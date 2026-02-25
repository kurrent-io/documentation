// Usercentrics Browser UI API (getServices was removed; use getServicesBaseInfo)
// https://usercentrics.com/docs/web/features/v2/browser_ui_api/browser_ui_api/#getservices

declare global {
  interface Window {
    UC_UI?: {
      getServicesBaseInfo?: () => Promise<Array<{
        id: string;
        categorySlug: string;
        consent: { status: boolean };
      }>>;
      isInitialized?: () => boolean;
    };
  }
}

async function hasConsentForCategory(categorySlug: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const ui = window.UC_UI;
  
  if (!ui?.getServicesBaseInfo) {
    return false;
  }

  try {
    const services = await ui.getServicesBaseInfo();
    
    if (!Array.isArray(services)) return false;
    
    return services.some(
      (s) => s.categorySlug.toLowerCase() === categorySlug.toLowerCase() && s.consent?.status === true
    );
  } catch (e) {
    console.error("[Consent] Error checking consent:", e);
    return false;
  }
}

/** PostHog uses the functional category in Usercentrics. */
export function hasFunctionalConsent(): Promise<boolean> {
  return hasConsentForCategory("functional");
}

/** Reo.dev uses the marketing category in Usercentrics. */
export function hasMarketingConsent(): Promise<boolean> {
  return hasConsentForCategory("marketing");
}
