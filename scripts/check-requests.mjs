// Vérifications en navigateur réel (Chrome) sur le site construit (dist/), servi par `astro preview` :
//  - aucune requête hors du site au chargement, aucun cookie avant le clic sur la vidéo ;
//  - aucun défilement horizontal de 320 à 1440 px sur toutes les pages ;
//  - le lecteur Vimeo n'est demandé qu'après le clic (avec dnt=1).
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 4322;
const BASE = `http://localhost:${PORT}`;
const failures = [];
const fail = (msg) => { failures.push(msg); console.error("✖", msg); };
const ok = (msg) => console.log("✔", msg);

const server = spawn("npx", ["astro", "preview", "--port", String(PORT)], { stdio: "ignore" });
const stop = () => server.kill();
process.on("exit", stop);
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
try {
  // 1. Requêtes et cookies au chargement
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const external = [];
  page.on("request", (r) => { const u = new URL(r.url()); if (!["localhost", ""].includes(u.hostname) && u.protocol.startsWith("http")) external.push(r.url()); });
  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 800));
  external.length ? fail(`requêtes externes au chargement : ${external.join(", ")}`) : ok("aucune requête externe au chargement");
  const cookies = await page.cookies();
  cookies.length ? fail(`cookies avant clic : ${cookies.map((c) => c.name)}`) : ok("aucun cookie avant le clic vidéo");

  // 2. Lecteur Vimeo seulement après le clic
  await page.evaluate(() => document.getElementById("temoignage").scrollIntoView());
  await page.click(".video button.video__play");
  await page.waitForSelector(".video iframe");
  const src = await page.$eval(".video iframe", (f) => f.src);
  src === "https://player.vimeo.com/video/1202756436?dnt=1&autoplay=1" ? ok("iframe Vimeo (dnt=1) injectée au clic") : fail(`src iframe inattendu : ${src}`);
  await page.close();

  // 2 bis. Sans JavaScript en mobile : l'en-tête déplié ne doit pas rester collant
  for (const width of [320, 390]) {
    const p = await browser.newPage();
    await p.setJavaScriptEnabled(false);
    await p.setViewport({ width, height: 700 });
    await p.goto(BASE, { waitUntil: "load" });
    const { pos, h } = await p.$eval("header", (el) => ({ pos: getComputedStyle(el).position, h: el.getBoundingClientRect().height }));
    pos === "sticky" && h > 120
      ? fail(`sans JS @${width}px : en-tête collant de ${Math.round(h)} px (masque les titres d'ancre)`)
      : ok(`sans JS @${width}px : en-tête non bloquant (${pos}, ${Math.round(h)} px)`);
    await p.close();
  }

  // 3. Pas de défilement horizontal
  for (const path of ["/", "/merci", "/mentions-legales", "/confidentialite", "/introuvable"]) {
    for (const width of [320, 390, 768, 900, 1024, 1100, 1440]) {
      const p = await browser.newPage();
      await p.setViewport({ width, height: 900 });
      await p.goto(BASE + path, { waitUntil: "networkidle0" });
      const { sw, iw } = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      if (sw > iw) fail(`${path} @${width}px : défilement horizontal (${sw} > ${iw})`);
      await p.close();
    }
  }
  if (!failures.length) ok("aucun défilement horizontal (35 combinaisons page x largeur)");
} finally {
  await browser.close();
  stop();
}
process.exit(failures.length ? 1 : 0);
