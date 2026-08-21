"use client";

import { useEffect, useRef, useState } from "react";

export function JurisdictionMap(props: {
  latitude: number;
  longitude: number;
  name: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    let active = true;
    void import("leaflet").then((leaflet) => {
      if (!active || !container.current || map.current) return;
      const instance = leaflet.map(container.current).setView([props.latitude, props.longitude], 13);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        })
        .addTo(instance);
      leaflet.circleMarker([props.latitude, props.longitude], { radius: 9 }).addTo(instance).bindPopup(props.name);
      map.current = instance;
    });
    return () => {
      active = false;
      map.current?.remove();
      map.current = null;
    };
  }, [props.latitude, props.longitude, props.name]);

  function locateUser() {
    if (!navigator.geolocation) {
      setLocationMessage("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }
    setLocationMessage("Recherche de votre position…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.current?.setView([coords.latitude, coords.longitude], 13);
        setLocationMessage("Carte centrée sur votre position. Cette position n’est pas enregistrée.");
      },
      () => setLocationMessage("Position refusée ou indisponible. La fiche reste utilisable."),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <section aria-labelledby="map-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="map-title" className="text-2xl font-bold">Carte</h2>
        <button type="button" onClick={locateUser} className="rounded-lg border px-4 py-2 font-semibold">
          Utiliser ma position
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-600" aria-live="polite">{locationMessage}</p>
      <div ref={container} className="mt-3 h-80 rounded-xl border" aria-label={`Carte de ${props.name}`} />
      <p className="mt-2 text-xs text-slate-600">La carte dépend d’un service de tuiles externe.</p>
    </section>
  );
}
