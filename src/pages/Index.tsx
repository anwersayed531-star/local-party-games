import { useNavigate } from "react-router-dom";
import { Settings, Dice5, Grid3X3, Crown, Globe, Trophy, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsDialog from "@/components/SettingsDialog";
import { useAuth } from "@/hooks/useAuth";
import { getCountry } from "@/lib/countries";

const gameDefs = [
  {
    id: "xo",
    icon: Grid3X3,
    path: "/xo",
    color: "from-red-900/60 to-orange-900/60",
    border: "border-red-700/40",
  },
  {
    id: "chess",
    icon: Crown,
    path: "/chess",
    color: "from-emerald-900/60 to-teal-900/60",
    border: "border-emerald-700/40",
  },
  {
    id: "ludo",
    icon: Dice5,
    path: "/ludo",
    color: "from-blue-900/60 to-indigo-900/60",
    border: "border-blue-700/40",
  },
] as const;

const Index = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();
  const { session, logout } = useAuth();
  const flag = getCountry(session?.country)?.flag ?? "";

  return (
    <div className="min-h-screen wood-texture flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-2 sm:inset-4 border-2 border-gold rounded-2xl pointer-events-none opacity-30" />
      <div className="absolute inset-3 sm:inset-6 border border-gold rounded-xl pointer-events-none opacity-15" />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2">
        {session ? (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary/80 hover:bg-secondary border border-gold/60 text-xs text-gold"
            title={t("home.logout")}
          >
            <span>{flag}</span>
            <span className="max-w-[6rem] truncate">{session.nickname}</span>
            <LogOut className="w-3 h-3 opacity-60" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary/80 hover:bg-secondary border border-gold/60 text-xs text-gold"
          >
            <LogIn className="w-3 h-3" />
            <span>{t("home.login")}</span>
          </button>
        )}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-3 rounded-full bg-secondary/80 hover:bg-secondary transition-colors border border-gold"
          aria-label={t("common.settings")}
        >
          <Settings className="w-5 h-5 text-gold" />
        </button>
      </div>

      <div className="text-center mb-6 sm:mb-10 animate-fade-in">
        <h1 className="text-3xl sm:text-5xl font-bold text-gold mb-2 tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
          {t("app.title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base" style={{ fontFamily: "'Amiri', serif" }}>
          {t("app.subtitle")}
        </p>
        <div className="w-32 sm:w-48 h-0.5 gold-gradient mx-auto mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl px-2">
        {gameDefs.map((game, i) => (
          <div
            key={game.id}
            className={`group relative rounded-xl border-2 ${game.border} bg-gradient-to-br ${game.color} p-5 sm:p-6 backdrop-blur-sm animate-fade-in flex flex-col`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute inset-0 rounded-xl border border-gold opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
            <button
              onClick={() => navigate(game.path)}
              className="flex flex-col items-center transition-transform hover:scale-105"
            >
              <game.icon className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 text-gold" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                {t(`games.${game.id}.title`)}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">{t(`games.${game.id}.subtitle`)}</p>
            </button>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => navigate(`/online/${game.id}`)}
                className="text-xs flex items-center justify-center gap-1 py-2 rounded-md bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold transition-colors"
              >
                <Globe className="w-3 h-3" /> {t("home.online")}
              </button>
              <button
                onClick={() => navigate(`/leaderboard/${game.id}`)}
                className="text-xs flex items-center justify-center gap-1 py-2 rounded-md bg-secondary/60 hover:bg-secondary border border-gold/30 text-foreground transition-colors"
              >
                <Trophy className="w-3 h-3" /> {t("home.ranking")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/tournaments")}
        className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-700 to-amber-900 border border-gold text-foreground font-bold hover:scale-105 transition-transform animate-fade-in"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        <Crown className="w-5 h-5 text-gold" />
        {t("home.viewTournaments")}
      </button>

      <p className="mt-6 sm:mt-8 text-muted-foreground text-xs opacity-50">
        {t("app.footer")}
      </p>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
