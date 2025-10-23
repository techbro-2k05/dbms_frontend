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
interface ShiftProps {
  user: User | null;
}
// const user = {
//       id:1234,
//       fname: "aa",
//       mname: "bb",
//       lname: "cc",
//       type: "ADMIN",
//       phone:"",
//       gender: "MALE",//"MALE" or "FEMALE"
//       allowedPaidLeaves:0,
//       allowedHours: 0,
//       worksAt: 0,  
//       password: "admin123", // hash in production!
//       feasibleRoles:[],
// };

export default function WeeklyShiftForm({ user }: ShiftProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm({
    defaultValues: {
      title: "",
      start_date: "",
      startTime: "",
      duration: "",
      assignedUserIds: [] as string[],
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/shifts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      setShowForm(false);
      form.reset();
    },
  });

  const onSubmit = (data: any) => {
    createShiftMutation.mutate(data);
  };
  if(user?.type === "MANAGER"){
  return (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button variant="outline">Weekly Allocate Shift</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Allocate New Weekly Shift</DialogTitle>
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
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
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
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="assignedUserIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Users</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {users.map((user) => (
                            <label key={user.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value.includes(user.id)}
                                onChange={() => {
                                  if (field.value.includes(user.id)) {
                                    field.onChange(field.value.filter((id: string) => id !== user.id));
                                  } else {
                                    field.onChange([...field.value, user.id]);
                                  }
                                }}
                              />
                              <span>{user.name} ({user.role})</span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <Button type="submit" className="w-full" disabled={createShiftMutation.isPending}>
                    {createShiftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Allocate Shift
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
  );
}else{
  return null;
}
}
