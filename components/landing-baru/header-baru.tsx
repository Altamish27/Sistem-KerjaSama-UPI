"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function HeaderBaru() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect khusus untuk header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-md py-3"
          : "bg-transparent border-b border-white/10 py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 overflow-hidden p-1.5 ${
              isScrolled ? "shadow-blue-900/10" : "shadow-blue-900/20"
            }`}
          >
            <Image
              src="/upi.png"
              alt="Logo UPI"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1
              className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${
                isScrolled ? "text-[#003d7a]" : "text-white"
              }`}
            >
              SIMADU
            </h1>
            <p
              className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                isScrolled ? "text-blue-600" : "text-blue-100"
              }`}
            >
              Sistem informasi kerjasama terpadu
            </p>
          </div>
        </Link>
        <div className="flex gap-5 items-center">
          <Link
            href="/register"
            className={`hidden md:flex text-sm font-bold transition-colors items-center gap-1 drop-shadow-sm ${
              isScrolled
                ? "text-gray-700 hover:text-blue-600"
                : "text-white hover:text-blue-200"
            }`}
          >
            Daftar Instansi <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/login">
            <Button
              className={`transition-all rounded-full px-8 py-5 font-bold text-sm ${
                isScrolled
                  ? "bg-[#003d7a] hover:bg-blue-800 text-white shadow-lg"
                  : "bg-white/10 hover:bg-white text-white hover:text-[#003d7a] backdrop-blur-md border border-white/20 shadow-lg"
              }`}
            >
              Login Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
