"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Jurisdiction } from "@/lib/jurisdictions";
import { fetchAllRoutes, fetchRoute, formatDuration, travelModes, type Position, type Route, type TravelMode } from "@/lib/routing";
import { RouteDistances } from "./route-distances";

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
  const [allRoutes, setAllRoutes] = useState<Record<TravelMode, Route | null> | null>(null);
  const [routeMessage, setRouteMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const locationVersion = useRef(0);

  function clearRoute() {
    request.current?.abort();
    routeLayer.current?.remove();
    routeLayer.current = null;
    setRoute(null);
    setAllRoutes(null);
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
    setRouteMessage("Calcul des itinéraires pour tous les modes…");
    try {
      // Calculer tous les modes en parallèle
      const routes = await fetchAllRoutes(start, selected, controller.signal);
      const leaflet = await import("leaflet");
      if (controller.signal.aborted || !map.current) return;

      // Afficher l'itinéraire du mode sélectionné
      const currentRoute = routes[mode];
      if (currentRoute) {
        routeLayer.current = leaflet.polyline(currentRoute.points, {
          color: mode === "foot" ? "#047857" : mode === "bike" ? "#2563eb" : mode === "motorcycle" ? "#ea580c" : "#9333ea",
          weight: 5,
          opacity: 0.7,
        }).addTo(map.current);
        map.current.fitBounds(routeLayer.current.getBounds(), { padding: [30, 30] });
        setRoute(currentRoute);
      }

      setAllRoutes(routes);
      setRouteMessage("");
    } catch {
      if (!controller.signal.aborted) setRouteMessage("Certains itinéraires sont indisponibles. Service momentanément indisponible.");
    } finally {
      if (request.current === controller && !controller.signal.aborted) setBusy(false);
    }
  }

  // Effet pour calculer automatiquement quand un tribunal est sélectionné ET que la position existe
  useEffect(() => {
    if (start && selected && !busy) {
      calculate();
    }
  }, [start, selected]);

  // Effet pour géolocaliser automatiquement au chargement de la carte
  useEffect(() => {
    if (jurisdictions.length > 0 && !start && !locating) {
      // Tenter la géolocalisation automatique après 1 seconde
      const timer = setTimeout(() => {
        if (navigator.geolocation && !start) {
          locateUser();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [jurisdictions]);

  // Effet pour changer la couleur de la ligne quand on change de mode
  useEffect(() => {
    if (allRoutes && routeLayer.current) {
      const currentRoute = allRoutes[mode];
      if (currentRoute) {
        void import("leaflet").then((leaflet) => {
          if (!map.current) return;
          routeLayer.current?.remove();
          const color = mode === "foot" ? "#047857" : mode === "bike" ? "#2563eb" : mode === "motorcycle" ? "#ea580c" : "#9333ea";
          routeLayer.current = leaflet.polyline(currentRoute.points, {
            color,
            weight: 5,
            opacity: 0.7,
          }).addTo(map.current);
          setRoute(currentRoute);
        });
      }
    }
  }, [mode, allRoutes]);

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
        <p className="font-medium">{selected.officialName}</p>
        <Link href={`/juridictions/${selected.slug}`} className="text-emerald-800 underline font-semibold">Consulter la fiche complète →</Link>

        {!start && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="font-medium text-blue-900">
              📍 Activez votre position pour calculer automatiquement les distances et itinéraires
            </p>
            <p className="mt-2 text-sm text-blue-700">
              Les distances seront affichées pour tous les modes de transport (pied, vélo, moto, voiture)
            </p>
          </div>
        )}

        {start && (
          <>
            {busy && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-medium text-emerald-900">⏳ Calcul des itinéraires en cours...</p>
                <p className="text-sm text-emerald-700">Calcul simultané pour tous les modes de transport</p>
              </div>
            )}

            {allRoutes && (
              <>
                <div>
                  <h4 className="mb-3 font-semibold text-slate-900">Choisissez votre mode de transport :</h4>
                  <RouteDistances
                    routes={allRoutes}
                    loading={busy}
                    selectedMode={mode}
                    onSelectMode={setMode}
                  />
                </div>

                {route && (
                  <div className="rounded-lg border-2 border-emerald-700 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">✓ Itinéraire tracé sur la carte</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      La ligne colorée affiche le trajet {travelModes[mode].toLowerCase()}
                    </p>
                  </div>
                )}
              </>
            )}

            {routeMessage && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">{routeMessage}</p>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-slate-600">
          En calculant un itinéraire, LUKA TRIBUNAL transmet le départ et la destination à FOSSGIS/OpenStreetMap.
          LUKA TRIBUNAL ne conserve aucune de ces données.{" "}
          <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer" className="underline">
            Politique de confidentialité
          </a>
        </p>
        <p className="text-xs text-slate-600">
          Durées indicatives, sans trafic en temps réel. Vérifiez les conditions d'accès au tribunal avant de vous déplacer.
        </p>
      </section>}
      <p className="text-xs text-slate-600">Itinéraires : OSRM / FOSSGIS, données © OpenStreetMap. <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer" className="underline">Corriger la carte</a>. La carte et les itinéraires dépendent de services externes.</p>
    </section>
  );
}
