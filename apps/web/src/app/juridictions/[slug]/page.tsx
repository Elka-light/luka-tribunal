import { JurisdictionDetail } from "@/components/jurisdiction-detail";

export default async function JurisdictionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-3xl"><JurisdictionDetail slug={slug} /></div>
    </main>
  );
}
