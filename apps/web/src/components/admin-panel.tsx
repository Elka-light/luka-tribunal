"use client";

import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { z } from "zod";

type Report = {
  id: string;
  category: string;
  comment: string | null;
  status: string;
  createdAt: string;
};

type AdminJurisdiction = {
  id: string;
  slug: string;
  officialName: string;
  jurisdictionType: string;
  status: "draft" | "pending_verification" | "published";
  province: string;
  city: string | null;
  address: string;
  latitude: number;
  longitude: number;
  coordinateSource: string;
  informationSource: string;
  verifiedAt: string | null;
};

const jurisdictionSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  officialName: z.string().trim().min(1).max(200),
  jurisdictionType: z.string().trim().min(1).max(80),
  province: z.string().trim().min(1).max(120),
  city: z.string().trim().max(120).optional(),
  address: z.string().trim().min(1).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  coordinateSource: z.string().trim().min(1).max(500),
  informationSource: z.string().trim().min(1).max(500),
  verifiedAt: z.string().optional(),
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const secureHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [jurisdictions, setJurisdictions] = useState<AdminJurisdiction[]>([]);
  const [editing, setEditing] = useState<AdminJurisdiction | null>(null);
  const [message, setMessage] = useState("");

  async function loadAdministration() {
    const [reportsResponse, jurisdictionsResponse] = await Promise.all([
      fetch(`${apiUrl}/api/v1/admin/reports`, { credentials: "include" }),
      fetch(`${apiUrl}/api/v1/admin/jurisdictions`, { credentials: "include" }),
    ]);
    if (!reportsResponse.ok || !jurisdictionsResponse.ok) {
      throw new Error("Accès administrateur requis.");
    }
    setReports(((await reportsResponse.json()) as { data: Report[] }).data);
    setJurisdictions(
      ((await jurisdictionsResponse.json()) as { data: AdminJurisdiction[] }).data,
    );
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch(`${apiUrl}/api/v1/admin/session`, {
      method: "POST",
      credentials: "include",
      headers: secureHeaders,
      body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
    });
    if (!response.ok) return setMessage("Identifiants invalides.");
    setAuthenticated(true);
    setMessage("Connexion réussie.");
    await loadAdministration();
  }

  async function saveJurisdiction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = jurisdictionSchema.safeParse({
      slug: form.get("slug"),
      officialName: form.get("officialName"),
      jurisdictionType: form.get("jurisdictionType"),
      province: form.get("province"),
      city: form.get("city") || undefined,
      address: form.get("address"),
      latitude: Number(form.get("latitude")),
      longitude: Number(form.get("longitude")),
      coordinateSource: form.get("coordinateSource"),
      informationSource: form.get("informationSource"),
      verifiedAt: form.get("verifiedAt") || undefined,
    });
    if (!parsed.success) return setMessage("Vérifiez les champs et les coordonnées.");

    const endpoint = editing
      ? `${apiUrl}/api/v1/admin/jurisdictions/${editing.id}`
      : `${apiUrl}/api/v1/admin/jurisdictions`;
    const response = await fetch(endpoint, {
      method: editing ? "PUT" : "POST",
      credentials: "include",
      headers: secureHeaders,
      body: JSON.stringify(parsed.data),
    });
    if (!response.ok) return setMessage("L’enregistrement du brouillon a échoué.");
    event.currentTarget.reset();
    setEditing(null);
    await loadAdministration();
    setMessage("Brouillon enregistré et action auditée.");
  }

  async function publishJurisdiction(jurisdiction: AdminJurisdiction) {
    if (!jurisdiction.verifiedAt) {
      setMessage("Ajoutez une date de vérification avant de publier.");
      return;
    }
    if (!window.confirm(`Publier « ${jurisdiction.officialName} » ?`)) return;
    const response = await fetch(
      `${apiUrl}/api/v1/admin/jurisdictions/${jurisdiction.id}/publish`,
      { method: "POST", credentials: "include", headers: secureHeaders },
    );
    if (!response.ok) return setMessage("La publication a été refusée par le serveur.");
    await loadAdministration();
    setMessage("Juridiction publiée et action auditée.");
  }

  async function updateReport(id: string, status: string) {
    const response = await fetch(`${apiUrl}/api/v1/admin/reports/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: secureHeaders,
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return setMessage("La mise à jour a échoué.");
    await loadAdministration();
    setMessage("Signalement mis à jour et action auditée.");
  }

  if (!authenticated) {
    return (
      <form onSubmit={login} className="mx-auto grid max-w-md gap-4 rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">Administration</h1>
        <label className="grid gap-2">Courriel<input name="email" type="email" required className="rounded-lg border px-3 py-2" /></label>
        <label className="grid gap-2">Mot de passe<input name="password" type="password" minLength={12} required className="rounded-lg border px-3 py-2" /></label>
        <button className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white">Se connecter</button>
        <p role="status">{message}</p>
      </form>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10">
      <header><h1 className="text-3xl font-bold">Administration du référentiel</h1><p className="mt-2" role="status">{message}</p></header>

      <section aria-labelledby="editor-title">
        <h2 id="editor-title" className="text-2xl font-bold">{editing ? "Corriger un brouillon" : "Créer un brouillon"}</h2>
        <form key={editing?.id ?? "new"} onSubmit={saveJurisdiction} className="mt-5 grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          <AdminField label="Nom officiel" name="officialName" defaultValue={editing?.officialName} />
          <AdminField label="Identifiant URL" name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={editing?.slug} />
          <AdminField label="Type de juridiction" name="jurisdictionType" defaultValue={editing?.jurisdictionType ?? "tribunal_for_children"} />
          <AdminField label="Province" name="province" defaultValue={editing?.province} />
          <AdminField label="Ville" name="city" required={false} defaultValue={editing?.city ?? ""} />
          <AdminField label="Adresse" name="address" defaultValue={editing?.address} />
          <AdminField label="Latitude" name="latitude" type="number" step="any" min="-90" max="90" defaultValue={editing?.latitude} />
          <AdminField label="Longitude" name="longitude" type="number" step="any" min="-180" max="180" defaultValue={editing?.longitude} />
          <AdminField label="Source des coordonnées" name="coordinateSource" defaultValue={editing?.coordinateSource} />
          <AdminField label="Source de l’information" name="informationSource" defaultValue={editing?.informationSource} />
          <AdminField label="Date de vérification" name="verifiedAt" type="date" required={false} defaultValue={editing?.verifiedAt ?? ""} />
          <div className="flex items-end gap-3"><button className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white">Enregistrer le brouillon</button>{editing && <button type="button" className="rounded-lg border px-4 py-3" onClick={() => setEditing(null)}>Annuler</button>}</div>
        </form>
      </section>

      <section aria-labelledby="jurisdictions-title">
        <h2 id="jurisdictions-title" className="text-2xl font-bold">Juridictions</h2>
        <ul className="mt-5 grid gap-4">{jurisdictions.map((item) => <li key={item.id} className="rounded-xl border bg-white p-5"><p className="font-bold">{item.officialName}</p><p className="text-sm">{item.province} — {item.status}</p><div className="mt-4 flex gap-3"><button type="button" className="rounded border px-3 py-2" onClick={() => setEditing(item)} disabled={item.status === "published"}>Corriger</button><button type="button" className="rounded bg-emerald-700 px-3 py-2 text-white disabled:opacity-50" onClick={() => void publishJurisdiction(item)} disabled={item.status === "published"}>Publier</button></div></li>)}</ul>
      </section>

      <section aria-labelledby="reports-title"><h2 id="reports-title" className="text-2xl font-bold">Signalements reçus</h2><ul className="mt-5 grid gap-4">{reports.map((report) => <li key={report.id} className="rounded-xl border bg-white p-5"><p className="font-semibold">{report.category} — {report.status}</p><p className="mt-2 whitespace-pre-wrap text-sm">{report.comment || "Sans commentaire"}</p><div className="mt-4 flex flex-wrap gap-2">{["reviewing", "resolved", "rejected"].map((status) => <button key={status} onClick={() => void updateReport(report.id, status)} className="rounded border px-3 py-2" type="button">{status}</button>)}</div></li>)}</ul></section>
    </div>
  );
}

function AdminField({ label, name, required = true, ...input }: { label: string; name: string; required?: boolean } & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  return <label className="grid gap-2 font-medium">{label}<input {...input} name={name} required={required} className="rounded-lg border px-3 py-2" /></label>;
}
