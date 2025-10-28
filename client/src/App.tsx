import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import  AddUser from "@/pages/add-user";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import WorkerDashboard from "@/pages/worker-dashboard";
import Wage from "@/pages/wage";
import LeaveRequest from "@/pages/leave-request";
import ManagerDashboard from "@/pages/manager-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import LeaveApproval from "@/pages/leave-approval";
import EditUser from "@/pages/edit-user";
import EditWorkerDetails from "@/pages/edit-worker-details";
import { AuthProvider } from "./hooks/AuthContext";
import Profile from "./pages/profile";
import NotificationsPage from "./pages/notifications";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes with Role-Based Access Control */}
      <ProtectedRoute 
        path="/admin-dashboard" 
        component={AdminDashboard}
        allowedRoles={["ADMIN"]}
      />
      <ProtectedRoute 
        path="/manager-dashboard" 
        component={ManagerDashboard}
        allowedRoles={["MANAGER"]}
      />
      <ProtectedRoute 
        path="/worker-dashboard" 
        component={WorkerDashboard}
        allowedRoles={["MEMBER"]}
      />
      <ProtectedRoute 
        path="/profile" 
        component={Profile}
        allowedRoles={["MANAGER", "MEMBER"]}
      />
      <ProtectedRoute 
        path="/notifications" 
        component={NotificationsPage}
        allowedRoles={["ADMIN", "MANAGER", "MEMBER"]}
      />
      
      {/* Other protected routes (any authenticated user can access) */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/wage" component={Wage} />
      <ProtectedRoute path="/leave-request" component={LeaveRequest} />
      <ProtectedRoute path="/leave-approval" component={LeaveApproval} />
      <ProtectedRoute path="/edit-user" component={EditUser} />
      <ProtectedRoute path="/add-user" component={AddUser} />
      <ProtectedRoute path="/edit-worker-details" component={EditWorkerDetails} />
      
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
