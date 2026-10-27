import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FLAT_CENTS,
  type StoreProduct,
} from '@/data/products';

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  priceCents: number;
  currency: 'CAD';
  quantity: number;
  size?: string;
  color?: string;
  gradient: readonly [string, string];
  sample: boolean;
};

export type CartTotals = {
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingRemainingCents: number;
  qualifiesForFreeShipping: boolean;
};

export const MAX_QUANTITY_PER_LINE = 5;

export function cartTotals(lines: CartLine[]): CartTotals {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
  const qualifiesForFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents = subtotalCents === 0 || qualifiesForFreeShipping ? 0 : SHIPPING_FLAT_CENTS;
  return {
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShippingRemainingCents: Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents),
    qualifiesForFreeShipping,
  };
}

export function makeCartLine(
  product: StoreProduct,
  options: { size?: string; color?: string; quantity?: number } = {}
): CartLine {
  return {
    id: [product.id, options.size, options.color].filter(Boolean).join(':'),
    productId: product.id,
    name: product.name,
    priceCents: product.priceCents,
    currency: product.currency,
    quantity: Math.min(MAX_QUANTITY_PER_LINE, Math.max(1, options.quantity ?? 1)),
    size: options.size,
    color: options.color,
    gradient: product.gradient,
    sample: product.sample,
  };
}

export function addLine(lines: CartLine[], incoming: CartLine): CartLine[] {
  const existing = lines.find((line) => line.id === incoming.id);
  if (!existing) return [...lines, incoming];
  return lines.map((line) =>
    line.id === incoming.id
      ? {
          ...line,
          quantity: Math.min(MAX_QUANTITY_PER_LINE, line.quantity + incoming.quantity),
        }
      : line
  );
}

export function setQuantity(lines: CartLine[], id: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((line) => line.id !== id);
  return lines.map((line) =>
    line.id === id
      ? { ...line, quantity: Math.min(MAX_QUANTITY_PER_LINE, Math.round(quantity)) }
      : line
  );
}
