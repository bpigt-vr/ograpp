import { addLine, cartTotals, makeCartLine, setQuantity } from '../cart';
import { SAMPLE_PRODUCTS, SHIPPING_FLAT_CENTS, FREE_SHIPPING_THRESHOLD_CENTS } from '@/data/products';

const hoodie = SAMPLE_PRODUCTS[0];
const stickers = SAMPLE_PRODUCTS[5];

describe('cart maths', () => {
  it('adds shipping below the free threshold', () => {
    const line = makeCartLine(stickers, { quantity: 1 });
    const totals = cartTotals([line]);
    expect(totals.subtotalCents).toBe(stickers.priceCents);
    expect(totals.shippingCents).toBe(SHIPPING_FLAT_CENTS);
    expect(totals.totalCents).toBe(stickers.priceCents + SHIPPING_FLAT_CENTS);
  });

  it('is empty-safe', () => {
    const totals = cartTotals([]);
    expect(totals.itemCount).toBe(0);
    expect(totals.totalCents).toBe(0);
    expect(totals.shippingCents).toBe(0);
  });

  it('waves shipping above the threshold', () => {
    const line = makeCartLine(hoodie, { size: 'L', color: 'Ink', quantity: 2 });
    const totals = cartTotals([line]);
    expect(totals.subtotalCents).toBe(hoodie.priceCents * 2);
    expect(totals.qualifiesForFreeShipping).toBe(hoodie.priceCents * 2 >= FREE_SHIPPING_THRESHOLD_CENTS);
    expect(totals.freeShippingRemainingCents).toBe(
      Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - hoodie.priceCents * 2)
    );
  });

  it('merges identical variants and caps quantity', () => {
    const line = makeCartLine(hoodie, { size: 'M', color: 'Ember' });
    let lines = addLine([], line);
    lines = addLine(lines, line);
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
    lines = setQuantity(lines, line.id, 99);
    expect(lines[0].quantity).toBe(5);
  });

  it('keeps different variants separate and removes at zero', () => {
    const small = makeCartLine(hoodie, { size: 'S', color: 'Ink' });
    const large = makeCartLine(hoodie, { size: 'L', color: 'Ink' });
    let lines = addLine(addLine([], small), large);
    expect(lines).toHaveLength(2);
    lines = setQuantity(lines, small.id, 0);
    expect(lines).toHaveLength(1);
    expect(lines[0].size).toBe('L');
  });
});
