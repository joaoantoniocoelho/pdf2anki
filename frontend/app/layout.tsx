import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Revisa Aí – PDF para Flashcards com IA",
  description:
    "Gere flashcards automaticamente a partir de PDFs. Compatível com Anki. Revisa Aí transforma o seu material de estudo em cartões de revisão em segundos.",
  openGraph: {
    title: "Revisa Aí – PDF para Flashcards com IA",
    description:
      "Gere flashcards automaticamente a partir de PDFs. Compatível com Anki.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
