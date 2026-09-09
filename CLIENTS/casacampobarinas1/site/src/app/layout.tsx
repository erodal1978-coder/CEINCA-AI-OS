import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://casacampo-barinas.vercel.app"),
  title: "Casa & Campo Barinas | El Placer de Sentirse Bien",
  description:
    "Tu oasis natural en Barinas. Piscina familiar, hospedaje campestre, gastronomía llanera y eventos privados para desconectar de la rutina. Planifica tu visita.",
  keywords: [
    "Casa y Campo Barinas",
    "piscina familiar Barinas",
    "hospedaje Barinas",
    "eventos privados Barinas",
    "gastronomía llanera",
    "turismo Barinas",
  ],
  openGraph: {
    title: "Casa & Campo Barinas | El Placer de Sentirse Bien",
    description:
      "Tu oasis natural en Barinas. Piscina familiar, eventos privados, gastronomía llanera y hospedaje para desconectar de la rutina.",
    siteName: "Casa & Campo Barinas",
    locale: "es_VE",
    type: "website",
    images: [
      {
        url: "/images/hero-instalaciones.jpg",
        width: 1200,
        height: 630,
        alt: "Instalaciones de Casa & Campo Barinas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Casa & Campo Barinas | El Placer de Sentirse Bien",
    description:
      "Tu oasis natural en Barinas. Piscina familiar, gastronomía y hospedaje campestre.",
    images: ["/images/hero-instalaciones.jpg"],
  },
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
    ],
    apple: "/images/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
