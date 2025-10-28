import { useAuth } from "@/hooks/AuthContext";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import AdminUserManagement from "@/components/dashboard/admin-user-management";

export default function AdminDashboard() {
  const { user } = useAuth();

  // ProtectedRoute handles authentication and role checking
  // No need for manual redirects or loading states here
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="dashboard-admin">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 via-indigo-50/60 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <section>
              <h1 className="font-display text-4xl font-bold tracking-tight title-gradient">Admin Dashboard</h1>
              <p className="mt-2 text-muted-foreground">Manage members, roles, and organization settings</p>
            </section>

            {/* Admin-focused content: manage users directly on the dashboard */}
            <AdminUserManagement hideBackButton className="card-elevated" />
          </div>
        </main>
      </div>
    </div>
  );
}
