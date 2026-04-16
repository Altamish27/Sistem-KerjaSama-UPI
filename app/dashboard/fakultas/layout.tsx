import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function FakultasLayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="fakultas">{children}</RoleModuleLayout>;
}
