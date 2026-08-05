const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const pub = path.join(__dirname, "..", "public");
const src = path.join(pub, "logo.png");
const BLUE = { r: 37, g: 99, b: 235, alpha: 1 };

function roundedMask(size, radius) {
  const r = Math.round(radius);
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/>` +
      `</svg>`,
  );
  return sharp(svg).png().toBuffer();
}

async function writeRounded(outPath, squareBuf, size) {
  const radius = Math.round(size * 0.22);
  const resized = await sharp(squareBuf).resize(size, size).png().toBuffer();
  const mask = await roundedMask(size, radius);
  await sharp(resized)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(outPath);
}

(async () => {
  const trimmed = await sharp(src)
    .trim({ threshold: 8 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = trimmed;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40) data[i + 3] = 0;
  }

  const mark = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const side = Math.max(info.width, info.height);
  const padded = Math.ceil(side * 1.15);

  const squareBuf = await sharp({
    create: {
      width: padded,
      height: padded,
      channels: 4,
      background: BLUE,
    },
  })
    .composite([
      {
        input: await sharp(mark)
          .resize({
            width: side,
            height: side,
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer(),
        gravity: "centre",
      },
    ])
    .png()
    .toBuffer();

  await writeRounded(path.join(pub, "favicon.png"), squareBuf, 32);
  await writeRounded(path.join(pub, "apple-touch-icon.png"), squareBuf, 180);
  await writeRounded(path.join(pub, "icon-192.png"), squareBuf, 192);
  await writeRounded(path.join(pub, "logo-icon.png"), squareBuf, 256);

  const sizes = [16, 32, 48];
  const pngs = [];
  for (const s of sizes) {
    const radius = Math.round(s * 0.22);
    const resized = await sharp(squareBuf).resize(s, s).png().toBuffer();
    const mask = await roundedMask(s, radius);
    pngs.push(
      await sharp(resized)
        .composite([{ input: mask, blend: "dest-in" }])
        .png()
        .toBuffer(),
    );
  }

  const count = pngs.length;
  let offset = 6 + count * 16;
  const header = Buffer.alloc(6 + count * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let body = Buffer.alloc(0);
  for (let i = 0; i < count; i++) {
    const s = sizes[i];
    const png = pngs[i];
    const entry = 6 + i * 16;
    header.writeUInt8(s === 256 ? 0 : s, entry);
    header.writeUInt8(s === 256 ? 0 : s, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
    body = Buffer.concat([body, png]);
  }
  fs.writeFileSync(path.join(pub, "favicon.ico"), Buffer.concat([header, body]));
  console.log("rounded blue favicons written");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
