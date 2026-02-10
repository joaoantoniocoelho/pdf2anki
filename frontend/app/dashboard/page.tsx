"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useUser } from "@/contexts/UserContext";
import api from "@/lib/api";
import {
  Loader2,
  Download,
  Trash2,
  FileText,
  Calendar,
  LayoutDashboard,
  AlertCircle,
  Eye,
  Pencil,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { DeckCardSkeleton } from "@/components/Skeleton";

interface Deck {
  _id: string;
  name: string;
  pdfFileName: string;
  density: string;
  createdAt: string;
  metadata: {
    finalCount: number;
    language: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useUser();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadDecks();
    }
  }, [authLoading, isAuthenticated]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/decks");
      setDecks(response.data.decks);
    } catch (err: unknown) {
      console.error("Error loading decks:", err);
      setError("Não foi possível carregar seus decks.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (deckId: string, deckName: string) => {
    try {
      setExporting(deckId);
      const response = await api.get(`/export/deck/${deckId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/apkg" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deckName}.apkg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Error exporting deck:", err);
      setError("Erro ao exportar o deck.");
    } finally {
      setExporting(null);
    }
  };

  const handleDelete = async (deckId: string) => {
    if (!confirm("Tem certeza que deseja excluir este deck? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      setDeleting(deckId);
      await api.delete(`/decks/${deckId}`);
      setDecks(decks.filter((d) => d._id !== deckId));
    } catch (err: unknown) {
      console.error("Error deleting deck:", err);
      setError("Erro ao excluir o deck.");
    } finally {
      setDeleting(null);
    }
  };

  const startEditingName = (deckId: string, currentName: string) => {
    setEditingDeckId(deckId);
    setEditedName(currentName);
  };

  const cancelEditingName = () => {
    setEditingDeckId(null);
    setEditedName("");
  };

  const saveDeckName = async (deckId: string) => {
    if (!editedName.trim()) return;
    try {
      setSavingName(true);
      const response = await api.patch(`/decks/${deckId}`, {
        name: editedName.trim(),
      });
      setDecks(
        decks.map((d) =>
          d._id === deckId ? { ...d, name: response.data.deck.name } : d
        )
      );
      setEditingDeckId(null);
      setEditedName("");
    } catch (err: unknown) {
      console.error("Error updating deck name:", err);
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Erro ao atualizar o nome."
      );
    } finally {
      setSavingName(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-surface py-6 md:py-12 px-4 pb-28 md:pb-6">
          <div className="max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <LayoutDashboard className="w-16 h-16 text-gray-300 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800">
                Faça login para ver seus decks
              </h2>
              <p className="text-muted text-sm">
                Os decks que você gerar ficam salvos na sua conta.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface py-6 md:py-12 px-4 pb-28 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Meus decks
            </h1>
            <p className="text-sm text-muted mt-1">
              {decks.length}{" "}
              {decks.length === 1 ? "deck salvo" : "decks salvos"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <DeckCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && decks.length === 0 && (
            <div className="bg-white rounded-card-lg border border-border shadow-card p-8 sm:p-12 text-center">
              <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Você ainda não tem decks
              </h3>
              <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
                Um deck é um conjunto de flashcards gerado a partir de um PDF.
                Gere o primeiro na página Gerar e ele aparecerá aqui.
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-card hover:bg-primary-hover transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Gerar flashcards
              </button>
            </div>
          )}

          {!loading && decks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {decks.map((deck) => (
                <div
                  key={deck._id}
                  className="bg-white rounded-card-lg border border-border shadow-card hover:shadow-card-hover transition-shadow overflow-hidden"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => {
                      if (editingDeckId !== deck._id) {
                        router.push(`/deck/${deck._id}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {editingDeckId === deck._id ? (
                        <div
                          className="flex-1 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="flex-1 text-sm font-medium text-gray-900 border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-0"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveDeckName(deck._id);
                              if (e.key === "Escape") cancelEditingName();
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => saveDeckName(deck._id)}
                            disabled={savingName || !editedName.trim()}
                            className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50"
                          >
                            {savingName ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingName}
                            disabled={savingName}
                            className="p-1.5 bg-gray-200 text-gray-700 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-900 truncate flex-1 min-w-0">
                            {deck.name}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingName(deck._id, deck.name);
                            }}
                            className="p-1 text-muted hover:text-primary hover:bg-primary-muted rounded"
                            title="Editar nome"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate flex items-center gap-1">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      {deck.pdfFileName}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                      <span>{deck.metadata?.finalCount ?? 0} cartões</span>
                      <span className="capitalize">{deck.density}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deck.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <div className="flex border-t border-border">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/deck/${deck._id}`);
                      }}
                      className="flex-1 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary-muted transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(deck._id, deck.name);
                      }}
                      disabled={exporting === deck._id}
                      className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1.5 border-x border-border"
                    >
                      {exporting === deck._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Exportar
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(deck._id);
                      }}
                      disabled={deleting === deck._id}
                      className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === deck._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
