import RoleDashboardPage from "@/components/dashboard/role-dashboard-page";

interface RolePageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function BiroHukumDashboardPage({ searchParams }: RolePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <RoleDashboardPage role="biro_hukum" tab={resolvedSearchParams?.tab} />;
}
