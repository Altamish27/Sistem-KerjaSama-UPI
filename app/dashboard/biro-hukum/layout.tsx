import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function BiroHukumLayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="biro_hukum">{children}</RoleModuleLayout>;
}
