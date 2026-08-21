"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";
import { searchJurisdictions } from "@/lib/jurisdictions";

const searchSchema = z.object({
  q: z.string().trim().max(100, "100 caractères maximum"),
  province: z.string().trim().max(120, "120 caractères maximum"),
  city: z.string().trim().max(120, "120 caractères maximum"),
});

type SearchFields = z.infer<typeof searchSchema>;

const emptyFilters: SearchFields = { q: "", province: "", city: "" };

export function JurisdictionSearch() {
  const [filters, setFilters] = useState<SearchFields>(emptyFilters);
  const form = useForm<SearchFields>({
    resolver: zodResolver(searchSchema),
    defaultValues: emptyFilters,
  });
  const jurisdictions = useQuery({
    queryKey: ["jurisdictions", filters],
    queryFn: () => searchJurisdictions(filters),
  });

  return (
    <section className="mx-auto mt-8 max-w-3xl" aria-labelledby="search-title">
      <h2 id="search-title" className="text-2xl font-bold">
        Rechercher une juridiction
      </h2>
      <form
        className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3"
        onSubmit={form.handleSubmit(setFilters)}
      >
        <label className="grid gap-2 text-sm font-medium">
          Nom
          <input className="rounded-lg border border-slate-300 px-3 py-2" {...form.register("q")} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Province
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            {...form.register("province")}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Ville
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            {...form.register("city")}
          />
        </label>
        <button
          className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white sm:col-span-3"
          type="submit"
        >
          Rechercher
        </button>
      </form>

      <div className="mt-6" aria-live="polite">
        {jurisdictions.isPending && <p>Chargement des juridictions…</p>}
        {jurisdictions.isError && <p role="alert">{jurisdictions.error.message}</p>}
        {jurisdictions.data?.length === 0 && <p>Aucune juridiction trouvée.</p>}
        {jurisdictions.data && jurisdictions.data.length > 0 && (
          <ul className="grid gap-4">
            {jurisdictions.data.map((jurisdiction) => (
              <li key={jurisdiction.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold">{jurisdiction.officialName}</h3>
                <p className="mt-1 text-slate-700">
                  {[jurisdiction.city, jurisdiction.province].filter(Boolean).join(" — ")}
                </p>
                <p className="mt-2 text-sm text-slate-600">{jurisdiction.address}</p>
                <p className="mt-3 text-xs text-slate-500">Source : {jurisdiction.informationSource}</p>
                <Link
                  className="mt-4 inline-block font-semibold text-emerald-800 underline"
                  href={`/juridictions/${jurisdiction.slug}`}
                >
                  Consulter la fiche
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
