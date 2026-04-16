import DocumentReviewModule from "@/components/modules/document-review-module";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function RektorReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;
  return <DocumentReviewModule documentId={id} roleSegment="rektor" />;
}
