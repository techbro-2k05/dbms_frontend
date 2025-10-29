import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LeavesApi, type LeaveRequestDto } from "@/services/leaves";
import { useAuth } from "@/hooks/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LeaveApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();

  const pendingQuery = useQuery<LeaveRequestDto[]>({
    queryKey: ["/leaves/pending", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return LeavesApi.pendingForManager(Number(user.id));
    },
    enabled: !!user?.id,
  });

  const handleMutation = useMutation({
    mutationFn: async (vars: { memberId: number; shiftId: number; approve: boolean }) => {
      return LeavesApi.handle({ ...vars });
    },
    onSuccess: (res) => {
      pendingQuery.refetch();
      const reassigned = Array.isArray(res) ? res.length : 0;
      toast({ title: "Request handled", description: reassigned > 0 ? `Reassignments created: ${reassigned}` : "Updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to update request", variant: "destructive" });
    },
  });

  const isLoading = pendingQuery.isLoading;
  const data = pendingQuery.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Leave Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending leave requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => (
                  <TableRow key={`${r.memberId}-${r.shiftId}`}>
                    <TableCell>#{r.memberId}</TableCell>
                    <TableCell>#{r.shiftId}</TableCell>
                    <TableCell>{r.shiftDay}</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">{r.approval.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => handleMutation.mutate({ memberId: Number(r.memberId), shiftId: Number(r.shiftId), approve: true })}
                          disabled={handleMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => handleMutation.mutate({ memberId: Number(r.memberId), shiftId: Number(r.shiftId), approve: false })}
                          disabled={handleMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
