import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estudar deck | Revisa Aí",
  description: "Estude os seus flashcards e exporte para Anki.",
};

export default function DeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
