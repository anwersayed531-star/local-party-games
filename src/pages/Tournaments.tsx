import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Crown, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db as supabase } from "@/lib/db";
import { useGuest } from "@/hooks/useGuest";
import GuestPrompt from "@/components/GuestPrompt";
import { toast } from "sonner";
import { extractFlag } from "@/lib/countries";

type GameType = "chess" | "xo" | "ludo";

interface Tournament {
  id: string;
  name: string;
  game: GameType;
  status: string;
  starts_at: string;
  ends_at: string;
  prize_label: string | null;
  participant_count?: number;
  joined?: boolean;
  my_score?: number;
}

export default function Tournaments() {
  const { game } = useParams<{ game?: GameType }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { guest } = useGuest();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [promptOpen, setPromptOpen] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<string | null>(null);

  const load = async () => {
    let query = supabase
      .from("tournaments")
      .select("*")
      .order("starts_at", { ascending: false });
    if (game) query = query.eq("game", game);
    const { data: ts } = await query;
    if (!ts) { setLoading(false); return; }

    // counts
    const ids = ts.map((t) => t.id);
    const { data: parts } = await supabase
      .from("tournament_participants")
      .select("tournament_id, guest_id, score")
      .in("tournament_id", ids);
    const counts = new Map<string, number>();
    const myScores = new Map<string, number>();
    (parts ?? []).forEach((p) => {
      counts.set(p.tournament_id, (counts.get(p.tournament_id) ?? 0) + 1);
      if (guest && p.guest_id === guest.id) myScores.set(p.tournament_id, p.score);
    });

    setTournaments(
      ts.map((t) => ({
        ...t,
        participant_count: counts.get(t.id) ?? 0,
        joined: myScores.has(t.id),
        my_score: myScores.get(t.id),
      })) as any
    );
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [game, guest?.id]);

  const join = async (tId: string) => {
    if (!guest) {
      setPendingJoin(tId);
      setPromptOpen(true);
      return;
    }
    const { error } = await supabase
      .from("tournament_participants")
      .insert({ tournament_id: tId, guest_id: guest.id, nickname: guest.nickname });
    if (error && !error.message.includes("duplicate")) {
      toast.error(t("online.joinError"));
      return;
    }
    toast.success(t("online.joined"));
    load();
  };

  // Auto-join after guest is created
  useEffect(() => {
    if (guest && pendingJoin) {
      const id = pendingJoin;
      setPendingJoin(null);
      join(id);
    }
    // eslint-disable-next-line
  }, [guest]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(i18n.language, { month: "short", day: "numeric" });

  return (
    <div className="min-h-screen wood-texture p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gold mb-4 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <span>{t("common.back")}</span>
        </button>

        <div className="text-center mb-6">
          <Crown className="w-12 h-12 mx-auto text-gold mb-2" />
          <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: "'Cinzel', serif" }}>
            {t("online.tournaments")}
          </h1>
          <p className="text-muted-foreground">{t("online.tournamentsDesc")}</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">...</p>
        ) : tournaments.length === 0 ? (
          <Card className="p-8 text-center bg-card border-gold/40">
            <p className="text-muted-foreground">{t("online.noTournaments")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tour) => (
              <Card key={tour.id} className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-950/30 border-gold/40">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gold">{tour.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {t(`games.${tour.game}.title`)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    tour.status === "open" ? "bg-emerald-900/50 text-emerald-300" :
                    tour.status === "running" ? "bg-blue-900/50 text-blue-300" :
                    "bg-gray-800 text-gray-400"
                  }`}>
                    {t(`online.tStatus.${tour.status}`)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(tour.starts_at)} → {fmtDate(tour.ends_at)}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {tour.participant_count ?? 0}</span>
                  {tour.prize_label && <span>{tour.prize_label}</span>}
                </div>
                <div className="flex gap-2">
                  {tour.joined ? (
                    <>
                      <Button variant="secondary" disabled className="flex-1">
                        ✓ {t("online.joined")} {tour.my_score ? `(${tour.my_score} pts)` : ""}
                      </Button>
                      <Button onClick={() => navigate(`/online/${tour.game}`)} className="bg-gold/90 text-background hover:bg-gold">
                        {t("online.play")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => join(tour.id)}
                      disabled={tour.status === "finished"}
                      className="w-full bg-gold/90 text-background hover:bg-gold"
                    >
                      {t("online.joinTournament")}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <GuestPrompt open={promptOpen} onOpenChange={setPromptOpen} onReady={() => {}} />
    </div>
  );
}
