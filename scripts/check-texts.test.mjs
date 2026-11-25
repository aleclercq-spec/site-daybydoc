import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as cheerio from "cheerio";

const norm = (s) => s.replace(/\s+/g, " ").trim();
// Écarts volontaires entre maquette et site (voir docs/superpowers/specs).
// Retouches demandées après les maquettes (commentaires Claude Design du 2026-11-25, voir docs/decisions.md) :
// titre de « Comment ça marche », « Prénom » / « Nom » à la place de « Nom et prénom », contact@daybydoc.fr.
export const KNOWN_DIFFS = new Set([
  "[adresse]@daybydoc",
  "Trois temps, une seule application",
  "Nom et prénom",
  "contact@dbyd.fr",
]);

/** Textes visibles d'une maquette .dc.html (contenu de <x-dc>, hors script/style/helmet). */
export function extractTexts(htmlPath, { dropHero = false } = {}) {
  const $ = cheerio.load(readFileSync(htmlPath, "utf8"));
  $("x-dc script, x-dc style, x-dc helmet").remove();
  // Le hero des 6 planches d'origine est remplacé par celui de kit/daybydoc-hero (consigne du 24/11).
  if (dropHero) $('x-dc section[aria-labelledby="hero-titre"]').remove();
  const out = [];
  $("x-dc *").each((_, el) => {
    for (const n of el.children ?? []) {
      if (n.type !== "text") continue;
      const t = norm(n.data.replace(/\{\{[^}]*\}\}/g, ""));
      if (t.length >= 3) out.push(t);
    }
  });
  return [...new Set(out)];
}

const pageText = () => {
  const $ = cheerio.load(readFileSync("dist/index.html", "utf8"));
  $("script, style").remove();
  const parts = [];
  $("body *").each((_, el) => {
    for (const n of el.children ?? []) if (n.type === "text") parts.push(n.data);
  });
  return norm(parts.join(" "));
};

const dir = "kit/maquettes";
const HERO = "kit/daybydoc-hero/maquette/hero.dc.html";
if (!existsSync(dir)) {
  test("kit/maquettes absent", { skip: "kit/ non présent" }, () => {});
} else {
  const sources = readdirSync(dir).filter((f) => f.endsWith(".dc.html")).map((f) => [f, `${dir}/${f}`, true]);
  if (existsSync(HERO)) sources.push(["hero.dc.html (nouveau hero)", HERO, false]);
  for (const [name, path, dropHero] of sources) {
    test(`textes de ${name} présents dans dist/index.html`, () => {
      const page = pageText();
      const missing = extractTexts(path, { dropHero }).filter(
        (t) => !KNOWN_DIFFS.has(t) && !page.includes(t),
      );
      assert.deepEqual(missing, [], `${missing.length} texte(s) manquant(s)`);
    });
  }
}
