import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

let dom, d, form, mod;

beforeEach(async () => {
  dom = new JSDOM(readFileSync("dist/index.html", "utf8"));
  d = dom.window.document;
  Object.assign(globalThis, { document: d, window: dom.window, HTMLElement: dom.window.HTMLElement, Event: dom.window.Event });
  mod = await import(`../src/scripts/form.ts?${Math.random()}`);
  form = d.querySelector("form[name=demo]");
  mod.initForm(form);
});

const $ = (name) => form.querySelector(`[name="${name}"]`);
const err = (name) => d.getElementById(`err-${name}`).textContent;
const fill = (v) => { for (const [k, val] of Object.entries(v)) $(k).value = val; };
const VALID = { prenom: "Jeanne", nom: "Martin", fonction: "Président", structure: "ADOPS de la Somme", email: "jeanne@adops80.fr" };
const submit = () => { const e = new dom.window.Event("submit", { cancelable: true, bubbles: true }); form.dispatchEvent(e); return e; };

test("prénom et nom : deux champs obligatoires distincts, refusés vides", () => {
  assert.ok($("prenom"), "champ prenom");
  assert.equal($("prenom").getAttribute("autocomplete"), "given-name");
  assert.equal($("nom").getAttribute("autocomplete"), "family-name");
  assert.equal(mod.messageFor($("prenom")), "Merci de renseigner ce champ.");
  fill({ ...VALID, prenom: "" });
  const e = submit();
  assert.equal(e.defaultPrevented, true);
  assert.equal(err("prenom"), "Merci de renseigner ce champ.");
  assert.equal(err("nom"), "");
  assert.equal(d.activeElement, $("prenom"));
});

test("messageFor : champ texte vide, liste vide, e-mail invalide", () => {
  assert.equal(mod.messageFor($("nom")), "Merci de renseigner ce champ.");
  assert.equal(mod.messageFor($("fonction")), "Merci de faire un choix.");
  fill({ email: "abc" });
  assert.equal(mod.messageFor($("email")), "Cette adresse e-mail ne semble pas valide.");
  fill({ email: "a@b.fr" });
  assert.equal(mod.messageFor($("email")), "");
});

test("envoi vide : bloqué, 5 messages, focus sur le premier champ en erreur", () => {
  const e = submit();
  assert.equal(e.defaultPrevented, true);
  assert.equal(err("prenom"), "Merci de renseigner ce champ.");
  assert.equal(err("nom"), "Merci de renseigner ce champ.");
  assert.equal(err("fonction"), "Merci de faire un choix.");
  assert.equal(err("structure"), "Merci de renseigner ce champ.");
  assert.equal(err("email"), "Merci de renseigner ce champ.");
  assert.equal(err("telephone"), "");
  assert.equal($("prenom").getAttribute("aria-invalid"), "true");
  assert.equal(d.activeElement, $("prenom"));
});

test("e-mail invalide : seul ce champ est refusé, pas d'envoi", () => {
  fill({ ...VALID, email: "abc" });
  const e = submit();
  assert.equal(e.defaultPrevented, true);
  assert.equal(err("email"), "Cette adresse e-mail ne semble pas valide.");
  assert.equal(err("nom"), "");
  assert.equal(d.activeElement, $("email"));
});

test("formulaire valide : envoi laissé au navigateur (non bloqué), aucune erreur", () => {
  fill(VALID);
  const e = submit();
  assert.equal(e.defaultPrevented, false);
  for (const n of ["prenom", "nom", "fonction", "structure", "email"]) assert.equal(err(n), "");
});

test("champ obligatoire rempli d'espaces : traité comme vide, envoi bloqué", () => {
  fill({ ...VALID, nom: "   ", structure: "\t " });
  assert.equal(mod.messageFor($("nom")), "Merci de renseigner ce champ.");
  const e = submit();
  assert.equal(e.defaultPrevented, true);
  assert.equal(err("nom"), "Merci de renseigner ce champ.");
  assert.equal(err("structure"), "Merci de renseigner ce champ.");
  assert.equal(err("email"), "");
});

test("e-mail sans point dans le domaine (a@b) : refusé, a@b.fr accepté", () => {
  fill({ ...VALID, email: "jean@adops80" });
  assert.equal(mod.messageFor($("email")), "Cette adresse e-mail ne semble pas valide.");
  assert.equal(submit().defaultPrevented, true);
  assert.equal(err("email"), "Cette adresse e-mail ne semble pas valide.");
  fill({ email: "jean@adops80.fr" });
  assert.equal(mod.messageFor($("email")), "");
});

test("l'attribut pattern de l'e-mail est dans le HTML (actif aussi sans JavaScript)", () => {
  assert.ok($("email").getAttribute("pattern"));
});

test("honeypot rempli : aucun envoi", () => {
  fill(VALID);
  $("bot-field").value = "spam";
  assert.equal(submit().defaultPrevented, true);
});

test("corriger un champ en erreur efface son message", () => {
  submit();
  fill({ nom: "Jeanne" });
  $("nom").dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(err("nom"), "");
  assert.equal($("nom").hasAttribute("aria-invalid"), false);
});

test("novalidate ajouté par le script (validation native conservée sans JavaScript)", () => {
  assert.equal(form.noValidate, true);
  assert.equal(readFileSync("dist/index.html", "utf8").includes("novalidate"), false);
});
