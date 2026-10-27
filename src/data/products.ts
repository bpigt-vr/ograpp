/**
 * Merchandise catalogue.
 *
 * The live Wix store currently returns "We don't have any products to show here
 * right now", so the native catalogue ships as an explicitly labelled *sample*
 * catalogue. It exists to make browsing, variants, cart and checkout handoff
 * testable; it never claims to be live inventory, and nothing here can take a
 * payment. Wire EXPO_PUBLIC_STORE_CATALOG_URL (Wix Storefront API proxy) to
 * replace it — see docs/INTEGRATIONS.md.
 */
export type ProductCategory = 'apparel' | 'headwear' | 'accessories' | 'print';

export type ProductColor = { name: string; hex: string };

export type StoreProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  currency: 'CAD';
  gradient: readonly [string, string];
  sizes: string[];
  colors: ProductColor[];
  inStock: boolean;
  badge?: string;
  sample: true;
  officialUrl: string;
};

export const PRODUCT_CATEGORIES: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'headwear', label: 'Headwear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'print', label: 'Prints' },
];

export const SAMPLE_PRODUCTS: StoreProduct[] = [
  {
    id: 'renaissance-hoodie',
    name: 'Renaissance Hoodie',
    category: 'apparel',
    description:
      'Heavyweight fleece with the OGR leaf embroidered at the chest. Sample product — live stock is in the official Wix store.',
    priceCents: 8900,
    compareAtCents: 10900,
    currency: 'CAD',
    gradient: ['#3A1A0C', '#0B0A09'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'Ink', hex: '#141110' },
      { name: 'Ember', hex: '#C43A05' },
    ],
    inStock: true,
    badge: 'Sample',
    sample: true,
    officialUrl: 'https://www.overgrowthrenaissance.com/merch',
  },
  {
    id: 'maple-tee',
    name: 'Maple Leaf Tee',
    category: 'apparel',
    description:
      'Ring-spun cotton tee with the full maple leaf print. Sample product for preview builds.',
    priceCents: 4200,
    currency: 'CAD',
    gradient: ['#7E1508', '#2A0D06'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Vintage Cream', hex: '#F2E4C9' },
      { name: 'Washed Black', hex: '#2B2724' },
    ],
    inStock: true,
    badge: 'Sample',
    sample: true,
    officialUrl: 'https://www.overgrowthrenaissance.com/merch',
  },
  {
    id: 'hoser-beanie',
    name: 'Hoser Gang Beanie',
    category: 'headwear',
    description:
      'Ribbed knit beanie for -30°C studio runs. Sample product for preview builds.',
    priceCents: 3200,
    currency: 'CAD',
    gradient: ['#2F4A34', '#0D1A12'],
    sizes: ['One size'],
    colors: [
      { name: 'Moss', hex: '#2F4A34' },
      { name: 'Ink', hex: '#141110' },
    ],
    inStock: true,
    sample: true,
    officialUrl: 'https://www.overgrowthrenaissance.com/merch',
  },
  {
    id: 'ogr-logo-cap',
    name: 'OGR Logo Cap',
    category: 'headwear',
    description: 'Structured six-panel cap with embroidered OGR wordmark. Sample product.',
    priceCents: 3800,
    currency: 'CAD',
    gradient: ['#1F1B18', '#0B0A09'],
    sizes: ['One size'],
    colors: [{ name: 'Ink', hex: '#141110' }],
    inStock: false,
    sample: true,
    officialUrl: 'https://www.overgrowthrenaissance.com/merch',
  },
  {
    id: 'overgrowth-poster',
    name: 'Overgrowth Poster',
    category: 'print',
    description:
      '18×24 matte print of the original maple leaf artwork. Sample product.',
    priceCents: 2500,
    currency: 'CAD',
    gradient: ['#F5B841', '#C43A05'],
    sizes: ['18×24'],
    colors: [{ name: 'Natural', hex: '#F7F0E4' }],
    inStock: true,
    sample: true,
    officialUrl: 'https://www.overgrowthrenaissance.com/merch',
  },
  {
    id: 'scintilla-stickers',
    name: 'Scintilla Sticker Pack',
    category: 'accessories',
    description: 'Five weatherproof stickers for the laptop that travels with you. Sample product.',
    priceCents: 1400,
    currency: 'CAD',
    gradient: ['#FF8A3D', '#7E1508'],
    sizes: ['Pack of 5'],
    colors: [{ name: 'Multi', hex: '#F2610C' }],
    inStock: true,
    sample: true,
    officialUrl: 'https://www.overgrowthrenaissance.com/merch',
  },
];

export const SHIPPING_FLAT_CENTS = 900;
export const FREE_SHIPPING_THRESHOLD_CENTS = 12000;

export function getSampleProduct(id: string): StoreProduct | undefined {
  return SAMPLE_PRODUCTS.find((product) => product.id === id);
}
