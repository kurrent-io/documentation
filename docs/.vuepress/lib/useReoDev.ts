import { loadReoScript } from "reodotdev";
import { hasMarketingConsent } from "./consent";

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

function stopReoDev(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    const reoPrefix = "__sec__"; 
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(reoPrefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (_error) {
    console.error("Error clearing Reo LocalStorage");
  }

  try {
    const cookies = document.cookie.split(";");
    const expiry = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    const domainParts = window.location.hostname.split('.');
    const mainDomain = domainParts.length > 2 ? `.${domainParts.slice(-2).join('.')}` : '';

    for (let i = 0; i < cookies.length; i++) {
      const name = cookies[i].split("=")[0].trim();
      
      if (name.startsWith("__sec__")) {
        document.cookie = `${name}=;${expiry};path=/;`;
        if (mainDomain) {
          document.cookie = `${name}=;${expiry};path=/;domain=${mainDomain};`;
        }
      }
    }
  } catch (_error) {
    console.error("Error resetting Reo cookies");
  }

  const Reo: any = (window.Reo ?? reoInstance) as any;
  try {
    Reo?.unload?.();
    Reo?.reset?.();
  } catch (error) {
    console.error("Error stopping Reo instance");
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

  window.addEventListener("consent_status", applyConsentState);
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
