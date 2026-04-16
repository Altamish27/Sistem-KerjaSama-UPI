"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  GraduationCap, Loader2, Mail, Lock, UserPlus, Building2, Shield, Users, Briefcase, Landmark, Moon, Sun, ArrowRight, User, Phone
} from "lucide-react"
import { useTheme } from "next-themes";

const ROLE_OPTIONS = [
  {
    value: "mitra",
    label: "Mitra / Partner",
    description: "Institusi eksternal yang ingin bekerjasama dengan UPI",
    icon: Briefcase,
    color: "text-blue-500",
  },
  {
    value: "dkui",
    label: "Staff DKUI",
    description: "Divisi Kerjasama & Urusan Internasional",
    icon: Users,
    color: "text-purple-500",
  },
  {
    value: "fakultas",
    label: "Staff Fakultas",
    description: "Dekan / Kaprodi / Staff Fakultas",
    icon: GraduationCap,
    color: "text-emerald-500",
  },
  {
    value: "biro_hukum",
    label: "Biro Hukum",
    description: "Staff Biro Hukum UPI",
    icon: Shield,
    color: "text-amber-500",
  },
  {
    value: "rektor",
    label: "Pimpinan",
    description: "Rektor / Wakil Rektor",
    icon: Building2,
    color: "text-red-500",
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    institution: "",
    fakultas: "",
    phone: "",
  })

  // Ensure theme is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validasi
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Mohon lengkapi semua field yang wajib")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok")
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    // Validasi field khusus per role
    if (formData.role === "mitra" && !formData.institution) {
      setError("Nama institusi wajib diisi untuk Mitra")
      return
    }

    if (["fakultas", "biro_hukum"].includes(formData.role) && !formData.fakultas) {
      setError("Fakultas/Unit wajib diisi")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registrasi gagal")
      }

      // Redirect ke login dengan pesan sukses
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat registrasi")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (value: string) => {
    setSelectedRole(value)
    setFormData({ ...formData, role: value })
  }

  const selectedRoleData = ROLE_OPTIONS.find((r) => r.value === selectedRole)

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4 bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300 font-sans">
      <div className="w-full h-screen md:h-auto md:min-h-[85vh] md:max-w-7xl flex flex-col md:flex-row bg-white dark:bg-[#1e293b] rounded-none md:rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200/50 dark:border-white/5">
        
        {/* Left Side: Hero Image & Branding */}
        <div className="hidden md:flex md:w-[45%] lg:w-1/2 relative group overflow-hidden">
          <Image
            src="/fotoHero2.jpg"
            alt="Universitas Pendidikan Indonesia"
            fill
            priority
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#001730]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B365D] via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col justify-end p-16 text-white w-full">
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <GlobeIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight decoration-red-500 decoration-4">
                Bergabung dalam <br />
                <span className="text-red-500">Jejaring Kemitraan</span>
              </h2>
              <p className="text-blue-100/80 text-xl font-medium leading-relaxed max-w-lg">
                Daftarkan instansi atau unit kerja Anda untuk menginisiasi dan mengelola kerjasama bersama Universitas Pendidikan Indonesia.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="h-1.5 w-16 bg-red-600 rounded-full" />
              <div className="h-1.5 w-3 bg-white/20 rounded-full" />
              <div className="h-1.5 w-3 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full md:w-[55%] lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16 relative bg-white dark:bg-[#0f172a] overflow-y-auto max-h-screen">
          {/* Theme Toggle */}
          <button
            type="button"
            className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/5 active:scale-95 shadow-sm z-50"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="w-full max-w-lg space-y-8 my-auto pt-16 md:pt-0">
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 mb-6 ring-1 ring-red-200/50 dark:ring-red-500/20 shadow-xl shadow-red-500/10">
                <Landmark className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                Buat Akun Baru
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.15em]">
                Sistem Kerja Sama UPI
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              
              {/* Role */}
              <div className="space-y-2 group">
                <Label
                  htmlFor="role"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors"
                >
                  Pilih Role Anda <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedRole} onValueChange={handleRoleChange} required>
                  <SelectTrigger className="w-full py-6 px-4 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 dark:focus:border-red-500 focus:ring-offset-0 text-base shadow-sm">
                    <SelectValue placeholder="Pilih hak akses..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] shadow-xl z-[100]">
                    {ROLE_OPTIONS.map((role) => {
                      const Icon = role.icon
                      return (
                        <SelectItem key={role.value} value={role.value} className="py-3 px-4 focus:bg-red-50 dark:focus:bg-red-500/10 transition-colors rounded-xl cursor-pointer my-1">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gray-100 dark:bg-white/5 ${role.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 dark:text-gray-100">{role.label}</span>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {selectedRoleData && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1 flex items-center gap-1.5 mt-2 animate-in slide-in-from-top-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {selectedRoleData.description}
                  </p>
                )}
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <Label
                    htmlFor="name"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors group-focus-within:text-red-600"
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={loading}
                      className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 dark:focus:border-red-500 transition-all text-base shadow-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <Label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors group-focus-within:text-red-600"
                  >
                    Alamat Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@upi.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={loading}
                      className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 dark:focus:border-red-500 transition-all text-base shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <Label
                    htmlFor="password"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors group-focus-within:text-red-600"
                  >
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={loading}
                      className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 dark:focus:border-red-500 transition-all text-base shadow-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <Label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors group-focus-within:text-red-600"
                  >
                    Konfirmasi <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      disabled={loading}
                      className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 dark:focus:border-red-500 transition-all text-base shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Fields Based on Role */}
              {selectedRole === "mitra" && (
                <div className="space-y-4 p-5 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl animate-in fade-in slide-in-from-top-4">
                  <h3 className="font-bold text-red-900 dark:text-red-400 text-sm tracking-wide uppercase mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Data Institusi Mitra
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="group">
                      <Label htmlFor="institution" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                        Nama Perusahaan/Institusi <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <Input
                          id="institution"
                          type="text"
                          placeholder="PT. Telkom Indonesia"
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          required
                          disabled={loading}
                          className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0f172a] focus:ring-4 focus:ring-red-500/10 focus:border-red-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedRole === "fakultas" || selectedRole === "biro_hukum") && (
                <div className="space-y-4 p-5 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl animate-in fade-in slide-in-from-top-4">
                  <div className="group">
                    <Label htmlFor="fakultas" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                      {selectedRole === "fakultas" ? "Nama Fakultas" : "Nama Unit"} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <Input
                        id="fakultas"
                        type="text"
                        placeholder={selectedRole === "fakultas" ? "FPMIPA" : "Biro Hukum"}
                        value={formData.fakultas}
                        onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                        required
                        disabled={loading}
                        className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0f172a] focus:ring-4 focus:ring-red-500/10 focus:border-red-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 rounded-2xl animate-in fade-in duration-300"
                >
                  <AlertDescription className="text-red-800 dark:text-red-400 text-sm font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-7 rounded-2xl transition-all duration-300 shadow-xl shadow-red-500/20 hover:shadow-red-500/40 active:scale-[0.98] text-lg group relative overflow-hidden disabled:opacity-70 disabled:hover:scale-100 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan Data...
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
                    Buat Akun Sekarang
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-8 border-t border-gray-100 dark:border-white/5 text-center flex flex-col gap-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sudah memiliki akun?{" "}
                <Link
                  href="/login"
                  className="text-red-600 hover:text-red-700 font-extrabold transition-colors inline-flex items-center gap-1 group"
                >
                  Masuk di sini{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
