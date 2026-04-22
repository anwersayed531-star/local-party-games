import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useGuest } from "@/hooks/useGuest";

type GameType = "chess" | "xo" | "ludo";

interface Row {
  guest_id: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  nickname: string;
}

export default function Leaderboard() {
  const { game } = useParams<{ game: GameType }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { guest } = useGuest();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!game) return;
    const load = async () => {
      const { data: lb } = await supabase
        .from("leaderboard")
        .select("guest_id, rating, wins, losses, draws")
        .eq("game", game)
        .order("rating", { ascending: false })
        .limit(100);
      if (!lb || lb.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const ids = lb.map((r) => r.guest_id);
      const { data: gs } = await supabase
        .from("guests")
        .select("id, nickname")
        .in("id", ids);
      const map = new Map<string, string>();
      (gs ?? []).forEach((g) => map.set(g.id, g.nickname));
      setRows(
        lb.map((r) => ({ ...r, nickname: map.get(r.guest_id) ?? "—" }))
      );
      setLoading(false);
    };
    load();
  }, [game]);

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (i === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (i === 2) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="text-muted-foreground w-5 text-center">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen wood-texture p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gold mb-4 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <span>{t("common.back")}</span>
        </button>

        <div className="text-center mb-6">
          <Trophy className="w-12 h-12 mx-auto text-gold mb-2" />
          <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: "'Cinzel', serif" }}>
            {t("online.leaderboard")}
          </h1>
          <p className="text-muted-foreground">{t(`games.${game}.title`)}</p>
        </div>

        <Card className="bg-card border-gold/40 overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-muted-foreground">...</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">{t("online.noPlayersYet")}</p>
          ) : (
            <ul>
              {rows.map((r, i) => {
                const me = guest?.id === r.guest_id;
                return (
                  <li
                    key={r.guest_id}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 ${me ? "bg-gold/10" : ""}`}
                  >
                    <div className="w-8 flex justify-center">{rankIcon(i)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">
                        {r.nickname} {me && <span className="text-xs text-gold">({t("online.you")})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.wins}W · {r.losses}L · {r.draws}D
                      </p>
                    </div>
                    <div className="text-gold font-bold text-lg">{r.rating}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
