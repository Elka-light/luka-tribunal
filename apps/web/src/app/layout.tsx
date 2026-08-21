import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LUKA TRIBUNAL",
  description:
    "Plateforme d’information et d’orientation vers les tribunaux pour enfants en RDC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
