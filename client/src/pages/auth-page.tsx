import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Factory } from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: 0,
      password: "",
    },
  });

  const onSubmit = async (values: loginValues) => {
    try {
      // Call the login function from AuthContext which uses auth.ts
      const loggedInUser = await login(values.id, values.password);
      console.log("Logged in user:", loggedInUser);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      
      // Redirect based on the user type returned from login
      if (loggedInUser) {
        console.log(loggedInUser.type);
        if (loggedInUser.type === "ADMIN") {
          setLocation("/admin-dashboard");
        } else if (loggedInUser.type === "MANAGER") {
          setLocation("/manager-dashboard");
        } else if (loggedInUser.type === "MEMBER") {
          setLocation("/worker-dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const msg =
        error?.response?.data?.message || 
        error?.message || 
        "Invalid credentials";
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: msg,
      });
    }
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
                    <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
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
                        {loginForm.formState.isSubmitting ? "logging in..." : "login"}
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
