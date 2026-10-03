"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";
import { JurisdictionMap } from "./jurisdiction-map";
import { searchJurisdictions } from "@/lib/jurisdictions";

const searchSchema = z.object({
  q: z.string().trim().max(100, "100 caractères maximum"),
  province: z.string().trim().max(120, "120 caractères maximum"),
  city: z.string().trim().max(120, "120 caractères maximum"),
});

type SearchFields = z.infer<typeof searchSchema>;

const emptyFilters: SearchFields = { q: "", province: "", city: "" };

// Provinces principales de la RDC
const QUICK_PROVINCES = [
  "Kinshasa",
  "Kongo Central",
  "Ituri",
  "Sud-Kivu",
  "Lualaba",
  "Kasaï-Oriental",
  "Kasaï-Central",
  "Tanganyika",
];

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

  const handleProvinceClick = (province: string) => {
    form.setValue("province", province);
    setFilters({ ...emptyFilters, province });
  };

  const clearFilters = () => {
    form.reset(emptyFilters);
    setFilters(emptyFilters);
  };

  const hasFilters = filters.q || filters.province || filters.city;
  const resultCount = jurisdictions.data?.length ?? 0;

  return (
    <section id="recherche" className="mx-auto mt-8 max-w-3xl" aria-labelledby="search-title">
      <div className="flex items-center justify-between">
        <h2 id="search-title" className="text-2xl font-bold">
          Rechercher une juridiction
        </h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Badges provinces rapides */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium text-slate-600">Provinces populaires:</span>
        {QUICK_PROVINCES.map((province) => (
          <button
            key={province}
            onClick={() => handleProvinceClick(province)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              filters.province === province
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {province}
          </button>
        ))}
      </div>
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

      {jurisdictions.data && <JurisdictionMap key={JSON.stringify(filters)} jurisdictions={jurisdictions.data} />}

      <div className="mt-6" aria-live="polite">
        {/* Compteur de résultats */}
        {jurisdictions.data && !jurisdictions.isPending && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
            <p className="font-medium text-emerald-900">
              {resultCount === 0 ? (
                "Aucun résultat"
              ) : (
                <>
                  <span className="text-2xl font-bold">{resultCount}</span>{" "}
                  tribunal{resultCount > 1 ? "x" : ""} trouvé{resultCount > 1 ? "s" : ""}
                </>
              )}
            </p>
            {resultCount > 0 && (
              <span className="text-sm text-emerald-700">
                {hasFilters ? "Résultats filtrés" : "Tous les tribunaux"}
              </span>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {jurisdictions.isPending && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="h-6 w-3/4 rounded bg-slate-200"></div>
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-200"></div>
                <div className="mt-3 h-4 w-full rounded bg-slate-200"></div>
              </div>
            ))}
          </div>
        )}

        {jurisdictions.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p role="alert" className="font-medium text-red-900">
              {jurisdictions.error.message}
            </p>
          </div>
        )}

        {jurisdictions.data && jurisdictions.data.length > 0 && (
          <ul className="grid gap-4">
            {jurisdictions.data.map((jurisdiction) => (
              <li
                key={jurisdiction.id}
                className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {jurisdiction.officialName}
                </h3>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {[jurisdiction.city, jurisdiction.province].filter(Boolean).join(" — ")}
                </p>
                <p className="mt-2 text-sm text-slate-600">{jurisdiction.address}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Source : {jurisdiction.informationSource.slice(0, 50)}...
                  </p>
                  <Link
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    href={`/juridictions/${jurisdiction.slug}`}
                  >
                    Voir la fiche →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
