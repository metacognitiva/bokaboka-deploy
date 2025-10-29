import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import Rankings from "./pages/Rankings";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import RegisterProfessional from "./pages/RegisterProfessional";
import RegisterClient from "./pages/RegisterClient";
import AdminDashboard from "./pages/AdminDashboard";
import ModerationPanel from "./pages/ModerationPanel";
import ChooseAccountType from "./pages/ChooseAccountType";
import ConfirmService from "./pages/ConfirmService";
import Analytics from "./pages/Analytics";
import Financial from "./pages/Financial";
import Plans from "./pages/Plans";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailure from "./pages/PaymentFailure";
import TestPayments from "./pages/TestPayments";
import AuthRedirect from "./pages/AuthRedirect";
import EditProfile from "./pages/EditProfile";
import UploadStory from "./pages/UploadStory";
import CreateStory from "./pages/CreateStory";
import RateProfessional from "./pages/RateProfessional";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/auth-redirect"} component={AuthRedirect} />
      <Route path={"/rankings"} component={Rankings} />
      <Route path="/professional/:uid" component={ProfessionalProfile} />
      <Route path={"/404"} component={NotFound} />
      <Route path="/escolher-tipo" component={ChooseAccountType} />
      <Route path="/cadastrar-profissional" component={RegisterProfessional} />
      <Route path="/cadastrar-cliente" component={RegisterClient} />
      <Route path="/confirmar-servico" component={ConfirmService} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/moderacao" component={ModerationPanel} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/financial" component={Financial} />
      <Route path="/planos" component={Plans} />
      <Route path="/checkout/:professionalId/:planType" component={Checkout} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/pending" component={PaymentPending} />
      <Route path="/payment/failure" component={PaymentFailure} />
      <Route path="/test-payments" component={TestPayments} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route path="/upload-story" component={UploadStory} />
      <Route path="/create-story" component={CreateStory} />
      <Route path="/avaliar/:uid" component={RateProfessional} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
