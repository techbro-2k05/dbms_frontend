import { useAuth } from "@/hooks/AuthContext";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import AnalyticsSection from "@/components/dashboard/analytics-section";
import NewShiftForm from "@/components/dashboard/new-shift-form";
import AttendanceOverview from "@/components/dashboard/attendance-overview";

export default function ManagerDashboard() {
  const { user } = useAuth();

  // ProtectedRoute handles authentication and role checking
  // No need for manual redirects or loading states here
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="dashboard-manager">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <AnalyticsSection /> {/* Location schedules, analytics */}
              <NewShiftForm user={user} /> {/* New shift allocation for manager */}
            </div>
            <div className="space-y-6">
              <AttendanceOverview /> {/* Attendance for manager's location */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
