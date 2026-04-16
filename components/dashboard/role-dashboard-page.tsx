import RoleModulePage from "@/components/dashboard/role-module-page";
import { isDashboardModuleId } from "@/lib/dashboard-config";
import { type AppRole } from "@/lib/workflow";

interface RoleDashboardPageProps {
  role: AppRole;
  tab?: string;
}

export default function RoleDashboardPage({ role, tab }: RoleDashboardPageProps) {
  const moduleId = isDashboardModuleId(tab) ? tab : "home";

  return <RoleModulePage role={role} moduleId={moduleId} />;
}
