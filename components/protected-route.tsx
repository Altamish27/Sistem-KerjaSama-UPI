"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const redirectedRef = useRef(false)

  useEffect(() => {
    // Only redirect once and only after loading is complete
    if (!isLoading && !user && !redirectedRef.current) {
      redirectedRef.current = true
      router.replace("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#e10000] mx-auto mb-2" />
          <p className="text-sm text-slate-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#e10000]" />
      </div>
    )
  }

  return <>{children}</>
}
