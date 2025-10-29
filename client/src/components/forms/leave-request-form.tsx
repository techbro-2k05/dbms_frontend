import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { LeavesApi, type SubmitLeaveRequest } from "@/services/leaves";
import { ShiftsApi } from "@/services/shifts";
import { useAuth } from "@/hooks/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Form schema aligned with backend: pick a shift and optionally add a reason
const leaveRequestFormSchema = z.object({
  shiftId: z.string().min(1, "Please select a shift"),
  reason: z.string().max(500).optional().or(z.literal("")),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestFormSchema>;

interface LeaveRequestFormProps {
  onSuccess: () => void;
}

export default function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      shiftId: "",
      reason: "",
    },
  });

  const shiftsQuery = useQuery({
    queryKey: ["/shifts/member", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as any[];
      const res = await ShiftsApi.listForMember(Number(user.id));
      return Array.isArray(res) ? res : [];
    },
    enabled: !!user?.id,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: LeaveRequestFormData) => {
      if (!user?.id) throw new Error("Not authenticated");
      const payload: SubmitLeaveRequest = {
        memberId: Number(user.id),
        shiftId: Number(data.shiftId),
        reason: data.reason || undefined,
      };
      return LeavesApi.submit(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/leaves/my"] });
      toast({
        title: "Request submitted",
        description: "Your leave request has been submitted for approval.",
      });
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    createRequestMutation.mutate(data);
  };

  return (
    <div data-testid="leave-request-form">
      <DialogHeader>
        <DialogTitle data-testid="form-title">Request Leave</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4" data-testid="leave-form">
          <FormField
            control={form.control}
            name="shiftId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={shiftsQuery.isLoading}>
                  <FormControl>
                    <SelectTrigger data-testid="select-shift">
                      <SelectValue placeholder={shiftsQuery.isLoading ? "Loading shifts..." : "Select a shift"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(shiftsQuery.data || []).map((s: any) => (
                      <SelectItem key={String(s.id)} value={String(s.id)}>
                        {`${s.title ?? "Shift"} — ${s.day ?? ""} ${s.startTime ?? ""}-${s.endTime ?? ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe the reason for your leave request..."
                    {...field}
                    value={field.value ?? ""}
                    data-testid="textarea-reason"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createRequestMutation.isPending || shiftsQuery.isLoading || (shiftsQuery.data?.length ?? 0) === 0}
            data-testid="button-submit-request"
          >
            {createRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
          {(shiftsQuery.data?.length ?? 0) === 0 && !shiftsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">No eligible shifts found to request leave for.</p>
          )}
        </form>
      </Form>
    </div>
  );
}
