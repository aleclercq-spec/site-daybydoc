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

  // 2 ter. Géométrie du hero : pas de chevauchement, carte jamais sous le texte, hauteur maîtrisée
  for (const width of [1440, 1280, 1180, 1100, 1024, 820, 768, 480, 390, 360, 320]) {
    const p = await browser.newPage();
    await p.setViewport({ width, height: 900 });
    await p.goto(BASE, { waitUntil: "networkidle0" });
    const g = await p.evaluate(() => {
      const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      const shown = (el) => el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
      const pick = (sel) => [...document.querySelectorAll(sel)].filter(shown);
      const hero = document.querySelector("#hero");
      return {
        hero: rect(hero), header: rect(document.querySelector("header")),
        text: rect(document.querySelector(".hero__text")), visual: rect(document.querySelector(".hero__visual")),
        map: rect(document.querySelector(".hero__map")),
        pastille: rect(document.querySelector('.hero__map circle[cx="380.3"][cy="284.4"][r="28"]')),
        laptop: rect(document.querySelector(".hero__laptop")),
        notifs: pick(".hero__notif").map(rect),
      };
    });
    const hit = (a, b) => a.l < b.r - 0.5 && a.r > b.l + 0.5 && a.t < b.b - 0.5 && a.b > b.t + 0.5;
    const problems = [];
    g.notifs.forEach((n, i) => {
      if (hit(n, g.pastille)) problems.push(`notification ${i} masque la pastille`);
      if (hit(n, g.laptop)) problems.push(`notification ${i} chevauche l'ordinateur`);
      g.notifs.slice(i + 1).forEach((m, j) => hit(n, m) && problems.push(`notifications ${i} et ${i + j + 1} se chevauchent`));
    });
    if (hit(g.laptop, g.pastille)) problems.push("l'ordinateur masque la pastille");
    if (hit(g.map, g.text)) problems.push("la carte passe sous le texte");
    if (width >= 1280 && g.hero.h > 820) problems.push(`hero trop haut : ${Math.round(g.hero.h)} px (max 820)`);
    if (width === 1440 && g.header.h + g.hero.h > 900) problems.push(`en-tête + hero = ${Math.round(g.header.h + g.hero.h)} px (> 900)`);
    if (width < 768 && g.notifs.length > 2) problems.push(`${g.notifs.length} notifications en mobile (2 max)`);
    if (width >= 1280 && g.visual.l < g.text.r - 1) problems.push("visuel pas à droite du texte");
    if (width < 1280 && g.visual.t < g.text.b - 1) problems.push("visuel pas sous le texte");
    problems.length ? fail(`hero @${width}px : ${problems.join(" ; ")}`) : ok(`hero @${width}px : géométrie correcte (${Math.round(g.hero.h)} px, ${g.notifs.length} notif.)`);
    await p.close();
  }

  // 2 quater. Retouches du 25/11 : puces centrées, frise au survol, cartes en fond
  for (const width of [1440, 390]) {
    const p = await browser.newPage();
    await p.setViewport({ width, height: 900 });
    await p.goto(BASE, { waitUntil: "networkidle0" });
    const off = await p.$$eval("#fonctionnement .step", (steps) =>
      steps.map((st) => {
        const a = st.getBoundingClientRect(), b = st.querySelector(".step__num").getBoundingClientRect();
        return Math.abs(a.left + a.width / 2 - (b.left + b.width / 2));
      }));
    const aligns = await p.$$eval("#fonctionnement .step h3, #fonctionnement .step p", (els) => [...new Set(els.map((e) => getComputedStyle(e).textAlign))]);
    const want = width < 768 ? "center" : "start";
    aligns.length === 1 && (aligns[0] === want || (want === "start" && aligns[0] === "left")) ? ok(`textes des étapes : alignement ${want} @${width}px`) : fail(`textes des étapes @${width}px : alignement ${aligns} au lieu de ${want} (centré sur mobile seulement)`);
    off.every((d) => d <= 1) ? ok(`puces 1, 2, 3 centrées @${width}px`) : fail(`puces non centrées @${width}px (écarts ${off.map((d) => d.toFixed(1)).join(", ")} px)`);
    const maps = await p.evaluate(() => ["#avant-apres", "#regles"].map((id) => {
      const el = document.querySelector(id), cs = getComputedStyle(el, "::before");
      return { id, img: cs.backgroundImage, op: cs.pointerEvents, pos: getComputedStyle(el).position };
    }));
    for (const m of maps) /url\(/.test(m.img) && m.op === "none" && m.pos === "relative" ? ok(`carte en fond ${m.id} @${width}px`) : fail(`carte en fond absente ou interactive ${m.id} @${width}px`);
    await p.close();
  }
  for (const width of [1440, 390]) {
    const p = await browser.newPage();
    await p.setViewport({ width, height: 900 });
    await p.goto(BASE, { waitUntil: "networkidle0" });
    const off = await p.$$eval("#integrations .integ li", (items) =>
      items.map((li) => {
        const a = li.getBoundingClientRect(), b = li.querySelector(".integ__icon").getBoundingClientRect();
        return Math.abs(a.left + a.width / 2 - (b.left + b.width / 2));
      }));
    off.length === 5 && off.every((d) => d <= 1) ? ok(`5 pictos d'intégrations centrés sur leur paragraphe @${width}px`) : fail(`pictos d'intégrations non centrés @${width}px (écarts ${off.map((d) => d.toFixed(1)).join(", ")} px)`);
    await p.close();
  }
  for (const width of [1440, 820]) {
    const p = await browser.newPage();
    await p.setViewport({ width, height: 900 });
    await p.goto(BASE, { waitUntil: "networkidle0" });
    await p.$eval("#deploiement", (el) => el.scrollIntoView({ behavior: "instant" }));
    const sizes = () => p.$$eval("#deploiement .frise__step .frise__mark", (ms) => ms.map((m) => Math.round(m.getBoundingClientRect().width)));
    await new Promise((r) => setTimeout(r, 400));
    let s0 = await sizes();
    s0[0] > s0[1] && s0.slice(1).every((w) => w === s0[1]) ? ok(`frise @${width}px : cercle corail sur l'étape 1 au repos`) : fail(`frise @${width}px au repos : ${s0}`);
    await p.$eval("#deploiement .frise__step:nth-child(4)", (el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await new Promise((r) => setTimeout(r, 300));
    const c = await p.$eval("#deploiement .frise__step:nth-child(4)", (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await p.mouse.move(c.x, c.y);
    await new Promise((r) => setTimeout(r, 600));
    const s1 = await sizes();
    s1[2] > s1[0] && s1[2] > s1[1] && s1[0] === s1[1] ? ok(`frise @${width}px : le cercle suit l'étape survolée`) : fail(`frise @${width}px au survol de l'étape 3 : ${s1}`);
    await p.mouse.move(2, 2);
    await new Promise((r) => setTimeout(r, 600));
    const s2 = await sizes();
    s2[0] > s2[1] ? ok(`frise @${width}px : retour sur l'étape 1 après le survol`) : fail(`frise @${width}px après survol : ${s2}`);
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
