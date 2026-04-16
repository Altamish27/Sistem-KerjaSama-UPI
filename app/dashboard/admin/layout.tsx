import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="admin">{children}</RoleModuleLayout>;
}
