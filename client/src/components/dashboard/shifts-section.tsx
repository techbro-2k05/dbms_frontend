import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Settings, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAuth } from "@/hooks/AuthContext";

export default function ShiftsSection() {
  const { user } = useAuth();
  
  const { data: shifts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/shifts"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getShiftIcon = (department: string) => {
    switch (department?.toLowerCase()) {
      case "production":
        return <Briefcase className="w-5 h-5 text-primary-foreground" />;
      case "quality control":
        return <Settings className="w-5 h-5 text-accent-foreground" />;
      case "maintenance":
        return <Wrench className="w-5 h-5 text-secondary-foreground" />;
      default:
        return <Briefcase className="w-5 h-5 text-primary-foreground" />;
    }
  };

  return (
    <Card data-testid="shifts-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="shifts-title">
            {user?.type === "ADMIN" ? "Today's Shifts" : "My Upcoming Shifts"}
          </CardTitle>
          {user?.type === "MEMBER" && (
            <Button variant="link" size="sm" data-testid="button-view-all-shifts">
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" data-testid="shifts-loading">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : shifts && shifts.length > 0 ? (
          <div className="space-y-4" data-testid="shifts-list">
            {shifts.slice(0, 3).map((shift: any) => (
              <div key={shift.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`shift-${shift.id}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    {getShiftIcon(shift.department)}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground" data-testid={`shift-title-${shift.id}`}>
                      {shift.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`shift-time-${shift.id}`}>
                      {format(new Date(shift.startTime), "HH:mm")} - {format(new Date(shift.endTime), "HH:mm")}
                    </p>
                    {user?.type === "ADMIN" && shift.assignedUser && (
                      <p className="text-xs text-muted-foreground" data-testid={`shift-employee-${shift.id}`}>
                        Assigned: {shift.assignedUser.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(shift.status)} data-testid={`shift-status-${shift.id}`}>
                    {shift.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1" data-testid={`shift-department-${shift.id}`}>
                    {shift.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground" data-testid="no-shifts">
            No shifts scheduled
          </div>
        )}
      </CardContent>
    </Card>
  );
}
