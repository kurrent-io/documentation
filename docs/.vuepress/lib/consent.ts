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

/**
 * Checks if the user has given consent for statistics cookies.
 * This is used for analytics tools like PostHog and Reo.dev.
 */
export function hasStatisticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.Cookiebot?.consent?.statistics === true;
}
