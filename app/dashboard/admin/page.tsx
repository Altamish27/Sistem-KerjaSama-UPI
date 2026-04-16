import RoleDashboardPage from "@/components/dashboard/role-dashboard-page";

interface RolePageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: RolePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <RoleDashboardPage role="admin" tab={resolvedSearchParams?.tab} />;
}
