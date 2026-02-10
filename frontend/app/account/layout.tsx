import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conta | Revisa Aí",
  description: "Gerir a sua conta e ver créditos disponíveis.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
