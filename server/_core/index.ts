import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { uploadMiddleware, handleUpload } from "../upload";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Security: Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitar CSP para desenvolvimento
    crossOriginEmbedderPolicy: false,
  }));
  
  // Security: Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por IP
    message: 'Muitas requisições, tente novamente em 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 tentativas de login
    message: 'Muitas tentativas de login, tente novamente em 15 minutos',
    skipSuccessfulRequests: true,
  });
  
  const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 uploads por minuto
    message: 'Muitos uploads, aguarde um momento',
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Apply auth limiter to OAuth routes
  app.use('/api/oauth/', authLimiter);
  // Upload endpoint with rate limiting
  app.post("/api/upload", uploadLimiter, uploadMiddleware, handleUpload);
  // Mercado Pago webhook
  app.post("/api/webhooks/mercadopago", async (req, res) => {
    const { handleMercadoPagoWebhook } = await import("../webhooks/mercadopago");
    await handleMercadoPagoWebhook(req, res);
  });
  // tRPC API with rate limiting
  app.use(
    "/api/trpc",
    apiLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
