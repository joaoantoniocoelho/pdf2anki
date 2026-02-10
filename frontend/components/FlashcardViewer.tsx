"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Tag as TagIcon,
  Layers,
  List,
  Download,
} from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
  tags?: string[];
}

type ViewMode = "deck" | "list";

interface FlashcardViewerProps {
  cards: Flashcard[];
  deckName?: string;
  onExport?: () => void;
  exporting?: boolean;
  exportDisabled?: boolean;
}

export default function FlashcardViewer({
  cards,
  deckName,
  onExport,
  exporting = false,
  exportDisabled = false,
}: FlashcardViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("deck");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndexRef = useRef(0);

  const updateCurrentIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || cards.length === 0) return;
    const cardWidth = el.offsetWidth;
    const scrollLeft = el.scrollLeft;
    const index = Math.round(scrollLeft / cardWidth);
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    if (clamped !== prevIndexRef.current) {
      prevIndexRef.current = clamped;
      setCurrentCardIndex(clamped);
      setShowAnswer(false);
    }
  }, [cards.length]);

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, cards.length);
  }, [cards.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) updateCurrentIndex();
  }, [viewMode, updateCurrentIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScrollEnd = () => updateCurrentIndex();
    el.addEventListener("scrollend", handleScrollEnd);
    return () => el.removeEventListener("scrollend", handleScrollEnd);
  }, [updateCurrentIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateCurrentIndex, 100);
    };
    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [updateCurrentIndex]);

  const scrollToCard = (index: number) => {
    const el = scrollRef.current;
    const slide = slideRefs.current[index];
    if (el && slide) {
      setShowAnswer(false);
      slide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) scrollToCard(currentCardIndex + 1);
  };

  const prevCard = () => {
    if (currentCardIndex > 0) scrollToCard(currentCardIndex - 1);
  };

  const handleCardClick = (index: number) => {
    if (index === currentCardIndex) setShowAnswer((prev) => !prev);
  };

  useEffect(() => {
    if (viewMode !== "deck" || cards.length === 0) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevCard();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextCard();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setShowAnswer((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [viewMode, currentCardIndex, cards.length]);

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-sm">Nenhum cartão neste deck.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {deckName && (
          <h2 className="text-lg font-semibold text-gray-900 truncate min-w-0 sm:flex-1">
            {deckName}
          </h2>
        )}
        <div className="flex flex-1 sm:flex-initial min-w-0 bg-gray-100 rounded-card p-1">
          <button
            type="button"
            onClick={() => setViewMode("deck")}
            className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 ${
              viewMode === "deck"
                ? "bg-white text-primary shadow-sm border border-gray-200/80"
                : "text-muted hover:text-gray-900 hover:bg-gray-50/80"
            }`}
          >
            <Layers className="w-4 h-4 flex-shrink-0" />
            Estudo
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 ${
              viewMode === "list"
                ? "bg-white text-primary shadow-sm border border-gray-200/80"
                : "text-muted hover:text-gray-900 hover:bg-gray-50/80"
            }`}
          >
            <List className="w-4 h-4 flex-shrink-0" />
            Lista
          </button>
        </div>
      </div>

      {onExport && (
        <div>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting || exportDisabled}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-card hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {exporting ? "A exportar..." : "Transferir .apkg para Anki"}
          </button>
        </div>
      )}

      {viewMode === "deck" && (
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Cartão {currentCardIndex + 1} de {cards.length}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {cards.map((card, index) => (
              <div
                key={index}
                ref={(el) => {
                  slideRefs.current[index] = el;
                }}
                className="flex-shrink-0 w-full min-w-full snap-center px-2 flex justify-center"
              >
                <div
                  className={`w-full max-w-[calc(100%-0.5rem)] min-h-[220px] sm:min-h-[260px] rounded-card-lg border border-blue-100 bg-white shadow-card-focus cursor-pointer overflow-hidden transition-shadow duration-200 hover:shadow-card-hover active:scale-[0.995] ${
                    index === currentCardIndex ? "ring-1 ring-primary/10" : ""
                  }`}
                  onClick={() => handleCardClick(index)}
                >
                  <div
                    className="relative w-full h-full min-h-[220px] sm:min-h-[260px]"
                    style={{ perspective: "2000px" }}
                  >
                    <div
                      className="relative w-full h-full min-h-[220px] sm:min-h-[260px]"
                      style={{
                        transformStyle: "preserve-3d",
                        transform:
                          index === currentCardIndex && showAnswer
                            ? "rotateY(180deg)"
                            : "rotateY(0deg)",
                        transition: "transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)",
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-blue-50/40 border border-blue-100/80 rounded-card-lg p-6 flex flex-col justify-center items-center text-left [backface-visibility:hidden]"
                        style={{ transform: "rotateY(0deg)" }}
                      >
                        <div className="w-full space-y-3">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Pergunta
                          </div>
                          <p className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed">
                            {card.front}
                          </p>
                          <p className="text-xs text-muted">
                            Clique ou use Espaço para ver a resposta
                          </p>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 bg-emerald-50/50 border border-emerald-100/80 rounded-card-lg p-6 flex flex-col justify-center items-center text-left [backface-visibility:hidden]"
                        style={{ transform: "rotateY(180deg)" }}
                      >
                        <div className="w-full space-y-3">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-100/80 text-emerald-800 rounded-md text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resposta
                          </div>
                          <div className="text-sm sm:text-base text-gray-800 leading-relaxed">
                            {card.back}
                          </div>
                          {card.tags && card.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {card.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                                >
                                  <TagIcon className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted">
                            Clique para voltar à pergunta
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-card hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={nextCard}
                disabled={currentCardIndex === cards.length - 1}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-card hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2 shadow-sm"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted text-center">
              <span className="md:hidden">Toque no cartão para virar e deslize para mudar.</span>
              <span className="hidden md:inline">Setas para navegar. Espaço ou Enter para virar.</span>
            </p>
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-card border border-gray-200 p-4 shadow-card hover:shadow-card-hover transition-shadow duration-150"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-muted text-primary rounded-lg flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                      Pergunta
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {card.front}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">
                      Resposta
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {card.back}
                    </p>
                  </div>
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {card.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          <TagIcon className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
