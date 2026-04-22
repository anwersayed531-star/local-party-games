/**
 * Unified Ads SDK adapter for Poki / CrazyGames / none.
 *
 * IMPORTANT: The real Poki/CrazyGames SDK script is provided by the platform
 * AFTER your game is accepted. Add the <script> tag to index.html where indicated.
 * Until then this module no-ops safely so the game runs locally.
 *
 * Poki test mode: append `?poki-test` to the URL to enable Poki's test SDK
 * (requires the Poki SDK script to be loaded).
 */

type Provider = "poki" | "crazygames" | "none";

declare global {
  interface Window {
    PokiSDK?: any;
    CrazyGames?: any;
  }
}

let provider: Provider = "none";
let initialized = false;
let initPromise: Promise<void> | null = null;
let lastBreakAt = 0;
const MIN_GAP_MS = 60_000; // no ads in first 60s + min 60s between breaks

function detectProvider(): Provider {
  if (typeof window === "undefined") return "none";
  if (window.PokiSDK) return "poki";
  if (window.CrazyGames?.SDK) return "crazygames";
  return "none";
}

export function initAds(): Promise<void> {
  if (initPromise) return initPromise;
  provider = detectProvider();
  lastBreakAt = Date.now(); // start the 60s grace from load

  initPromise = (async () => {
    try {
      if (provider === "poki" && window.PokiSDK) {
        await window.PokiSDK.init({
          debug: new URLSearchParams(location.search).has("poki-test"),
        });
        window.PokiSDK.gameLoadingFinished?.();
      } else if (provider === "crazygames" && window.CrazyGames?.SDK) {
        await window.CrazyGames.SDK.init();
      }
      initialized = true;
    } catch (e) {
      console.warn("[adsSDK] init failed", e);
      provider = "none";
    }
  })();
  return initPromise;
}

export function gameplayStart() {
  if (!initialized) return;
  try {
    if (provider === "poki") window.PokiSDK?.gameplayStart?.();
    if (provider === "crazygames") window.CrazyGames?.SDK?.game?.gameplayStart?.();
  } catch {}
}

export function gameplayStop() {
  if (!initialized) return;
  try {
    if (provider === "poki") window.PokiSDK?.gameplayStop?.();
    if (provider === "crazygames") window.CrazyGames?.SDK?.game?.gameplayStop?.();
  } catch {}
}

export async function showCommercialBreak(): Promise<void> {
  if (!initialized) return;
  const now = Date.now();
  if (now - lastBreakAt < MIN_GAP_MS) return;
  lastBreakAt = now;
  try {
    if (provider === "poki") {
      await window.PokiSDK?.commercialBreak?.();
    } else if (provider === "crazygames") {
      await window.CrazyGames?.SDK?.ad?.requestAd?.("midgame");
    }
  } catch (e) {
    console.warn("[adsSDK] commercialBreak failed", e);
  }
}

export async function showRewardedAd(): Promise<boolean> {
  if (!initialized) return false;
  try {
    if (provider === "poki") {
      await window.PokiSDK?.rewardedBreak?.();
      return true;
    } else if (provider === "crazygames") {
      await window.CrazyGames?.SDK?.ad?.requestAd?.("rewarded");
      return true;
    }
  } catch (e) {
    console.warn("[adsSDK] rewarded failed", e);
  }
  return false;
}

export function getProvider(): Provider {
  return provider;
}
