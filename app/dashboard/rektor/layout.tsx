import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function RektorLayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="rektor">{children}</RoleModuleLayout>;
}
