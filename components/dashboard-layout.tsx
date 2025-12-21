"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, FileText, Home, Users } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ROLE_LABELS, MOCK_PROPOSALS } from "@/lib/mock-data"
import { canUserApprove } from "@/lib/workflow-utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const pendingReviewsCount = MOCK_PROPOSALS.filter((proposal) => {
    if (proposal.status === "completed" || proposal.status === "rejected") {
      return false
    }
    return canUserApprove(proposal.status, user!.role)
  }).length

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Proposal", href: "/dashboard/proposals", icon: FileText },
    ...(user?.role !== "dosen"
      ? [{ name: "Review", href: "/dashboard/review", icon: Users, badge: pendingReviewsCount }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Executive Clean: White background with subtle red accent */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center gap-3">
              <div className="w-1 h-10 bg-[#e10000] rounded-full"></div>
              <h1 className="text-xl font-bold text-slate-900">Sistem Kerja Sama <span className="text-[#e10000]">UPI</span></h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role && ROLE_LABELS[user.role]}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Executive Clean: White with subtle active indicator */}
        <aside className="w-72 border-r border-slate-200 bg-white min-h-[calc(100vh-4.5rem)]">
          <nav className="p-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/dashboard")
              return (
                <Link key={item.name} href={item.href}>
                  <div className="relative">
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#e10000] rounded-r-full"></div>}
                    <Button
                      variant="ghost"
                      className={`w-full justify-start pl-6 py-6 ${
                        isActive 
                          ? "text-[#e10000] font-semibold bg-red-50/50" 
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-[#e10000]" : "text-slate-500"}`} />
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

        {/* Main Content - Generous whitespace */}
        <main className="flex-1 p-10 bg-slate-50">{children}</main>
      </div>
    </div>
  )
}
