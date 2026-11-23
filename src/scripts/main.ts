import { initNav } from "./nav";
import { initProfils } from "./profils";
import { initVideo } from "./video";
import { initFaq } from "./faq";

function start(): void {
  initNav();
  initProfils();
  initVideo();
  initFaq();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
