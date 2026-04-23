import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Crown, Grid3X3, Dice5, Users, KeyRound, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import GuestPrompt from "@/components/GuestPrompt";
import { useGuest } from "@/hooks/useGuest";
import { db as supabase } from "@/lib/db";
import { toast } from "sonner";
import { generateAiName } from "@/lib/aiNames";
import { COUNTRIES, NEIGHBORS, getCountry, extractFlag } from "@/lib/countries";

type GameType = "chess" | "xo" | "ludo";

const GAME_META: Record<GameType, { icon: typeof Crown; color: string }> = {
  chess: { icon: Crown, color: "from-emerald-900/60 to-teal-900/60" },
  xo: { icon: Grid3X3, color: "from-red-900/60 to-orange-900/60" },
  ludo: { icon: Dice5, color: "from-blue-900/60 to-indigo-900/60" },
};

// 15s before AI fallback joins matchmaking
const AI_FALLBACK_MS = 15_000;

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function initialState(game: GameType) {
  if (game === "chess") return { fen: "start", lastMove: null, chat: [] };
  if (game === "xo") return { board: Array(9).fill(null), size: 3, chat: [] };
  return { positions: {}, chat: [] };
}

function pickAiCountry(playerNickname?: string | null): string {
  // Try to read player's flag and pick a neighbor; otherwise random.
  const flag = extractFlag(playerNickname);
  const player = COUNTRIES.find((c) => c.flag === flag);
  const neighbors = player ? NEIGHBORS[player.code] : undefined;
  const pool = neighbors && neighbors.length > 0 ? neighbors : COUNTRIES.map((c) => c.code);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function OnlineLobby() {
  const { game } = useParams<{ game: GameType }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { guest } = useGuest();
  const [promptOpen, setPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | "match" | "create" | "join">(null);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const aiTimerRef = useRef<number | null>(null);
  const myWaitingMatchRef = useRef<string | null>(null);

  if (!game || !["chess", "xo", "ludo"].includes(game)) {
    return <div className="p-8">Invalid game</div>;
  }
  const Meta = GAME_META[game].icon;

  // After guest is ready, run the requested action
  useEffect(() => {
    if (guest && pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      if (action === "match") doMatchmaking();
      else if (action === "create") doCreateRoom();
      else if (action === "join") doJoinRoom();
    }
    // eslint-disable-next-line
  }, [guest, pendingAction]);

  // Cleanup AI timer on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    };
  }, []);

  const ensureGuest = (action: "match" | "create" | "join") => {
    if (!guest) {
      setPendingAction(action);
      setPromptOpen(true);
      return false;
    }
    return true;
  };

  // Schedules an AI to join my waiting matchmaking match if no one shows up.
  const scheduleAiFallback = (matchId: string, playerNickname: string) => {
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    myWaitingMatchRef.current = matchId;
    aiTimerRef.current = window.setTimeout(async () => {
      // Re-check the match is still waiting and still mine
      const { data } = await supabase
        .from("matches")
        .select("id,status,player2_id")
        .eq("id", matchId)
        .maybeSingle();
      if (!data || data.status !== "waiting" || data.player2_id) return;

      const ai = generateAiName(playerNickname);
      const aiCountryCode = pickAiCountry(playerNickname);
      const aiFlag = getCountry(aiCountryCode)?.flag ?? "🏳️";
      // Synthetic AI guest id (uuid). Mark as AI by storing in nickname prefix? Use a known sentinel pattern.
      // We use a real uuid so it satisfies uuid columns; the "AI" flag is stored in match.state.ai = true.
      const aiId = crypto.randomUUID();
      const aiNickname = `${aiFlag} ${ai.name}`.slice(0, 24);

      // Insert a guest row for the AI so leaderboard FK is happy if it ever updates.
      await supabase.from("guests").insert({ id: aiId, nickname: aiNickname }).select().maybeSingle();

      const { error } = await supabase
        .from("matches")
        .update({
          player2_id: aiId,
          player2_nickname: aiNickname,
          status: "active",
          state: {
            ...(initialState(game as GameType)),
            ai: { role: 2, name: ai.name, lang: ai.lang, country: aiCountryCode },
          },
        })
        .eq("id", matchId)
        .eq("status", "waiting");
      if (error) return;
      // Real-time channel on the match page will pick up the change automatically.
    }, AI_FALLBACK_MS) as unknown as number;
  };

  const doMatchmaking = async () => {
    if (!guest) return;
    setBusy(true);
    setSearching(true);
    try {
      // Find an open match (waiting, not created by me, not an AI room)
      const { data: open } = await supabase
        .from("matches")
        .select("*")
        .eq("game", game)
        .eq("mode", "matchmaking")
        .eq("status", "waiting")
        .neq("player1_id", guest.id)
        .order("created_at", { ascending: true })
        .limit(1);

      if (open && open.length > 0) {
        const match = open[0];
        const { error } = await supabase
          .from("matches")
          .update({
            player2_id: guest.id,
            player2_nickname: guest.nickname,
            status: "active",
          })
          .eq("id", match.id)
          .eq("status", "waiting");
        if (error) {
          toast.error(t("online.matchError"));
          setBusy(false);
          setSearching(false);
          return;
        }
        navigate(`/online/${game}/${match.id}`);
        return;
      }

      // None available - create one and start AI fallback timer
      const { data: created, error } = await supabase
        .from("matches")
        .insert({
          game,
          mode: "matchmaking",
          status: "waiting",
          player1_id: guest.id,
          player1_nickname: guest.nickname,
          state: initialState(game as GameType),
        })
        .select()
        .single();
      if (error || !created) {
        toast.error(t("online.matchError"));
        setBusy(false);
        setSearching(false);
        return;
      }
      // Schedule AI to join after AI_FALLBACK_MS if no human shows up
      scheduleAiFallback(created.id, guest.nickname);
      navigate(`/online/${game}/${created.id}`);
    } finally {
      setBusy(false);
      // searching cleared by navigation
    }
  };

  const doCreateRoom = async () => {
    if (!guest) return;
    setBusy(true);
    try {
      const code = genCode();
      const { data, error } = await supabase
        .from("matches")
        .insert({
          game,
          mode: "private",
          status: "waiting",
          room_code: code,
          player1_id: guest.id,
          player1_nickname: guest.nickname,
          state: initialState(game as GameType),
        })
        .select()
        .single();
      if (error || !data) {
        toast.error(t("online.matchError"));
        setBusy(false);
        return;
      }
      navigate(`/online/${game}/${data.id}`);
    } finally {
      setBusy(false);
    }
  };

  const doJoinRoom = async () => {
    if (!guest) return;
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      toast.error(t("online.invalidCode"));
      return;
    }
    setBusy(true);
    try {
      const { data: match } = await supabase
        .from("matches")
        .select("*")
        .eq("room_code", code)
        .eq("game", game)
        .maybeSingle();
      if (!match) {
        toast.error(t("online.roomNotFound"));
        setBusy(false);
        return;
      }
      if (match.status !== "waiting" || !match.player1_id) {
        toast.error(t("online.roomFull"));
        setBusy(false);
        return;
      }
      if (match.player1_id === guest.id) {
        navigate(`/online/${game}/${match.id}`);
        return;
      }
      const { error } = await supabase
        .from("matches")
        .update({
          player2_id: guest.id,
          player2_nickname: guest.nickname,
          status: "active",
        })
        .eq("id", match.id)
        .eq("status", "waiting");
      if (error) {
        toast.error(t("online.matchError"));
        setBusy(false);
        return;
      }
      navigate(`/online/${game}/${match.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen wood-texture flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gold mb-6 hover:opacity-80"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t("common.back")}</span>
        </button>

        <div className="text-center mb-8">
          <Meta className="w-16 h-16 mx-auto text-gold mb-3" />
          <h1 className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
            {t(`games.${game}.title`)} — {t("online.title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("online.subtitle")}</p>
          {guest && (
            <p className="text-xs text-muted-foreground mt-2">
              {t("online.playingAs")}: <span className="text-gold font-bold">{guest.nickname}</span>
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className={`p-6 bg-gradient-to-br ${GAME_META[game].color} border-gold/40`}>
            <Users className="w-10 h-10 text-gold mb-3" />
            <h2 className="text-xl font-bold mb-2">{t("online.matchmaking")}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t("online.matchmakingDesc")}</p>
            <Button
              onClick={() => ensureGuest("match") && doMatchmaking()}
              disabled={busy}
              className="w-full bg-gold/90 text-background hover:bg-gold"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t("online.findOpponent")}
            </Button>
          </Card>

          <Card className="p-6 bg-card border-gold/40">
            <KeyRound className="w-10 h-10 text-gold mb-3" />
            <h2 className="text-xl font-bold mb-2">{t("online.privateRoom")}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t("online.privateRoomDesc")}</p>
            <Button
              onClick={() => ensureGuest("create") && doCreateRoom()}
              disabled={busy}
              variant="secondary"
              className="w-full mb-3"
            >
              {t("online.createRoom")}
            </Button>
            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={t("online.codePlaceholder")}
                maxLength={8}
                className="uppercase"
              />
              <Button onClick={() => ensureGuest("join") && doJoinRoom()} disabled={busy}>
                {t("online.join")}
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <Button
            variant="outline"
            className="border-gold/40 text-gold h-auto py-4 flex flex-col gap-1"
            onClick={() => navigate(`/leaderboard/${game}`)}
          >
            <Trophy className="w-6 h-6" />
            <span>{t("online.leaderboard")}</span>
          </Button>
          <Button
            variant="outline"
            className="border-gold/40 text-gold h-auto py-4 flex flex-col gap-1"
            onClick={() => navigate(`/tournaments/${game}`)}
          >
            <Crown className="w-6 h-6" />
            <span>{t("online.tournaments")}</span>
          </Button>
        </div>
      </div>

      <GuestPrompt
        open={promptOpen}
        onOpenChange={setPromptOpen}
        onReady={() => {}}
      />
    </div>
  );
}
