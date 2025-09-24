import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LeaveRequestForm from "@/components/forms/leave-request-form";
import { format } from "date-fns";

export default function LeaveRequestsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/leave-requests"],
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/leave-requests/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Request updated",
        description: "Leave request has been updated successfully.",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <Card data-testid="leave-requests-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="leave-requests-title">
            {user?.type === "admin" ? "Leave Requests" : "My Leave Requests"}
          </CardTitle>
          {user?.type === "worker" && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-request">New Request</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <LeaveRequestForm onSuccess={() => setShowForm(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" data-testid="leave-requests-loading">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="overflow-x-auto" data-testid="leave-requests-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {user?.type === "admin" ? "Employee" : "Type"}
                  </TableHead>
                  <TableHead>
                    {user?.type === "admin" ? "Leave Type" : "Dates"}
                  </TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  {user?.type === "admin" && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.slice(0, 5).map((request: any) => (
                  <TableRow key={request.id} data-testid={`request-${request.id}`}>
                    <TableCell>
                      {user?.type === "admin" ? (
                        <span className="font-medium" data-testid={`request-employee-${request.id}`}>
                          {request.user?.name || "Unknown"}
                        </span>
                      ) : (
                        <span className="font-medium" data-testid={`request-type-${request.id}`}>
                          {request.type}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user?.type === "admin" ? (
                        <span className="text-muted-foreground" data-testid={`request-admin-type-${request.id}`}>
                          {request.type}
                        </span>
                      ) : (
                        <span className="text-muted-foreground" data-testid={`request-dates-${request.id}`}>
                          {format(new Date(request.startDate), "MMM dd")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground" data-testid={`request-duration-${request.id}`}>
                      {calculateDuration(request.startDate, request.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)} data-testid={`request-status-${request.id}`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    {user?.type === "admin" && (
                      <TableCell>
                        {request.status === "pending" ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              onClick={() => updateRequestMutation.mutate({ id: request.id, status: "approved" })}
                              disabled={updateRequestMutation.isPending}
                              data-testid={`button-approve-${request.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              onClick={() => updateRequestMutation.mutate({ id: request.id, status: "rejected" })}
                              disabled={updateRequestMutation.isPending}
                              data-testid={`button-reject-${request.id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground capitalize" data-testid={`request-final-status-${request.id}`}>
                            {request.status}
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground" data-testid="no-requests">
            No leave requests found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
