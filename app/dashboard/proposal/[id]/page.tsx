import Link from "next/link";

interface ProposalDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ role?: string }>;
}

const VALID_ROLE_SEGMENTS = new Set([
  "dkui",
  "mitra",
  "fakultas",
  "biro-hukum",
  "sekretaris-univ",
  "warek",
  "rektor",
  "admin",
]);

export default async function ProposalDetailPage({ params, searchParams }: ProposalDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const roleCandidate = resolvedSearchParams?.role;
  const roleSegment =
    typeof roleCandidate === "string" && VALID_ROLE_SEGMENTS.has(roleCandidate)
      ? roleCandidate
      : "dkui";

  const backHref = `/dashboard/${roleSegment}?tab=pengajuan`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-700">
      <p className="font-medium text-gray-900">Detail pengajuan (sementara)</p>
      <p className="mt-2 text-gray-600">
        Modul detail pengajuan sedang tidak dipanggil. ID: <span className="font-mono text-xs">{id}</span>
      </p>
      <Link href={backHref} className="mt-4 inline-block text-[#e10000] underline hover:text-[#b00000]">
        Kembali ke daftar pengajuan
      </Link>
    </div>
  );
}
