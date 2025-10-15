import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import ShiftsSection from "@/components/dashboard/shifts-section";
import LeaveRequestsSection from "@/components/dashboard/leave-requests-section";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import QuickActions from "@/components/dashboard/quick-actions";
import AttendanceOverview from "@/components/dashboard/attendance-overview";
import AnalyticsSection from "@/components/dashboard/analytics-section";

export default function Dashboard() {
  // const { user } = useAuth();
  const user = {
  id: "some-uuid", // generate or assign a UUID
  username: "admin",
  password: "admin123", // hash in production!
  name: "Administrator",
  type: "admin",        // member type
  location: "Administration",
  role: "Manager",      // or any role/title
  createdAt: new Date(),
};
    if (!user) return null;

    // Route to dedicated dashboard pages
    if (user.role === "worker") {
      window.location.replace("/worker-dashboard");
      return null;
    }
    if (user.role === "supervisor") {
      window.location.replace("/supervisor-dashboard");
      return null;
    }
    if (user.role === "admin") {
      window.location.replace("/admin-dashboard");
      return null;
    }
    return null;
  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="dashboard">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <ShiftsSection />
              <LeaveRequestsSection />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <CalendarWidget />
              <QuickActions />
              <AttendanceOverview />
            </div>
          </div>
          
          {user.role === "admin" && (
            <div className="mt-8">
              <AnalyticsSection />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
