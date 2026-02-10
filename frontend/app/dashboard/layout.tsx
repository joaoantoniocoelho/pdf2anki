import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus decks | Revisa Aí",
  description: "Veja e exporte os seus decks de flashcards para Anki.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
