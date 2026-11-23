import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import * as cheerio from "cheerio";

const TITLE = "DaybyDoc - Planning des gardes ADOPS et maisons médicales";
const DESCRIPTION =
  "Planning des gardes pour ADOPS, maisons médicales et associations de régulation : répartition automatique selon vos règles, échanges et gardes vacantes.";
const ALLOWED_ABSOLUTE = [
  "https://dbyd.fr",
  "https://9tq.fr",
  "https://www.daybydoc.fr",
  "https://vimeo.com/1202756436",
  "mailto:contact@dbyd.fr",
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
  for (const n of ["nom", "fonction", "structure", "email"])
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
  assert.equal(f.find('a[href="mailto:contact@dbyd.fr"]').length, 1);
  assert.match(f.text(), /Conçu et maintenu par 9troisquarts\./);
  assert.match(f.text(), /Le planning des gardes pour les ADOPS, maisons médicales et associations de régulation\./);
});

test("barre CTA mobile : lien vers #demo", () => {
  assert.equal(home()('.sticky-cta a[href="#demo"]').text().trim(), "Demander une démo");
});

test("hero : h1 exact, image principale prioritaire, CTA et lien témoignage", () => {
  const $ = home();
  const hero = $("section#hero");
  assert.equal(hero.attr("aria-labelledby"), "hero-titre");
  assert.equal($("h1#hero-titre").text().replace(/\s+/g, " ").trim(), "Vos plannings, répartis automatiquement, selon vos règles");
  assert.equal($("h1 strong").text(), "vos règles");
  const img = hero.find('img[alt^="Planning mensuel des gardes"]');
  assert.equal(img.attr("loading"), "eager");
  assert.equal(img.attr("fetchpriority"), "high");
  assert.equal(hero.find('a[href="#demo"]').text().trim(), "Demander une démo");
  assert.equal(hero.find('a[href="#temoignage"]').text().trim(), "Voir le témoignage de l'ADOPS59");
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
  assert.equal(s.find("h2").text(), "Trois temps, une seule application");
  assert.deepEqual(s.find("ol > li h3").map((_, e) => $(e).text()).get(), [
    "Les médecins posent leurs indisponibilités.", "DaybyDoc répartit les gardes.", "La garde vit sans vous solliciter.",
  ]);
  assert.equal(s.find("ol > li img").length, 3);
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
