import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as cheerio from "cheerio";

const norm = (s) => s.replace(/\s+/g, " ").trim();
// Écarts volontaires entre maquette et site (voir docs/superpowers/specs).
export const KNOWN_DIFFS = new Set(["[adresse]@daybydoc"]);

/** Textes visibles d'une maquette .dc.html (contenu de <x-dc>, hors script/style/helmet). */
export function extractTexts(htmlPath) {
  const $ = cheerio.load(readFileSync(htmlPath, "utf8"));
  $("x-dc script, x-dc style, x-dc helmet").remove();
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
if (!existsSync(dir)) {
  test("kit/maquettes absent", { skip: "kit/ non présent" }, () => {});
} else {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".dc.html"))) {
    test(`textes de ${file} présents dans dist/index.html`, () => {
      const page = pageText();
      const missing = extractTexts(`${dir}/${file}`).filter(
        (t) => !KNOWN_DIFFS.has(t) && !page.includes(t),
      );
      assert.deepEqual(missing, [], `${missing.length} texte(s) manquant(s)`);
    });
  }
}
