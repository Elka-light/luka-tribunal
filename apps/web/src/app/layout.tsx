import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LUKA TRIBUNAL",
  description:
    "Plateforme d'information et d'orientation vers les tribunaux pour enfants en RDC.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "LUKA TRIBUNAL",
    description:
      "Plateforme d'information et d'orientation vers les tribunaux pour enfants en RDC.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Logo LUKA TRIBUNAL" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
