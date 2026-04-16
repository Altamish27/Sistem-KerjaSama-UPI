"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, FileText, Shield } from "lucide-react";
import { motion, Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export function FeaturesBaru() {
  return (
    <section
      id="features"
      className="py-24 relative overflow-hidden bg-white/80 backdrop-blur-lg border-y border-gray-200/50"
    >
      <div className="container mx-auto px-6">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={staggerContainer}
           className="max-w-3xl mx-auto text-center mb-20"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Dirancang untuk{" "}
            <span className="text-blue-600">Akselerasi</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 font-medium"
          >
            Kami menghadirkan ekosistem digital yang menghilangkan birokrasi
            berbelit, mempercepat kolaborasi instansi Anda.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-10"
        >
          {[
            {
              title: "Pengajuan Terpadu",
              desc: "Tidak perlu akun di awal. Cukup isi form ringkas, dan sistem kami akan merutekan ke fakultas yang tepat secara otomatis.",
              icon: FileText,
              color: "bg-blue-50 text-blue-600 ring-blue-100",
              hover: "hover:shadow-blue-900/10 hover:border-blue-200",
            },
            {
              title: "Pemantauan Real-time",
              desc: "Dapatkan akses login otomatis setelah proposal diverifikasi awal. Lacak setiap tahap persetujuan secara real-time.",
              icon: CheckCircle2,
              color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
              hover: "hover:shadow-emerald-900/10 hover:border-emerald-200",
            },
            {
              title: "Legalitas Terjamin",
              desc: "Integrasi sistem yang aman, mulai dari riwayat revisi MoU/MoA hingga pengesahan dokumen kemitraan yang transparan.",
              icon: Shield,
              color: "bg-amber-50 text-amber-600 ring-amber-100",
              hover: "hover:shadow-amber-900/10 hover:border-amber-200",
            },
          ].map((feature, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <Card
                className={`h-full border border-gray-100 shadow-xl shadow-gray-200/40 p-2 transition-all duration-500 hover:-translate-y-2 bg-white ${feature.hover}`}
              >
                <CardHeader className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ring-1 ${feature.color}`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 leading-relaxed font-medium">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
