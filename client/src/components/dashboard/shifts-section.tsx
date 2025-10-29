import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/AuthContext";
import { ShiftsApi } from "@/services/shifts";
import { locationLabel, roleLabel } from "./shift-constants";
import { ShiftAssignmentsApi, type ShiftAssignmentDto } from "@/services/shiftAssignments";

export default function ShiftsSection() {
  const { user } = useAuth();
  const isMember = user?.type === "MEMBER";

  // Fetch shifts for the logged-in member
  const { data: shifts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/shifts/member", user?.id],
    queryFn: () => (isMember && user?.id ? ShiftsApi.listForMember(Number(user.id)) : Promise.resolve([])),
    enabled: Boolean(isMember && user?.id),
  });

  // Fetch the current member's assignment (role + attendance) for each shift
  const [myAssignmentsByShift, setMyAssignmentsByShift] = React.useState<Record<number, ShiftAssignmentDto | null>>({});
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isMember || !user?.id || !Array.isArray(shifts) || shifts.length === 0) return;
        const pairs = await Promise.all(
          shifts.map(async (s: any) => {
            try {
              const list = await ShiftAssignmentsApi.listByShift(Number(s.id));
              const mine = list.find((a) => Number(a.memberId) === Number(user.id)) || null;
              return [Number(s.id), mine] as const;
            } catch {
              return [Number(s.id), null] as const;
            }
          })
        );
        if (cancelled) return;
        const map: Record<number, ShiftAssignmentDto | null> = {};
        for (const [id, mine] of pairs) map[id] = mine;
        setMyAssignmentsByShift(map);
      } catch (e) {
        console.warn("Failed to load member assignments for shifts", e);
      }
    })();
    return () => { cancelled = true; };
  }, [isMember, user?.id, JSON.stringify(shifts)]);

  const getStatus = (shift: any) => {
    try {
      const start = new Date(`${shift.day}T${(shift.startTime || '').slice(0,8)}`);
      const end = new Date(`${shift.day}T${(shift.endTime || '').slice(0,8)}`);
      const now = new Date();
      if (now < start) return { key: "upcoming", label: "Yet to start", color: "bg-sky-100 text-sky-700" } as const;
      if (now >= start && now <= end) return { key: "ongoing", label: "Ongoing", color: "bg-emerald-100 text-emerald-700" } as const;
      return { key: "finished", label: "Finished", color: "bg-zinc-100 text-zinc-700" } as const;
    } catch {
      return { key: "unknown", label: "—", color: "bg-zinc-100 text-zinc-700" } as const;
    }
  };

  const [statusFilter, setStatusFilter] = React.useState<"all" | "upcoming" | "ongoing" | "finished">("all");

  return (
    <Card data-testid="shifts-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="shifts-title">{isMember ? "My Shifts" : "Shifts"}</CardTitle>
          {isMember && (
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Yet to start</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="finished">Finished</TabsTrigger>
              </TabsList>
            </Tabs>
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
            {shifts
              .filter((s: any) => {
                if (statusFilter === "all") return true;
                const st = getStatus(s).key;
                return st === statusFilter;
              })
              .map((shift: any) => {
                const status = getStatus(shift);
                const myAssign = myAssignmentsByShift[Number(shift.id)] || null;
                return (
                  <div key={shift.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`shift-${shift.id}`}>
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground" data-testid={`shift-title-${shift.id}`}>{shift.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {shift.day}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {shift.startTime?.slice(0,8)} - {shift.endTime?.slice(0,8)}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> #{shift.locationId}{locationLabel(shift.locationId) ? ` — ${locationLabel(shift.locationId)}` : ''}</span>
                      </div>
                      {myAssign && (
                        <div className="text-xs text-muted-foreground">
                          Role: {roleLabel(myAssign.roleId)} • Attendance: {myAssign.attendance}
                        </div>
                      )}
                    </div>
                    <Badge className={status.color} data-testid={`shift-status-${shift.id}`}>{status.label}</Badge>
                  </div>
                );
              })}
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
