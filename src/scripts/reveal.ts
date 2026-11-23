/** Apparition douce au défilement. Sans effet si l'utilisateur a demandé moins d'animations. */
export function initReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (!items.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  // Le masquage initial n'est appliqué qu'une fois l'observateur en place.
  document.documentElement.classList.add("reveal-ready");
  items.forEach((el) => observer.observe(el));
}
