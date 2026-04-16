import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function WarekLayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="warek">{children}</RoleModuleLayout>;
}
