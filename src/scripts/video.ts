/**
 * Témoignage Vimeo : la vignette locale s'affiche d'abord, le lecteur n'est chargé qu'au clic
 * (paramètre dnt=1, aucun cookie de suivi). Sans JavaScript, un lien vers Vimeo sert de repli.
 */
export function initVideo(): void {
  document.querySelectorAll<HTMLElement>(".video[data-vimeo]").forEach((box) => {
    const link = box.querySelector<HTMLAnchorElement>("a.video__play");
    if (!link) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = link.className;
    button.setAttribute("aria-label", link.getAttribute("aria-label") ?? "");
    button.innerHTML = link.innerHTML;
    link.replaceWith(button);
    button.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.className = "video__frame";
      iframe.src = `https://player.vimeo.com/video/${box.dataset.vimeo}?dnt=1&autoplay=1`;
      iframe.title = box.dataset.title ?? "Vidéo";
      iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      box.replaceChildren(iframe);
      iframe.focus();
    });
  });
}
