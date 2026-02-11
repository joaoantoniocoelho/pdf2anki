"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { resendVerificationEmail } from "@/lib/auth";
import { Mail, Loader2, X } from "lucide-react";

export function EmailVerificationBanner() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<"sent" | "error" | null>(null);
  const [errorDetail, setErrorDetail] = useState("");

  if (!user || user.emailVerified !== false) return null;

  const handleResend = async () => {
    setMessage(null);
    setErrorDetail("");
    setLoading(true);
    try {
      await resendVerificationEmail();
      setMessage("sent");
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : "Erro ao reenviar";
      setMessage("error");
      setErrorDetail(String(msg));
      setTimeout(() => { setMessage(null); setErrorDetail(""); }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-800 text-sm">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span>
            {message === "sent"
              ? "Email reenviado! Verifique sua caixa de entrada."
              : message === "error"
                ? errorDetail || "Erro ao reenviar. Tente novamente."
                : "Confirme seu email para ativar sua conta."}
          </span>
        </div>
        {message !== "sent" && (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-sm font-medium text-amber-800 hover:text-amber-900 underline disabled:opacity-70 flex items-center gap-1 sm:flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Enviando...
              </>
            ) : (
              "Reenviar email"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
