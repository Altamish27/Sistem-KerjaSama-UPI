import { Alert, AlertDescription } from "@/components/ui/alert";
import MitraModule from "@/components/modules/mitra-module";
import OverviewModule from "@/components/modules/overview-module";
import PengajuanModule from "@/components/modules/pengajuan-module";
import ReviewQueueModule from "@/components/modules/review-queue-module";
import WorkflowWorkspaceModule from "@/components/modules/workflow-workspace-module";
import WorkflowConfigAdminModule from "@/components/modules/admin/workflow-config-admin-module";
import CoreDbAdminModule from "@/components/modules/admin/core-db-admin-module";
import { getRoleModules, roleToSegment, type DashboardModuleId } from "@/lib/dashboard-config";
import { type AppRole } from "@/lib/workflow";

interface RoleModulePageProps {
  role: AppRole;
  moduleId: DashboardModuleId;
}

export default function RoleModulePage({ role, moduleId }: RoleModulePageProps) {
  const available = getRoleModules(role);

  if (!available.includes(moduleId)) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertDescription className="text-amber-800 text-sm">
          Modul ini tidak diaktifkan untuk role saat ini.
        </AlertDescription>
      </Alert>
    );
  }

  const roleSegment = roleToSegment(role);

  switch (moduleId) {
    case "home":
      return <OverviewModule />;
    case "review":
      return <ReviewQueueModule showActions roleSegment={roleSegment} role={role} />;
    case "workflow":
      if (role === "admin") {
        return <WorkflowConfigAdminModule />;
      }
      return <WorkflowWorkspaceModule role={role} />;
    case "pengajuan":
      return <PengajuanModule />;
    case "mitra":
      return <MitraModule />;
    case "database":
      if (role === "admin") {
        return <CoreDbAdminModule />;
      }
      return null;
    default:
      return null;
  }
}
