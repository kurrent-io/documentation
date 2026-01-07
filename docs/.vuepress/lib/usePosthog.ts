import posthog from "posthog-js";

const POSTHOG_CONFIG = {
  apiKey: "phc_DeHBgHGersY4LmDlADnPrsCPOAmMO7QFOH8f4DVEVmD",
  apiHost: "https://phog.kurrent.io",
} as const;

let isInitialized = false;
let listenersRegistered = false;

function hasStatisticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.Cookiebot?.consent?.statistics === true;
}

function initializePostHog(): void {
  if (isInitialized) return;
  try {
    posthog.init(POSTHOG_CONFIG.apiKey, {
      api_host: POSTHOG_CONFIG.apiHost,
      persistence: "localStorage+cookie",
      capture_pageview: false,
    });
    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize PostHog:", error);
  }
}

function stopTracking(): void {
  if (!isInitialized) return;
  try {
    posthog.opt_out_capturing();
  } catch (error) {
    console.error("Failed to stop PostHog tracking:", error);
  }
}

function resumeTracking(): void {
  if (!isInitialized) {
    initializePostHog();
  }
  try {
    posthog.opt_in_capturing();
  } catch (error) {
    console.error("Failed to resume PostHog tracking:", error);
  }
}

function setupConsentListeners(): void {
  if (typeof window === "undefined") return;
  if (listenersRegistered) return;
  listenersRegistered = true;

  window.addEventListener("CookiebotOnAccept", () => {
    if (hasStatisticsConsent()) {
      resumeTracking();
    } else {
      stopTracking();
    }
  });

  window.addEventListener("CookiebotOnDecline", () => {
    stopTracking();
  });

  window.addEventListener("CookiebotOnConsentReady", () => {
    if (hasStatisticsConsent()) {
      resumeTracking();
    } else {
      stopTracking();
    }
  });
}

export function usePostHog() {
  if (typeof window !== "undefined") {
    setupConsentListeners();
    if (hasStatisticsConsent()) {
      initializePostHog();
    }
  }

  return {
    posthog,
    hasConsent: hasStatisticsConsent,
  };
}

// Type declarations for Cookiebot
declare global {
  interface Window {
    Cookiebot?: {
      consent?: {
        necessary?: boolean;
        preferences?: boolean;
        statistics?: boolean;
        marketing?: boolean;
      };
      renew?: () => void;
      withdraw?: () => void;
    };
  }
}
