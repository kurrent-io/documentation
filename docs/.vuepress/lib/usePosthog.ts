import posthog from "posthog-js";
import { hasStatisticsConsent } from "./consent";

const POSTHOG_CONFIG = {
  apiKey: "phc_DeHBgHGersY4LmDlADnPrsCPOAmMO7QFOH8f4DVEVmD",
  apiHost: "https://phog.kurrent.io",
} as const;

let isInitialized = false;
let listenersRegistered = false;

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

  window.addEventListener("consent_status", () => {
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
