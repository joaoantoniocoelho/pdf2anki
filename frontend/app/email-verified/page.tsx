"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useUser } from "@/contexts/UserContext";
import { getProfile, resendVerificationEmail } from "@/lib/auth";
import Link from "next/link";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";

export default function EmailVerifiedPage() {
  const { refreshUser } = useUser();
  const [profile, setProfile] = useState<{ emailVerified?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<"sent" | "error" | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getProfile();
        if (!cancelled) {
          setProfile(data as { emailVerified?: boolean });
          refreshUser();
        }
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshUser]);

  const verified = profile?.emailVerified === true;

  const handleResend = async () => {
    setResendMessage(null);
    setResending(true);
    try {
      await resendVerificationEmail();
      setResendMessage("sent");
      await refreshUser();
    } catch {
      setResendMessage("error");
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-surface flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface py-12 px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          {verified ? (
            <>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Seu email já está verificado
              </h1>
              <p className="text-muted text-sm">
                Não é preciso fazer nada. Você já pode usar todos os recursos.
              </p>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-card hover:bg-primary-hover"
              >
                Ir para Gerar
              </Link>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Link expirado ou inválido
              </h1>
              <p className="text-muted text-sm">
                Solicite um novo email de confirmação abaixo.
              </p>
              {resendMessage === "sent" && (
                <p className="text-sm text-green-600">
                  Email reenviado. Verifique sua caixa de entrada.
                </p>
              )}
              {resendMessage === "error" && (
                <p className="text-sm text-red-600">
                  Erro ao reenviar. Tente novamente em alguns minutos.
                </p>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-card hover:bg-primary-hover disabled:opacity-70"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Reenviar email"
                )}
              </button>
              <div>
                <Link href="/" className="text-sm text-muted hover:text-gray-900">
                  Voltar ao início
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
