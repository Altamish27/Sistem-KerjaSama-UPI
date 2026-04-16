import {
  Database,
  FolderOpen,
  Home,
  Inbox,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { type AppRole } from "@/lib/workflow";

export type DashboardModuleId = "home" | "review" | "workflow" | "pengajuan" | "mitra" | "database";

interface ModuleMeta {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface DashboardNavItem {
  moduleId: DashboardModuleId;
  name: string;
  href: string;
  icon: LucideIcon;
}

const DASHBOARD_MODULE_IDS: DashboardModuleId[] = ["home", "review", "workflow", "pengajuan", "mitra", "database"];

const MODULE_META: Record<DashboardModuleId, ModuleMeta> = {
  home: { label: "Home", path: "", icon: Home },
  review: { label: "Review", path: "review", icon: Inbox },
  workflow: { label: "Workflow", path: "workflow", icon: Workflow },
  pengajuan: { label: "Data Pengajuan", path: "pengajuan", icon: FolderOpen },
  mitra: { label: "Manajemen Mitra", path: "mitra", icon: Users },
  database: { label: "Database", path: "database", icon: Database },
};

const ROLE_SEGMENT: Record<AppRole, string> = {
  mitra: "mitra",
  dkui: "dkui",
  fakultas: "fakultas",
  biro_hukum: "biro-hukum",
  sekretaris_univ: "sekretaris-univ",
  warek: "warek",
  rektor: "rektor",
  admin: "admin",
};

const ROLE_MODULES: Record<AppRole, DashboardModuleId[]> = {
  dkui: ["home", "review", "pengajuan", "mitra", "workflow"],
  fakultas: ["home", "review", "pengajuan", "workflow"],
  biro_hukum: ["home", "review", "pengajuan", "workflow"],
  sekretaris_univ: ["home", "review", "pengajuan", "workflow"],
  warek: ["home", "review", "pengajuan", "workflow"],
  rektor: ["home", "review", "pengajuan", "workflow"],
  mitra: ["home", "review", "pengajuan", "workflow"],
  admin: ["home", "workflow", "database"],
};

export function roleToSegment(role: AppRole): string {
  return ROLE_SEGMENT[role];
}

export function getRoleModules(role: AppRole): DashboardModuleId[] {
  return ROLE_MODULES[role];
}

export function getRoleNavItems(role: AppRole): DashboardNavItem[] {
  const basePath = `/dashboard/${roleToSegment(role)}`;
  return ROLE_MODULES[role].map((moduleId) => {
    const meta = MODULE_META[moduleId];
    return {
      moduleId,
      name:
        role === "admin" && moduleId === "workflow"
          ? "Pengaturan Alur"
          : role === "admin" && moduleId === "database"
          ? "Pengaturan Data"
          : meta.label,
      href: moduleId === "home" ? basePath : `${basePath}?tab=${moduleId}`,
      icon: meta.icon,
    };
  });
}

export function isDashboardModuleId(value: string | null | undefined): value is DashboardModuleId {
  if (!value) return false;
  return DASHBOARD_MODULE_IDS.includes(value as DashboardModuleId);
}
