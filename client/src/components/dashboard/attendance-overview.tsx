import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceOverview() {
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
  
  const { data: attendance, isLoading } = useQuery({
    queryKey: ["/api/attendance", user?.type === "ADMIN" ? { date: new Date().toISOString().split('T')[0] } : undefined],
  });

  if (isLoading) {
    return (
      <Card data-testid="attendance-overview-loading">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Calculate stats based on role
  const getAttendanceStats = () => {
    if (!attendance) return { present: 0, absent: 0, late: 0, rate: 0 };

    if (user?.type === "MANAGER") {
      // For admin, show today's overall stats
      const present = attendance.filter((record: any) => record.status === "present").length;
      const absent = attendance.filter((record: any) => record.status === "absent").length;
      const late = attendance.filter((record: any) => record.status === "late").length;
      const total = present + absent + late;
      const rate = total > 0 ? (present / total * 100) : 0;
      
      return { present, absent, late, rate };
    } else {
      // For normal users, show their personal stats
      const present = attendance.filter((record: any) => record.status === "present").length;
      const absent = attendance.filter((record: any) => record.status === "absent").length;
      const late = attendance.filter((record: any) => record.status === "late").length;
      const total = attendance.length;
      const rate = total > 0 ? (present / total * 100) : 0;
      
      return { present, absent, late, rate };
    }
  };

  const stats = getAttendanceStats();

  return (
    <Card data-testid="attendance-overview">
      <CardHeader>
        <CardTitle data-testid="attendance-title">
          {user?.type === "MANAGER" ? "Today's Attendance" : "My Attendance"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Present</span>
            <span className="text-sm font-medium text-green-600" data-testid="attendance-present">
              {stats.present}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Absent</span>
            <span className="text-sm font-medium text-red-600" data-testid="attendance-absent">
              {stats.absent}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Late</span>
            <span className="text-sm font-medium text-yellow-600" data-testid="attendance-late">
              {stats.late}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="attendance-rate">
                {stats.rate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
