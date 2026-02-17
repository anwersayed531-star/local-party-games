import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LudoGame = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen wood-texture flex flex-col items-center justify-center p-4">
      <button onClick={() => navigate("/")} className="absolute top-4 left-4 p-2 rounded-full bg-secondary/80 hover:bg-secondary border border-gold">
        <ArrowLeft className="w-5 h-5 text-gold" />
      </button>
      <h1 className="text-3xl font-bold text-gold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>🎲 لودو</h1>
      <p className="text-muted-foreground">قريباً...</p>
    </div>
  );
};

export default LudoGame;
