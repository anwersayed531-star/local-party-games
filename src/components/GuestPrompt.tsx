import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useGuest } from "@/hooks/useGuest";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReady: (guestId: string, nickname: string) => void;
}

export default function GuestPrompt({ open, onOpenChange, onReady }: Props) {
  const { t } = useTranslation();
  const { guest, createOrUpdateGuest, loading } = useGuest();
  const [name, setName] = useState(guest?.nickname ?? "");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error(t("online.nicknameTooShort"));
      return;
    }
    const g = await createOrUpdateGuest(trimmed);
    if (g) {
      onReady(g.id, g.nickname);
      onOpenChange(false);
    } else {
      toast.error(t("online.nicknameError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gold bg-card">
        <DialogHeader>
          <DialogTitle className="text-gold" style={{ fontFamily: "'Cinzel', serif" }}>
            {t("online.chooseNickname")}
          </DialogTitle>
          <DialogDescription>{t("online.chooseNicknameDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("online.nicknamePlaceholder")}
            maxLength={24}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-amber-700 to-amber-900 text-foreground border border-gold">
            {loading ? "..." : t("online.continue")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
