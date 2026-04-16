"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { MitraDashboardBaru } from "@/components/dashboard-baru/mitra-dashboard-baru"
import { FakultasDashboardBaru } from "@/components/dashboard-baru/fakultas-dashboard-baru"
import { BiroHukumDashboardBaru } from "@/components/dashboard-baru/biro-hukum-dashboard-baru"
import { SupervisiDashboardBaru } from "@/components/dashboard-baru/supervisi-dashboard-baru"
import { DKUIStatisticsDashboard } from "@/components/dkui-statistics-dashboard"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// ─── Router: menentukan tampilan berdasarkan role ────────────────────────────
function DashboardContent() {
  const { user } = useAuth()

  switch (user?.role) {
    case "mitra":
      return <MitraDashboardBaru />
    case "fakultas":
      return <FakultasDashboardBaru />
    case "dkui":
      return (
        <div className="space-y-6 sm:space-y-8">
          <DKUIStatisticsDashboard />
        </div>
      )
    case "biro_hukum":
      return <BiroHukumDashboardBaru />
    case "wakil_rektor":
    case "rektor":
      return <SupervisiDashboardBaru />
    default:
      return (
        <div className="space-y-6 sm:space-y-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard</h1>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-5">
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Selamat Datang</CardTitle>
              <CardDescription className="text-slate-600 text-sm sm:text-base">
                Silakan login dengan role yang sesuai
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
  }
}
