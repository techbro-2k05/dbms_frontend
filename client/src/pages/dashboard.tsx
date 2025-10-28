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
      id:1234,
      fname: "aa",
      mname: "bb",
      lname: "cc",
      type: "MANAGER",
      phone:"",
      gender: "MALE",//"MALE" or "FEMALE"
      allowedPaidLeaves:0,
      allowedHours: 0,
      worksAt: 0,  
      password: "admin123", // hash in production!
      feasibleRoles:[],
};
    if (!user) return null;

    // Route to dedicated dashboard pages
    if (user.type === " MEMBER") {
      window.location.replace("/worker-dashboard");
      return null;
    }
    if (user.type === "MANAGER") {
      window.location.replace("/");
      return null;
    }
    if (user.type === "ADMIN") {
      window.location.replace("/admin-dashboard");
      return null;
    }
    return null;
}
