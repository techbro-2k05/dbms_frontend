import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import ShiftsSection from "@/components/dashboard/shifts-section";
import LeaveRequestsSection from "@/components/dashboard/leave-requests-section";
import QuickActions from "@/components/dashboard/quick-actions";
import AttendanceOverview from "@/components/dashboard/attendance-overview";

export default function WorkerDashboard() {
  const { user } = useAuth();
  if (!user || user.role !== "worker") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="dashboard-worker">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <ShiftsSection /> {/* Upcoming shifts and details */}
              <LeaveRequestsSection /> {/* Leave and overtime requests */}
            </div>
            <div className="space-y-6">
              <QuickActions /> {/* Request leave/overtime, clock in/out */}
              <AttendanceOverview /> {/* Wage display for week, attendance */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
