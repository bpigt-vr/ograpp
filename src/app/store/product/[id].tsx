import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Artwork } from '@/components/Artwork';
import { Button } from '@/components/Button';
import { Chip, Pill } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { getSampleProduct } from '@/data/products';
import { makeCartLine } from '@/features/store/cart';
import { useCartStore } from '@/features/store/useCartStore';
import { formatMoney } from '@/lib/format';
import { openExternal } from '@/lib/links';
import { SITE } from '@/lib/site';
import { useTheme } from '@/theme';

export default function ProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getSampleProduct(String(id));
  const addToCart = useCartStore((state) => state.add);

  const [size, setSize] = useState<string | undefined>(product?.sizes[0]);
  const [color, setColor] = useState<string | undefined>(product?.colors[0]?.name);
  const [quantity, setQuantity] = useState(1);

  const artSize = useMemo(() => Math.min(width - 64, 340), [width]);

  if (!product) {
    return (
      <Screen back title="Product" bottomInset={40}>
        <Card tone="alt" style={{ gap: 8 }}>
          <AppText variant="subheading">Product not found</AppText>
          <AppText variant="small" color="textMuted">
            This item is not in the current catalogue.
          </AppText>
          <Button label="Back to store" size="sm" onPress={() => router.replace('/store')} />
        </Card>
      </Screen>
    );
  }

  const handleAdd = () => {
    if (!product.inStock) {
      toast.show('That variant is sold out in the sample catalogue.', 'error');
      return;
    }
    addToCart(makeCartLine(product, { size, color, quantity }));
    toast.show(`${product.name} added to cart`, 'success');
  };

  return (
    <Screen back title={product.name} eyebrow={product.category.toUpperCase()} bottomInset={40}>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Artwork gradient={product.gradient} size={artSize} radius={24} showTitle={false} />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pill text={product.sample ? 'Sample product' : 'Official'} tone="gold" />
          <Pill text={product.inStock ? 'In stock' : 'Sold out'} tone={product.inStock ? 'success' : 'neutral'} />
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <AppText variant="heading">{product.name}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppText variant="subheading" color="accent">
            {formatMoney(product.priceCents)}
          </AppText>
          {product.compareAtCents ? (
            <AppText variant="small" color="textFaint" style={{ textDecorationLine: 'line-through' }}>
              {formatMoney(product.compareAtCents)}
            </AppText>
          ) : null}
          <AppText variant="small" color="textFaint">
            CAD · taxes at checkout
          </AppText>
        </View>
      </View>

      {product.sizes.length > 1 ? (
        <View style={{ gap: 8 }}>
          <AppText variant="smallMedium" color="textMuted">
            Size{size ? ` · ${size}` : ''}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {product.sizes.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={size === option}
                onPress={() => setSize(option)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <AppText variant="smallMedium" color="textMuted">
          Colour{color ? ` · ${color}` : ''}
        </AppText>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {product.colors.map((option) => (
            <Pressable
              key={option.name}
              onPress={() => setColor(option.name)}
              accessibilityRole="button"
              accessibilityLabel={option.name}
              accessibilityState={{ selected: color === option.name }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: color === option.name ? theme.colors.accent : theme.colors.border,
              }}
            >
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: option.hex }} />
              <AppText variant="small">{option.name}</AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <AppText variant="smallMedium" color="textMuted">
          Quantity
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => setQuantity((value) => Math.max(1, value - 1))}
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
            hitSlop={8}
          >
            <Ionicons name="remove-circle-outline" size={26} color={theme.colors.text} />
          </Pressable>
          <AppText variant="subheading">{quantity}</AppText>
          <Pressable
            onPress={() => setQuantity((value) => Math.min(5, value + 1))}
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
            hitSlop={8}
          >
            <Ionicons name="add-circle-outline" size={26} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      <Button
        label={product.inStock ? `Add to cart · ${formatMoney(product.priceCents * quantity)}` : 'Sold out'}
        icon="cart-outline"
        onPress={handleAdd}
        disabled={!product.inStock}
        fullWidth
      />
      <Button
        label="Buy on the official store"
        icon="open-outline"
        variant="secondary"
        fullWidth
        onPress={() => void openExternal(product.officialUrl)}
      />

      <Card style={{ gap: 8 }}>
        <AppText variant="smallMedium">Details</AppText>
        <AppText variant="small" color="textMuted">
          {product.description}
        </AppText>
        <AppText variant="small" color="textFaint">
          Sizes and colours shown here mirror the sample catalogue. Live inventory, variant
          availability and checkout are handled by the Wix store at overgrowthrenaissance.com/merch.
        </AppText>
        <Button label="Read shipping policy" size="sm" variant="ghost" onPress={() => void openExternal(SITE.merch)} />
      </Card>
    </Screen>
  );
}
