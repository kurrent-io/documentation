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
      if (state === "ALL_ACCEPTED" || state === "SOME_ACCEPTED") return true;
    }
    return false;
  } catch {
    return false;
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
      updateConsentCache();
    });
  });

  // When user returns to tab (e.g. after closing banner), refresh consent cache
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if ((window as Window & { __ucCmp?: unknown }).__ucCmp) {
      void readStatisticsConsentFromLoader().then((v) => {
        cachedStatisticsConsent = v;
      }).catch(() => updateConsentCache());
    } else {
      updateConsentCache();
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
  if (!ucInstance || typeof window === "undefined") return false;
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
  if (!ucInstance || typeof window === "undefined") return false;
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
