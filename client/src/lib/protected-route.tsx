import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/AuthContext";

type UserType = "ADMIN" | "MANAGER" | "MEMBER";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: {
  path: string;
  component: () => React.JSX.Element | null;
  allowedRoles?: UserType[]; // Optional: if not provided, just checks authentication
}) {
  const { user, isLoading, accessToken, refreshUser } = useAuth();
  const [hydrating, setHydrating] = useState(false);
  const [triedHydrate, setTriedHydrate] = useState(false);

  // Guard against race conditions: if we have a token but no user yet, try to hydrate
  useEffect(() => {
    if (!user && accessToken && !isLoading && !hydrating && !triedHydrate) {
      setHydrating(true);
      setTriedHydrate(true);
      refreshUser().finally(() => setHydrating(false));
    }
  }, [user, accessToken, isLoading, hydrating, triedHydrate, refreshUser]);

  // Reset hydration attempt when token changes
  useEffect(() => {
    setTriedHydrate(false);
  }, [accessToken]);

  if (isLoading || hydrating || (accessToken && !user)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to /auth');
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.type as UserType)) {
    console.log(`ProtectedRoute: User type ${user.type} not allowed, redirecting based on role`);
    // Redirect to the appropriate dashboard based on user type
    const redirectPath = user.type === "ADMIN" 
      ? "/admin-dashboard" 
      : user.type === "MANAGER" 
      ? "/manager-dashboard" 
      : "/worker-dashboard";
    
    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }

  console.log(`ProtectedRoute: Access granted to ${path} for user type ${user.type}`);
  return <Route path={path}><Component /></Route>;
}
