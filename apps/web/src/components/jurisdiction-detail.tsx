"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createReport, getJurisdiction } from "@/lib/jurisdictions";
import { JurisdictionMap } from "./jurisdiction-map";

export function JurisdictionDetail({ slug }: { slug: string }) {
  const jurisdiction = useQuery({ queryKey: ["jurisdiction", slug], queryFn: () => getJurisdiction(slug) });
  const mapItems = useMemo(() => jurisdiction.data ? [jurisdiction.data] : [], [jurisdiction.data]);
  const [reportMessage, setReportMessage] = useState("");

  if (jurisdiction.isPending) return <p>Chargement de la fiche…</p>;
  if (jurisdiction.isError) return <p role="alert">{jurisdiction.error.message}</p>;
  const item = jurisdiction.data;
  const routeUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${item.latitude},${item.longitude}`;

  async function submitReport(formData: FormData) {
    setReportMessage("Envoi en cours…");
    try {
      await createReport({
        jurisdictionId: item.id,
        category: String(formData.get("category")),
        comment: String(formData.get("comment") ?? ""),
      });
      setReportMessage("Signalement reçu. Il sera vérifié manuellement.");
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : "Erreur inattendue.");
    }
  }

  return (
    <article className="grid gap-8">
      <Link href="/" className="font-semibold text-emerald-800 underline">Retour à la recherche</Link>
      <header>
        <h1 className="text-3xl font-bold">{item.officialName}</h1>
        <p className="mt-3 text-lg">{item.address}</p>
        <p className="mt-2 text-sm">{[item.city, item.province].filter(Boolean).join(" — ")}</p>
      </header>
      <section className="rounded-xl bg-amber-50 p-4">
        Ces informations servent uniquement à l’orientation. Confirmez-les auprès de l’autorité compétente.
      </section>
      <section>
        <h2 className="text-2xl font-bold">Fiabilité de l’information</h2>
        <p className="mt-2">Source : {item.informationSource}</p>
        <p>Date de vérification : {item.verifiedAt}</p>
      </section>
      <JurisdictionMap jurisdictions={mapItems} />
      <a href={routeUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-700 px-5 py-3 text-center font-semibold text-white">
        Ouvrir l’itinéraire dans OpenStreetMap
      </a>
      <section aria-labelledby="report-title">
        <h2 id="report-title" className="text-2xl font-bold">Signaler une information incorrecte</h2>
        <p className="mt-2 text-sm text-red-800">Ne saisissez aucune identité, information sur un enfant, plainte ou affaire judiciaire.</p>
        <form action={submitReport} className="mt-4 grid gap-4 rounded-xl border bg-white p-5">
          <label className="grid gap-2 font-medium">Catégorie
            <select name="category" required className="rounded-lg border px-3 py-2">
              <option value="incorrect_address">Adresse incorrecte</option>
              <option value="incorrect_coordinates">Position incorrecte</option>
              <option value="incorrect_contact">Contact incorrect</option>
              <option value="closed_or_moved">Fermé ou déplacé</option>
              <option value="other">Autre</option>
            </select>
          </label>
          <label className="grid gap-2 font-medium">Commentaire facultatif
            <textarea name="comment" maxLength={1000} rows={4} className="rounded-lg border px-3 py-2" />
          </label>
          <button className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white" type="submit">Envoyer le signalement</button>
        </form>
        <p className="mt-3" aria-live="polite">{reportMessage}</p>
      </section>
    </article>
  );
}
