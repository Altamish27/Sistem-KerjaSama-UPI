"use client";

import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function PartnersBaru() {
  return (
    <section className="container mx-auto px-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="mb-16">
          <div className="flex flex-col items-center gap-4 mb-10">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50/80 px-5 py-2 rounded-full border border-blue-100 shadow-sm">
              Jejaring Kemitraan
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
              Dipercaya Oleh Mitra{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Strategis Global
              </span>{" "}
              & Nasional
            </h2>
          </div>

          {/* Logo Marquee */}
          <div className="relative flex overflow-hidden py-10 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-32 before:bg-gradient-to-r before:from-[#fafcff] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-32 after:bg-gradient-to-l after:after:from-[#fafcff] after:to-transparent">
            <motion.div
              animate={{
                x: [0, -3500],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 50,
                  ease: "linear",
                },
              }}
              className="flex flex-nowrap gap-8 items-center"
            >
              {[
                { name: "Bank Indonesia", domain: "bi.go.id" },
                { name: "Telkom Indonesia", domain: "telkom.co.id" },
                { name: "Pertamina", domain: "pertamina.com" },
                { name: "Bank Mandiri", domain: "bankmandiri.co.id" },
                { name: "Tokopedia", domain: "tokopedia.com" },
                { name: "Traveloka", domain: "traveloka.com" },
                { name: "Samsung", domain: "samsung.com" },
                { name: "Astra International", domain: "astra.co.id" },
                { name: "Shopee", domain: "shopee.co.id" },
                { name: "Gojek", domain: "gojek.com" },
                { name: "Unilever", domain: "unilever.co.id" },
                { name: "PT KAI", domain: "kai.id" },
              ].map((partner, i) => (
                <div
                  key={`logo-1-${i}`}
                  className="group flex-none flex items-center justify-center bg-white/50 backdrop-blur-md border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 px-8 py-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-[1rem] bg-white p-2 border border-gray-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <img
                        src={`https://unavatar.io/${partner.domain}?fallback=https://api.dicebear.com/7.x/initials/svg?seed=${partner.name}`}
                        alt={partner.name}
                        className="w-full h-full object-contain relative z-10 filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-lg font-extrabold text-gray-500 group-hover:text-[#003d7a] tracking-tight whitespace-nowrap transition-colors duration-300">
                      {partner.name}
                    </span>
                  </div>
                </div>
              ))}
              {/* Duplicate for infinite effect */}
              {[
                { name: "Bank Indonesia", domain: "bi.go.id" },
                { name: "Telkom Indonesia", domain: "telkom.co.id" },
                { name: "Pertamina", domain: "pertamina.com" },
                { name: "Bank Mandiri", domain: "bankmandiri.co.id" },
                { name: "Tokopedia", domain: "tokopedia.com" },
                { name: "Traveloka", domain: "traveloka.com" },
                { name: "Samsung", domain: "samsung.com" },
                { name: "Astra International", domain: "astra.co.id" },
                { name: "Shopee", domain: "shopee.co.id" },
                { name: "Gojek", domain: "gojek.com" },
                { name: "Unilever", domain: "unilever.co.id" },
                { name: "PT KAI", domain: "kai.id" },
              ].map((partner, i) => (
                <div
                  key={`logo-2-${i}`}
                  className="group flex-none flex items-center justify-center bg-white/50 backdrop-blur-md border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 px-8 py-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-[1rem] bg-white p-2 border border-gray-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <img
                        src={`https://unavatar.io/${partner.domain}?fallback=https://api.dicebear.com/7.x/initials/svg?seed=${partner.name}`}
                        alt={partner.name}
                        className="w-full h-full object-contain relative z-10 filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-lg font-extrabold text-gray-500 group-hover:text-[#003d7a] tracking-tight whitespace-nowrap transition-colors duration-300">
                      {partner.name}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center mt-12 px-4 md:px-0">
          <Link href="/submit-proposal">
            <Button
              size="lg"
              className="bg-[#003d7a] hover:bg-blue-800 text-white px-12 py-8 text-xl font-black rounded-full shadow-2xl shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-1 active:scale-95 group"
            >
              <FileText className="w-6 h-6 mr-3 opacity-80" />
              Ajukan Kemitraan Sekarang
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
