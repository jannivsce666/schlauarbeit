import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Schlauarbeit – Finde Profis. Erledige Aufträge. Mit KI-Speed.",
  description: "Suche Dienstleister, erstelle Aufträge, lade Bilder hoch und chatte – alles in einem modernen Interface.",
  keywords: ["Dienstleister", "Aufträge", "KI", "Schlauarbeit"],
  openGraph: {
    title: "Schlauarbeit – Finde Profis. Erledige Aufträge. Mit KI-Speed.",
    description: "Suche Dienstleister, erstelle Aufträge, lade Bilder hoch und chatte – alles in einem modernen Interface.",
    url: "https://schlauarbeit.de",
    siteName: "Schlauarbeit",
    locale: "de_DE",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://schlauarbeit.de",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-foreground">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}