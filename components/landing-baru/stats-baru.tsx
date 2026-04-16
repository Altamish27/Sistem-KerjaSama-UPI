"use client";

import { Building, Users, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function StatsBaru() {
  return (
    <section className="relative z-20 pb-16 bg-[#fafcff] px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-5xl mx-auto bg-white/80 backdrop-blur-3xl rounded-[2rem] shadow-xl shadow-gray-200/60 p-10 md:p-14 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8 -mt-24 relative"
        >
          {[
            { label: "Fakultas", value: "8+", icon: Building },
            { label: "Mitra Aktif", value: "500+", icon: Users },
            { label: "Jangkauan", value: "Global", icon: Globe },
            { label: "Proses", value: "1 Pintu", icon: Shield },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2 ring-1 ring-blue-100">
                <stat.icon className="w-7 h-7" />
              </div>
              <h4 className="text-4xl font-black text-gray-900">
                {stat.value}
              </h4>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider text-center">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
