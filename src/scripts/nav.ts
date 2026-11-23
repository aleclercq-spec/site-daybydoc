/** Menu replié (burger) et barre « Demander une démo » collante sur mobile. */
export function initNav(): void {
  const burger = document.querySelector<HTMLButtonElement>(".burger");
  const menu = document.getElementById("menu");
  if (burger && menu) {
    const set = (open: boolean) => {
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    };
    burger.addEventListener("click", () => set(burger.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("a")) set(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        set(false);
        burger.focus();
      }
    });
  }

  const cta = document.querySelector<HTMLElement>(".sticky-cta");
  const hero = document.getElementById("hero");
  const demo = document.getElementById("demo");
  if (cta && hero && demo && "IntersectionObserver" in window) {
    let heroVisible = true;
    let demoVisible = false;
    const update = () => { cta.hidden = heroVisible || demoVisible; };
    const watch = (el: Element, set: (v: boolean) => void) =>
      new IntersectionObserver(([entry]) => { set(entry.isIntersecting); update(); }).observe(el);
    watch(hero, (v) => (heroVisible = v));
    watch(demo, (v) => (demoVisible = v));
    update();
  }
}
