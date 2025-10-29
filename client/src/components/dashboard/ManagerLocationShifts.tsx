import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Clock, MapPin } from "lucide-react";
import { ShiftsApi } from "@/services/shifts";
import { ShiftAssignmentsApi } from "@/services/shiftAssignments";
import { NotificationsApi } from "@/services/notifications";
import { useToast } from "@/hooks/use-toast";
import { LOC_OPTIONS, roleLabel, locationLabel } from "./shift-constants";

export default function ManagerLocationShifts({ worksAt }: { worksAt: number }) {
  const { data: allShifts = [], isLoading } = useQuery({ queryKey: ["/shifts"], queryFn: ShiftsApi.list });

  // state before early returns
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "ongoing" | "finished">("all");
  const [assignmentsByShift, setAssignmentsByShift] = useState<Record<number, any[]>>({});
  const { toast } = useToast();

  const autoAssignMutation = useMutation({
    mutationFn: async (shiftId: number) => ShiftAssignmentsApi.autoAssign(shiftId),
    onSuccess: async (list, shiftId) => {
      setAssignmentsByShift((prev) => ({ ...prev, [shiftId as number]: list }));
      toast({ title: "Members auto-assigned", description: `${list?.length ?? 0} assignment(s) created.` });
      try {
        await NotificationsApi.notifyAssignments(Number(shiftId));
        toast({ title: "Notified members", description: "Notifications sent to assigned members." });
      } catch (e: any) {
        console.warn("Failed to send notifications:", e?.message || e);
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to auto-assign members";
      toast({ variant: "destructive", title: "Error", description: msg });
    },
  });

  const shifts = useMemo(() => {
    if (!Array.isArray(allShifts)) return [] as any[];
    return allShifts.filter((s: any) => s?.locationId === worksAt);
  }, [allShifts, worksAt]);

  // Fetch existing assignments for each shift so counts/details persist after refresh
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!shifts || shifts.length === 0) return;
        const pairs = await Promise.all(
          shifts.map(async (s: any) => {
            const list = await ShiftAssignmentsApi.listByShift(Number(s.id));
            return [Number(s.id), list] as const;
          })
        );
        if (cancelled) return;
        const map: Record<number, any[]> = {};
        for (const [id, list] of pairs) map[id] = list;
        setAssignmentsByShift(map);
      } catch (e) {
        console.warn("Failed to prefetch assignments for shifts", e);
      }
    })();
    return () => { cancelled = true; };
  }, [shifts]);

  if (isLoading) return <div className="text-muted-foreground">Loading shifts…</div>;
  if (!shifts.length) return <div className="text-muted-foreground">No shifts created for your location yet.</div>;

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

  const openDetails = (shift: any) => { setSelected(shift); setOpen(true); };
  const requiredTotal = (shift: any) => Array.isArray(shift?.requirements) ? shift.requirements.reduce((sum: number, r: any) => sum + Number(r?.count || 0), 0) : undefined;

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Yet to start</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="finished">Finished</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {shifts
          .filter((s: any) => {
            if (statusFilter === "all") return true;
            const st = getStatus(s).key;
            return st === statusFilter;
          })
          .map((s: any) => {
            const status = getStatus(s);
            const activeAssigned = (assignmentsByShift[s.id] || []).filter((a: any) => a?.attendance !== "LEAVE").length;
            const reqTotal = requiredTotal(s);
            const disableAllot = typeof reqTotal === "number" ? activeAssigned >= reqTotal : false;
            return (
              <div key={s.id} className="p-4 border rounded-xl bg-background/60 dark:bg-card ring-1 ring-black/5 cursor-pointer hover:bg-background/70 transition" onClick={() => openDetails(s)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-medium">{s.title}</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>{status.label}</span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Location #{s.locationId}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" disabled={disableAllot || autoAssignMutation.isPending} onClick={(e) => e.stopPropagation()}>
                          {disableAllot ? "Allotted" : "Allot members"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => autoAssignMutation.mutate(s.id)} disabled={disableAllot}>
                          Auto assign
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>Manual assign (soon)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {s.day}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.startTime?.slice(0, 8)} - {s.endTime?.slice(0, 8)}</span>
                </div>
                {activeAssigned > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">Assigned {activeAssigned}{typeof reqTotal === 'number' ? ` / ${reqTotal}` : ''}</div>
                )}
              </div>
            );
          })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selected?.title || "Shift details"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div>{selected.day}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div>{selected.startTime?.slice(0,8)} - {selected.endTime?.slice(0,8)}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div>#{selected.locationId} — {locationLabel(selected.locationId) || "Unknown address"}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Requirements</div>
                {Array.isArray(selected.requirements) && selected.requirements.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {selected.requirements.map((r: any, idx: number) => (
                      <li key={idx}>{roleLabel(r.roleId)} #{r.roleId} — {Number(r.count)} required</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No requirements recorded.</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-medium">Assigned members</div>
                {Array.isArray(assignmentsByShift[selected.id]) && assignmentsByShift[selected.id].length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {assignmentsByShift[selected.id].map((a: any, idx: number) => (
                      <li key={idx}>Member #{a.memberId} — {roleLabel(a.roleId)} #{a.roleId} — {a.attendance || 'SCHEDULED'}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No members assigned yet.</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
