import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { User } from "@shared/schema";
import WeeklyShiftForm from "./assign-weekly";
import { MultiSelect } from "../ui/multi-select";
import { ShiftService } from "@/services/api";
import internal from "stream";
interface ShiftProps {
  user: User | null;
}
const LOC_OPTIONS = [
  { label: "Mumbai", value: 1 },
  { label: "Delhi", value: 2 },
  { label: "Noida", value: 3 },
  { label: "Banglore", value: 4 },
  // ... add more roles as integers
];

const ROLE_OPTIONS = [
  { label: "Role A", value: 1 },
  { label: "Role B", value: 2 },
  { label: "Role C", value: 3 },
  { label: "Role D", value: 4 },
  // ... add more roles as integers
];
export default function NewShiftForm({ user }: ShiftProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });
  const LOC_OPTIONS = [
  { label: "Mumbai", value: 1 },
  { label: "Delhi", value: 2 },
  { label: "Noida", value: 3 },
  { label: "Banglore", value: 4 },
  // ... add more roles as integers
];
type FormValues = {
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  locationId: number;
  requirements: object[];
};
  const form = useForm({
    defaultValues: {
      title: "",
      day: "",
      startTime: "",
      endTime: "",
      locationId: 0,
      requirements: [] as object[],
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // The number input issue must be fixed on the field level as shown in the previous answer.
      // Assuming you will implement the custom onChange logic for number fields later.
      const payload = {
        title: values.title?.trim(),
        day: values.day.trim(),
        startTime: values.startTime.trim(),
        endTime: values.endTime.trim(),
        locationId: values.locationId,
        requirements: values.requirements||[],
      };

      await ShiftService.create(payload);
      alert("Shift created successfully");
      form.reset();
    } catch (error: any) {
      console.error("Create shift failed:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Unknown error";
      alert("Failed to create shift: " + msg);
    }
  };
  if(user?.type === "MANAGER"){
  return (
    <Card data-testid="new-shift-form">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>New Shift Allocation</CardTitle>
          <WeeklyShiftForm user={user}/>
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
                  
                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Location ID</FormLabel>
                      <FormControl>
                                <select 
                                    {...field} 
                                    value={String(field.value || "")} 
                                    onChange={(e) => field.onChange(Number(e.target.value) || null)}
                                    className="p-2 border rounded" // Add any necessary styling (e.g., Tailwind)
                                >
                                    <option value="" disabled>Select a location</option>
                                    {/* Render options from your array */}
                                    {LOC_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                          <FormField  
                                control={form.control}
                                name="requirements"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Feasible Roles</FormLabel>
                                    <FormControl>
                                      <MultiSelect
                                        options={ROLE_OPTIONS}
                                        // The field.value is the current array of integers from RHF
                                        value={ Object.assign(field.value,0) || []} 
                                        // RHF's onChange receives the new array from the MultiSelect component
                                        onChange={field.onChange} 
                                        placeholder="Select applicable roles"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Adding..." : "Add shift"}
                    Allocate Shift
                  </Button>
                  {/* <Button type="submit" className="w-full" disabled={createShiftMutation.isPending}>
                    {createShiftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Allocate Shift
                  </Button> */}
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">Create and assign new shifts to users. All fields are required.</div>
      </CardContent>
    </Card>
  );
}  else if(user?.type === "ADMIN"){
  return(
  <Card data-testid="new-shift-form">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>New Shift Allocation</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">Create and assign new shifts to users. All fields are required.</div>
      </CardContent>
    </Card>
  );
}
}
