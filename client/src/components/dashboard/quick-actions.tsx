import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  CalendarPlus, 
  Calendar, 
  UserPlus, 
  BarChart3 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LeaveRequestForm from "@/components/forms/leave-request-form";
import ViewScheduleDialog from "@/components/dashboard/view-schedule-dialog";

export default function QuickActions() {
  const user = {
      id:1234,
      fname: "aa",
      mname: "bb",
      lname: "cc",
      type: "MEMBER",
      phone:"",
      gender: "MALE",//"MALE" or "FEMALE"
      allowedPaidLeaves:0,
      allowedHours: 0,
      worksAt: 0,  
      password: "admin123", // hash in production!
};
  const { toast } = useToast();
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const clockMutation = useMutation({
    mutationFn: async (type: "in" | "out") => {
      const res = await apiRequest("POST", "/api/attendance/clock", { type });
      return res.json();
    },
    onSuccess: (data, type) => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: type === "in" ? "Clocked In" : "Clocked Out",
        description: `Successfully clocked ${type} at ${new Date().toLocaleTimeString()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const actions = [
    ...(user?.type === "MEMBER" ? [
      {
        icon: Clock,
        label: "Clock In/Out",
        color: "text-primary",
        onClick: () => {
          // For demo purposes, we'll clock in. In a real app, this would check current status
          clockMutation.mutate("in");
        },
        testId: "action-clock"
      },
      {
        icon: CalendarPlus,
        label: "Request Leave",
        color: "text-green-600",
        onClick: () => setShowLeaveForm(true),
        testId: "action-request-leave"
      },
    ] : []),
    {
      icon: Calendar,
      label: "View Schedule",
      color: "text-blue-600",
      onClick: () => setShowSchedule(true),
      testId: "action-view-schedule"
    },
    ...(user?.type === "ADMIN" ? [
      {
        icon: UserPlus,
        label: "Add Employee",
        color: "text-purple-600",
        onClick: () => {},
        testId: "action-add-employee"
      },
      {
        icon: BarChart3,
        label: "View Reports",
        color: "text-orange-600",
        onClick: () => {},
        testId: "action-view-reports"
      },
    ] : []),
  ];

  return (
    <Card data-testid="quick-actions">
      <CardHeader>
        <CardTitle data-testid="quick-actions-title">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={action.onClick}
              disabled={clockMutation.isPending}
              data-testid={action.testId}
            >
              <Icon className={`w-4 h-4 mr-3 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          );
        })}

        {/* Leave Request Form Dialog */}
        <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
          <DialogContent className="max-w-md">
            <LeaveRequestForm onSuccess={() => setShowLeaveForm(false)} />
          </DialogContent>
        </Dialog>
        {/* View Schedule Dialog */}
        <ViewScheduleDialog open={showSchedule} onOpenChange={setShowSchedule} />
      </CardContent>
    </Card>
  );
}
