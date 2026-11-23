import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const HTML = `<div class="video" data-vimeo="1202756436" data-title="Témoignage de l'ADOPS59">
  <img src="/v.jpg" alt="x"><a class="video__play" href="https://vimeo.com/1202756436" aria-label="Lire la vidéo"><svg></svg></a>
  <span>Vidéo sous-titrée</span></div>`;

async function setup() {
  const dom = new JSDOM(`<body>${HTML}</body>`);
  globalThis.document = dom.window.document;
  const { initVideo } = await import(`../src/scripts/video.ts?${Math.random()}`);
  initVideo();
  return dom;
}

test("avant le clic : aucun iframe, le lien de repli devient un vrai bouton", async () => {
  const dom = await setup();
  const d = dom.window.document;
  assert.equal(d.querySelectorAll("iframe").length, 0);
  assert.equal(d.querySelectorAll("a.video__play").length, 0);
  const btn = d.querySelector("button.video__play");
  assert.equal(btn.getAttribute("type"), "button");
  assert.equal(btn.getAttribute("aria-label"), "Lire la vidéo");
});

test("au clic : iframe Vimeo avec dnt=1 et autoplay, thumbnail retirée", async () => {
  const dom = await setup();
  const d = dom.window.document;
  d.querySelector("button.video__play").click();
  const f = d.querySelector("iframe");
  assert.equal(f.getAttribute("src"), "https://player.vimeo.com/video/1202756436?dnt=1&autoplay=1");
  assert.equal(f.getAttribute("title"), "Témoignage de l'ADOPS59");
  assert.match(f.getAttribute("allow"), /autoplay/);
  assert.equal(d.querySelectorAll("img").length, 0);
});
