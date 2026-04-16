"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Mengimpor komponen-komponen baru dari folder landing-baru
import { HeaderBaru } from "@/components/landing-baru/header-baru";
import { HeroBaru } from "@/components/landing-baru/hero-baru";
import { StatsBaru } from "@/components/landing-baru/stats-baru";
import { FeaturesBaru } from "@/components/landing-baru/features-baru";
import { WorkflowBaru } from "@/components/landing-baru/workflow-baru";
import { PartnersBaru } from "@/components/landing-baru/partners-baru";
import { FooterBaru } from "@/components/landing-baru/footer-baru";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect jika sudah login
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden font-sans selection:bg-blue-200">
      <HeaderBaru />

      <main>
        <HeroBaru />
        <StatsBaru />
        <FeaturesBaru />
        <WorkflowBaru />
        <PartnersBaru />
      </main>

      <FooterBaru />
    </div>
  );
}
