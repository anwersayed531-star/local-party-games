// Lightweight, client-only "account" system.
// Stores accounts entirely in localStorage. NOT secure — for a casual games app
// where the user explicitly opted out of email verification.
// Backed by the same `guests` row used by useGuest, so ELO and matches keep working.

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;
const ACCOUNTS_KEY = "game-hub-accounts";   // map: identifier → record
const SESSION_KEY = "game-hub-session";     // current logged-in identifier
const GUEST_KEY = "game-hub-guest";         // shared with useGuest

interface AccountRecord {
  identifier: string;        // name or email (lowercased trimmed)
  passwordHash: string;      // sha-256 hex
  nickname: string;          // display name (without flag prefix)
  country: string;           // ISO code
  guestId: string;           // links to guests.id row
  createdAt: string;
}

export interface AuthSession {
  identifier: string;
  nickname: string;
  country: string;
  guestId: string;
}

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadAll(): Record<string, AccountRecord> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, AccountRecord>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
}

function loadSession(): AuthSession | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const all = loadAll();
    const acc = all[id];
    if (!acc) return null;
    return {
      identifier: acc.identifier,
      nickname: acc.nickname,
      country: acc.country,
      guestId: acc.guestId,
    };
  } catch {
    return null;
  }
}

// Build the nickname stored in the DB & shown to others: "🇪🇬 Mohamed"
function flaggedNickname(nickname: string, flag: string): string {
  return `${flag} ${nickname}`.slice(0, 24);
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [busy, setBusy] = useState(false);

  // When we get a session, also write the guest cache so useGuest picks it up.
  useEffect(() => {
    if (!session) return;
    // We don't have the flag here; useGuest only needs id+nickname. Use the
    // already-flagged nickname from DB on next refresh; for now just keep id + display name.
    const cached = { id: session.guestId, nickname: session.nickname };
    localStorage.setItem(GUEST_KEY, JSON.stringify(cached));
  }, [session]);

  const signup = useCallback(async (
    identifier: string,
    password: string,
    nickname: string,
    country: string,
    flag: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    setBusy(true);
    try {
      const id = identifier.trim().toLowerCase();
      const nick = nickname.trim();
      if (id.length < 2) return { ok: false, error: "shortIdentifier" };
      if (password.length < 4) return { ok: false, error: "shortPassword" };
      if (nick.length < 2) return { ok: false, error: "shortNickname" };
      if (!country) return { ok: false, error: "noCountry" };

      const all = loadAll();
      if (all[id]) return { ok: false, error: "exists" };

      // Create a guest row so this user has a real ELO identity on the server.
      const dbNickname = flaggedNickname(nick, flag);
      const { data: g, error } = await sb
        .from("guests")
        .insert({ nickname: dbNickname })
        .select()
        .single();
      if (error || !g) return { ok: false, error: "server" };

      const rec: AccountRecord = {
        identifier: id,
        passwordHash: await sha256(password),
        nickname: nick,
        country,
        guestId: g.id,
        createdAt: new Date().toISOString(),
      };
      all[id] = rec;
      saveAll(all);
      localStorage.setItem(SESSION_KEY, id);
      localStorage.setItem(GUEST_KEY, JSON.stringify({ id: g.id, nickname: dbNickname }));
      setSession({ identifier: id, nickname: nick, country, guestId: g.id });
      return { ok: true };
    } finally {
      setBusy(false);
    }
  }, []);

  const login = useCallback(async (
    identifier: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    setBusy(true);
    try {
      const id = identifier.trim().toLowerCase();
      const all = loadAll();
      const acc = all[id];
      if (!acc) return { ok: false, error: "notFound" };
      const hash = await sha256(password);
      if (hash !== acc.passwordHash) return { ok: false, error: "badPassword" };

      localStorage.setItem(SESSION_KEY, id);
      // Refresh nickname in guests row in case it changed locally
      sb.from("guests")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", acc.guestId)
        .then(() => {});
      setSession({
        identifier: acc.identifier,
        nickname: acc.nickname,
        country: acc.country,
        guestId: acc.guestId,
      });
      return { ok: true };
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(GUEST_KEY);
    setSession(null);
  }, []);

  return { session, busy, signup, login, logout };
}
