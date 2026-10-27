/**
 * Moderator passphrase configuration.
 *
 * The client only ever stores a PBKDF2 hash (see `useCommunityStore`), never the
 * literal string. Set EXPO_PUBLIC_MODERATION_PASSWORD in your build environment
 * to provision a different first-run passphrase.
 *
 * A client-side gate is a convenience lock for a shared device, not a security
 * boundary: production moderation must also be enforced by a server that checks
 * a moderator role. See docs/INTEGRATIONS.md.
 */
export const DEFAULT_MODERATION_PASSPHRASE =
  process.env.EXPO_PUBLIC_MODERATION_PASSWORD ?? 'Nekkcity1';

export const MODERATION_SESSION_MINUTES = 30;
