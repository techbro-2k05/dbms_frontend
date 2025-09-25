import React from "react";
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
import { UserService } from "@/services/api";

type FormValues = {
  name: string;
  username: string;
  password: string;
  type: string;
  location?: string;
  role?: string;
};

export default function AddUserForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      type: "worker",
      location: "",
      role: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // optionally transform values before sending (e.g., trim)
      const payload = {
        // ...values,
        // name: values.name?.trim(),
        // username: values.username?.trim(),
        // location: values.location?.trim(),
        // role: values.role?.trim(),
        fName: values.name?.trim(),
        mName: null,
        lName: null,
        gender: null,
        phone: null,
        password: values.password,
      };

      await UserService.create(payload);
      // success handling
      alert("User created successfully");
      form.reset();
    } catch (error: any) {
      console.error("Create user failed:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Unknown error";
      alert("Failed to create user: " + msg);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New User</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
  );
}
