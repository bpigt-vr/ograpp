/**
 * The Overgrowth Renaissance website is a Wix site.
 *
 * - Music lives in a Wix Music player that Wix only serves through an iframe
 *   (`tpa.wixapps.net`). There is no public stream URL, so the native player
 *   runs on a licensed/authorized catalog (see docs/INTEGRATIONS.md) and the
 *   official player is available in a WebView as a no-license-change fallback.
 * - Merch is a Wix Stores catalogue. Native product data requires a Wix
 *   Storefront API key/proxy; until that is configured the app browses the live
 *   store in a WebView and hands checkout to the site.
 * - Memberships are Wix Pricing Plans, priced in CAD.
 */
export const SITE = {
  origin: 'https://www.overgrowthrenaissance.com',
  music: 'https://www.overgrowthrenaissance.com/music',
  exclusiveMusic: 'https://www.overgrowthrenaissance.com/exclusive-music-streaming',
  merch: 'https://www.overgrowthrenaissance.com/merch',
  beats: 'https://www.overgrowthrenaissance.com/shopogrbeats',
  membership: 'https://www.overgrowthrenaissance.com/pricing-plans/jointhehosergang',
  account: 'https://www.overgrowthrenaissance.com/account/my-account',
  donate: 'https://www.overgrowthrenaissance.com/donate',
  contact: 'https://www.overgrowthrenaissance.com/contact',
  subscribe: 'https://www.overgrowthrenaissance.com/subscribe',
  social: 'https://www.overgrowthrenaissance.com/socialmedia',
} as const;

export const CONTACT_EMAIL = 'overgrowthrenaissance@gmail.com';

export const BRAND_TAGLINE = 'Be the greatest you can be.';

export const ARTIST_NAME = 'OGR-Scintilla';
