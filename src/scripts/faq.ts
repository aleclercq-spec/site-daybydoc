/** FAQ en accordéon : première question ouverte, une seule ouverte à la fois. */
export function initFaq(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".faq__btn"));
  for (const b of buttons) {
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      for (const other of buttons) other.setAttribute("aria-expanded", String(other === b && open));
    });
  }
}
