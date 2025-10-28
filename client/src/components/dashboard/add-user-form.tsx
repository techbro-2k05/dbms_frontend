import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import api from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
type FormValues = {
  fname: string;
  mname: string;
  lname: string;
  password: string;
  type: string;
  phone: string;
  gender: string; // "MALE" or "FEMALE"
  allowedPaidLeaves: number;
  allowedHours: number;
  worksAt?: number;
  feasibleRoles?: number[];
};

const ROLE_OPTIONS = [
  { label: "MANAGER", value: 1 },
  { label: "ELECTRICIAN", value: 2 },
  { label: "CARPENTER", value: 3 },
  { label: "PLUMBER", value: 4 },
  { label: "SECURITY_GUARD", value: 5 },
  { label: "CLEANER", value: 6 },
  { label: "RECEPTIONIST", value: 7 },
  { label: "SUPERVISOR", value: 8 },
  { label: "TECHNICIAN", value: 9 },
];

// Location dictionary mapped to DB IDs (1..5)
const LOCATION_OPTIONS = [
  { value: 1, label: "12A, Maple Street, Mumbai 400001" },
  { value: 2, label: "7B, Oak Avenue, Pune 411001" },
  { value: 3, label: "101, Cedar Lane, Bengaluru 560001" },
  { value: 4, label: "45, Pine Road, Chennai 600001" },
  { value: 5, label: "9C, Birch Boulevard, Kolkata 700001" },
];

export default function AddUserForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<FormValues>({
    defaultValues: {
      fname: "",
      mname: "",
      lname: "",
      password: "",
      type: "MEMBER",
      phone:"",
      gender: "MALE",//"MALE" or "FEMALE"
      allowedPaidLeaves:0,
      allowedHours: 0,
      worksAt: 0,
      feasibleRoles: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Prepare the RegisterMemberRequest payload matching backend structure
      const payload = {
        fname: values.fname?.trim(),
        mname: values.mname?.trim(),
        lname: values.lname?.trim(),
        password: values.password?.trim(),
        type: values.type?.trim(),
        phone: values.phone?.trim(),
        gender: values.gender?.trim(),
        allowedPaidLeaves: values.allowedPaidLeaves,
        allowedHours: values.allowedHours,
        worksAt: values.worksAt,
        feasibleRoles: values.feasibleRoles || [],
      };

  // Send POST request to /members endpoint
  const response = await api.post('/members', payload, { withCredentials: true });
  const created = response.data;
      
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      
      // Optimistically merge into cached list so admin dashboard shows it immediately
      queryClient.setQueryData(["/members"], (old: any) => {
        if (Array.isArray(old)) {
          // Avoid duplicates if navigating back (id check)
          const exists = old.some((u: any) => u.id === created?.id);
          return exists ? old : [created, ...old];
        }
        return created ? [created] : old;
      });

      // Also invalidate and refetch in background to stay authoritative
      queryClient.invalidateQueries({ queryKey: ["/members"] });
      queryClient.refetchQueries({ queryKey: ["/members"] });

      form.reset();
      
      // Optional: Redirect back to admin dashboard or user list
      setTimeout(() => {
        setLocation("/admin-dashboard");
      }, 800);
      
    } catch (error: any) {
      console.error("Create user failed:", error);
      const msg =
        error?.response?.data?.message || 
        error?.message || 
        "Failed to create user";
      
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
    }
  };
  return (
    <div>

    <div className="absolute top-4 right-4 z-10">
      <Button asChild variant="outline" className="text-sm">
        <a href="/admin-dashboard">&larr; Back</a>
      </Button>
    </div>

    <div className="flex justify-center items-start md:py-10 min-h-screen p-4 bg-gradient-to-br from-slate-50 via-indigo-50/60 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Card className="w-full max-w-3xl card-elevated"> 
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-3xl title-gradient">Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="fname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} required placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="A." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} required placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="MANAGER">MANAGER</SelectItem>
                        <SelectItem value="MEMBER">MEMBER</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="worksAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      value={field.value && field.value > 0 ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATION_OPTIONS.map((loc) => (
                          <SelectItem key={loc.value} value={String(loc.value)}>
                            {loc.label}
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
                name="allowedPaidLeaves"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed Paid Leaves</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed Hours</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">MALE</SelectItem>
                        <SelectItem value="FEMALE">FEMALE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="feasibleRoles" // Must match the field name in your form schema
                render={({ field }) => (
                  <FormItem className="flex flex-col md:col-span-2">
                    <FormLabel>Feasible Roles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={ROLE_OPTIONS}
                        // The field.value is the current array of integers from RHF
                        value={field.value || []} 
                        // RHF's onChange receives the new array from the MultiSelect component
                        onChange={field.onChange} 
                        placeholder="Select applicable roles"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Adding..." : "Add User"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}