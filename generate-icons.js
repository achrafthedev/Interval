// Generates proper PNG icons from the SVG for PWA installation
// Run: node generate-icons.js

import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync('public/icon.svg', 'utf8');

// Create a simple script that will be run in the browser to generate PNGs
// Since we don't have canvas in Node.js on Alpine, we generate valid PNGs manually

// For proper PWA icons, we need actual sized PNGs
// We'll create them using a minimal PNG encoder

function createPNG(size) {
  // Create an uncompressed PNG with the indigo gradient color
  const width = size;
  const height = size;

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr[16] = 8; // bit depth
  ihdr[17] = 2; // color type (RGB)
  ihdr[18] = 0; // compression
  ihdr[19] = 0; // filter
  ihdr[20] = 0; // interlace

  // Calculate CRC for IHDR
  const ihdrData = ihdr.subarray(4, 21);
  const ihdrCrc = crc32(ihdrData);
  ihdr.writeInt32BE(ihdrCrc, 21);

  // Create raw pixel data (indigo gradient with clock circle)
  const rawData = Buffer.alloc(height * (1 + width * 3)); // filter byte + RGB per pixel

  const cx = width / 2, cy = height / 2;
  const radius = width * 0.3125; // 160/512
  const strokeWidth = width * 0.035;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 3);
    rawData[rowOffset] = 0; // no filter

    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 3;

      // Background gradient (indigo)
      const t = (x + y) / (width + height);
      const r = Math.round(99 * (1 - t) + 79 * t);
      const g = Math.round(102 * (1 - t) + 70 * t);
      const b = Math.round(241 * (1 - t) + 229 * t);

      // Check if pixel is on the clock circle
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const onCircle = Math.abs(dist - radius) < strokeWidth;

      // Clock hands
      const onHourHand = x >= cx - 3 && x <= cx + 3 && y >= cy - radius * 0.75 && y <= cy;
      const onMinuteHand = y >= cy - 2 && y <= cy + 2 && x >= cx && x <= cx + radius * 0.55;

      // Center dot
      const onCenter = dist < width * 0.02;

      if (onCircle || onHourHand || onMinuteHand || onCenter) {
        rawData[px] = 255;
        rawData[px + 1] = 255;
        rawData[px + 2] = 255;
      } else {
        // Round corners
        const cornerR = width * 0.21;
        const inCorner = (
          (x < cornerR && y < cornerR && Math.sqrt((x - cornerR) ** 2 + (y - cornerR) ** 2) > cornerR) ||
          (x > width - cornerR && y < cornerR && Math.sqrt((x - (width - cornerR)) ** 2 + (y - cornerR) ** 2) > cornerR) ||
          (x < cornerR && y > height - cornerR && Math.sqrt((x - cornerR) ** 2 + (y - (height - cornerR)) ** 2) > cornerR) ||
          (x > width - cornerR && y > height - cornerR && Math.sqrt((x - (width - cornerR)) ** 2 + (y - (height - cornerR)) ** 2) > cornerR)
        );

        if (inCorner) {
          rawData[px] = 0;
          rawData[px + 1] = 0;
          rawData[px + 2] = 0;
        } else {
          rawData[px] = r;
          rawData[px + 1] = g;
          rawData[px + 2] = b;
        }
      }
    }
  }

  // Compress with zlib
  const { deflateSync } = await import('zlib');
  const compressed = deflateSync(rawData);

  // IDAT chunk
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  idat.writeInt32BE(idatCrc, compressed.length + 8);

  // IEND chunk
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 0xAE, 0x42, 0x60, 0x82]);

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

const crc32Table = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crc32Table[i] = c;
}

// Generate icons
const icon192 = await createPNG(192);
const icon512 = await createPNG(512);

writeFileSync('public/icon-192.png', icon192);
writeFileSync('public/icon-512.png', icon512);

console.log(`icon-192.png: ${icon192.length} bytes`);
console.log(`icon-512.png: ${icon512.length} bytes`);
console.log('PNG icons generated successfully.');
