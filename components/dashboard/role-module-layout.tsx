"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, type AppRole } from "@/lib/workflow";
import { getRoleNavItems, isDashboardModuleId, type DashboardModuleId } from "@/lib/dashboard-config";
import { useSessionUser } from "@/hooks/use-session-user";

interface RoleModuleLayoutProps {
  role: AppRole;
  children: React.ReactNode;
}

export default function RoleModuleLayout({ role, children }: RoleModuleLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getRoleNavItems(role);
  const [activeModuleId, setActiveModuleId] = useState<DashboardModuleId>("home");

  useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (isDashboardModuleId(tabParam)) {
      setActiveModuleId(tabParam);
      return;
    }
    setActiveModuleId("home");
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      <header className="w-full sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-700 hover:text-[#e10000] hover:bg-red-50"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-3">
                <Image
                  src="/upi.png"
                  alt="Logo UPI"
                  width={40}
                  height={40}
                  className="object-contain w-auto h-auto"
                />
                <div className="border-l border-gray-300 pl-3">
                  <p className="text-xs text-gray-500 font-medium">Sistem Kerja Sama</p>
                  <h1 className="text-base md:text-lg font-bold text-gray-900">Universitas Pendidikan Indonesia</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end mr-3">
                <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{ROLE_LABEL[role]}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-[#e10000] hover:bg-red-50"
                title="Pengaturan"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-[#e10000] hover:bg-red-50"
                onClick={handleLogout}
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "bg-white border-r border-gray-200 w-72 shrink-0 flex flex-col transition-transform duration-300 ease-in-out z-20 shadow-lg lg:shadow-none",
            "fixed inset-y-0 left-0 top-[73px] lg:top-auto lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="px-4 py-6 border-b border-gray-200 bg-gradient-to-br from-[#e10000] to-[#b00000]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user?.name || "User"}</p>
                <p className="text-xs text-white/80 font-medium">{ROLE_LABEL[role]}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith("/dashboard/") && item.moduleId === activeModuleId;

              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      "text-gray-700 hover:bg-red-50 hover:text-[#e10000]",
                      isActive && "bg-gradient-to-r from-[#e10000] to-[#b00000] text-white hover:text-white shadow-md hover:shadow-lg",
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "drop-shadow-sm")} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-[#ffcc00]/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ffcc00] to-[#ffa500] flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Butuh Bantuan?</p>
                  <p className="text-xs text-gray-600">Hubungi admin untuk panduan penggunaan sistem</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
