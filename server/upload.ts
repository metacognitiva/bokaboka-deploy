import { Request, Response } from "express";
import { storagePut } from "./storage";
import multer from "multer";
import { randomUUID } from "crypto";

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadMiddleware = upload.single('file');

export async function handleUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // Gerar nome único para o arquivo
    const ext = req.file.originalname.split('.').pop();
    const filename = `${randomUUID()}.${ext}`;
    const key = `uploads/${filename}`;

    // Upload para S3
    const result = await storagePut(key, req.file.buffer, req.file.mimetype);

    return res.json({
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return res.status(500).json({ error: "Erro ao fazer upload" });
  }
}

