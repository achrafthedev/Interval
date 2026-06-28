import { writeFileSync } from 'fs';

// Generate a minimal valid 1x1 PNG as a placeholder.
// For production icons, replace these with properly rendered PNGs from the SVG.
// The app primarily uses icon.svg which renders at any resolution.

function createPlaceholderPng() {
  // Minimal valid PNG: 1x1 indigo pixel (#4f46e5)
  return Buffer.from(
    '89504e47' + '0d0a1a0a' + // PNG signature
    '0000000d' + '49484452' + // IHDR chunk header
    '00000001' + '00000001' + // 1x1
    '08020000' + '0090775de6' + // 8-bit RGB, CRC
    '0000000c' + '49444154' + // IDAT chunk header
    '08d76360' + '604cf80f' + // compressed pixel data
    '00000300' + '0159e834' + // CRC
    '0000000049454e44ae426082', // IEND
    'hex'
  );
}

const png = createPlaceholderPng();
writeFileSync('public/icon-192.png', png);
writeFileSync('public/icon-512.png', png);
console.log('Placeholder icons written.');
