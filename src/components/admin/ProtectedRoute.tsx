import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, requireStaff = true }: { children: React.ReactNode; requireStaff?: boolean }) {
  const { user, loading, isStaff } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (requireStaff && !isStaff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="text-muted-foreground max-w-md">Sua conta não possui permissão para acessar o painel administrativo.</p>
      </div>
    );
  }
  return <>{children}</>;
}