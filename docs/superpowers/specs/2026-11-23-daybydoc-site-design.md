# Site vitrine DaybyDoc V1 - conception

Source de vérité : `kit/BRIEF.md` et `kit/maquettes/` (la maquette fait foi, textes à l'identique).

## Intention
Obtenir des demandes de démo d'ADOPS et de structures de permanence des soins. Site statique, rapide, sans cookie ni service tiers au chargement.

## Objectifs
- Pages : `/`, `/merci`, `/mentions-legales`, `/confidentialite`, `/404`.
- Fidélité aux maquettes (6 planches, 390 px et 1440 px) et comportement propre en tablette.
- Lighthouse mobile >= 90 partout, contrastes AA, clavier complet, zones cliquables >= 44 px.
- Formulaire Netlify Forms (honeypot, validation navigateur en français, redirection `/merci`).

## Non-objectifs / anti-objectifs
- Aucun framework JS lourd, base de données, cookie, mesure d'audience, bandeau de consentement.
- Aucune reformulation des textes. Pas de Google Fonts.
- Corail jamais en texte ni en fond de bouton.

## Décisions validées
- **Boutons :** teal sur fond clair, blanc (texte teal) sur fond teal (option « Teal » de la maquette).
- **Mobile / ordinateur :** on suit la maquette de chaque format (Profils en accordéon sur mobile, ordre bureau / secrétariat / médecins, sans intro ni bille sur le h2 ; bloc gauche de la FAQ masqué sur mobile). Tablette déduite (768-1100 px).
- **Dépôt :** Astro à la racine, kit déplacé dans `kit/` (non versionné). Remote : `git@github.com:9troisquarts/daybydoc-site.git`.

## Approche
Astro statique, CSS natif à partir des tokens, scripts `src/scripts/*` minimaux. Images via `astro:assets` (WebP/AVIF). Polices : `@fontsource/poppins` latin, graisses 400/500/600/700 copiées dans `public/fonts`, préchargées, `font-display: swap`. Alternative écartée : Tailwind / framework d'îles (poids inutile pour un site de 5 pages).

## Structure
`src/{assets,styles,layouts,components(ui,sections),content,scripts,pages}`, `public/{_redirects,robots.txt,og-image.png,favicon.svg,fonts}`, `netlify.toml`, `astro.config.mjs` (site `https://www.daybydoc.fr`, sitemap).

## Comportements
En-tête fixe + ancres (`scroll-margin-top`, défilement doux, « Se connecter » -> https://dbyd.fr) ; FAQ accordéon (1re ouverte, une seule, `aria-expanded`, colonne gauche sticky desktop) ; vidéo Vimeo 1202756436 : vignette locale, iframe injectée au clic avec `dnt=1` ; barre CTA collante mobile après le hero ; reveal au scroll désactivé si `prefers-reduced-motion`.

## Écarts du kit traités
Champs de formulaire sans `name`/`value` et bouton `type="button"` (corrigés) ; contact du pied `[adresse]@daybydoc` -> contact@dbyd.fr ; liens `#` à brancher ; SVG de `logos/` utilisés (différent de `assets/`) ; date de la confidentialité à renseigner au lancement ; `/merci` et `/404` sans maquette (style du site, `noindex`).

## Laissé au réalisateur
Découpage fin des composants, noms de classes, breakpoints exacts de la tablette, génération de l'image Open Graph (script sharp).

## Vérifications
Script de comparaison des textes maquettes/build ; rendu à 390/768/1024/1440 px ; zéro requête tierce et zéro cookie avant clic vidéo ; Lighthouse mobile ; clavier et contrastes ; recette du brief.

## Hors périmètre agent
Création du dépôt GitHub distant (déjà fourni), réglage Netlify (e-mail de notification, domaine), DNS OVH, résiliation Squarespace.
