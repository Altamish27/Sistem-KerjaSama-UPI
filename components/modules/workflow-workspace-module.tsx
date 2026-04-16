import RoleDashboard from "@/components/dashboard/role-dashboard";
import { type AppRole } from "@/lib/workflow";

interface WorkflowWorkspaceModuleProps {
  role: AppRole;
}

export default function WorkflowWorkspaceModule({ role }: WorkflowWorkspaceModuleProps) {
  return <RoleDashboard role={role} />;
}
