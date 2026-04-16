"use client";

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

export function WorkflowBaru() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={staggerContainer}
           className="text-center mb-20"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Alur Kemitraan
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-3xl mx-auto font-medium"
          >
            Proses pengajuan hingga penetapan kerjasama telah kami
            simplifikasi ke dalam empat tahapan efisien.
          </motion.p>
        </motion.div>

        <div className="max-w-6xl mx-auto relative">
          {/* Timeline Connector */}
          <div className="hidden lg:block absolute top-12 left-12 right-12 h-2 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 -z-10 rounded-full" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
          >
            {[
              {
                step: "01",
                title: "Registrasi Proposal",
                desc: "Isi data profil instansi dan unggah draf kerangka acuan kerjasama.",
              },
              {
                step: "02",
                title: "Validasi Awal",
                desc: "Direktorat menelaah dokumen dan meneruskan ke unit kerja terkait.",
              },
              {
                step: "03",
                title: "Akses Terotorisasi",
                desc: "Terima kredensial khusus untuk memantau progres persetujuan.",
              },
              {
                step: "04",
                title: "Penandatanganan",
                desc: "Finalisasi naskah MoU/MoA dan pengesahan dokumen kemitraan.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="relative group"
              >
                <div className="bg-white/80 backdrop-blur-sm border-2 border-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 rounded-[2rem] p-8 h-full flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white border-[6px] border-[#fafcff] shadow-inner rounded-full flex items-center justify-center font-black text-4xl text-[#003d7a] mb-8 relative -mt-16 group-hover:scale-110 transition-transform duration-500 group-hover:bg-blue-50">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base font-medium">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
