import { loadReoScript } from "reodotdev";

let listenersRegistered = false;
let isInitialized = false;
let reoInstance: any | null = null;
let reoPromise: Promise<any> | null = null;

declare global {
  interface Window {
    Reo?: unknown;
  }
}

const CLIENT_ID = "f1c2b9fbebbf202";

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.Cookiebot?.consent?.marketing === true;
}

function stopReoDev(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Best-effort cleanup: remove any localStorage keys that look Reo-related.
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.toLowerCase().includes("reo")) localStorage.removeItem(key);
    });
  } catch (_error) {
    console.error("Error clearing LocalStorage");
  }

  // Best-effort cleanup: expire any cookies whose name contains "reo".
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
  } catch (_error) {
    console.error("Error resetting Reo cookies expiry");
  }

  const Reo: any = (window.Reo ?? reoInstance) as any;
  try {
    Reo?.unload?.();
    Reo?.reset?.();
    Reo?.deleteCookieReo?.();
    Reo?.deleteCookie?.();
  } catch (error) {
    console.error("Error stopping Reo");
  }

  document.querySelectorAll('script[src*="reo.dev"]').forEach(el => el.remove());

  isInitialized = false;
  reoInstance = null;
  reoPromise = null;
  window.Reo = undefined;
}

async function initializeReoDev(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;
  if (isInitialized || reoInstance || reoPromise || typeof window.Reo !== 'undefined') return;

  try {
    reoPromise = loadReoScript({ clientID: CLIENT_ID });
    reoInstance = await reoPromise;
    reoInstance.init({ clientID: CLIENT_ID });
    isInitialized = true;
  } catch (error) {
    console.error("Error loading Reo");
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
