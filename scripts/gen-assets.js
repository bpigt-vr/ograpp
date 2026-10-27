const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = '/workspace/assets/images';
const logo = '/tmp/brand/logo.png';

(async () => {
  const trimmed = await sharp(logo).trim({ threshold: 1 }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  console.log('trimmed', meta.width, meta.height);

  // Leaf only, transparent, square canvas
  const size = Math.max(meta.width, meta.height);
  const leafSquare = await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: trimmed, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(OUT, 'brand-mark.png'), await sharp(leafSquare).resize(800, 800).png().toBuffer());

  // App icon: deep ink background, ember glow, centered mark
  const iconBg = Buffer.from(`<svg width="1024" height="1024">
    <defs>
      <radialGradient id="g" cx="50%" cy="46%" r="62%">
        <stop offset="0%" stop-color="#C43A05" stop-opacity="0.85"/>
        <stop offset="55%" stop-color="#5A1A06" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#0B0A09" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="#0B0A09"/>
    <rect width="1024" height="1024" fill="url(#g)"/>
  </svg>`);
  const iconLeaf = await sharp(leafSquare).resize(720, 720).png().toBuffer();
  await sharp(iconBg)
    .composite([{ input: iconLeaf, left: 152, top: 142 }])
    .png()
    .toFile(path.join(OUT, 'icon.png'));

  const fgLeaf = await sharp(leafSquare).resize(600, 600).png().toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fgLeaf, left: 212, top: 212 }])
    .png()
    .toFile(path.join(OUT, 'android-icon-foreground.png'));

  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 11, g: 10, b: 9, alpha: 1 } } })
    .png()
    .toFile(path.join(OUT, 'android-icon-background.png'));

  const splashLeaf = await sharp(leafSquare).resize(460, 460).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: splashLeaf, left: 26, top: 26 }])
    .png()
    .toFile(path.join(OUT, 'splash-icon.png'));

  fs.copyFileSync('/tmp/brand/poster.png', path.join(OUT, 'brand-poster.png'));
  await sharp('/tmp/brand/poster.png').resize(1200, 1200, { fit: 'cover', position: 'attention' }).png().toFile(path.join(OUT, 'brand-cover.png'));
  await sharp(path.join(OUT, 'icon.png')).resize(96, 96).png().toFile(path.join(OUT, 'favicon.png'));

  for (const f of fs.readdirSync(OUT)) {
    const st = fs.statSync(path.join(OUT, f));
    console.log(f, st.size);
  }
})();
