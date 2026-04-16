import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function MitraLayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="mitra">{children}</RoleModuleLayout>;
}
