// Lightweight, dependency-free tracking utility.
// - Captures UTM/referrer data on first visit so you know which ad or post brought the lead.
// - Exposes trackEvent() which forwards to Google Analytics / Meta Pixel if you add them (see index.html).
// - Attaches the captured attribution data to every contact-form submission automatically.

const STORAGE_KEY = 'weblsh_attribution';

function readStoredAttribution() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeStoredAttribution(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function makeClientId() {
  return 'c_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Call once on app load. Only stores the *first-touch* attribution, so a lead
// who browses for days before submitting is still credited to the ad/post
// that originally brought them in.
export function initAttribution() {
  const existing = readStoredAttribution();
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const attribution = {
    clientId: makeClientId(),
    firstVisit: new Date().toISOString(),
    landingPage: window.location.pathname,
    referrer: document.referrer || 'direct',
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content: params.get('utm_content') || null,
    utm_term: params.get('utm_term') || null,
  };
  writeStoredAttribution(attribution);
  return attribution;
}

export function getAttribution() {
  return readStoredAttribution() || initAttribution();
}

// Generic event tracker. Wire this up to GA4 (gtag) or Meta Pixel (fbq) —
// both are detected automatically if their snippets are present in index.html.
export function trackEvent(name, data = {}) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, data);
  }
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', name, data);
  }
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[track]', name, data);
  }
}

export function trackPageView(path) {
  trackEvent('page_view', { page_path: path });
}
