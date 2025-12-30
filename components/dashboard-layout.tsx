"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, FileText, Home, Users, Menu, ChevronLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ROLE_LABELS } from "@/lib/mock-data"
import { useDataStore } from "@/lib/data-store"
import { canUserTakeAction } from "@/lib/workflow-engine"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { proposals } = useDataStore()

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const pendingReviewsCount = proposals.filter((proposal) => {
    if (proposal.status === "completed" || proposal.status === "rejected") {
      return false
    }
    return canUserTakeAction(proposal.status, user!.role)
  }).length

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Proposal", href: "/dashboard/proposals", icon: FileText },
    ...(user?.role !== "mitra"
      ? [{ name: "Review", href: "/dashboard/review", icon: Users, badge: pendingReviewsCount }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-slate-700 hover:bg-slate-100 hover:text-slate-900 p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-1 h-8 bg-[#e10000] rounded-full"></div>
                <h1 className="text-lg font-bold text-slate-900">
                  Sistem Kerja Sama <span className="text-[#e10000]">UPI</span>
                </h1>
              </div>
              <div className="sm:hidden flex items-center gap-2">
                <div className="w-1 h-6 bg-[#e10000] rounded-full"></div>
                <span className="text-base font-bold text-[#e10000]">UPI</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role && ROLE_LABELS[user.role]}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            ${isMobile ? "fixed top-16" : "sticky top-16"} 
            left-0 z-40
            bg-white border-r border-slate-200 
            h-[calc(100vh-4rem)] 
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0 w-64 lg:w-72" : isMobile ? "-translate-x-full w-64" : "w-0 -translate-x-full"}
            overflow-hidden flex-shrink-0
          `}
        >
          {/* Sidebar Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Menu</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1 h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/dashboard")
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <div className="relative">
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#e10000] rounded-r-full"></div>
                    )}
                    <Button
                      variant="ghost"
                      className={`w-full justify-start pl-5 py-5 ${
                        isActive 
                          ? "text-[#e10000] font-semibold bg-red-50/50" 
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? "text-[#e10000]" : "text-slate-500"}`} />
                      <span className="text-[15px]">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-0.5 min-w-[22px] h-5 font-semibold border border-amber-200">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          className={`
            flex-1 min-w-0 
            p-4 sm:p-6 lg:p-8 
            bg-slate-50 
            min-h-[calc(100vh-4rem)]
            transition-all duration-300
          `}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
