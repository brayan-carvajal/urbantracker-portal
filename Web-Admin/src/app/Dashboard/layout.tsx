"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  Car,
  ChevronDown,
  Clock,
  Cog,
  MapPin,
  Route,
  Shuffle,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { DashboardHeader } from "./components/DashboardHeader";
import { useTheme } from "@/hooks/useTheme";
import { DriverProvider } from "./drivers/context/DriverContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

interface SubMenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Administrar Conductores",
    icon: Users,
    subItems: [
      {
        title: "Conductores",
        href: "/Dashboard/drivers",
        icon: Users,
      },
      {
        title: "Horarios de Conductores",
        href: "/Dashboard/driver-schedule",
        icon: Clock,
      },
    ],
  },
  {
    title: "Administrar Empresas",
    href: "/Dashboard/company",
    icon: Building2,
  },

  {
    title: "Administrar Vehículos",
    icon: Car,
    subItems: [
      {
        title: "Tipos de Vehículos",
        href: "/Dashboard/vehicleType",
        icon: Cog,
      },
      {
        title: "Vehículos",
        href: "/Dashboard/vehicles",
        icon: Car,
      },
      {
        title: "Asignación de Vehículos",
        href: "/Dashboard/vehicleAssigments",
        icon: Shuffle,
      },
    ],
  },
  {
    title: "Administrar Rutas",
    icon: Route,
    subItems: [
      {
        title: "Rutas",
        href: "/Dashboard/routes",
        icon: Route,
      },
      {
        title: "Horarios de Rutas",
        href: "/Dashboard/route-schedule",
        icon: Clock,
      },
      {
        title: "Asignación de Rutas",
        href: "/Dashboard/route-assign",
        icon: MapPin,
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expandedItems, setExpandedItems] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => prev === title ? null : title);
  };

  const isExpanded = (title: string) => expandedItems === title;

  const isActiveRoute = (href: string) => pathname === href;

  const isParentActive = (subItems?: SubMenuItem[]) => {
    if (!subItems) return false;
    return subItems.some((item) => pathname === item.href);
  };

  // Determinar logo según tema - con placeholder durante hidratación
  const logoSrc = mounted ? (theme === "dark" ? "/logo-icon-white.svg" : "/logo-icon-black.svg") : "/logo-icon-white.svg";

  return (
    <QueryClientProvider client={queryClient}>
      <DriverProvider>
        <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border shadow-2xl">
          <div className="flex h-20 items-center px-8 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Image
                src={logoSrc}
                alt="Logo UrbanTracker"
                width={280}
                height={280}
                className="mx-auto h-11 w-11"
              />
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">UrbanTracker</h1>
                <p className="text-sm text-sidebar-foreground/70">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-6">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
                Principal
              </h3>
              <Link
                href="/Dashboard"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 group hover:shadow-lg hover:scale-105 transform"
              >
                <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground" />
                <span className="font-medium">Panel de Control</span>
              </Link>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
                Gestión
              </h3>

              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.title}>
                    {item.subItems ? (
                      // Menu item with submenus
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.title)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-3 text-left rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-105 group",
                            isParentActive(item.subItems)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm scale-100"
                              : "text-sidebar-foreground/80"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon
                              className={cn(
                                "h-5 w-5 transition-colors",
                                isParentActive(item.subItems)
                                  ? "text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                              )}
                            />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-300",
                              isExpanded(item.title)
                                ? "rotate-180"
                                : "rotate-0",
                              isParentActive(item.subItems)
                                ? "text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                            )}
                          />
                        </button>

                        {/* Submenu */}
                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-300",
                            isExpanded(item.title)
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          )}
                        >
                          <ul className="mt-2 ml-4 space-y-1 relative">
                            {item.subItems.map((subItem) => (
                              <li key={subItem.title}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md scale-95 hover:scale-100 group",
                                    isActiveRoute(subItem.href)
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm scale-100"
                                      : "text-sidebar-foreground/80"
                                  )}
                                >
                                  <subItem.icon
                                    className={cn(
                                      "h-5 w-5 transition-colors",
                                      isActiveRoute(subItem.href)
                                        ? "text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                                    )}
                                  />
                                  <span className="text-sm font-medium">
                                    {subItem.title}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : item.href ? (
                      // Simple menu item
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-105 group",
                          isActiveRoute(item.href)
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm scale-100"
                            : "text-sidebar-foreground/80"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActiveRoute(item.href)
                              ? "text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                          )}
                        />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="pl-72">
          <DashboardHeader />

          {/* Page content */}
          <main className="p-8 bg-background">
            {children}
          </main>
        </div>

        
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
      </DriverProvider>
    </QueryClientProvider>
  );
}
