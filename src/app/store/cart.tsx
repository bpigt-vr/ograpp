import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Artwork } from '@/components/Artwork';
import { Button } from '@/components/Button';
import { Chip, ProgressBar } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card, Divider } from '@/components/Surfaces';
import { EmptyState } from '@/components/States';
import { useCartStore } from '@/features/store/useCartStore';
import { cartTotals } from '@/features/store/cart';
import { formatMoney } from '@/lib/format';
import { openExternal } from '@/lib/links';
import { SITE } from '@/lib/site';
import { useTheme } from '@/theme';

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const totals = cartTotals(lines);

  if (lines.length === 0) {
    return (
      <Screen back title="Cart" bottomInset={40}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Add something from the store, or browse the official shop for live inventory and secure checkout."
          actionLabel="Browse the store"
          onAction={() => router.replace('/store')}
          secondaryLabel="Official merch store"
          onSecondary={() => void openExternal(SITE.merch)}
        />
      </Screen>
    );
  }

  const checkout = () => {
    Alert.alert(
      'Checkout happens on the official store',
      'Payments, taxes, shipping rates and inventory are handled securely by overgrowthrenaissance.com. The app never touches your card details. Keep this cart handy and complete the order on the website.',
      [
        { text: 'Keep browsing', style: 'cancel' },
        { text: 'Open official store', onPress: () => void openExternal(SITE.merch) },
      ]
    );
  };

  return (
    <Screen back title="Cart" eyebrow={`${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`} bottomInset={40}>
      <View style={{ gap: 10 }}>
        {lines.map((line) => (
          <Card key={line.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Artwork gradient={line.gradient} size={64} radius={12} showMark={false} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="bodyMedium" numberOfLines={1}>
                  {line.name}
                </AppText>
                <AppText variant="small" color="textFaint">
                  {[line.size, line.color].filter(Boolean).join(' · ') || 'One size'}
                </AppText>
                <AppText variant="smallMedium" color="accent">
                  {formatMoney(line.priceCents * line.quantity)}
                </AppText>
              </View>
              <Pressable
                onPress={() => remove(line.id)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${line.name}`}
                hitSlop={8}
              >
                <Ionicons name="close" size={18} color={theme.colors.textFaint} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={() => updateQuantity(line.id, line.quantity - 1)}
                accessibilityRole="button"
                accessibilityLabel={`Decrease ${line.name} quantity`}
                hitSlop={8}
              >
                <Ionicons name="remove-circle-outline" size={24} color={theme.colors.text} />
              </Pressable>
              <AppText variant="bodyMedium">{line.quantity}</AppText>
              <Pressable
                onPress={() => updateQuantity(line.id, line.quantity + 1)}
                disabled={line.quantity >= 5}
                accessibilityRole="button"
                accessibilityLabel={`Increase ${line.name} quantity`}
                hitSlop={8}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={line.quantity >= 5 ? theme.colors.textFaint : theme.colors.text}
                />
              </Pressable>
              {line.sample ? <Chip label="Sample" size="sm" tone="gold" /> : null}
            </View>
          </Card>
        ))}
      </View>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="small" color="textMuted">
            Subtotal
          </AppText>
          <AppText variant="smallMedium">{formatMoney(totals.subtotalCents)}</AppText>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="small" color="textMuted">
            Shipping
          </AppText>
          <AppText variant="smallMedium">
            {totals.shippingCents === 0 ? 'Free' : formatMoney(totals.shippingCents)}
          </AppText>
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="subheading">Total (before tax)</AppText>
          <AppText variant="subheading" color="accent">
            {formatMoney(totals.totalCents)}
          </AppText>
        </View>
        {!totals.qualifiesForFreeShipping ? (
          <View style={{ gap: 6 }}>
            <ProgressBar value={totals.subtotalCents / 12000} height={6} />
            <AppText variant="small" color="textFaint">
              {formatMoney(totals.freeShippingRemainingCents)} away from free shipping.
            </AppText>
          </View>
        ) : (
          <AppText variant="small" color="success">
            Free shipping unlocked.
          </AppText>
        )}
      </Card>

      <Button label="Continue to secure checkout" icon="lock-closed" fullWidth onPress={checkout} />
      <Button label="Clear cart" variant="ghost" onPress={clear} fullWidth />

      <Card tone="alt" style={{ gap: 6 }}>
        <AppText variant="smallMedium">Why checkout leaves the app</AppText>
        <AppText variant="small" color="textMuted">
          The artist’s inventory, tax rules and payment provider live in the Wix store. Handing off
          keeps prices and stock identical to the website, and keeps card data out of the app.
        </AppText>
      </Card>
    </Screen>
  );
}
