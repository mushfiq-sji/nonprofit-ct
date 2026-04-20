import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminRoute() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  // Safety net: demo accounts can never access admin
  const isDemoAccount = user?.email?.toLowerCase().includes("demo@") ?? false;

  const isAdmin = profile?.role === "admin" || profile?.role === "moderator";
  const shouldRedirect = !loading && !!user && !!profile && (isDemoAccount || !isAdmin);

  useEffect(() => {
    if (shouldRedirect) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
    }
  }, [shouldRedirect, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile is fetched asynchronously after loading=false — wait for it
  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isDemoAccount || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
