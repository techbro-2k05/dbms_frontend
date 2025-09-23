import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Factory, 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  UserCheck, 
  CalendarX, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  User as UserIcon
} from "lucide-react";


interface SidebarProps {
  user: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const { logoutMutation } = useAuth();
  if (!user) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "#", current: true },
    { name: "Schedule", icon: Calendar, href: "#" },
    { name: "Time Tracking", icon: Clock, href: "#" },
    { name: "Attendance", icon: UserCheck, href: "#" },
    { name: "Leave Requests", icon: CalendarX, href: "#" },
    ...(user.role === "admin" ? [
      { name: "Employee Management", icon: Users, href: "#" },
      { name: "Analytics", icon: BarChart3, href: "#" },
    ] : []),
    { name: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Factory className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="app-title">FactoryPro</h1>
            <p className="text-xs text-muted-foreground">Work Scheduling</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                item.current
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground" data-testid="user-name">{user.name}</p>
            <p className="text-xs text-muted-foreground" data-testid="user-role">
              {user.role === "admin" ? "Administrator" : "Factory Worker"}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
