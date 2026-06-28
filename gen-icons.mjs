import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

function crc32(buf) {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}

function makePNG(size) {
  const w = size, h = size;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrBody = Buffer.alloc(13);
  ihdrBody.writeUInt32BE(w, 0);
  ihdrBody.writeUInt32BE(h, 4);
  ihdrBody[8] = 8; ihdrBody[9] = 2; // 8-bit RGB
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = crc32(Buffer.concat([ihdrType, ihdrBody]));
  const ihdr = Buffer.alloc(12 + 13);
  ihdr.writeUInt32BE(13, 0);
  ihdrType.copy(ihdr, 4);
  ihdrBody.copy(ihdr, 8);
  ihdr.writeUInt32BE(ihdrCrc, 21);

  // Pixel data
  const raw = Buffer.alloc(h * (1 + w * 3));
  const cx = w / 2, cy = h / 2, r = w * 0.3125, sw = w * 0.035;

  for (let y = 0; y < h; y++) {
    const ro = y * (1 + w * 3);
    raw[ro] = 0;
    for (let x = 0; x < w; x++) {
      const px = ro + 1 + x * 3;
      const t = (x + y) / (w + h);
      const cr = Math.round(99 * (1 - t) + 79 * t);
      const cg = Math.round(102 * (1 - t) + 70 * t);
      const cb = Math.round(241 * (1 - t) + 229 * t);
      const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy);
      const onCircle = Math.abs(dist - r) < sw;
      const onHour = x >= cx - sw/2 && x <= cx + sw/2 && y >= cy - r * 0.72 && y <= cy;
      const onMin = y >= cy - sw/3 && y <= cy + sw/3 && x >= cx && x <= cx + r * 0.52;
      const onDot = dist < w * 0.018;
      const cornerR = w * 0.21;
      const inCorner = [
        [cornerR, cornerR], [w - cornerR, cornerR],
        [cornerR, h - cornerR], [w - cornerR, h - cornerR]
      ].some(([ccx, ccy]) => Math.sqrt((x - ccx) ** 2 + (y - ccy) ** 2) > cornerR &&
        ((ccx < w/2 ? x < cornerR : x > w - cornerR) && (ccy < h/2 ? y < cornerR : y > h - cornerR)));

      if (onCircle || onHour || onMin || onDot) {
        raw[px] = 255; raw[px+1] = 255; raw[px+2] = 255;
      } else if (inCorner) {
        raw[px] = 0; raw[px+1] = 0; raw[px+2] = 0;
      } else {
        raw[px] = cr; raw[px+1] = cg; raw[px+2] = cb;
      }
    }
  }

  const compressed = deflateSync(raw);
  const idatType = Buffer.from('IDAT');
  const idatCrc = crc32(Buffer.concat([idatType, compressed]));
  const idat = Buffer.alloc(12 + compressed.length);
  idat.writeUInt32BE(compressed.length, 0);
  idatType.copy(idat, 4);
  compressed.copy(idat, 8);
  idat.writeUInt32BE(idatCrc, 8 + compressed.length);

  const iend = Buffer.alloc(12);
  iend.writeUInt32BE(0, 0);
  iend.write('IEND', 4);
  iend.writeUInt32BE(crc32(Buffer.from('IEND')), 8);

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const i192 = makePNG(192);
const i512 = makePNG(512);
writeFileSync('public/icon-192.png', i192);
writeFileSync('public/icon-512.png', i512);
console.log(`icon-192.png: ${i192.length} bytes`);
console.log(`icon-512.png: ${i512.length} bytes`);
