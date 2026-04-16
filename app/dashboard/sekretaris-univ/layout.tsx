import RoleModuleLayout from "@/components/dashboard/role-module-layout";

export default function SekretarisUnivLayout({ children }: { children: React.ReactNode }) {
  return <RoleModuleLayout role="sekretaris_univ">{children}</RoleModuleLayout>;
}
