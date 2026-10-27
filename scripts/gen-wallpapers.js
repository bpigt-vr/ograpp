/**
 * Generates the reward wallpapers from the OGR brand mark.
 * Run with: node scripts/gen-wallpapers.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'wallpapers');
const LEAF = path.join(__dirname, '..', 'assets', 'images', 'brand-mark.png');
const W = 1290;
const H = 2796;
const leafB64 = fs.readFileSync(LEAF).toString('base64');

const WALLPAPERS = [
  {
    id: 'ember-rise',
    defs: `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFB067"/><stop offset="0.45" stop-color="#D93A0B"/><stop offset="1" stop-color="#240603"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="40%" r="75%">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>`,
    bg: `<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#v)"/>`,
    leaf: { size: 1120, x: 85, y: 800, opacity: 0.95 },
  },
  {
    id: 'ink-glow',
    defs: `<radialGradient id="glow" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="#C43A05" stop-opacity="0.9"/><stop offset="0.5" stop-color="#5A1A06" stop-opacity="0.55"/><stop offset="1" stop-color="#0B0A09" stop-opacity="0"/>
    </radialGradient>`,
    bg: `<rect width="${W}" height="${H}" fill="#0B0A09"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`,
    leaf: { size: 940, x: 175, y: 930, opacity: 0.55 },
  },
  {
    id: 'gold-hour',
    defs: `<linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#FFD98A"/><stop offset="0.4" stop-color="#F5B841"/><stop offset="0.78" stop-color="#B93A06"/><stop offset="1" stop-color="#2A0803"/>
    </linearGradient>`,
    bg: `<rect width="${W}" height="${H}" fill="url(#g)"/>`,
    leaf: { size: 1150, x: 70, y: -60, opacity: 0.33, rotate: 10 },
  },
  {
    id: 'moss-static',
    defs: `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4C7A57"/><stop offset="0.55" stop-color="#1C3122"/><stop offset="1" stop-color="#070C08"/>
    </linearGradient>`,
    bg: `<rect width="${W}" height="${H}" fill="url(#g)"/>`,
    leaf: { size: 1180, x: 55, y: 1560, opacity: 0.3 },
  },
  {
    id: 'cream-poster',
    defs: `<radialGradient id="g" cx="50%" cy="45%" r="70%">
      <stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#EFE1CB"/>
    </radialGradient>`,
    bg: `<rect width="${W}" height="${H}" fill="url(#g)"/><rect x="70" y="70" width="${W - 140}" height="${H - 140}" fill="none" stroke="#141110" stroke-opacity="0.16" stroke-width="4"/>`,
    leaf: { size: 1020, x: 135, y: 860, opacity: 0.98 },
  },
  {
    id: 'midnight',
    defs: `<linearGradient id="g" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#223A5E"/><stop offset="0.55" stop-color="#101A2B"/><stop offset="1" stop-color="#05070C"/>
    </linearGradient>
    <radialGradient id="ember" cx="50%" cy="78%" r="45%">
      <stop offset="0" stop-color="#F2610C" stop-opacity="0.45"/><stop offset="1" stop-color="#F2610C" stop-opacity="0"/>
    </radialGradient>`,
    bg: `<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#ember)"/>`,
    leaf: { size: 1150, x: 70, y: 1210, opacity: 0.24 },
  },
];

function svgFor(wallpaper) {
  const { size, x, y, opacity, rotate = 0 } = wallpaper.leaf;
  const centre = size / 2;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>${wallpaper.defs}</defs>
    ${wallpaper.bg}
    <image xlink:href="data:image/png;base64,${leafB64}" x="${x}" y="${y}" width="${size}" height="${size}" opacity="${opacity}" transform="rotate(${rotate} ${x + centre} ${y + centre})"/>
  </svg>`;
}

(async () => {
  for (const wallpaper of WALLPAPERS) {
    const file = path.join(OUT, `${wallpaper.id}.jpg`);
    await sharp(Buffer.from(svgFor(wallpaper)))
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
      .toFile(file);
    await sharp(file)
      .resize(330, 715)
      .jpeg({ quality: 78 })
      .toFile(path.join(OUT, `${wallpaper.id}-thumb.jpg`));
    console.log(wallpaper.id, 'full', Math.round(fs.statSync(file).size / 1024), 'KB');
  }
})();
