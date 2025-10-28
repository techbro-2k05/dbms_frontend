import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import api from "@/services/api";
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
  { label: "Role A", value: 1 },
  { label: "Role B", value: 2 },
  { label: "Role C", value: 3 },
  { label: "Role D", value: 4 },
  // ... add more roles as integers
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
      const response = await api.post('/members', payload);
      
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      
      form.reset();
      
      // Optional: Redirect back to admin dashboard or user list
      setTimeout(() => {
        setLocation("/admin-dashboard");
      }, 1500);
      
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
      <a href="/admin-dashboard">
                        &larr; Back
                    </a>
                </Button>
    </div>
    <div className="flex justify-center items-start md:py-10 min-h-screen p-4 bg-white  ">
      <Card className="w-full max-w-lg shadow-2xl"> 
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
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
                      <Input {...field} required />
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
                      <Input {...field} required />
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
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
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
                    <FormLabel>worksAt</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowedPaidLeaves"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>allowedPaidLeaves</FormLabel>
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
                    <FormLabel>allowedHours</FormLabel>
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
                    <FormLabel>gender</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
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
                  <FormItem className="flex flex-col">
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Adding..." : "Add User"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}