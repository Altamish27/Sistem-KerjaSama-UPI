"use client";

import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroBaru() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-48 z-10 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 bg-[#001730]">
        <Image
          src="/fotoHero2.jpg"
          alt="Universitas Pendidikan Indonesia"
          fill
          priority
          className="object-cover object-center opacity-70 mix-blend-luminosity"
        />
        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#003d7a]/85 via-[#001730]/75 to-[#005bb5]/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-blue-900/40" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-4xl md:text-5xl lg:text-[4rem] font-black text-white mb-8 tracking-tighter leading-[1.1] drop-shadow-xl"
          >
            Kemitraan Strategis bersama <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-100 to-white drop-shadow-sm">
              Universitas Pendidikan Indonesia
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-xl md:text-2xl text-blue-50/90 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md"
          >
            Digitalisasi proses pengajuan kerjasama yang adaptif,
            transparan, dan efisien. Wujudkan inovasi bersama institusi
            bereputasi global.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <Link href="/submit-proposal">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#003d7a] px-10 py-7 text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <FileText className="w-6 h-6 mr-2" />
                Mulai Pengajuan
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 hover:border-white px-10 py-7 text-lg font-bold rounded-full transition-all duration-300 pointer-events-auto"
              >
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Curve Separator */}
      <div className="absolute bottom-[-1px] left-0 right-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none">
        <svg
          className="relative block w-full h-[60px] md:h-[120px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,112.44,112.33,124.6,183,120.3,237.9,116.92,284.15,64.26,321.39,56.44Z"
            className="fill-[#fafcff]"
          ></path>
        </svg>
      </div>
    </section>
  );
}
