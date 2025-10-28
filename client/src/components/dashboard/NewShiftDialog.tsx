import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ShiftSelect from "./ShiftSelect";
import ShiftRoleRequirements from "./ShiftRoleRequirements";
import { LOC_OPTIONS, ROLE_OPTIONS } from "./shift-constants";
import { ShiftsApi } from "@/services/shifts";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type Requirement = { roleId: number; count: number };
export type FormValues = {
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  locationId: number;
  requirements: Requirement[];
};

export default function NewShiftDialog({ open, onOpenChange, defaultLocationId }: { open: boolean; onOpenChange: (v: boolean) => void; defaultLocationId: number }) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      day: "",
      startTime: "",
      endTime: "",
      locationId: defaultLocationId || 0,
      requirements: [{ roleId: ROLE_OPTIONS[0].value, count: 1 }],
    },
  });

  const ensureSeconds = (t: string) => (t && t.length === 5 ? `${t}:00` : t);

  const createShiftMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const requirements = (values.requirements || [])
        .filter((r) => r && r.roleId && r.count > 0)
        .map((r) => ({ roleId: Number(r.roleId), count: Number(r.count) }));
      const payload = {
        title: values.title?.trim(),
        day: values.day,
        startTime: ensureSeconds(values.startTime),
        endTime: ensureSeconds(values.endTime),
        locationId: Number(values.locationId),
        requirements,
      };
      return ShiftsApi.create(payload);
    },
    onSuccess: () => {
      toast({ title: "Shift created" });
      queryClient.invalidateQueries({ queryKey: ["/shifts"] });
      form.reset({
        title: "",
        day: "",
        startTime: "",
        endTime: "",
        locationId: defaultLocationId || 0,
        requirements: [{ roleId: ROLE_OPTIONS[0].value, count: 1 }],
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to create shift";
      toast({ variant: "destructive", title: "Error", description: msg });
    },
  });

  const onSubmit = (values: FormValues) => createShiftMutation.mutate(values);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl md:w-[720px] h-[90vh] overflow-y-auto card-elevated">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Allocate New Shift</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Morning Shift - Warehouse A" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" step="1" {...field} required />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Format HH:mm or HH:mm:ss</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" step="1" {...field} required />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Format HH:mm or HH:mm:ss</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <ShiftSelect options={LOC_OPTIONS} value={Number(field.value || 0)} onChange={(e) => field.onChange(Number(e.target.value) || 0)} placeholder="Select Location" />
                    </FormControl>
                    {field.value ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {LOC_OPTIONS.find((o) => o.value === Number(field.value))?.label} (ID: {String(field.value)})
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Pick the location for this shift</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ShiftRoleRequirements control={form.control} name="requirements" />

            <Button type="submit" className="w-full" disabled={createShiftMutation.isPending}>
              {createShiftMutation.isPending ? "Allocating…" : "Allocate Shift"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
