import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, LogIn, UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import CountrySelect from "@/components/CountrySelect";
import { useAuth } from "@/hooks/useAuth";
import { getCountry } from "@/lib/countries";
import { toast } from "sonner";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, login, busy } = useAuth();

  // Login fields
  const [loginId, setLoginId] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // Signup fields
  const [suId, setSuId] = useState("");
  const [suPwd, setSuPwd] = useState("");
  const [suNick, setSuNick] = useState("");
  const [suCountry, setSuCountry] = useState("EG");

  const errToast = (key: string) => toast.error(t(`auth.errors.${key}`));

  const onLogin = async () => {
    const r = await login(loginId, loginPwd);
    if (!r.ok) return errToast(r.error || "server");
    toast.success(t("auth.welcome", { name: loginId }));
    navigate("/");
  };

  const onSignup = async () => {
    const flag = getCountry(suCountry)?.flag ?? "🏳️";
    const r = await signup(suId, suPwd, suNick, suCountry, flag);
    if (!r.ok) return errToast(r.error || "server");
    toast.success(t("auth.accountCreated"));
    navigate("/");
  };

  return (
    <div className="min-h-screen wood-texture flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gold mb-4 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <span>{t("common.back")}</span>
        </button>

        <Card className="p-6 bg-card border-gold/40">
          <h1 className="text-2xl font-bold text-gold mb-1 text-center" style={{ fontFamily: "'Cinzel', serif" }}>
            {t("auth.title")}
          </h1>
          <p className="text-xs text-center text-muted-foreground mb-5">{t("auth.subtitle")}</p>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">
                <LogIn className="w-4 h-4 me-2" />
                {t("auth.login")}
              </TabsTrigger>
              <TabsTrigger value="signup">
                <UserPlus className="w-4 h-4 me-2" />
                {t("auth.signup")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-3">
              <div>
                <Label className="text-xs">{t("auth.identifier")}</Label>
                <Input value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder={t("auth.identifierPlaceholder")} />
              </div>
              <div>
                <Label className="text-xs">{t("auth.password")}</Label>
                <Input type="password" value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
              </div>
              <Button onClick={onLogin} disabled={busy} className="w-full bg-gold/90 text-background hover:bg-gold">
                {t("auth.login")}
              </Button>
              <button
                type="button"
                onClick={() => toast.info(t("auth.forgotHint"))}
                className="w-full text-xs text-muted-foreground hover:text-gold flex items-center justify-center gap-1 pt-1"
              >
                <KeyRound className="w-3 h-3" /> {t("auth.forgot")}
              </button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3">
              <div>
                <Label className="text-xs">{t("auth.identifier")}</Label>
                <Input value={suId} onChange={(e) => setSuId(e.target.value)} placeholder={t("auth.identifierPlaceholder")} />
              </div>
              <div>
                <Label className="text-xs">{t("auth.password")}</Label>
                <Input type="password" value={suPwd} onChange={(e) => setSuPwd(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{t("auth.nickname")}</Label>
                <Input value={suNick} onChange={(e) => setSuNick(e.target.value)} placeholder={t("auth.nicknamePlaceholder")} maxLength={20} />
              </div>
              <div>
                <Label className="text-xs">{t("auth.country")}</Label>
                <CountrySelect value={suCountry} onChange={setSuCountry} />
              </div>
              <Button onClick={onSignup} disabled={busy} className="w-full bg-gold/90 text-background hover:bg-gold">
                {t("auth.signup")}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-5 pt-4 border-t border-border text-center">
            <button
              onClick={() => navigate("/")}
              className="text-xs text-muted-foreground hover:text-gold"
            >
              {t("auth.continueAsGuest")} →
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
