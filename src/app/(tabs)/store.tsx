import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { SegmentedControl } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { SiteWebView } from '@/components/SiteWebView';
import { Card } from '@/components/Surfaces';
import { PRODUCT_CATEGORIES, SAMPLE_PRODUCTS, type ProductCategory } from '@/data/products';
import { ProductCard } from '@/features/store/ProductCard';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useCartStore } from '@/features/store/useCartStore';
import { cartTotals } from '@/features/store/cart';
import { openExternal } from '@/lib/links';
import { formatMoney } from '@/lib/format';
import { SITE } from '@/lib/site';
import { useTheme } from '@/theme';

type StoreTab = 'official' | 'app';

export default function StoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<StoreTab>('official');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const lines = useCartStore((state) => state.lines);
  const sampleEnabled = useSettingsStore((state) => state.sampleCatalogueEnabled);
  const totals = cartTotals(lines);

  const products = useMemo(
    () =>
      !sampleEnabled
        ? []
        : category === 'all'
          ? SAMPLE_PRODUCTS
          : SAMPLE_PRODUCTS.filter((product) => product.category === category),
    [category, sampleEnabled]
  );

  const segmented = (
    <SegmentedControl<StoreTab>
      value={tab}
      onChange={setTab}
      options={[
        { value: 'official', label: 'Official shop' },
        { value: 'app', label: 'App shop' },
      ]}
    />
  );

  if (tab === 'official') {
    return (
      <Screen
        scroll={false}
        title="Store"
        eyebrow="Merch · CAD"
        bottomInset={110}
        right={
          <Pressable
            onPress={() => router.push('/store/cart')}
            accessibilityRole="button"
            accessibilityLabel={`Cart with ${totals.itemCount} items`}
            hitSlop={8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="cart-outline" size={20} color={theme.colors.text} />
              {totals.itemCount > 0 ? <AppText variant="smallMedium" color="accent">{totals.itemCount}</AppText> : null}
            </View>
          </Pressable>
        }
      >
        {segmented}
        <SiteWebView
          fill
          url={SITE.merch}
          title="Official merch · overgrowthrenaissance.com/merch"
          note="Browse and check out on the artist’s live Wix store — inventory, taxes, shipping and payments stay authoritative there."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Store" eyebrow="Merch · CAD" bottomInset={150}>
      {segmented}

      <Card tone="accent" style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="information-circle-outline" size={15} color={theme.colors.accent} />
          <AppText variant="smallMedium">Sample catalogue</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          The live Wix store currently lists no products, so these items are sample data for testing
          the browsing and cart flow. Nothing here can take a payment — checkout always hands off to
          the official store.
        </AppText>
        <Button
          label="Open official shop"
          size="sm"
          icon="open-outline"
          onPress={() => void openExternal(SITE.merch)}
        />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PRODUCT_CATEGORIES.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            size="sm"
            selected={category === item.id}
            onPress={() => setCategory(item.id)}
          />
        ))}
      </View>

      {products.length === 0 ? (
        <Card style={{ gap: 8 }}>
          <AppText variant="smallMedium">Sample catalogue hidden</AppText>
          <AppText variant="small" color="textMuted">
            Turn it back on in Settings to test the cart flow, or browse the official shop above.
          </AppText>
          <Button label="Open settings" size="sm" variant="ghost" onPress={() => router.push('/settings')} />
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            width={158}
            onPress={() => router.push(`/store/product/${product.id}`)}
          />
        ))}
      </View>

      {totals.itemCount > 0 ? (
        <Pressable
          onPress={() => router.push('/store/cart')}
          accessibilityRole="button"
          accessibilityLabel="Review cart"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} tone="alt">
            <Ionicons name="cart" size={20} color={theme.colors.accent} />
            <View style={{ flex: 1 }}>
              <AppText variant="smallMedium">
                {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} in cart
              </AppText>
              <AppText variant="small" color="textFaint">
                {formatMoney(totals.subtotalCents)} · shipping calculated at checkout
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <AppText variant="smallMedium" color="accent">
                Review
              </AppText>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.accent} />
            </View>
          </Card>
        </Pressable>
      ) : null}

      <Card style={{ gap: 6 }}>
        <AppText variant="smallMedium">Shipping & returns</AppText>
        <AppText variant="small" color="textMuted">
          Flat {formatMoney(900)} shipping in Canada, free over {formatMoney(12000)}. Final taxes and
          delivery options are confirmed by the official store at checkout.
        </AppText>
      </Card>
    </Screen>
  );
}
