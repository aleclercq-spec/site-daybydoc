import { initNav } from "./nav";

function start(): void {
  initNav();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
