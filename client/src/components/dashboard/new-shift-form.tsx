import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { ShiftService } from "@/services/api"; 

export default function NewShiftForm() {
  const [showForm, setShowForm] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      day: "",
      startTime: "",
      endTime: "",
    },
  });

  // Fetch existing shifts
  const {
    data: shifts = [],
    isLoading: shiftsLoading,
    isError: shiftsError,
    error: shiftsFetchError,
  } = useQuery({
    queryKey: ["/shifts"],
    queryFn: async () => {
      const res = await ShiftService.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await ShiftService.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/shifts"] });
      setShowForm(false);
      form.reset();
    },
    onError: (err: any) => {
      console.error("Create shift failed:", err);
      alert("Failed to create shift: " + (err?.message || "Unknown error"));
    },
  });

  const onSubmit = (data: any) => {
    createShiftMutation.mutate(data);
  };

  return (
    <Card data-testid="new-shift-form">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>New Shift Allocation</CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button variant="outline">Allocate Shift</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Allocate New Shift</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} required />
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
                        <FormLabel>Day</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} required />
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
                          <Input type="time" {...field} required />
                        </FormControl>
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
                          <Input type="time" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createShiftMutation.isPending}
                  >
                    {createShiftMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Allocate Shift
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {shiftsLoading ? (
          <div>Loading shifts…</div>
        ) : shiftsError ? (
          <div className="text-destructive">
            Error loading shifts: {String((shiftsFetchError as any)?.message ?? "Unknown")}
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-muted-foreground">
            Create and assign new shifts to users. All fields are required.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((s: any) => (
                <TableRow key={s.id ?? `${s.title}-${s.day}-${s.startTime}`}>
                  <TableCell>{s.title ?? "—"}</TableCell>
                  <TableCell>{s.day ?? "—"}</TableCell>
                  <TableCell>{s.startTime ?? "—"}</TableCell>
                  <TableCell>{s.endTime ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
