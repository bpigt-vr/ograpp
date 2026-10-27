import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Artwork } from '@/components/Artwork';
import { Pill } from '@/components/Elements';
import type { StoreProduct } from '@/data/products';
import { formatMoney } from '@/lib/format';
import { useTheme } from '@/theme';

export function ProductCard({
  product,
  onPress,
  width = 168,
}: {
  product: StoreProduct;
  onPress: () => void;
  width?: number;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatMoney(product.priceCents)}`}
      style={({ pressed }) => [{ width, gap: 8, opacity: pressed ? 0.82 : 1 }]}
    >
      <View>
        <Artwork
          gradient={product.gradient}
          size={width}
          radius={18}
          showMark
          showTitle={false}
        />
        <View style={{ position: 'absolute', top: 8, left: 8 }}>
          <Pill text={product.inStock ? (product.badge ?? 'Sample') : 'Sold out'} tone={product.inStock ? 'gold' : 'neutral'} />
        </View>
      </View>
      <View style={{ gap: 2 }}>
        <AppText variant="smallMedium" numberOfLines={1}>
          {product.name}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppText variant="small" color="textMuted">
            {formatMoney(product.priceCents)}
          </AppText>
          {product.compareAtCents ? (
            <AppText
              variant="small"
              color="textFaint"
              style={{ textDecorationLine: 'line-through' }}
            >
              {formatMoney(product.compareAtCents)}
            </AppText>
          ) : null}
          {!product.inStock ? (
            <Ionicons name="alert-circle-outline" size={12} color={theme.colors.textFaint} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const productStyles = StyleSheet.create({
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
