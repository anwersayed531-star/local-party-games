import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db as supabase } from "@/lib/db";
import { supabase as sb2 } from "@/integrations/supabase/client";

export interface ChatMessage {
  from: 1 | 2;
  text: string;
  ts: number;
}

interface Props {
  matchId: string;
  myRole: 1 | 2 | 0;
  messages: ChatMessage[];
  // Pushes a new chat message into match.state.chat
  onSend: (text: string) => Promise<void>;
  // Whether opponent is the AI (so we trigger AI replies after my messages)
  opponentIsAi: boolean;
  aiName?: string;
  aiLang?: string;
  myNickname?: string;
  // Live game context so the AI can react meaningfully
  gameType?: "chess" | "xo" | "ludo";
  matchStatus?: "waiting" | "active" | "finished" | "abandoned";
  winner?: number | null; // 0 draw, 1/2 player, null ongoing
  aiRole?: 1 | 2;
}

export default function MatchChat({
  matchId,
  myRole,
  messages,
  onSend,
  opponentIsAi,
  aiName,
  aiLang,
  myNickname,
  gameType,
  matchStatus,
  winner,
  aiRole,
}: Props) {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastReplyTo = useRef<number>(0); // ts of last user msg the AI replied to

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  // NOTE: AI never speaks first. It only replies after the human player sends the first message.
  // (Greeting logic was intentionally removed — the AI must wait to be addressed.)

  // When opponent is AI and the latest message is from me, ask the AI for a reply.
  useEffect(() => {
    if (!opponentIsAi || myRole === 0) return;
    const last = messages[messages.length - 1];
    if (!last || last.from === (myRole === 1 ? 2 : 1)) return; // last is from AI already
    if (last.from !== myRole) return;
    if (last.ts === lastReplyTo.current) return;
    lastReplyTo.current = last.ts;

    const delay = 1200 + Math.random() * 2500;
    const tid = setTimeout(async () => {
      try {
        const gameStatus =
          matchStatus === "finished"
            ? winner === 0
              ? "draw"
              : winner === aiRole
              ? "ai_won"
              : "ai_lost"
            : "ongoing";
        const { data, error } = await sb2.functions.invoke("ai-opponent-chat", {
          body: {
            message: last.text,
            history: messages.slice(-6).map((m) => ({
              role: m.from === myRole ? "user" : "assistant",
              content: m.text,
            })),
            aiName: aiName ?? "Player",
            lang: aiLang ?? i18n.language ?? "en",
            playerName: myNickname ?? "Friend",
            gameType: gameType ?? "chess",
            gameStatus,
          },
        });
        if (error) {
          console.error("[MatchChat] ai-opponent-chat error:", error);
          return;
        }
        const reply = (data as any)?.reply;
        if (!reply) {
          console.warn("[MatchChat] empty reply", data);
          return;
        }
        // Re-fetch current match state and append
        const { data: m } = await supabase.from("matches").select("state").eq("id", matchId).maybeSingle();
        const chat: ChatMessage[] = m?.state?.chat ?? [];
        const next = [...chat, { from: myRole === 1 ? 2 : 1, text: reply, ts: Date.now() } as ChatMessage];
        await supabase
          .from("matches")
          .update({ state: { ...(m?.state ?? {}), chat: next } })
          .eq("id", matchId);
      } catch (e) {
        console.error("[MatchChat] unexpected:", e);
      }
    }, delay);
    return () => clearTimeout(tid);
  }, [messages, opponentIsAi, myRole, matchId, aiName, aiLang, myNickname, i18n.language, matchStatus, winner, aiRole, gameType]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSend(trimmed.slice(0, 200));
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-gold/30 rounded-lg bg-card/60 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gold/20 text-xs text-gold">
        <MessageCircle className="w-3 h-3" />
        {t("chat.title")}
      </div>
      <div ref={scrollRef} className="max-h-40 overflow-y-auto px-3 py-2 space-y-1 text-sm">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">{t("chat.empty")}</p>
        )}
        {messages.map((m, i) => {
          const mine = m.from === myRole;
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-2 py-1 rounded-md max-w-[80%] break-words ${
                  mine ? "bg-gold/20 text-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      {myRole !== 0 && (
        <div className="flex gap-1 p-2 border-t border-gold/20">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("chat.placeholder")}
            maxLength={200}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={handleSend} disabled={sending || !text.trim()} className="h-8 px-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
