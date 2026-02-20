const USERCENTRICS_SETTINGS_ID = "ArWRikBAz-iKhj";

/** Slugs/names used in Usercentrics for the statistics/analytics category */
const STATISTICS_CATEGORY_NAMES = ["statistics", "statistic", "analytics"];

function isStatisticsCategory(slugOrName: string): boolean {
  const lower = slugOrName?.toLowerCase() ?? "";
  return STATISTICS_CATEGORY_NAMES.some((n) => lower.includes(n));
}

/** SDK instance; only set in browser after dynamic import to avoid SSR "location is not defined" */
let ucInstance: { getCategoriesBaseInfo: () => Array<{ slug?: string; name?: string; label?: string; services?: Array<{ consent?: { status?: boolean } }> }> } | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initializes the Usercentrics SDK in read-only mode (suppressCmpDisplay: true).
 * SDK is imported dynamically so it never runs in Node (VuePress SSR).
 */
function ensureUC(): Promise<typeof ucInstance> {
  if (ucInstance) return Promise.resolve(ucInstance);
  if (initPromise) return initPromise.then(() => ucInstance);

  initPromise = (async () => {
    if (typeof window === "undefined") return;
    const { default: Usercentrics } = await import(
      "@usercentrics/cmp-browser-sdk"
    );
    const UC = new Usercentrics(USERCENTRICS_SETTINGS_ID, {
      suppressCmpDisplay: true,
    });
    await UC.init();
    ucInstance = UC;
  })();

  return initPromise.then(() => ucInstance);
}

/** Cached result for sync getters; updated after init and on consent_status event */
let cachedStatisticsConsent = false;
/** When loader (__ucCmp) is present, we cache from getConsentDetails() so we stay in sync after user saves in banner */
let cachedFunctionalConsent = false;
let cachedMarketingConsent = false;
/** If true, hasFunctionalConsent/hasMarketingConsent use loader cache; else use SDK */
let loaderCacheValid = false;

/**
 * Reads statistics consent from the SDK (getCategoriesBaseInfo).
 * Category is identified by slug (statistics, statistic, analytics).
 */
function readStatisticsConsentFromSDK(): boolean {
  if (!ucInstance || typeof window === "undefined") return false;
  try {
    const categories = ucInstance.getCategoriesBaseInfo();
    const statisticsCategory = categories.find((cat) =>
      isStatisticsCategory(cat.slug ?? (cat as { label?: string }).label ?? "")
    );
    if (!statisticsCategory) return false;
    return (
      statisticsCategory.services?.some((s) => s.consent?.status === true) ??
      false
    );
  } catch {
    return false;
  }
}

/**
 * Reads statistics consent from the loader API (window.__ucCmp.getConsentDetails).
 * Use when the loader is present so we get live updates when user saves.
 */
function categoryAccepted(state: string): boolean {
  return state === "ALL_ACCEPTED" || state === "SOME_ACCEPTED";
}

async function readStatisticsConsentFromLoader(): Promise<boolean> {
  const cmp = (window as Window & { __ucCmp?: { getConsentDetails: () => Promise<{ categories: Record<string, { name: string; state: string }> }> } }).__ucCmp;
  if (!cmp?.getConsentDetails) return false;
  try {
    const details = await cmp.getConsentDetails();
    const categories = details?.categories ?? {};
    for (const [key, cat] of Object.entries(categories)) {
      const name = (cat?.name ?? key).toLowerCase();
      if (!STATISTICS_CATEGORY_NAMES.some((n) => name.includes(n))) continue;
      const state = (cat as { state?: string })?.state ?? "";
      if (categoryAccepted(state)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** When loader is present, fetch all category states and cache them; then dispatch consent_status so PostHog/Reo re-check */
async function refreshFromLoaderAndDispatch(): Promise<void> {
  const cmp = (window as Window & { __ucCmp?: { getConsentDetails: () => Promise<{ categories: Record<string, { name: string; state: string }> }> } }).__ucCmp;
  if (!cmp?.getConsentDetails) return;
  try {
    const details = await cmp.getConsentDetails();
    const categories = details?.categories ?? {};
    for (const [key, cat] of Object.entries(categories)) {
      const name = (cat?.name ?? key).toLowerCase();
      const state = (cat as { state?: string })?.state ?? "";
      const accepted = categoryAccepted(state);
      if (STATISTICS_CATEGORY_NAMES.some((n) => name.includes(n))) cachedStatisticsConsent = accepted;
      if (name === "functional" || key === "functional") cachedFunctionalConsent = accepted;
      if (name === "marketing" || key === "marketing") cachedMarketingConsent = accepted;
    }
    loaderCacheValid = true;
    window.dispatchEvent(new CustomEvent("consent_status"));
  } catch {
    loaderCacheValid = false;
  }
}

function updateConsentCache(): void {
  cachedStatisticsConsent = readStatisticsConsentFromSDK();
}

/**
 * Call once when the app is ready (e.g. in client enhance) so consent is available.
 * Registers for consent_status and optionally refreshes from loader when available.
 */
export function initConsent(): void {
  if (typeof window === "undefined") return;

  ensureUC().then(() => {
    updateConsentCache();
    window.dispatchEvent(new CustomEvent("consent_status"));

    window.addEventListener("consent_status", () => {
      if (!loaderCacheValid) updateConsentCache();
    });

    // Loader may finish after our SDK; sync from loader and re-dispatch so PostHog/Reo start
    const tryLoaderSync = () => {
      if ((window as Window & { __ucCmp?: unknown }).__ucCmp) {
        void refreshFromLoaderAndDispatch();
      }
    };
    tryLoaderSync();
    setTimeout(tryLoaderSync, 2000);
  });

  // When user returns to tab (e.g. after closing banner), sync from loader and re-dispatch
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if ((window as Window & { __ucCmp?: unknown }).__ucCmp) {
      void refreshFromLoaderAndDispatch();
    } else {
      updateConsentCache();
      loaderCacheValid = false;
      window.dispatchEvent(new CustomEvent("consent_status"));
    }
  });
}

/**
 * Checks if the user has given consent for the statistics category.
 * Returns the cached value; ensure initConsent() has been called (e.g. from client enhance).
 */
export function hasStatisticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  if (ucInstance) {
    updateConsentCache();
  }
  return cachedStatisticsConsent;
}

/**
 * Returns whether the functional category has consent.
 * Used for PostHog (analytics).
 */
export function hasFunctionalConsent(): boolean {
  if (typeof window === "undefined") return false;
  if (loaderCacheValid) return cachedFunctionalConsent;
  if (!ucInstance) return false;
  try {
    const categories = ucInstance.getCategoriesBaseInfo();
    const functional = categories.find(
      (cat) => (cat.slug?.toLowerCase() ?? "") === "functional"
    );
    return functional?.services?.some((s) => s.consent?.status === true) ?? false;
  } catch {
    return false;
  }
}

/**
 * Returns whether the marketing category has consent.
 * Used for Reo.dev.
 */
export function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  if (loaderCacheValid) return cachedMarketingConsent;
  if (!ucInstance) return false;
  try {
    const categories = ucInstance.getCategoriesBaseInfo();
    const marketing = categories.find(
      (cat) => (cat.slug?.toLowerCase() ?? "") === "marketing"
    );
    return marketing?.services?.some((s) => s.consent?.status === true) ?? false;
  } catch {
    return false;
  }
}

/**
 * Returns whether the preferences category has consent (for optional future use).
 */
export function hasPreferencesConsent(): boolean {
  if (!ucInstance || typeof window === "undefined") return false;
  try {
    const categories = ucInstance.getCategoriesBaseInfo();
    const prefs = categories.find(
      (cat) => (cat.slug?.toLowerCase() ?? "") === "preferences"
    );
    return prefs?.services?.some((s) => s.consent?.status === true) ?? false;
  } catch {
    return false;
  }
}

/** Browser debug helper: in DevTools Console use window.__consentDebug */
const consentDebug = {
  /** Current consent flags (functional → PostHog, marketing → Reo.dev) */
  state: () => ({
    functional: hasFunctionalConsent(),
    marketing: hasMarketingConsent(),
    statistics: hasStatisticsConsent(),
    preferences: hasPreferencesConsent(),
  }),
  /** Raw categories from SDK (slug, services, consent status) */
  get categories() {
    return ucInstance?.getCategoriesBaseInfo() ?? null;
  },
  /** Re-run consent_status so PostHog/Reo re-check consent; when loader present, sync from it first */
  refresh: () => {
    if ((window as Window & { __ucCmp?: unknown }).__ucCmp) {
      void refreshFromLoaderAndDispatch();
    } else {
      updateConsentCache();
      loaderCacheValid = false;
      window.dispatchEvent(new CustomEvent("consent_status"));
    }
  },
  /** Usercentrics loader API (getConsentDetails, etc.) if present */
  get ucCmp() {
    return (window as Window & { __ucCmp?: unknown }).__ucCmp ?? null;
  },
};

if (typeof window !== "undefined") {
  (window as Window & { __consentDebug?: typeof consentDebug }).__consentDebug =
    consentDebug;
}
