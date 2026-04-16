"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  Loader2,
  Mail,
  Lock,
  LogIn,
  Landmark,
  Moon,
  Sun,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { saveSessionUser, type SessionUser } from "@/hooks/use-session-user";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const isRegistered = new URLSearchParams(window.location.search).get("registered") === "true";
    if (isRegistered) {
      setSuccessMessage("Registrasi berhasil! Silakan login dengan akun Anda.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.message || "Email atau password salah. Silakan coba lagi.";
        throw new Error(message);
      }

      const user = (await response.json()) as {
        id: string;
        email: string;
        name: string;
        role: SessionUser["role"];
        unit?: string;
        institution?: string;
      };

      saveSessionUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        unit: user.unit,
        institution: user.institution,
      });

      setSuccessMessage("Login berhasil! Mengarahkan ke dashboard...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

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
                Membangun Masa Depan <br />
                <span className="text-[#ffcc00]">Melalui Kolaborasi</span>
              </h2>
              <p className="text-white/90 text-xl font-medium leading-relaxed max-w-lg">
                Sistem terintegrasi untuk mengelola kemitraan strategis dan
                kerja sama akademik Universitas Pendidikan Indonesia.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="h-1.5 w-16 bg-[#ffcc00] rounded-full shadow-lg" />
              <div className="h-1.5 w-3 bg-white/30 rounded-full" />
              <div className="h-1.5 w-3 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 relative bg-white dark:bg-[#0f172a]">
          {/* Theme Toggle */}
          <button
            type="button"
            className="absolute top-8 right-8 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/5 active:scale-95 shadow-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
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
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                Sistem Kerja Sama
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-[0.15em]">
                Universitas Pendidikan Indonesia
              </p>
              <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-[#e10000] to-[#ffcc00] rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-10">
              <div className="space-y-6">
                <div className="group">
                  <Label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors group-focus-within:text-red-600"
                  >
                    Email Institusi
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@upi.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 dark:focus:border-red-500 transition-all text-base shadow-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <Label
                      htmlFor="password"
                      className="block text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-red-600"
                    >
                      Password
                    </Label>
                    <Link
                      href="#"
                      className="text-xs font-bold text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-6 border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 dark:focus:border-red-500 transition-all text-base shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {successMessage && (
                <Alert className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 rounded-2xl animate-in fade-in duration-300">
                  <AlertDescription className="text-emerald-800 dark:text-emerald-400 text-sm font-medium">
                    {successMessage}
                  </AlertDescription>
                </Alert>
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
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-7 rounded-2xl transition-all duration-300 shadow-xl shadow-red-500/20 hover:shadow-red-500/40 active:scale-[0.98] text-lg group relative overflow-hidden disabled:opacity-70 disabled:hover:scale-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    Masuk ke Sistem
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-8 border-t border-gray-100 dark:border-white/5 text-center flex flex-col gap-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Belum memiliki akses?{" "}
                <Link
                  href="/register"
                  className="text-red-600 hover:text-red-700 font-extrabold transition-colors inline-flex items-center gap-1 group"
                >
                  Daftar di sini{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>

              <div className="space-y-4">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                  © {new Date().getFullYear()} Universitas Pendidikan Indonesia.{" "}
                  <br /> Hak Cipta Dilindungi.
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    Syarat & Ketentuan
                  </Link>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    Kebijakan Privasi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
