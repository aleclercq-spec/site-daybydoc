// Génère public/og-image.png (1200 x 630, logo blanc centré sur fond teal #105064).
import sharp from "sharp";

const W = 1200, H = 630, LOGO_W = 640;
const logo = await sharp("src/assets/logo-daybydoc-blanc.svg", { density: 300 })
  .resize({ width: LOGO_W })
  .png()
  .toBuffer();
const { height: logoH } = await sharp(logo).metadata();

await sharp({ create: { width: W, height: H, channels: 3, background: "#105064" } })
  .composite([{ input: logo, left: Math.round((W - LOGO_W) / 2), top: Math.round((H - logoH) / 2) }])
  .png({ compressionLevel: 9 })
  .toFile("public/og-image.png");
console.log("public/og-image.png généré");
