"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Email atau password salah")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 shadow-sm mb-6">
            <GraduationCap className="w-10 h-10 text-[#e10000]" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sistem Kerja Sama</h1>
          <p className="text-slate-600 text-lg">Universitas Pendidikan Indonesia</p>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-black font-bold text-xl">Login</CardTitle>
            <CardDescription className="text-gray-600">
              Masukkan email dan password untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@upi.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10 py-3 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-medium text-base">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10 py-3 text-base"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-[#e10000] text-white hover:bg-[#c10000] font-semibold py-6 text-base shadow-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-gray-700 mb-2 font-semibold">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>MITRA: mitra@partner.com</p>
                <p>Fakultas: fakultas@upi.edu</p>
                <p>DKUI: dkui@upi.edu</p>
                <p>Biro Hukum: biro.hukum@upi.edu</p>
                <p>Wakil Rektor: warek@upi.edu</p>
                <p>Rektor: rektor@upi.edu</p>
                <p>
                  Password untuk semua: <span className="text-black font-semibold">password</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
