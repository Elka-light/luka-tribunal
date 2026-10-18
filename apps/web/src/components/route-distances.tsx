"use client";

import { formatDuration, travelModes, type Route, type TravelMode } from "@/lib/routing";

interface RouteDistancesProps {
  routes: Record<TravelMode, Route | null>;
  loading: boolean;
  selectedMode: TravelMode;
  onSelectMode: (mode: TravelMode) => void;
}

const modeIcons: Record<TravelMode, string> = {
  foot: "🚶",
  bike: "🚴",
  motorcycle: "🏍️",
  car: "🚗",
};

const modeColors: Record<TravelMode, string> = {
  foot: "bg-emerald-100 text-emerald-900 border-emerald-300",
  bike: "bg-blue-100 text-blue-900 border-blue-300",
  motorcycle: "bg-orange-100 text-orange-900 border-orange-300",
  car: "bg-purple-100 text-purple-900 border-purple-300",
};

const modeColorsSelected: Record<TravelMode, string> = {
  foot: "bg-emerald-700 text-white border-emerald-800",
  bike: "bg-blue-700 text-white border-blue-800",
  motorcycle: "bg-orange-700 text-white border-orange-800",
  car: "bg-purple-700 text-white border-purple-800",
};

export function RouteDistances({ routes, loading, selectedMode, onSelectMode }: RouteDistancesProps) {
  const modes: TravelMode[] = ["foot", "bike", "motorcycle", "car"];

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {modes.map((mode) => (
          <div
            key={mode}
            className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="h-6 w-24 rounded bg-slate-200"></div>
            <div className="mt-2 h-4 w-32 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Modes de transport disponibles">
      {modes.map((mode) => {
        const route = routes[mode];
        const isSelected = mode === selectedMode;
        const colorClass = isSelected ? modeColorsSelected[mode] : modeColors[mode];

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onSelectMode(mode)}
            disabled={!route}
            className={`rounded-lg border-2 p-4 text-left transition ${
              route
                ? `${colorClass} hover:shadow-md ${isSelected ? "ring-2 ring-offset-2" : ""}`
                : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            }`}
            aria-pressed={isSelected}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {modeIcons[mode]}
                </span>
                <span className="font-semibold">{travelModes[mode]}</span>
              </div>
              {isSelected && (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-label="Sélectionné"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {route ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium">
                  <span className="text-lg font-bold">
                    {(route.distance / 1000).toLocaleString("fr", { maximumFractionDigits: 1 })} km
                  </span>
                </p>
                <p>⏱️ {formatDuration(route.duration)}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs">Itinéraire indisponible</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
