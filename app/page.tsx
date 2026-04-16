"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Sparkles,
  FileText,
  Shield,
  ArrowRight,
  Building,
  Users,
  Globe,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

// Animation Variants
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
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
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
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden font-sans selection:bg-blue-200">
      {/* Header */}
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
                className="object-contain w-auto h-auto"
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

      <main className="">
        {/* Full Background Hero Section */}
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

        {/* Stats / Trust indicators */}
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

        {/* Features Section */}
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

        {/* How It Works */}
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

        {/* CTA Section */}
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
              {/* <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                Siap Menjadi Mitra <br className="hidden md:block" /><span className="text-[#003d7a]">UPI Selanjutnya?</span>
              </h3> */}
              {/* <p className="text-xl md:text-2xl mb-12 text-gray-600 max-w-2xl font-medium leading-relaxed">
                Wujudkan kolaborasi strategis dan inovatif bersama institusi pendidikan terkemuka di Indonesia.
              </p> */}
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
      </main>

      {/* Footer */}
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
                    className="object-contain w-auto h-auto"
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
    </div>
  );
}
