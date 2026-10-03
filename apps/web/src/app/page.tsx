import { JurisdictionSearch } from "@/components/jurisdiction-search";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-700">
          République démocratique du Congo
        </p>
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Logo LUKA TRIBUNAL - Balance de justice dans une loupe"
            width={80}
            height={80}
            className="h-16 w-16 flex-shrink-0 sm:h-20 sm:w-20"
            priority
          />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            LUKA TRIBUNAL
          </h1>
        </div>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
          Une plateforme d’information et d’orientation pour trouver les tribunaux
          pour enfants et consulter leurs informations institutionnelles.
        </p>
        <div className="mt-8 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Le service est en cours de construction. Les informations devront toujours
          être confirmées auprès des autorités judiciaires compétentes.
        </div>
      </section>
      <JurisdictionSearch />
    </main>
  );
}
