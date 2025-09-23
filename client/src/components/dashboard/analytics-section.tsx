import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsSection() {
  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/attendance"],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  if (attendanceLoading || employeesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="analytics-loading">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate weekly attendance trends
  const getWeeklyTrends = () => {
    if (!attendance) return [];
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      present: Math.floor(Math.random() * 50) + 150, // Mock data
      absent: Math.floor(Math.random() * 20) + 5,
      late: Math.floor(Math.random() * 15) + 2,
    }));
  };

  // Calculate department breakdown
  const getDepartmentBreakdown = () => {
    if (!employees) return [];
    
    const departments = employees.reduce((acc: any, emp: any) => {
      const dept = emp.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(departments).map(([name, count]) => ({
      name,
      count,
      percentage: ((count as number) / employees.length * 100).toFixed(1),
    }));
  };

  const weeklyTrends = getWeeklyTrends();
  const departmentBreakdown = getDepartmentBreakdown();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="analytics-section">
      {/* Weekly Attendance Trends */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="weekly-trends-title">Weekly Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="weekly-trends-chart">
            {weeklyTrends.map((trend, index) => (
              <div key={trend.day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{trend.day}</span>
                  <span className="text-muted-foreground">
                    {trend.present + trend.absent + trend.late} total
                  </span>
                </div>
                <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(trend.present / (trend.present + trend.absent + trend.late)) * 100}%` }}
                    data-testid={`trend-present-${index}`}
                  />
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(trend.absent / (trend.present + trend.absent + trend.late)) * 100}%` }}
                    data-testid={`trend-absent-${index}`}
                  />
                  <div 
                    className="bg-yellow-500" 
                    style={{ width: `${(trend.late / (trend.present + trend.absent + trend.late)) * 100}%` }}
                    data-testid={`trend-late-${index}`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Present: {trend.present}
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    Absent: {trend.absent}
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                    Late: {trend.late}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="department-breakdown-title">Department Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="department-breakdown-chart">
            {departmentBreakdown.map((dept, index) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" data-testid={`dept-name-${index}`}>{dept.name}</span>
                  <span className="text-muted-foreground" data-testid={`dept-count-${index}`}>
                    {dept.count} ({dept.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${dept.percentage}%` }}
                    data-testid={`dept-bar-${index}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
