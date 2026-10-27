import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip, Pill } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card, Divider } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getPlan, MEMBERSHIP_PLANS, type MembershipTierId } from '@/features/membership/plans';
import { formatMoney } from '@/lib/format';
import { openExternal } from '@/lib/links';
import { SITE } from '@/lib/site';
import { useTheme } from '@/theme';

export default function MembershipScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const membership = useAuthStore((state) => state.membership);
  const setMembership = useAuthStore((state) => state.setMembership);
  const clearMembership = useAuthStore((state) => state.clearMembership);

  const current = getPlan(membership.tier);

  const unlockPreview = (tier: MembershipTierId) => {
    Alert.alert(
      'Preview-only unlock',
      'This simulates the tier so you can test member features. It does not charge anything and is not a real membership. Production entitlements must come from the website checkout or App Store / Play Store billing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock for preview',
          onPress: () => {
            setMembership(tier, 'preview-unlock');
            toast.show(`Preview unlocked: ${getPlan(tier).name}`, 'success');
          },
        },
      ]
    );
  };

  return (
    <Screen back title="Membership" eyebrow="Join the Hoser Gang" bottomInset={40}>
      <Card tone="accent" style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="ribbon" size={18} color={theme.colors.accent} />
          <AppText variant="smallMedium" style={{ flex: 1 }}>
            Current plan: {current.name}
          </AppText>
          <Pill text={membership.status === 'preview' ? 'Preview' : membership.status === 'verified' ? 'Verified' : 'Free'} tone="accent" />
        </View>
        <AppText variant="small" color="textMuted">
          Memberships support the run directly. Free streaming always stays free — the paid tiers add
          unreleased music, downloads and member perks.
        </AppText>
        <Button
          label="Manage on overgrowthrenaissance.com"
          size="sm"
          icon="open-outline"
          onPress={() => void openExternal(SITE.membership)}
        />
        {membership.status === 'preview' ? (
          <Button
            label="Reset preview entitlement"
            size="sm"
            variant="ghost"
            onPress={() => {
              clearMembership();
              toast.show('Back to the free plan', 'default');
            }}
          />
        ) : null}
      </Card>

      {MEMBERSHIP_PLANS.map((plan) => {
        const active = plan.id === membership.tier;
        return (
          <Card key={plan.id} style={{ gap: 10, borderColor: active ? theme.colors.accent : theme.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="subheading">{plan.name}</AppText>
                  {plan.highlight ? <Chip label="Most popular" size="sm" tone="gold" /> : null}
                  {active ? <Chip label="Current" size="sm" tone="success" /> : null}
                </View>
                <AppText variant="small" color="textMuted">
                  {plan.tagline}
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="heading" color="accent">
                  {plan.priceCents === 0 ? 'Free' : formatMoney(plan.priceCents)}
                </AppText>
                <AppText variant="label" color="textFaint">
                  {plan.priceCents === 0 ? 'FOREVER' : 'CAD / MONTH'}
                </AppText>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              {plan.perks.map((perk) => (
                <View key={perk.label} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Ionicons
                    name={perk.status === 'confirmed' ? 'checkmark-circle' : 'time-outline'}
                    size={15}
                    color={perk.status === 'confirmed' ? theme.colors.success : theme.colors.gold}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText variant="small" color={perk.status === 'confirmed' ? 'textMuted' : 'textFaint'}>
                      {perk.label}
                    </AppText>
                    {perk.status === 'planned' ? (
                      <AppText variant="label" color="textFaint">
                        COMING SOON{perk.detail ? ` · ${perk.detail}` : ''}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>

            <Divider />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Button
                label={plan.id === 'free' ? 'Stay on free' : 'Join on the website'}
                size="sm"
                variant={plan.highlight ? 'primary' : 'secondary'}
                onPress={() => void openExternal(plan.checkoutUrl)}
              />
              {!active && plan.id !== 'free' ? (
                <Button
                  label="Preview unlock"
                  size="sm"
                  variant="ghost"
                  onPress={() => unlockPreview(plan.id)}
                />
              ) : null}
            </View>
          </Card>
        );
      })}

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="card-outline" size={15} color={theme.colors.accent} />
          <AppText variant="smallMedium">Billing & cancellation</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Plans are billed monthly in CAD by the artist’s website checkout, which also handles
          cancellation and receipts. Cancel any time from your account there — access continues to the
          end of the paid period. In-app purchases are not enabled in this build: Apple and Google
          require digital memberships to be sold through their billing systems, so a production iOS or
          Android release needs StoreKit / Play Billing (or an approved external-purchase entitlement)
          wired to the same entitlement service.
        </AppText>
        <Button label="Open your account" size="sm" variant="ghost" onPress={() => void openExternal(SITE.account)} />
      </Card>

      <Card tone="alt" style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="information-circle-outline" size={15} color={theme.colors.gold} />
          <AppText variant="smallMedium">Benefits marked “coming soon”</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Remix suggestions, member polls, early access, exclusive merch offers and member-only rooms
          are on the roadmap. They are shown as planned — not sold — until the artist confirms they can
          deliver them.
        </AppText>
        <Button label="See what is live now" size="sm" variant="ghost" onPress={() => router.push('/community')} />
      </Card>
    </Screen>
  );
}
