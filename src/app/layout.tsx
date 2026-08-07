import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peluquería SL | Barbería en Villa Elvira, La Plata",
  description: "Reservá tu turno online con Santiago Lencina. Cortes de pelo, barba y perfilado profesional. Galería VIP y sistema de fidelización de clientes.",
  keywords: ["peluqueria", "barberia", "la plata", "villa elvira", "turnos online", "peluqueria sl", "santiago lencina", "cortes de pelo", "barber"],
  authors: [{ name: "Santiago Lencina" }],
  openGraph: {
    title: "Peluquería SL | Barbería en Villa Elvira, La Plata",
    description: "Reservá tu turno online con Santiago Lencina. ¡Mira nuestra galería VIP y acumula cortes gratis!",
    type: "website",
    locale: "es_AR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0F0F11] text-zinc-100 selection:bg-gold selection:text-[#0F0F11]">
        {children}
      </body>
    </html>
  );
}
