import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import AnalyticsSection from "@/components/dashboard/analytics-section";
import LeaveRequestsSection from "@/components/dashboard/leave-requests-section";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import AttendanceOverview from "@/components/dashboard/attendance-overview";
// TODO: Create AdminUserManagement component for user directory and location management

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="dashboard-admin">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <AnalyticsSection /> {/* Location schedules, analytics */}
              <LeaveRequestsSection /> {/* All leave/overtime requests */}
              {/* <AdminUserManagement /> */}
            </div>
            <div className="space-y-6">
              <CalendarWidget />
              <AttendanceOverview /> {/* Attendance for all locations */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
