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
import { UserService } from "@/services/api";
import { Navigate } from 'react-router-dom';
const loginSchema = z.object({
   id: z.coerce.number({
      required_error: "ID is required", // Use required_error for empty/missing
      invalid_type_error: "ID must be a number", // Error if it contains text
  }).positive("ID must be positive"), 
  password: z.string().min(1, "Password is required"),
});

type loginValues = {
  id: number;
  password: string;
};

// const registerSchema = z.object({
//   name: z.string().min(1, "Full name is required"),
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   confirmPassword: z.string().min(6, "Password confirmation is required"),
//   type: z.enum(["worker", "supervisor", "admin"]),
//   department: z.string().optional().nullable(),
//   position: z.string().optional().nullable(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

type LoginData = z.infer<typeof loginSchema>;
// type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation} = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: 0,
      password: "",
    },
  });
  if (user) {
    return <Redirect to="/" />;
  }
  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };
  const onSubmit= async(values: loginValues)=>{
     try {
          // The number input issue must be fixed on the field level as shown in the previous answer.
          // Assuming you will implement the custom onChange logic for number fields later.
          const payload = {
            is:values.id,
            password: values.password?.trim(),
          };
          await UserService.create(payload);
          alert("Signed in successfully");
          return <Navigate to="/" replace={true} />;
        } catch (error: any) {
          console.error("Create user failed:", error);
          const msg =
            error?.response?.data?.message || error?.message || "Unknown error";
          alert("Failed to create user: " + msg);
        }
      };
  // const onRegister = (data: RegisterData) => {
  //   const { confirmPassword, ...registerData } = data;
  //   registerMutation.mutate(registerData);
  // };

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
            {/* <TabsList className="grid w-full grid-cols-2 justify-centre" data-testid="tabs-list">
              {/* <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger> */}
              {/* <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger> */}
            {/* </TabsList> */} 

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
                        name="id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UserId</FormLabel>
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
                      <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                        {loginForm.formState.isSubmitting ? "Adding..." : "Add User"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium mb-2">Demo Credentials:</p>
                    <div className="text-xs space-y-1">
                      <div><strong>Admin:</strong> 123 / admin123</div>
                      <div><strong>Worker:</strong> 1234 / worker123</div>
                    </div>
                  </div>
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
