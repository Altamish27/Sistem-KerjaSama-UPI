import RoleDashboardPage from "@/components/dashboard/role-dashboard-page";

interface RolePageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function FakultasDashboardPage({ searchParams }: RolePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <RoleDashboardPage role="fakultas" tab={resolvedSearchParams?.tab} />;
}
