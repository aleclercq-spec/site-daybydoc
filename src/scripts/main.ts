import { initNav } from "./nav";
import { initProfils } from "./profils";
import { initVideo } from "./video";

function start(): void {
  initNav();
  initProfils();
  initVideo();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
