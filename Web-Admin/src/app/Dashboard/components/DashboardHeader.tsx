"use client";

import { RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export function DashboardHeader() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleRefresh = () => {
    // Invalidate all dashboard queries
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="h-20 border-b border-border bg-background/90 backdrop-blur-sm overflow-hidden">
      <div className="flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Panel de Control
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona tu flota de transporte
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-accent"
            aria-label="Actualizar datos del dashboard"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}