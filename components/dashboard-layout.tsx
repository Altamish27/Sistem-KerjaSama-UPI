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
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Sistem Kerja Sama</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.role && ROLE_LABELS[user.role]}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/30 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start relative ${
                      isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                    {item.badge && item.badge > 0 && (
                      <Badge className="ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
