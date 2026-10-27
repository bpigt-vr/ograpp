/**
 * Membership tiers mirror the live Wix pricing plans on
 * overgrowthrenaissance.com/pricing-plans/jointhehosergang (CAD, monthly).
 *
 * `status` is deliberately explicit: "confirmed" perks come straight from the
 * artist's website, "planned" perks are part of the roadmap and are never sold
 * as available until the artist confirms them.
 */
export type MembershipTierId = 'free' | 'top1' | 'top01';

export type PerkStatus = 'confirmed' | 'planned';

export type MembershipPerk = {
  label: string;
  status: PerkStatus;
  detail?: string;
};

export type MembershipPlan = {
  id: MembershipTierId;
  name: string;
  shortName: string;
  priceCents: number;
  currency: 'CAD';
  interval: 'month';
  tagline: string;
  perks: MembershipPerk[];
  checkoutUrl: string;
  highlight?: boolean;
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Casual Listener',
    shortName: 'Free',
    priceCents: 0,
    currency: 'CAD',
    interval: 'month',
    tagline: 'Everything you need to follow the journey.',
    perks: [
      { label: 'Unlimited free streaming', status: 'confirmed' },
      { label: 'Exclusive content access', status: 'confirmed' },
      { label: 'Daily journal, rewards and community', status: 'confirmed' },
    ],
    checkoutUrl: 'https://www.overgrowthrenaissance.com/pricing-plans/jointhehosergang',
  },
  {
    id: 'top1',
    name: 'Top 1% Listener',
    shortName: 'Top 1%',
    priceCents: 499,
    currency: 'CAD',
    interval: 'month',
    tagline: 'Fans who value the art and want the unreleased catalog.',
    highlight: true,
    perks: [
      { label: 'Stream unreleased music', status: 'confirmed' },
      { label: 'Unlimited free streaming', status: 'confirmed' },
      { label: 'Exclusive content access', status: 'confirmed' },
      {
        label: 'Suggest songs for future remixes',
        status: 'planned',
        detail: 'Submissions open once the artist confirms the remix pipeline.',
      },
      {
        label: 'Vote in member polls',
        status: 'planned',
        detail: 'Polls are seeded now; member-weighted voting ships with the release calendar.',
      },
    ],
    checkoutUrl: 'https://www.overgrowthrenaissance.com/pricing-plans/jointhehosergang',
  },
  {
    id: 'top01',
    name: 'Top 0.1% Listener',
    shortName: 'Top 0.1%',
    priceCents: 1499,
    currency: 'CAD',
    interval: 'month',
    tagline: 'Superfans who want to change the trajectory of this run.',
    perks: [
      { label: 'Download all music for free', status: 'confirmed' },
      { label: 'Personal thank-you video on sign up', status: 'confirmed' },
      { label: 'Stream unreleased music', status: 'confirmed' },
      { label: 'Unlimited free streaming', status: 'confirmed' },
      {
        label: 'Early access to drops',
        status: 'planned',
        detail: 'Requires the release calendar from the artist.',
      },
      {
        label: 'Exclusive merch offers',
        status: 'planned',
        detail: 'Depends on live merch inventory in the Wix store.',
      },
      {
        label: 'Members-only discussions',
        status: 'planned',
        detail: 'Moderated member rooms, launching after community guidelines review.',
      },
    ],
    checkoutUrl: 'https://www.overgrowthrenaissance.com/pricing-plans/jointhehosergang',
  },
];

export const TIER_ORDER: Record<MembershipTierId, number> = {
  free: 0,
  top1: 1,
  top01: 2,
};

export function getPlan(id: MembershipTierId): MembershipPlan {
  return MEMBERSHIP_PLANS.find((plan) => plan.id === id) ?? MEMBERSHIP_PLANS[0];
}

export function tierAtLeast(current: MembershipTierId, required: MembershipTierId): boolean {
  return TIER_ORDER[current] >= TIER_ORDER[required];
}

export function nextTier(current: MembershipTierId): MembershipTierId | null {
  if (current === 'free') return 'top1';
  if (current === 'top1') return 'top01';
  return null;
}
