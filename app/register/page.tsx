"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, Landmark, Moon, Sun, ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"

export default function RegisterPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => setMounted(true), [])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [role, setRole] = useState("mitra")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.email || !formData.password || !role) {
      setError("Mohon lengkapi semua field yang wajib")
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role,
          }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Terjadi kesalahan saat registrasi")
      }

      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat registrasi")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4 bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300 font-sans">
      <div className="w-full h-screen md:h-auto md:max-w-7xl md:aspect-[16/9] flex flex-col md:flex-row bg-white dark:bg-[#1e293b] rounded-none md:rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200/50 dark:border-white/5">
        {/* Left Side: Hero Image & Branding */}
        <div className="hidden md:flex md:w-1/2 relative group overflow-hidden">
          <Image
            src="/fotoHero.jpg"
            alt="Universitas Pendidikan Indonesia"
            fill
            priority
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#e10000]/90 via-[#b00000]/80 to-[#1B365D]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
            <div className="flex items-center gap-4">
              <Image
                src="/upi.png"
                alt="Logo UPI"
                width={80}
                height={80}
                className="drop-shadow-2xl w-auto h-auto"
              />
              <div>
                <h3 className="text-2xl font-black tracking-tight">Universitas Pendidikan</h3>
                <h3 className="text-2xl font-black tracking-tight text-[#ffcc00]">Indonesia</h3>
              </div>
            </div>

            <div className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <h2 className="text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                Bergabung untuk <br />
                <span className="text-[#ffcc00]">Kolaborasi Strategis</span>
              </h2>
              <p className="text-white/90 text-xl font-medium leading-relaxed max-w-lg">
                Daftarkan organisasi Anda untuk memulai pengajuan kerja sama dengan Universitas Pendidikan Indonesia.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="h-1.5 w-16 bg-[#ffcc00] rounded-full shadow-lg" />
              <div className="h-1.5 w-3 bg-white/30 rounded-full" />
              <div className="h-1.5 w-3 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 relative bg-white dark:bg-[#0f172a]">
          {/* Theme Toggle */}
          <button
            type="button"
            className="absolute top-8 right-8 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/5 active:scale-95 shadow-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="w-full max-w-md space-y-10">
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="inline-flex items-center justify-center mb-6">
                <Image
                  src="/upi.png"
                  alt="Logo UPI"
                  width={100}
                  height={100}
                  className="drop-shadow-xl w-auto h-auto"
                />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Daftar Mitra</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-[0.15em]">Universitas Pendidikan Indonesia</p>
              <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-[#e10000] to-[#ffcc00] rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="rounded-2xl">
                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="group">
                  <Label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Nama Lengkap</Label>
                  <Input id="name" type="text" placeholder="Nama lengkap" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} className="block w-full pl-4 pr-4 py-4 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-base shadow-sm" />
                </div>

                <div className="group">
                  <Label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Email</Label>
                  <Input id="email" type="email" placeholder="nama@domain.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={loading} className="block w-full pl-4 pr-4 py-4 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-base shadow-sm" />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Password</Label>
                  <Input id="password" type="password" placeholder="Minimal 6 karakter" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={loading} className="block w-full pl-4 pr-4 py-4 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-base shadow-sm" />
                </div>

                <div>
                  <Label htmlFor="role" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Peran</Label>
                  <Select onValueChange={(v) => setRole(v)} defaultValue={role}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mitra">Mitra</SelectItem>
                      <SelectItem value="dkui">DKUI</SelectItem>
                      <SelectItem value="fakultas">Fakultas</SelectItem>
                      <SelectItem value="rektor">Rektor</SelectItem>
                      <SelectItem value="warek">Wakil Rektor</SelectItem>
                      <SelectItem value="biro_hukum">Biro Hukum</SelectItem>
                      <SelectItem value="sekretaris_univ">Sekretaris Univ</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Daftar sebagai Mitra
                  </div>
                )}
              </Button>

              <div className="pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sudah punya akun? <Link href="/login" className="text-red-600 hover:text-red-700 font-extrabold inline-flex items-center gap-1">Login di sini <ArrowRight className="w-4 h-4" /></Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
