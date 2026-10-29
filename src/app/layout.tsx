import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web RG Est / Logistique",
  description: "Tableau visuel, rituel de 5 minutes et KPI automatiques pour les équipes terrain.",
  metadataBase: new URL("https://webrgest-logistique.vercel.app"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Web RG Est",
    title: "Web RG Est / Logistique",
    description: "Tableau visuel, rituel de 5 minutes et KPI automatiques pour les équipes terrain.",
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "Web RG Est / Logistique", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141729",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
