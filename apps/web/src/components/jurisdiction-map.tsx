"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Jurisdiction } from "@/lib/jurisdictions";
import { fetchRoute, formatDuration, travelModes, type Position, type Route, type TravelMode } from "@/lib/routing";

export function JurisdictionMap({ jurisdictions }: { jurisdictions: Jurisdiction[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const departureMarker = useRef<import("leaflet").CircleMarker | null>(null);
  const routeLayer = useRef<import("leaflet").Polyline | null>(null);
  const request = useRef<AbortController | null>(null);
  const picking = useRef(false);
  const alive = useRef(true);
  const [locationMessage, setLocationMessage] = useState("");
  const [mapError, setMapError] = useState("");
  const [start, setStart] = useState<Position | null>(null);
  const [selected, setSelected] = useState<Jurisdiction | null>(null);
  const [mode, setMode] = useState<TravelMode>("foot");
  const [route, setRoute] = useState<Route | null>(null);
  const [routeMessage, setRouteMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const locationVersion = useRef(0);

  function clearRoute() {
    request.current?.abort();
    routeLayer.current?.remove();
    routeLayer.current = null;
    setRoute(null);
    setRouteMessage("");
    setBusy(false);
  }

  useEffect(() => {
    alive.current = true;
    let active = true;
    void import("leaflet").then((leaflet) => {
      if (!active || !container.current) return;
      const instance = leaflet.map(container.current).setView([-4.325, 15.322], 6);
      map.current = instance;
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 18,
      }).on("tileerror", () => {
        if (active) setMapError("Fond de carte indisponible. La liste des tribunaux reste accessible.");
      }).addTo(instance);
      const bounds: [number, number][] = [];
      for (const item of jurisdictions) {
        bounds.push([item.latitude, item.longitude]);
        const content = document.createElement("div");
        const title = document.createElement("p");
        title.textContent = item.officialName;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Se rendre à ce tribunal";
        button.className = "font-semibold underline p-2";
        button.addEventListener("click", () => {
          clearRoute();
          setSelected(item);
          instance.closePopup();
        });
        content.append(title, button);
        // DOM textContent avoids interpreting institution names as HTML.
        leaflet.marker([item.latitude, item.longitude], {
          title: item.officialName, alt: item.officialName,
          icon: leaflet.divIcon({ className: "", html: '<span style="display:block;width:24px;height:24px;border-radius:50%;background:#047857;border:3px solid white;box-shadow:0 0 0 2px #047857"></span>', iconSize: [24, 24], iconAnchor: [12, 12] }),
        }).addTo(instance).bindPopup(content);
      }
      if (bounds.length) instance.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
      instance.on("click", (event: import("leaflet").LeafletMouseEvent) => {
        if (!picking.current) return;
        picking.current = false;
        locationVersion.current += 1;
        setLocating(false);
        clearRoute();
        setStart({ latitude: event.latlng.lat, longitude: event.latlng.lng });
        setLocationMessage("Point de départ choisi. Cette position n’est pas enregistrée par LUKA TRIBUNAL.");
      });
    }).catch(() => { if (active) setMapError("Carte indisponible. Utilisez la liste des tribunaux."); });
    return () => {
      active = false;
      alive.current = false;
      locationVersion.current += 1;
      request.current?.abort();
      map.current?.remove();
      map.current = null;
      departureMarker.current = null;
      routeLayer.current = null;
    };
  }, [jurisdictions]);

  useEffect(() => {
    let active = true;
    void import("leaflet").then((leaflet) => {
      if (!active || !map.current) return;
      departureMarker.current?.remove();
      if (start) {
        departureMarker.current = leaflet.circleMarker([start.latitude, start.longitude], {
          radius: 9, color: "#1d4ed8", fillColor: "#60a5fa", fillOpacity: 1,
        }).addTo(map.current).bindTooltip("Votre point de départ");
        map.current.setView([start.latitude, start.longitude], 13);
      }
    });
    return () => { active = false; };
  }, [start, jurisdictions]);

  function locateUser() {
    if (!navigator.geolocation) {
      setLocationMessage("Géolocalisation indisponible. Vous pouvez choisir le départ sur la carte.");
      return;
    }
    const version = ++locationVersion.current;
    picking.current = false;
    setLocating(true);
    setLocationMessage("Recherche de votre position…");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (!alive.current || locationVersion.current !== version) return;
      clearRoute();
      setStart({ latitude: coords.latitude, longitude: coords.longitude });
      setLocating(false);
      setLocationMessage("Votre position est indiquée en bleu. Cette position n’est pas enregistrée par LUKA TRIBUNAL.");
    }, () => {
      if (!alive.current || locationVersion.current !== version) return;
      setLocating(false);
      setLocationMessage("Position refusée ou indisponible. Choisissez un départ sur la carte ou consultez les fiches.");
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }

  async function calculate() {
    if (!start || !selected || busy) return;
    clearRoute();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setRouteMessage("Calcul de l’itinéraire…");
    try {
      const result = await fetchRoute(start, selected, mode, controller.signal);
      const leaflet = await import("leaflet");
      if (controller.signal.aborted || !map.current) return;
      routeLayer.current = leaflet.polyline(result.points, { color: "#1d4ed8", weight: 5 }).addTo(map.current);
      map.current.fitBounds(routeLayer.current.getBounds(), { padding: [30, 30] });
      setRoute(result);
      setRouteMessage("");
    } catch {
      if (!controller.signal.aborted) setRouteMessage("Aucun itinéraire disponible pour ce trajet, ou service momentanément indisponible. Essayez un autre départ ou mode.");
    } finally {
      if (request.current === controller && !controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <section aria-label="Carte des tribunaux" className="my-6 grid gap-3">
      <h2 className="text-2xl font-bold">Carte des tribunaux pour enfants</h2>
      <p className="text-sm">{jurisdictions.length} tribunal(aux) publié(s) affiché(s). Vert : tribunal. Bleu : votre départ.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={locateUser} disabled={locating} className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-50">{locating ? "Localisation…" : "Utiliser ma position"}</button>
        <button type="button" onClick={() => { picking.current = true; setLocationMessage("Touchez un emplacement de la carte pour choisir votre départ."); }} className="rounded-lg border px-4 py-2">Choisir le départ sur la carte</button>
        {start && <button type="button" onClick={() => { locationVersion.current += 1; picking.current = false; setLocating(false); clearRoute(); setStart(null); departureMarker.current?.remove(); setLocationMessage("Votre position a été effacée."); }} className="rounded-lg border px-4 py-2">Effacer ma position</button>}
      </div>
      <p className="text-sm" aria-live="polite">{locationMessage}</p>
      {mapError && <p role="status" className="text-sm text-amber-900">{mapError}</p>}
      <div ref={container} className="h-96 rounded-xl border" aria-label="Sélectionnez un tribunal sur la carte" />
      <label className="grid gap-2 font-medium">Choisir un tribunal (également accessible sans toucher la carte)
        <select value={selected?.id ?? ""} onChange={(event) => { clearRoute(); setSelected(jurisdictions.find((item) => item.id === event.target.value) ?? null); }} className="w-full min-w-0 rounded-lg border bg-white p-3">
          <option value="">Sélectionner un tribunal</option>
          {jurisdictions.map((item) => <option key={item.id} value={item.id}>{item.officialName}</option>)}
        </select>
      </label>
      {selected && <section className="grid gap-4 rounded-xl border bg-white p-5" aria-label="Préparer le trajet">
        <h3 className="text-xl font-bold">Se rendre à ce tribunal</h3>
        <p>{selected.officialName}</p>
        <Link href={`/juridictions/${selected.slug}`} className="text-emerald-800 underline">Consulter la fiche</Link>
        <label className="grid gap-2">Mode de déplacement
          <select value={mode} onChange={(event) => { clearRoute(); setMode(event.target.value as TravelMode); }} className="rounded-lg border p-3">
            {Object.entries(travelModes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            <option disabled>En moto — non disponible</option>
            <option disabled>En train — horaires et lignes non disponibles</option>
          </select>
        </label>
        {!start && <p>Utilisez votre position ou choisissez un départ sur la carte.</p>}
        <p className="text-sm">En calculant, vous transmettez le départ et la destination à FOSSGIS/OpenStreetMap, qui les conserve dans ses journaux. LUKA TRIBUNAL ne les enregistre pas. <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer" className="underline">Confidentialité du service</a></p>
        <button type="button" disabled={!start || busy} onClick={calculate} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Calcul en cours…" : "Transmettre et calculer l’itinéraire"}</button>
        <div aria-live="polite">
          {routeMessage && <p>{routeMessage}</p>}
          {route && <p className="text-xl font-bold">{travelModes[mode]} : environ {formatDuration(route.duration)} · {(route.distance / 1000).toLocaleString("fr", { maximumFractionDigits: 1 })} km</p>}
        </div>
        <p className="text-sm">Durée indicative, sans trafic en temps réel. Vérifiez les conditions et l’accès au tribunal. Une fiche de démonstration ne correspond pas à un tribunal réel.</p>
      </section>}
      <p className="text-xs text-slate-600">Itinéraires : OSRM / FOSSGIS, données © OpenStreetMap. <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer" className="underline">Corriger la carte</a>. La carte et les itinéraires dépendent de services externes.</p>
    </section>
  );
}
