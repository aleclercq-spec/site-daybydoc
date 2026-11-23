import { initNav } from "./nav";
import { initProfils } from "./profils";

function start(): void {
  initNav();
  initProfils();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
