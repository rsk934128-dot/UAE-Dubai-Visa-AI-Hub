import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgPath = path.resolve('public/favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating high-res PNG & PWA icons...');

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/icon-192.png'));
  console.log('✓ Created public/icon-192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/icon-512.png'));
  console.log('✓ Created public/icon-512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png');

  // 32x32 favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public/favicon-32x32.png'));

  // 16x16 favicon
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.resolve('public/favicon-16x16.png'));

  // Maskable icon 512x512 (with 10% padding safe zone)
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 11, g: 19, b: 41, alpha: 1 }
    })
    .png()
    .toFile(path.resolve('public/icon-maskable-512.png'));
  console.log('✓ Created public/icon-maskable-512.png');

  // Favicon.ico (using 32x32 png)
  fs.copyFileSync(path.resolve('public/favicon-32x32.png'), path.resolve('public/favicon.ico'));
  console.log('✓ Created public/favicon.ico');

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
