import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import  AddUser from "@/pages/add-user";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import WorkerDashboard from "@/pages/worker-dashboard";
import Wage from "@/pages/wage";
import LeaveRequest from "@/pages/leave-request";
// import SupervisorDashboard from "@/pages/manager-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import LeaveApproval from "@/pages/leave-approval";
import NewShift from "@/pages/new-shift";
import EditUser from "@/pages/edit-user";
import EditWorkerDetails from "@/pages/edit-worker-details";

function Router() {
  return (
    <Switch>
      {/* <ProtectedRoute path="/" component={() => <Dashboard />} /> */}
      <Route path="/" component={AdminDashboard}></Route>
      <Route path="/auth" component={AuthPage} />
  <Route path="/worker-dashboard" component={WorkerDashboard} />
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/wage" component={Wage} />
  <Route path="/leave-request" component={LeaveRequest} />
  <Route path="/manager-dashboard" component={AdminDashboard} />
  <Route path="/admin-dashboard" component={AdminDashboard} />
  <Route path="/leave-approval" component={LeaveApproval} />
  <Route path="/edit-user" component={EditUser} />
  <Route path="/add-user" component={AddUser} />
  <Route path="/edit-worker-details" component={EditWorkerDetails} />
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
