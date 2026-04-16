"use client";

import { ChevronRight, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function FooterBaru() {
  return (
    <footer className="relative z-10 bg-[#001730] text-gray-300 pt-24 pb-12 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/40 overflow-hidden p-2">
                <Image
                  src="/upi.png"
                  alt="Logo UPI"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  SIMADU
                </h2>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">
                  Sistem informasi kerjasama terpadu
                </p>
              </div>
            </Link>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Pintu gerbang inovasi dan kolaborasi global antara Universitas
              Pendidikan Indonesia dengan institusi serta industri di seluruh
              dunia.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Navigasi
            </h4>
            <ul className="space-y-4">
              {[
                "Layanan Kami",
                "Cara Kerja",
                "Daftar Mitra",
                "Panduan Proposal",
                "FAQ",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 font-medium"
                  >
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-lg font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Informasi
            </h4>
            <ul className="space-y-4 font-medium">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Kontak Kami
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Jl. Dr. Setiabudi No. 229 Bandung, <br />
                  Jawa Barat 40154, Indonesia
                </p>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <a
                  href="mailto:kerjasama@upi.edu"
                  className="text-white font-bold hover:text-blue-400 transition-colors"
                >
                  kerjasama@upi.edu
                </a>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-blue-500" />
                </div>
                <a
                  href="tel:+62222013163"
                  className="text-white font-bold hover:text-blue-400 transition-colors"
                >
                  +62 (22) 201-3163
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm font-semibold">
            © {new Date().getFullYear()} Universitas Pendidikan Indonesia.{" "}
            <span className="hidden sm:inline">All Rights Reserved.</span>
          </p>
          <div className="flex gap-3 items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
              Sistem Online & Terverifikasi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
