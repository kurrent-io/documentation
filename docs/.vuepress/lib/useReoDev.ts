import { loadReoScript } from "reodotdev";

declare const __REODEV_CLIENT_ID__: string;

let listenersRegistered = false;
let isInitialized = false;
let reoInstance: any | null = null;
let reoPromise: Promise<any> | null = null;

declare global {
  interface Window {
    Reo?: unknown;
  }
}

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.Cookiebot?.consent?.marketing === true;
}

function stopReoDev(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  isInitialized = false;
  reoInstance = null;
  reoPromise = null;

  // Clear LocalStorage (if any – guesswork)
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.toLowerCase().includes("reo")) localStorage.removeItem(key);
    });
  } catch (_error) {}

  // Clear cookies containing 'reo' (if any – guesswork)
  try {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      if (name.toLowerCase().includes("reo")) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }
  } catch (_error) {}

  const Reo: any = (window.Reo ?? reoInstance) as any;
  try {
    Reo?.unload?.();
    Reo?.reset?.();
    Reo?.deleteCookieReo?.();
    Reo?.deleteCookie?.();
  } catch (error) {
    console.error("Error stopping Reo: ", error);
  }

  window.Reo = undefined;
}

async function initializeReoDev(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;
  if (isInitialized || reoInstance || reoPromise) return;

  const clientID = __REODEV_CLIENT_ID__  || "f1c2b9fbebbf202";

  try {
    reoPromise = loadReoScript({ clientID });
    const Reo = await reoPromise;
    reoInstance = Reo;
    Reo.init({ clientID });
    isInitialized = true;
  } catch (error) {
    console.error("Error loading Reo", error);
    reoInstance = null;
  } finally {
    reoPromise = null;
  }
}

function applyConsentState(): void {
  if (hasMarketingConsent()) void initializeReoDev();
  else stopReoDev();
}

function setupConsentListeners(): void {
  if (typeof window === "undefined") return;
  if (listenersRegistered) return;
  listenersRegistered = true;

  window.addEventListener("CookiebotOnAccept", applyConsentState);
  window.addEventListener("CookiebotOnDecline", applyConsentState);
  window.addEventListener("CookiebotOnConsentReady", applyConsentState);
}

export function useReoDev() {
  if (typeof window !== "undefined") {
    setupConsentListeners();
    applyConsentState();
  }

  return {
    hasConsent: hasMarketingConsent,
    init: initializeReoDev,
  };
}
