import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

async function setup({ reduce }) {
  const dom = new JSDOM(`<body><div data-reveal id="a"></div><div data-reveal id="b"></div></body>`);
  const observers = [];
  class IO {
    constructor(cb) { this.cb = cb; this.watched = new Set(); observers.push(this); }
    observe(el) { this.watched.add(el); }
    unobserve(el) { this.watched.delete(el); }
    disconnect() {}
  }
  Object.assign(globalThis, { document: dom.window.document, IntersectionObserver: IO,
    window: Object.assign(dom.window, { matchMedia: () => ({ matches: reduce }) }) });
  const { initReveal } = await import(`../src/scripts/reveal.ts?${Math.random()}`);
  initReveal();
  return { dom, observers };
}

test("mouvement autorisé : un élément qui entre dans l'écran reçoit is-visible", async () => {
  const { dom, observers } = await setup({ reduce: false });
  const a = dom.window.document.getElementById("a");
  observers[0].cb([{ target: a, isIntersecting: true }]);
  assert.ok(a.classList.contains("is-visible"));
  assert.equal(observers[0].watched.has(a), false);
  assert.equal(dom.window.document.getElementById("b").classList.contains("is-visible"), false);
});

test("prefers-reduced-motion : aucun observateur, contenu laissé visible", async () => {
  const { observers } = await setup({ reduce: true });
  assert.equal(observers.length, 0);
});
