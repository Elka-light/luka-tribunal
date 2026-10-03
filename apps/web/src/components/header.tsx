"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        {/* Logo et titre */}
        <Link href="/" className="flex items-center gap-3 font-bold hover:opacity-80">
          <Image
            src="/logo.png"
            alt="Logo LUKA TRIBUNAL"
            width={48}
            height={48}
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <div className="flex flex-col">
            <span className="text-lg leading-tight sm:text-xl">LUKA TRIBUNAL</span>
            <span className="text-xs font-normal text-slate-600">Tribunaux pour enfants - RDC</span>
          </div>
        </Link>

        {/* Navigation desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="font-medium text-slate-700 transition hover:text-emerald-700"
          >
            Accueil
          </Link>
          <Link
            href="/#recherche"
            className="font-medium text-slate-700 transition hover:text-emerald-700"
          >
            Rechercher
          </Link>
          <Link
            href="/administration"
            className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800"
          >
            Administration
          </Link>
        </div>

        {/* Bouton menu mobile */}
        <button
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="flex flex-col gap-2 px-5 py-4">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/#recherche"
              className="rounded-lg px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rechercher
            </Link>
            <Link
              href="/administration"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-center font-semibold text-white transition hover:bg-emerald-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Administration
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
