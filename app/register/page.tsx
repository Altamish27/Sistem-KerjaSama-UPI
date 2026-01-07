"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, Building2, GraduationCap, Shield, Users, Briefcase } from "lucide-react"

const ROLE_OPTIONS = [
  {
    value: "mitra",
    label: "Mitra / Partner",
    description: "Institusi eksternal yang ingin bekerjasama dengan UPI",
    icon: Briefcase,
    color: "text-blue-600",
  },
  {
    value: "dkui",
    label: "Staff DKUI",
    description: "Divisi Kerjasama & Urusan Internasional",
    icon: Users,
    color: "text-purple-600",
  },
  {
    value: "fakultas",
    label: "Staff Fakultas",
    description: "Dekan / Kaprodi / Staff Fakultas",
    icon: GraduationCap,
    color: "text-green-600",
  },
  {
    value: "biro_hukum",
    label: "Biro Hukum",
    description: "Staff Biro Hukum UPI",
    icon: Shield,
    color: "text-amber-600",
  },
  {
    value: "rektor",
    label: "Pimpinan",
    description: "Rektor / Wakil Rektor",
    icon: Building2,
    color: "text-red-600",
  },
]

export default function RegisterPage() {
  const router = useRouter()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Daftar Akun Baru</CardTitle>
          <CardDescription className="text-base">
            Sistem Kerjasama Universitas Pendidikan Indonesia
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-base font-semibold">
                Pilih Role <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedRole} onValueChange={handleRoleChange} required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih role Anda..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => {
                    const Icon = role.icon
                    return (
                      <SelectItem key={role.value} value={role.value} className="py-3">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${role.color}`} />
                          <div>
                            <div className="font-semibold">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {selectedRoleData && (
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                  <selectedRoleData.icon className={`w-4 h-4 ${selectedRoleData.color}`} />
                  {selectedRoleData.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Conditional Fields Based on Role */}
            {selectedRole === "mitra" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900">Informasi Mitra</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">
                      Nama Institusi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="institution"
                      type="text"
                      placeholder="PT. Example Indonesia"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xx-xxxx-xxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedRole === "fakultas" || selectedRole === "biro_hukum") && (
              <div className="space-y-2">
                <Label htmlFor="fakultas">
                  {selectedRole === "fakultas" ? "Fakultas" : "Unit"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fakultas"
                  type="text"
                  placeholder={
                    selectedRole === "fakultas"
                      ? "Fakultas Pendidikan Matematika dan Ilmu Pengetahuan Alam"
                      : "Biro Hukum"
                  }
                  value={formData.fakultas}
                  onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {selectedRole === "dkui" && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900">
                  <strong>Info:</strong> Anda akan terdaftar sebagai staff DKUI dengan akses penuh untuk mengelola
                  semua proposal kerjasama.
                </p>
              </div>
            )}

            {selectedRole === "rector" && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-900">
                  <strong>Info:</strong> Akun pimpinan memiliki hak akses tingkat tinggi untuk approval final.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Daftar Sekarang
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Login di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
