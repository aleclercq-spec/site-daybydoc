/** Accordéon des profils (mobile) : un seul panneau ouvert, le premier au chargement. */
export function initProfils(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".prof-acc__btn"));
  const panelOf = (b: HTMLButtonElement) => document.getElementById(b.getAttribute("aria-controls")!);
  for (const b of buttons) {
    const expanded = b.getAttribute("aria-expanded") === "true";
    const panel = panelOf(b);
    if (panel) panel.hidden = !expanded;
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      for (const other of buttons) {
        const isThis = other === b;
        other.setAttribute("aria-expanded", String(isThis && open));
        const p = panelOf(other);
        if (p) p.hidden = !(isThis && open);
      }
    });
  }
}
