import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function DKUILayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="dkui">{children}</RoleModuleLayout>;
}
