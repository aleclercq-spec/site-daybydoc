import { initNav } from "./nav";
import { initProfils } from "./profils";
import { initVideo } from "./video";
import { initFaq } from "./faq";
import { initForm } from "./form";
import { initReveal } from "./reveal";

function start(): void {
  initNav();
  initProfils();
  initVideo();
  initFaq();
  const form = document.querySelector<HTMLFormElement>("form[name=demo]");
  if (form) initForm(form);
  initReveal();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
