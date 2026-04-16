"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readSessionUser } from "@/hooks/use-session-user";
import type { AppRole } from "@/lib/workflow";

const ROLE_ROUTE: Record<AppRole, string> = {
  dkui: "/dashboard/dkui",
  mitra: "/dashboard/mitra",
  fakultas: "/dashboard/fakultas",
  biro_hukum: "/dashboard/biro-hukum",
  sekretaris_univ: "/dashboard/sekretaris-univ",
  warek: "/dashboard/warek",
  rektor: "/dashboard/rektor",
  admin: "/dashboard/admin",
};

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const session = readSessionUser();
    if (!session) {
      router.replace("/login");
      return;
    }

    const route = ROLE_ROUTE[session.role] || "/dashboard/dkui";
    router.replace(route);
  }, [router]);

  return null;
}
