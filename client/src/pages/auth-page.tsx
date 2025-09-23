import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Factory } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
  role: z.enum(["worker", "supervisor", "admin"]),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "worker",
      department: "",
      position: "",
    },
  });

  // Redirect if already authenticated
  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Factory className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">FactoryPro</h1>
            <p className="text-gray-600 mt-2">Work Scheduling Dashboard</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="auth-tabs">
            <TabsList className="grid w-full grid-cols-2" data-testid="tabs-list">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" data-testid="login-tab">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="login-title">Welcome Back</CardTitle>
                  <CardDescription data-testid="login-description">
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" data-testid="login-form">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} data-testid="input-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} data-testid="input-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium mb-2">Demo Credentials:</p>
                    <div className="text-xs space-y-1">
                      <div><strong>Admin:</strong> admin / admin123</div>
                      <div><strong>Worker:</strong> worker / worker123</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" data-testid="register-tab">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="register-title">Create Account</CardTitle>
                  <CardDescription data-testid="register-description">
                    Register as a new employee
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4" data-testid="register-form">
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "worker"}>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="worker">Worker</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} data-testid="input-register-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                  <SelectTrigger data-testid="select-department">
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Production">Production</SelectItem>
                                    <SelectItem value="Quality Control">Quality Control</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Administration">Administration</SelectItem>
                                    <SelectItem value="Security">Security</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input placeholder="Job title" {...field} value={field.value || ""} data-testid="input-position" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} data-testid="input-register-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} data-testid="input-confirm-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            Streamline Your Factory Operations
          </h2>
          <div className="space-y-4 text-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full mr-3"></div>
              <span>Manage work schedules efficiently</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full mr-3"></div>
              <span>Track attendance and time</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full mr-3"></div>
              <span>Handle leave requests seamlessly</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full mr-3"></div>
              <span>Real-time analytics and reporting</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <Factory className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
