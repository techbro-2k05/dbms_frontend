import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import ShiftsSection from "@/components/dashboard/shifts-section";
import LeaveRequestsSection from "@/components/dashboard/leave-requests-section";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import AttendanceOverview from "@/components/dashboard/attendance-overview";
// TODO: Create SupervisorUserDirectory component for listing users under supervisor

export default function SupervisorDashboard() {
  const { user } = useAuth();
  if (!user || user.type !== "supervisor") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="dashboard-supervisor">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <ShiftsSection /> {/* Assign/update/delete shifts for workers */}
              <LeaveRequestsSection /> {/* Approve leave/overtime requests */}
              {/* <SupervisorUserDirectory /> */}
            </div>
            <div className="space-y-6">
              <CalendarWidget />
              <AttendanceOverview /> {/* Attendance for users under supervisor */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
