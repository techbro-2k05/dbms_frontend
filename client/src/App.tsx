import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import WorkerDashboard from "@/pages/worker-dashboard";
import SupervisorDashboard from "@/pages/supervisor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => <Dashboard />} />
      <Route path="/auth" component={AuthPage} />
  <Route path="/worker-dashboard" component={WorkerDashboard} />
  <Route path="/supervisor-dashboard" component={SupervisorDashboard} />
  <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
