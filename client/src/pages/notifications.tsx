import { useAuth } from "@/hooks/AuthContext";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NotificationsApi, NotificationDto } from "@/services/notifications";

export default function NotificationsPage() {
  const { user } = useAuth();

  if (!user) return null;

  const isMember = user.type === "MEMBER";

  const { data: notifications = [], isLoading, refetch } = useQuery<NotificationDto[]>({
    queryKey: ["/notifications/member", user.id],
    queryFn: async () => {
      if (!isMember) return [];
      return NotificationsApi.listForMember(Number(user.id));
    },
  });

  const markViewed = useMutation({
    mutationFn: async ({ memberId, notifSeq }: { memberId: number; notifSeq: number }) => {
      return NotificationsApi.markViewed(memberId, notifSeq);
    },
    onSuccess: () => refetch(),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="page-notifications">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {!isMember ? (
                <div className="text-muted-foreground">No notifications yet. Leave approval notifications coming soon.</div>
              ) : isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-1/2" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-muted-foreground">You're all caught up. No notifications.</div>
              ) : (
                <ul className="divide-y">
                  {notifications.map((n) => {
                    const unread = !n.viewTime;
                    return (
                      <li key={`${n.memberId}-${n.notifSeq}`} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{n.title || "Shift Assigned"}</span>
                            {unread && <Badge variant="default">New</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">{n.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                        {unread ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markViewed.mutate({ memberId: Number(n.memberId), notifSeq: Number(n.notifSeq) })}
                            disabled={markViewed.isPending}
                          >
                            Mark as read
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Read</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
