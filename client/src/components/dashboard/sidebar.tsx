import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth, Member } from "@/hooks/AuthContext";
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
  user: Member | null;
}

type NavItem = {
  name: string;
  icon: React.ElementType;
  href: string;
  current?: boolean;
};

export default function Sidebar({ user }: SidebarProps) {
  const { logout } = useAuth();
  
  if (!user) {
    return null;
  }

  let navigation: NavItem[] = [];
  if (user.type === "MEMBER") {
    navigation = [
      { name: "Dashboard", icon: LayoutDashboard, href: "/worker-dashboard", current: true },
      { name: "Leave Request", icon: CalendarX, href: "/leave-request" },
      { name: "Wage", icon: BarChart3, href: "/wage" },
      // { name: "Settings", icon: Settings, href: // "/settings" },
    ];
  } else if (user.type === "ADMIN") {
    navigation = [
      { name: "Dashboard", icon: LayoutDashboard, href: "/admin-dashboard", current: true },
      { name: "Leave Approval", icon: CalendarX, href: "/leave-approval" },
      { name: "Add User", icon: Users, href: "/add-user" },
      // { name: "Settings", icon: Settings, href: "/settings" },
    ];
  } else if (user.type === "MANAGER") {
    navigation = [
      { name: "Dashboard", icon: LayoutDashboard, href: "/manager-dashboard", current: true },
      { name: "Leave Approval", icon: CalendarX, href: "/leave-approval" },
      // { name: "Settings", icon: Settings, href: "/settings" },
    ];
  }

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
            <Link
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
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        {(() => {
          const canViewProfile = user.type === "MANAGER" || user.type === "MEMBER";
          const inner = (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground" data-testid="user-name">{user.fname}</p>
                <p className="text-xs text-muted-foreground" data-testid="user-role">
                  {user.type === "ADMIN"
                    ? "Administrator"
                    : user.type === "MANAGER"
                    ? "Manager"
                    : "Factory Worker"}
                </p>
              </div>
            </div>
          );
          return canViewProfile ? (
            <Link href="/profile" className="block hover:bg-accent hover:text-accent-foreground rounded-md px-2 -mx-2">
              {inner}
            </Link>
          ) : (
            inner
          );
        })()}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
