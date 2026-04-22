import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Copy, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chess } from "chess.js";
import { supabase } from "@/integrations/supabase/client";
import { useGuest } from "@/hooks/useGuest";
import { toast } from "sonner";

type GameType = "chess" | "xo" | "ludo";

interface MatchRow {
  id: string;
  game: GameType;
  status: "waiting" | "active" | "finished" | "abandoned";
  room_code: string | null;
  player1_id: string | null;
  player2_id: string | null;
  player1_nickname: string | null;
  player2_nickname: string | null;
  current_turn: number;
  state: any;
  winner: number | null;
}

const PIECE_UNICODE: Record<string, string> = {
  wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
  bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚",
};

export default function OnlineMatch() {
  const { game, matchId } = useParams<{ game: GameType; matchId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { guest } = useGuest();
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const chessRef = useRef<Chess>(new Chess());
  const lastAppliedFen = useRef<string>("");

  // Determine my role
  const myRole: 1 | 2 | 0 = match
    ? guest?.id === match.player1_id ? 1 : guest?.id === match.player2_id ? 2 : 0
    : 0;

  // Initial fetch + subscription
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error(t("online.matchError"));
        navigate("/");
        return;
      }
      setMatch(data as any);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          if (payload.new) setMatch(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Sync chess engine with state
  useEffect(() => {
    if (!match || match.game !== "chess") return;
    const fen = match.state?.fen ?? "start";
    if (fen === lastAppliedFen.current) return;
    try {
      if (fen === "start") chessRef.current = new Chess();
      else chessRef.current = new Chess(fen);
      lastAppliedFen.current = fen;
    } catch {
      chessRef.current = new Chess();
    }
  }, [match]);

  // Apply ELO rating after match finishes (fire from player1 only to avoid duplicate)
  useEffect(() => {
    if (!match || !guest) return;
    if (match.status === "finished" && match.winner !== null && myRole === 1) {
      supabase.rpc("apply_match_result", { _match_id: match.id }).then(() => {});
    }
  }, [match?.status, match?.winner]);

  const copyCode = () => {
    if (!match?.room_code) return;
    navigator.clipboard.writeText(match.room_code);
    toast.success(t("online.codeCopied"));
  };

  // ============ CHESS ============
  const handleChessSquare = async (sq: string) => {
    if (!match || match.status !== "active" || !guest) return;
    if (myRole === 0) return;
    const turnNum = match.current_turn;
    if (turnNum !== myRole) {
      toast.message(t("online.notYourTurn"));
      return;
    }
    const chess = chessRef.current;
    const piece = chess.get(sq as any);
    if (selected) {
      if (selected === sq) { setSelected(null); return; }
      const move = chess.move({ from: selected as any, to: sq as any, promotion: "q" });
      if (move) {
        const newFen = chess.fen();
        const isOver = chess.isGameOver();
        let winner: number | null = null;
        if (chess.isCheckmate()) winner = myRole;
        else if (chess.isDraw() || chess.isStalemate()) winner = 0;
        const update: any = {
          state: { fen: newFen, lastMove: { from: selected, to: sq } },
          current_turn: myRole === 1 ? 2 : 1,
        };
        if (isOver) {
          update.status = "finished";
          update.winner = winner;
          update.finished_at = new Date().toISOString();
        }
        await supabase.from("matches").update(update).eq("id", match.id);
        setSelected(null);
      } else if (piece && ((piece.color === "w" && myRole === 1) || (piece.color === "b" && myRole === 2))) {
        setSelected(sq);
      } else {
        setSelected(null);
      }
    } else {
      if (piece && ((piece.color === "w" && myRole === 1) || (piece.color === "b" && myRole === 2))) {
        setSelected(sq);
      }
    }
  };

  // ============ XO ============
  const handleXoCell = async (idx: number) => {
    if (!match || match.status !== "active" || !guest) return;
    if (myRole === 0) return;
    if (match.current_turn !== myRole) {
      toast.message(t("online.notYourTurn"));
      return;
    }
    const board: (string | null)[] = match.state?.board ?? Array(9).fill(null);
    if (board[idx]) return;
    const symbol = myRole === 1 ? "X" : "O";
    const newBoard = [...board];
    newBoard[idx] = symbol;
    const winner = checkXoWinner(newBoard);
    const update: any = {
      state: { board: newBoard, size: 3 },
      current_turn: myRole === 1 ? 2 : 1,
    };
    if (winner) {
      update.status = "finished";
      update.winner = winner === "draw" ? 0 : (winner === "X" ? 1 : 2);
      update.finished_at = new Date().toISOString();
    }
    await supabase.from("matches").update(update).eq("id", match.id);
  };

  if (loading || !match) {
    return (
      <div className="min-h-screen wood-texture flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  // Status banner
  const isWaiting = match.status === "waiting";
  const isFinished = match.status === "finished";
  const myTurn = match.current_turn === myRole && match.status === "active";

  return (
    <div className="min-h-screen wood-texture p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gold mb-4 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <span>{t("common.back")}</span>
        </button>

        {/* Players */}
        <Card className="p-4 mb-4 bg-card border-gold/40">
          <div className="flex justify-between items-center text-sm">
            <div className={`${match.current_turn === 1 && match.status === "active" ? "text-gold font-bold" : ""}`}>
              ♙ {match.player1_nickname ?? "—"} {myRole === 1 && `(${t("online.you")})`}
            </div>
            <div className="text-muted-foreground">vs</div>
            <div className={`${match.current_turn === 2 && match.status === "active" ? "text-gold font-bold" : ""}`}>
              ♟ {match.player2_nickname ?? t("online.waitingOpponent")} {myRole === 2 && `(${t("online.you")})`}
            </div>
          </div>
        </Card>

        {/* Waiting screen with room code */}
        {isWaiting && (
          <Card className="p-6 mb-4 text-center bg-card border-gold/40">
            <Loader2 className="w-8 h-8 mx-auto text-gold animate-spin mb-3" />
            <p className="text-foreground mb-3">{t("online.waitingOpponent")}</p>
            {match.room_code && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t("online.shareCode")}</p>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold rounded-lg text-gold font-bold text-2xl tracking-widest"
                >
                  {match.room_code}
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Finished banner */}
        {isFinished && (
          <Card className="p-4 mb-4 text-center bg-gradient-to-r from-amber-900/40 to-amber-700/40 border-gold">
            <Crown className="w-8 h-8 mx-auto text-gold mb-2" />
            {match.winner === 0
              ? <p className="text-xl font-bold">{t("online.draw")}</p>
              : <p className="text-xl font-bold">
                  {match.winner === myRole ? t("online.youWon") : (myRole === 0 ? t("online.matchEnded") : t("online.youLost"))}
                </p>
            }
          </Card>
        )}

        {/* Game board */}
        {match.game === "chess" && (
          <ChessBoard
            chess={chessRef.current}
            selected={selected}
            myRole={myRole}
            onSquare={handleChessSquare}
            disabled={!myTurn}
          />
        )}
        {match.game === "xo" && (
          <XoBoard
            board={match.state?.board ?? Array(9).fill(null)}
            onCell={handleXoCell}
            disabled={!myTurn}
          />
        )}
        {match.game === "ludo" && (
          <Card className="p-8 text-center bg-card border-gold/40">
            <p className="text-muted-foreground">{t("online.ludoOnlineSoon")}</p>
          </Card>
        )}

        {!myTurn && match.status === "active" && (
          <p className="text-center text-sm text-muted-foreground mt-3">{t("online.opponentTurn")}</p>
        )}
      </div>
    </div>
  );
}

// ============== Chess board component ==============
function ChessBoard({ chess, selected, myRole, onSquare, disabled }: any) {
  const files = ["a","b","c","d","e","f","g","h"];
  const ranks = [8,7,6,5,4,3,2,1];
  // Flip board for player 2 (black)
  const dispRanks = myRole === 2 ? [...ranks].reverse() : ranks;
  const dispFiles = myRole === 2 ? [...files].reverse() : files;

  const legalTargets = selected
    ? chess.moves({ square: selected, verbose: true }).map((m: any) => m.to)
    : [];

  return (
    <div className="aspect-square w-full max-w-md mx-auto border-4 border-gold rounded-md overflow-hidden shadow-2xl">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {dispRanks.map((rank) =>
          dispFiles.map((file) => {
            const sq = `${file}${rank}`;
            const piece = chess.get(sq as any);
            const isLight = (files.indexOf(file) + rank) % 2 === 0;
            const isSelected = selected === sq;
            const isTarget = legalTargets.includes(sq);
            return (
              <button
                key={sq}
                onClick={() => onSquare(sq)}
                disabled={disabled}
                className={`relative flex items-center justify-center text-3xl sm:text-4xl transition
                  ${isLight ? "bg-amber-100" : "bg-amber-800"}
                  ${isSelected ? "ring-4 ring-yellow-400 ring-inset" : ""}
                  ${disabled ? "cursor-not-allowed" : "hover:brightness-110"}
                `}
              >
                {piece && (
                  <span className={piece.color === "w" ? "text-stone-900" : "text-stone-950"} style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                    {PIECE_UNICODE[`${piece.color}${piece.type}`]}
                  </span>
                )}
                {isTarget && !piece && (
                  <span className="absolute w-3 h-3 rounded-full bg-emerald-600/60" />
                )}
                {isTarget && piece && (
                  <span className="absolute inset-1 rounded-md ring-2 ring-emerald-600/70" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============== XO board ==============
function XoBoard({ board, onCell, disabled }: any) {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto aspect-square">
      {board.map((cell: string | null, i: number) => (
        <button
          key={i}
          onClick={() => onCell(i)}
          disabled={disabled || !!cell}
          className="bg-card border-2 border-gold/40 rounded-lg flex items-center justify-center text-5xl font-bold text-gold hover:bg-card/80 disabled:opacity-90"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}

function checkXoWinner(b: (string | null)[]): "X" | "O" | "draw" | null {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b1,c] of lines) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a] as "X" | "O";
  }
  if (b.every((c) => c)) return "draw";
  return null;
}
