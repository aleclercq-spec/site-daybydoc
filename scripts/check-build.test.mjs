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
