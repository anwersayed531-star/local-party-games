import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const GUEST_KEY = "game-hub-guest";

export interface Guest {
  id: string;
  nickname: string;
}

function loadStored(): Guest | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useGuest() {
  const [guest, setGuest] = useState<Guest | null>(() => loadStored());
  const [loading, setLoading] = useState(false);

  // Touch last_seen on mount if we already have a guest
  useEffect(() => {
    if (guest) {
      supabase.from("guests").update({ last_seen: new Date().toISOString() }).eq("id", guest.id).then(() => {});
    }
  }, []); // eslint-disable-line

  const createOrUpdateGuest = async (nickname: string): Promise<Guest | null> => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 24) return null;
    setLoading(true);
    try {
      if (guest) {
        const { data, error } = await supabase
          .from("guests")
          .update({ nickname: trimmed, last_seen: new Date().toISOString() })
          .eq("id", guest.id)
          .select()
          .maybeSingle();
        if (error || !data) {
          // record may have been removed; create new
          const { data: created } = await supabase
            .from("guests")
            .insert({ nickname: trimmed })
            .select()
            .single();
          if (created) {
            const g = { id: created.id, nickname: created.nickname };
            localStorage.setItem(GUEST_KEY, JSON.stringify(g));
            setGuest(g);
            return g;
          }
          return null;
        }
        const g = { id: data.id, nickname: data.nickname };
        localStorage.setItem(GUEST_KEY, JSON.stringify(g));
        setGuest(g);
        return g;
      } else {
        const { data, error } = await supabase
          .from("guests")
          .insert({ nickname: trimmed })
          .select()
          .single();
        if (error || !data) return null;
        const g = { id: data.id, nickname: data.nickname };
        localStorage.setItem(GUEST_KEY, JSON.stringify(g));
        setGuest(g);
        return g;
      }
    } finally {
      setLoading(false);
    }
  };

  return { guest, loading, createOrUpdateGuest };
}
