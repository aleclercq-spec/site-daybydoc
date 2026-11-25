import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import * as cheerio from "cheerio";

const TITLE = "DaybyDoc - Planning des gardes ADOPS et maisons médicales";
const DESCRIPTION =
  "Planning des gardes pour ADOPS, maisons médicales et associations de régulation : répartition automatique selon vos règles, échanges et gardes vacantes.";
const ALLOWED_ABSOLUTE = [
  "https://dbyd.fr",
  "https://9tq.fr",
  "https://www.daybydoc.fr",
  "https://vimeo.com/1202756436",
  "mailto:contact@daybydoc.fr",
];

const load = (file) => cheerio.load(readFileSync(`dist/${file}`, "utf8"));
const home = () => load("index.html");

test("pages et fichiers de sortie présents", () => {
  for (const f of [
    "index.html", "merci.html", "mentions-legales.html", "confidentialite.html",
    "404.html", "sitemap-index.xml", "robots.txt", "_redirects", "og-image.png",
  ]) assert.ok(existsSync(`dist/${f}`), `dist/${f} manquant`);
});

test("accueil : html lang=fr, title, description, canonical", () => {
  const $ = home();
  assert.equal($("html").attr("lang"), "fr");
  assert.equal($("title").text(), TITLE);
  assert.equal($('meta[name="description"]').attr("content"), DESCRIPTION);
  assert.equal($('link[rel="canonical"]').attr("href"), "https://www.daybydoc.fr/");
});

test("accueil : un seul h1", () => {
  assert.equal(home()("h1").length, 1);
});

test("accueil : aucune ressource Google Fonts", () => {
  const html = readFileSync("dist/index.html", "utf8");
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html));
});

test("accueil : toute URL absolue est autorisée", () => {
  const $ = home();
  const bad = [];
  $("[src],[href],[action]").each((_, el) => {
    for (const attr of ["src", "href", "action"]) {
      const v = $(el).attr(attr);
      if (v && /^(https?:|mailto:|\/\/)/.test(v) &&
          !ALLOWED_ABSOLUTE.some((a) => v === a || v.startsWith(a + "/") || v.startsWith(a + "?")))
        bad.push(`${el.tagName} ${attr}=${v}`);
    }
  });
  assert.deepEqual(bad, []);
});

test("accueil : chaque ancre #x a un id correspondant", () => {
  const $ = home();
  const missing = [];
  $('a[href^="#"]').each((_, a) => {
    const id = $(a).attr("href").slice(1);
    if (id && !$(`[id="${id}"]`).length) missing.push(id);
  });
  assert.deepEqual([...new Set(missing)], []);
});

test("formulaire de démo : attributs Netlify et champs obligatoires", () => {
  const $ = home();
  const f = $("form[name=demo]");
  assert.equal(f.length, 1);
  assert.equal(f.attr("data-netlify"), "true");
  assert.equal(f.attr("method")?.toUpperCase(), "POST");
  assert.equal(f.attr("action"), "/merci");
  assert.equal(f.attr("netlify-honeypot"), "bot-field");
  assert.equal(f.find('input[name="form-name"]').attr("value"), "demo");
  assert.equal(f.find('[name="bot-field"]').length, 1);
  for (const n of ["prenom", "nom", "fonction", "structure", "email"])
    assert.ok(f.find(`[name="${n}"][required]`).length, `${n} doit être required`);
  for (const n of ["telephone", "nombre-medecins", "message"])
    assert.equal(f.find(`[name="${n}"][required]`).length, 0, `${n} ne doit pas être required`);
});

test("accueil : chaque image a alt, width, height", () => {
  const $ = home();
  const bad = [];
  $("img").each((_, el) => {
    const i = $(el);
    if (i.attr("alt") === undefined || !i.attr("width") || !i.attr("height"))
      bad.push(i.attr("src"));
  });
  assert.deepEqual(bad, []);
});

test("merci et 404 sont en noindex", () => {
  for (const f of ["merci.html", "404.html"])
    assert.match(load(f)('meta[name="robots"]').attr("content") ?? "", /noindex/);
});

test("polices : 4 woff2 locaux, 400 et 500 préchargés, font-display swap", () => {
  for (const w of [400, 500, 600, 700])
    assert.ok(existsSync(`dist/fonts/poppins-${w}.woff2`), `poppins-${w}.woff2 manquant`);
  const $ = home();
  const pre = $('link[rel="preload"][as="font"]').map((_, e) => $(e).attr("href")).get();
  assert.deepEqual(pre.sort(), ["/fonts/poppins-400.woff2", "/fonts/poppins-500.woff2"]);
  const css = readFileSync("src/styles/fonts.css", "utf8");
  assert.equal((css.match(/font-display:\s*swap/g) ?? []).length, 4);
});

test("accueil : balises Open Graph et JSON-LD Organization + SoftwareApplication", () => {
  const $ = home();
  assert.equal($('meta[property="og:image"]').attr("content"), "https://www.daybydoc.fr/og-image.png");
  assert.equal($('meta[property="og:title"]').attr("content"), TITLE);
  const types = $('script[type="application/ld+json"]').map((_, e) => JSON.parse($(e).text())["@type"]).get();
  assert.deepEqual(types.sort(), ["Organization", "SoftwareApplication"]);
});

test("en-tête : logo, 5 ancres, Se connecter, CTA démo, burger accessible", () => {
  const $ = home();
  const h = $("header");
  assert.equal(h.length, 1);
  assert.equal(h.find('a[aria-label="DaybyDoc, accueil"] img[alt="DaybyDoc"]').length, 1);
  const nav = h.find('nav[aria-label="Sections de la page"] a').map((_, a) => [[$(a).attr("href"), $(a).text().trim()]]).get();
  assert.deepEqual(nav, [
    ["#fonctionnement", "Comment ça marche"], ["#regles", "Vos règles"], ["#profils", "Profils"],
    ["#temoignage", "Témoignage"], ["#faq", "FAQ"],
  ]);
  assert.equal(h.find('a[href="https://dbyd.fr"]').text().trim(), "Se connecter");
  assert.equal(h.find('a[href="#demo"]').text().trim(), "Demander une démo");
  const b = h.find("button.burger");
  assert.equal(b.attr("aria-label"), "Ouvrir le menu");
  assert.equal(b.attr("aria-expanded"), "false");
  assert.ok($(`#${b.attr("aria-controls")}`).length, "aria-controls doit viser un élément existant");
});

test("pied de page : logo blanc, liens, contact, mention 9troisquarts", () => {
  const $ = home();
  const f = $("footer");
  assert.equal(f.find('img[alt="DaybyDoc"]').length, 1);
  assert.equal(f.find('a[href="/mentions-legales"]').text().trim(), "Mentions légales");
  assert.equal(f.find('a[href="/confidentialite"]').text().trim(), "Politique de confidentialité");
  assert.equal(f.find('a[href="https://dbyd.fr"]').text().trim(), "Se connecter");
  assert.equal(f.find('a[href="#demo"]').text().trim(), "Demander une démo");
  assert.equal(f.find('a[href="mailto:contact@daybydoc.fr"]').length, 1);
  assert.equal(f.find('a[href="mailto:contact@daybydoc.fr"]').text(), "contact@daybydoc.fr");
  assert.match(f.text(), /Conçu et maintenu par 9troisquarts\./);
  assert.match(f.text(), /Le planning des gardes pour les ADOPS, maisons médicales et associations de régulation\./);
});

test("barre CTA mobile : lien vers #demo", () => {
  assert.equal(home()('.sticky-cta a[href="#demo"]').text().trim(), "Demander une démo");
});

test("hero : titre, surtitre, sous-titre, CTA corail, ordinateur prioritaire", () => {
  const $ = home();
  const hero = $("section#hero");
  assert.equal(hero.attr("aria-labelledby"), "hero-titre");
  assert.equal($("h1#hero-titre").text().replace(/\s+/g, " ").trim(), "Vos gardes médicales, réparties en un clic, selon vos règles");
  assert.equal($("h1 strong").text(), "vos règles");
  assert.equal(hero.find(".hero__eyebrow").text().trim(), "Logiciel de planning des gardes pour les ADOPS, maisons médicales et associations de régulation");
  assert.equal(hero.find(".hero__lead").text().trim(), "DaybyDoc se paramètre selon les règles de votre ADOPS, répartit les gardes automatiquement, gère échanges et gardes vacantes, et transmet le planning à Ordigard.");
  assert.equal(hero.find('a.btn.btn--coral[href="#demo"]').text().trim(), "Demander une démo");
  assert.equal(hero.find('a[href="#temoignage"]').text().trim(), "Voir le témoignage de l'ADOPS59");
  const img = hero.find('.hero__laptop img[alt="Planning mensuel des gardes dans DaybyDoc, sur ordinateur"]');
  assert.equal(img.length, 1);
  assert.equal(img.attr("loading"), "eager");
  assert.equal(img.attr("fetchpriority"), "high");
});

test("hero : carte des secteurs en SVG inline décoratif, pastille de régulation présente", () => {
  const hero = home()("section#hero");
  const map = hero.find('.hero__map[aria-hidden="true"]');
  assert.equal(map.length, 1);
  assert.equal(map.find("svg").length, 1);
  assert.equal(map.find("img").length, 0);
  assert.equal(map.find('circle[cx="380.3"][cy="284.4"][r="28"]').length, 1);
  assert.ok(!/carte-secteurs/.test(hero.html()), "la carte est inline, pas référencée par fichier");
});

test("hero : téléphone supprimé, trois notifications", () => {
  const $ = home();
  const hero = $("section#hero");
  assert.equal(hero.find('img[alt*="vue mobile"]').length, 0);
  assert.equal(hero.find(".hero__phone").length, 0);
  assert.deepEqual(hero.find(".hero__notif-title").map((_, e) => $(e).text()).get().sort(),
    ["Garde vacante pourvue", "Régulation · Nuit du samedi", "Échange accepté"].sort());
});

test("hero : bandeau des activités", () => {
  const $ = home();
  const band = $('section#hero ul[aria-label="Les activités gérées"]');
  assert.equal(band.length, 1);
  assert.deepEqual(band.find("li p").map((_, e) => $(e).text()).get(),
    ["Régulation", "Gardes de secteur", "Maisons médicales de garde", "Médecins mobiles"]);
  assert.equal(band.find('li [aria-hidden="true"] svg').length, 4);
});

test("preuves : deux articles ADOPS85 et ADOPS59 avec leurs chiffres", () => {
  const $ = home();
  const s = $("section#preuves");
  assert.equal(s.find("h2").length, 1);
  assert.deepEqual(s.find("article h3").map((_, e) => $(e).text()).get(), ["ADOPS85 - Vendée", "ADOPS59 - Nord"]);
  assert.deepEqual(s.find("article .stat__num").map((_, e) => $(e).text()).get(), ["+500", "11", "3", "50", "3"]);
});

test("avant/après : tableau ARIA de 6 lignes, 2 colonnes", () => {
  const $ = home();
  const t = $('section#avant-apres [role="table"]');
  assert.equal(t.length, 1);
  assert.deepEqual(t.find('[role="columnheader"]').map((_, e) => $(e).text().replace(/\s+/g, " ").trim()).get(), ["Avant", "Avec"]);
  assert.equal(t.find('[role="row"]').length, 7);
  assert.equal(t.find('[role="cell"]').length, 12);
  assert.equal(t.find('[role="columnheader"] img[alt="DaybyDoc"]').length, 1);
});

test("comment ça marche : 3 étapes numérotées avec capture", () => {
  const $ = home();
  const s = $("section#fonctionnement");
  assert.equal(s.find("h2").text(), "Un fonctionnement simple, pensé pour vous simplifier la vie");
  assert.deepEqual(s.find("ol > li h3").map((_, e) => $(e).text()).get(), [
    "Les médecins posent leurs indisponibilités.", "DaybyDoc répartit les gardes.", "La garde vit sans vous solliciter.",
  ]);
  assert.equal(s.find("ol > li img").length, 3);
});

test("comment ça marche : dans chaque étape, puce, titre, capture, puis paragraphe", () => {
  const $ = home();
  const items = $("section#fonctionnement ol > li");
  assert.equal(items.length, 3);
  items.each((_, li) => {
    const order = $(li).children().map((_, c) => (c.name === "div" ? ($(c).hasClass("step__head") ? "puce" : $(c).hasClass("step__shot") ? "capture" : "?") : c.name)).get();
    assert.deepEqual(order, ["puce", "h3", "capture", "p"]);
  });
});

test("fonds en carte : avant/après et vos règles, décoratifs (CSS), fichier présent dans la sortie", () => {
  const $ = home();
  for (const id of ["avant-apres", "regles"]) {
    const s = $(`section#${id}`);
    assert.ok(s.hasClass("has-map"), `${id} : classe has-map`);
    const m = /--map:\s*url\("(\/_astro\/[^"]+\.svg)"\)/.exec(s.attr("style") ?? "");
    assert.ok(m, `${id} : variable --map vers un SVG local`);
    assert.ok(existsSync(`dist${m[1]}`), `${id} : ${m[1]} absent de dist`);
    assert.equal(s.find("svg, img[src*='carte']").filter((_, e) => /carte/.test($(e).attr("src") ?? "")).length, 0, `${id} : la carte n'est pas dans le HTML`);
  }
  const css = readdirSync("dist/_astro").filter((f) => f.endsWith(".css")).map((f) => readFileSync(`dist/_astro/${f}`, "utf8")).join("");
  assert.match(css, /\.has-map::?before/, "règle .has-map::before");
  assert.match(css, /pointer-events:\s*none/, "carte sans interaction");
});

test("vos règles : 4 cartes, capture, phrase de clôture", () => {
  const $ = home();
  const s = $("section#regles");
  assert.deepEqual(s.find(".card h3").map((_, e) => $(e).text()).get(), [
    "Vos plannings", "Vos créneaux", "Votre règlement intérieur", "Votre algorithme",
  ]);
  assert.equal(s.find('img[alt^="Détail d\'une garde"]').length, 1);
  assert.match(s.text(), /Et si une règle manque, notre équipe fait évoluer DaybyDoc avec vous\./);
});

test("profils : 3 blocs desktop et accordéon mobile (premier ouvert)", () => {
  const $ = home();
  const s = $("section#profils");
  assert.deepEqual(s.find(".prof-row h3").map((_, e) => $(e).text()).get(), [
    "Les médecins gardent la main sur leurs gardes",
    "Le bureau pilote, sans courir après personne",
    "Le secrétariat suit tout, sans ressaisie",
  ]);
  const btns = s.find("button[aria-expanded]");
  assert.deepEqual(btns.map((_, e) => $(e).text().trim()).get(), ["Le bureau et la coordination", "Le secrétariat", "Les médecins"]);
  assert.deepEqual(btns.map((_, e) => $(e).attr("aria-expanded")).get(), ["true", "false", "false"]);
  btns.each((_, b) => assert.ok($(`#${$(b).attr("aria-controls")}`).length, "aria-controls valide"));
  assert.equal(s.find(".prof-row li").length, 12);
});

test("intégrations : 5 éléments", () => {
  const $ = home();
  assert.deepEqual($("section#integrations li h3").map((_, e) => $(e).text()).get(), [
    "Ordigard", "Connexion par e-CPS", "Agendas personnels", "Traçabilité", "Données protégées",
  ]);
});

test("témoignage : vignette locale, lien Vimeo de repli, aucun iframe au chargement", () => {
  const $ = home();
  const s = $("section#temoignage");
  assert.equal(s.find("h2").text(), "Ce qu'en dit l'ADOPS59");
  assert.equal(s.find("iframe").length, 0);
  const v = s.find(".video");
  assert.equal(v.attr("data-vimeo"), "1202756436");
  assert.equal(v.find('a.video__play[href="https://vimeo.com/1202756436"]').attr("aria-label"), "Lire la vidéo du témoignage de l'ADOPS59");
  assert.equal(v.find('img[alt^="Nicolas Ryckewaert"]').length, 1);
  assert.match(v.text(), /Vidéo sous-titrée/);
  assert.match(s.find("blockquote").text(), /On a eu affaire à des gens qui savent de quoi ils parlent\./);
});

test("équipe : lien 9troisquarts, photo et logo", () => {
  const $ = home();
  const s = $("section#equipe");
  assert.equal(s.find('a[href="https://9tq.fr"]').text().trim(), "Découvrir 9troisquarts");
  assert.equal(s.find('img[alt="L\'équipe 9troisquarts au travail dans ses locaux"]').length, 1);
  assert.equal(s.find('img[alt="9troisquarts"]').length, 1);
});

test("déploiement : 5 étapes et CTA", () => {
  const $ = home();
  const s = $("section#deploiement");
  assert.deepEqual(s.find("ol > li h3").map((_, e) => $(e).text()).get(), ["Atelier de cadrage", "Paramétrage", "Formation", "Lancement", "Suivi"]);
  assert.equal(s.find('a.btn[href="#demo"]').text().trim(), "Demander une démo");
});

const QUESTIONS = [
  "Notre ADOPS fonctionne différemment des autres. DaybyDoc peut-il s'adapter ?",
  "La répartition est-elle vraiment équitable ?",
  "Nos médecins sont-ils à l'aise avec ce type d'outil ?",
  "DaybyDoc remplace-t-il Ordigard ?",
  "Combien de temps faut-il pour démarrer ?",
  "Que se passe-t-il si nous avons besoin d'une évolution ?",
  "Nous avons un besoin très particulier. Pouvez-vous le développer ?",
];

test("faq : 7 questions, première ouverte, boutons reliés à leur panneau", () => {
  const $ = home();
  const s = $("section#faq");
  assert.equal(s.find("h2").text(), "Questions fréquentes");
  const btns = s.find("h3 > button[aria-expanded]");
  assert.deepEqual(btns.map((_, e) => $(e).text().trim()).get(), QUESTIONS);
  assert.deepEqual(btns.map((_, e) => $(e).attr("aria-expanded")).get(), ["true", "false", "false", "false", "false", "false", "false"]);
  btns.each((_, b) => {
    const panel = $(`#${$(b).attr("aria-controls")}`);
    assert.equal(panel.length, 1);
    assert.equal(panel.attr("aria-labelledby"), $(b).attr("id"));
  });
});

test("faq : colonne gauche avec rassurances et contact", () => {
  const $ = home();
  const side = $("section#faq .faq__side");
  assert.equal(side.find("li p:first-child").map((_, e) => $(e).text()).get().join("|"),
    "Opérationnel en un à deux mois|Accompagné de bout en bout|Données protégées");
  assert.equal(side.find('a[href="mailto:contact@daybydoc.fr"]').text(), "contact@daybydoc.fr");
  assert.equal(side.find('a[href="#demo"]').text().trim(), "Demander une démo");
});

test("démo : champs étiquetés, zones d'erreur, options des listes, bouton submit", () => {
  const $ = home();
  const f = $("form[name=demo]");
  const fields = { prenom: "Prénom", nom: "Nom", fonction: "Fonction", structure: "Structure", email: "E-mail", telephone: "Téléphone", "nombre-medecins": "Nombre de médecins", message: "Message" };
  for (const [name, label] of Object.entries(fields)) {
    const el = f.find(`[name="${name}"]`);
    assert.equal(el.length, 1, name);
    const l = f.find(`label[for="${el.attr("id")}"]`);
    assert.equal(l.text().replace("*", "").trim(), label);
    assert.equal(f.find(`#err-${name}`).length, 1, `zone d'erreur de ${name}`);
    assert.equal(el.attr("aria-describedby"), `err-${name}`);
  }
  assert.equal(f.find('[name="email"]').attr("type"), "email");
  assert.deepEqual(f.find('select[name="fonction"] option').map((_, e) => $(e).text()).get(),
    ["Choisir", "Président", "Membre du bureau", "Coordinateur", "Secrétariat", "Médecin", "Autre"]);
  assert.deepEqual(f.find('select[name="nombre-medecins"] option').map((_, e) => $(e).text()).get(),
    ["Choisir", "Moins de 100", "100 à 300", "Plus de 300"]);
  assert.equal(f.find('button[type="submit"]').text().trim(), "Demander une démo");
  assert.equal(f.find('a[href="/confidentialite"]').text(), "politique de confidentialité");
  assert.equal($("section#demo h2").text(), "Voyons ensemble comment DaybyDoc s'adapte à votre ADOPS ou votre organisation");
});

test("animations : classe js posée en ligne, révélation masquée seulement après démarrage du script et si le mouvement est permis", async () => {
  const { readdirSync } = await import("node:fs");
  assert.match(readFileSync("dist/index.html", "utf8"), /classList\.add\(["']js["']\)/);
  const css = readdirSync("dist/_astro").filter((f) => f.endsWith(".css")).map((f) => readFileSync(`dist/_astro/${f}`, "utf8")).join("\n");
  assert.match(css, /prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*\.reveal-ready \[data-reveal\]/);
  assert.ok(!/(^|[}\s,])\[data-reveal\]\s*\{[^}]*opacity:\s*0/.test(css.replace(/\.reveal-ready \[data-reveal\]/g, "")), "[data-reveal] ne doit pas être masqué avant démarrage du script");
});

test("mentions légales : h1, sections, coordonnées, canonical", () => {
  const $ = load("mentions-legales.html");
  assert.equal($("h1").length, 1);
  assert.equal($("h1").text(), "Mentions légales");
  assert.deepEqual($("h2").map((_, e) => $(e).text()).get(), ["Éditeur du site", "Directeur de la publication", "Hébergement", "Propriété intellectuelle", "Crédits"]);
  assert.match($("main").text(), /RCS Lille 522 385 749/);
  assert.equal($('link[rel="canonical"]').attr("href"), "https://www.daybydoc.fr/mentions-legales");
  assert.equal($("title").text(), "Mentions légales - DaybyDoc");
});

test("confidentialité : h1, tableaux, date de mise à jour encore à renseigner", () => {
  const $ = load("confidentialite.html");
  assert.equal($("h1").text(), "Politique de confidentialité");
  assert.equal($("main table").length, 3);
  assert.match($("main").text(), /Dernière mise à jour : \[date de mise en ligne\]/);
  assert.equal($('link[rel="canonical"]').attr("href"), "https://www.daybydoc.fr/confidentialite");
});

test("merci et 404 : titre, retour accueil, ancres du menu absolues hors accueil", () => {
  const m = load("merci.html");
  assert.equal(m("h1").text(), "Merci, votre demande est bien envoyée");
  assert.equal(m('main a[href="/"]').text().trim(), "Retour à l'accueil");
  const n = load("404.html");
  assert.equal(n("h1").text(), "Page introuvable");
  assert.equal(n('main a[href="/"]').text().trim(), "Retour à l'accueil");
  assert.deepEqual(n('header nav[aria-label="Sections de la page"] a').map((_, a) => n(a).attr("href")).get(),
    ["/#fonctionnement", "/#regles", "/#profils", "/#temoignage", "/#faq"]);
});

test("sitemap : accueil et pages légales, sans merci ni 404", () => {
  const files = readFileSync("dist/sitemap-0.xml", "utf8");
  assert.match(files, /https:\/\/www\.daybydoc\.fr\/<\/loc>/);
  assert.match(files, /\/mentions-legales</);
  assert.match(files, /\/confidentialite</);
  assert.ok(!/\/merci</.test(files) && !/\/404</.test(files));
});

test("robots.txt et _redirects", () => {
  assert.equal(readFileSync("dist/robots.txt", "utf8").trim().split("\n").join("|"),
    "User-agent: *|Allow: /|Sitemap: https://www.daybydoc.fr/sitemap-index.xml");
  const r = readFileSync("dist/_redirects", "utf8");
  for (const from of ["/home", "/cart", "/search"]) assert.match(r, new RegExp(`^${from}\\s+/\\s+301$`, "m"));
});

test("image Open Graph : 1200x630, fond teal", async () => {
  const sharp = (await import("sharp")).default;
  const img = sharp("dist/og-image.png");
  const meta = await img.metadata();
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  const { data } = await img.extract({ left: 5, top: 5, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([...data].slice(0, 3), [0x10, 0x50, 0x64]);
});

test("netlify.toml : build, en-têtes de sécurité, CSP Vimeo, cache long sur fonts et _astro", () => {
  const t = readFileSync("netlify.toml", "utf8");
  assert.match(t, /command = "npm run build"/);
  assert.match(t, /publish = "dist"/);
  for (const h of ["X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options", "Content-Security-Policy"])
    assert.ok(t.includes(h), h);
  assert.match(t, /frame-src https:\/\/player\.vimeo\.com/);
  assert.match(t, /form-action 'self'/);
  for (const p of ["/fonts/*", "/_astro/*"]) {
    const block = t.split("[[headers]]").find((b) => b.includes(`for = "${p}"`));
    assert.ok(block && /max-age=31536000, immutable/.test(block), `cache immutable sur ${p}`);
  }
});

test("netlify.toml : version de Node imposée (Astro exige Node >= 22.23.4)", () => {
  const t = readFileSync("netlify.toml", "utf8");
  const m = t.match(/NODE_VERSION\s*=\s*"(\d+)/);
  assert.ok(m, "NODE_VERSION manquante dans [build.environment]");
  assert.ok(Number(m[1]) >= 22);
});
