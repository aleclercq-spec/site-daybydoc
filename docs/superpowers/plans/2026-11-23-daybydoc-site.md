# Site vitrine DaybyDoc V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire et déployer le site statique DaybyDoc (5 pages) fidèle aux maquettes, avec formulaire de démo Netlify.

**Architecture:** Astro statique, un composant par section de la page d'accueil, CSS natif sur tokens, scripts TypeScript minimaux dans `src/scripts/`. Qualité garantie par deux scripts de contrôle (`check:texts`, `check:build`) exécutés sur `dist/`.

**Tech Stack:** Astro (dernière stable), `@astrojs/sitemap`, `@fontsource/poppins`, `sharp`, `cheerio` (dev, scripts de contrôle), `node:test`, Lighthouse CLI.

**Spec:** `docs/superpowers/specs/2026-11-23-daybydoc-site-design.md` (et `kit/BRIEF.md`, `kit/maquettes/*.dc.html` comme référence de structure, styles, textes).

## Global Constraints

- Les textes des maquettes sont repris **à l'identique** (aucune reformulation, un seul tiret `-`, jamais de tiret long).
- Teal `#105064` principal ; corail `#F28C6F` uniquement en accent graphique (bille, puces, repères), jamais texte ni fond de bouton. Boutons : teal/texte blanc sur fond clair ; blanc/texte teal sur fond teal.
- Fonds alternés (mode « Alterné blanc / teal » des maquettes) : hero teal, preuves blanc, avant/après teal, comment ça marche blanc, règles teal, profils blanc, intégrations teal, témoignage blanc, équipe teal, déploiement blanc, FAQ teal, démo blanc (formulaire), pied de page `#082832`.
- Poppins en woff2 hébergé (400, 500, 600, 700, sous-ensemble latin), `font-display: swap`. Aucun Google Fonts.
- Logos : SVG de `kit/logos/` non modifiés (couleur sur clair, blanc sur teal).
- `<html lang="fr">`, un seul H1, H2 par section, canonical `https://www.daybydoc.fr/`.
- Title : `DaybyDoc - Planning des gardes ADOPS et maisons médicales`. Meta description : `Planning des gardes pour ADOPS, maisons médicales et associations de régulation : répartition automatique selon vos règles, échanges et gardes vacantes.`
- Aucun cookie, aucune ressource tierce au chargement (hors lecteur Vimeo après clic, `https://player.vimeo.com/video/1202756436?dnt=1&autoplay=1`).
- Zones cliquables >= 44 px, focus visible (anneau 3 px `rgba(129,165,189,0.5)`), contrastes AA, `prefers-reduced-motion` respecté.
- Breakpoints : mobile < 768 px (maquette mobile 390), tablette 768-1100 px (déduite), ordinateur >= 1100 px (maquette 1440, contenu max 1200 px).
- Liens : « Se connecter » -> `https://dbyd.fr` ; 9troisquarts -> `https://9tq.fr` ; contact -> `contact@dbyd.fr`.
- Un commit par tâche ; jamais de push sans accord explicite de l'utilisateur.

## Review Focus

- Formulaire soumis avec champ obligatoire vide, e-mail invalide, ou honeypot rempli : refus clair en français, pas de redirection `/merci`. (Task 8)
- JavaScript désactivé : page lisible, FAQ entièrement dépliée et formulaire envoyable (POST natif vers `/merci`), lien vidéo vers Vimeo. (Task 8)
- Ancre `#demo` ou `#faq` ouverte directement par URL : le titre n'est pas masqué par l'en-tête fixe. (Task 3)
- Largeurs 320 px et 768-1100 px : aucun défilement horizontal. (Task 11)
- `prefers-reduced-motion: reduce` : contenu visible immédiatement, sans animation. (Task 8)

---

### Task 1: Dépôt, kit rangé, projet Astro, scripts de contrôle (en échec)

**Files:**
- Move: `BRIEF.md assets contenus design-system logos maquettes` -> `kit/`
- Create: `.gitignore` (`node_modules`, `dist`, `.astro`, `kit/`, `.DS_Store`), `package.json`, `astro.config.mjs`, `tsconfig.json`, `netlify.toml`, `src/pages/index.astro` (squelette), `scripts/check-build.test.mjs`, `scripts/check-texts.test.mjs`

**Interfaces:**
- Produces: scripts npm `dev`, `build`, `check:build` (`node --test scripts/check-build.test.mjs`), `check:texts` (`node --test scripts/check-texts.test.mjs`), `check` (build puis les deux). `astro.config.mjs` : `site: "https://www.daybydoc.fr"`, `output: "static"`, `trailingSlash: "never"`, `build.format: "file"`, intégration sitemap filtrant `/merci` et `/404`.

- [ ] **Step 1:** `git init -b main`, `git remote add origin git@github.com:9troisquarts/daybydoc-site.git`, `mkdir kit`, `mv` des 6 éléments du kit dans `kit/` (docs/ reste à la racine, versionné).
- [ ] **Step 2:** Scaffold Astro minimal (template `minimal`, TypeScript strict) à la racine sans écraser `docs/` ni `kit/` ; installer les dépendances listées dans la stack.
- [ ] **Step 3: Écrire `scripts/check-build.test.mjs`** (lit `dist/`, cheerio). Un `test()` par assertion sur `dist/index.html` : un seul `h1` ; `html[lang=fr]` ; `<title>` et meta description exactes (cf. contraintes) ; `link[rel=canonical]` = `https://www.daybydoc.fr/` ; aucune URL `fonts.googleapis`/`gstatic` ; tout `src`/`href`/`action` absolu est dans la liste autorisée (`https://dbyd.fr`, `https://9tq.fr`, `https://www.daybydoc.fr`, `https://vimeo.com/1202756436`, `mailto:contact@dbyd.fr`) ; chaque `href="#x"` a un `id="x"` ; `form[data-netlify=true][name=demo][method=POST][action="/merci"]` avec `input[name=form-name][value=demo]`, honeypot `netlify-honeypot=bot-field`, 4 champs `required` (`nom`, `fonction`, `structure`, `email`) ; chaque `img` a `alt`, `width`, `height` ; existence de `dist/{merci,mentions-legales,confidentialite,404}.html`, `sitemap-index.xml`, `robots.txt`, `_redirects`, `og-image.png` ; `merci` et `404` contiennent `noindex`.
- [ ] **Step 4: Écrire `scripts/check-texts.test.mjs`** : exports `extractTexts(htmlPath): string[]` (nœuds texte visibles de `<x-dc>`, hors `<script>/<style>/<helmet>`, retirant `{{...}}`, espaces normalisés, longueur >= 3) ; pour chacune des 6 maquettes (`kit/maquettes/*.dc.html`) un `test()` vérifiant que chaque texte est présent dans le texte normalisé de `dist/index.html`. Exceptions explicites (tableau `KNOWN_DIFFS`) : `[adresse]@daybydoc` (remplacé par `contact@dbyd.fr`), « Choisir » si renommé. Le script `kit/` est exigé présent ; sinon test ignoré avec message.
- [ ] **Step 5:** `npm run build && npm run check` -> **FAIL** attendu (page vide). Noter les échecs comme liste de travail.
- [ ] **Step 6: Commit** `chore: init Astro, scripts de contrôle` (inclut `docs/`).

### Task 2: Tokens, polices, base CSS, layout et SEO

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/fonts.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `public/fonts/poppins-{400,500,600,700}.woff2`, `public/favicon.svg`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: variables CSS (`--primary: #105064`, `--primary-800`, `--teal-dark: #082832`, `--coral: #F28C6F`, `--neutral-0..7`, `--ring`, `--radius-md: 10px`, `--radius-lg: 14px`, `--shadow-card`) dérivées de `kit/design-system/tokens.json` et des valeurs des maquettes ; classes `.section`, `.section--teal`, `.section--plain`, `.container` (max 1200, gutter 24 / 16 mobile) ; `Base.astro` props `{ title: string; description: string; canonical?: string; noindex?: boolean; ogImage?: string }`, slot par défaut, inclut skip-link « Aller au contenu », `<Header/>`/`<Footer/>` en slot `header`/`footer`, JSON-LD Organization (9troisquarts) et SoftwareApplication (DaybyDoc) uniquement sur l'accueil (prop `jsonLd?: boolean`).

- [ ] **Step 1:** Copier les woff2 latin Poppins depuis `node_modules/@fontsource/poppins/files/` (poids 400/500/600/700) vers `public/fonts/` ; `@font-face` avec `font-display: swap` ; `<link rel="preload" as="font" type="font/woff2" crossorigin>` pour 400 et 500.
- [ ] **Step 2:** Écrire les tokens et `base.css` (reset léger, focus visible, `scroll-behavior: smooth` sauf reduced-motion, `scroll-padding-top` = hauteur de l'en-tête, `.btn`, `.btn--light` pour fond teal, style des puces).
- [ ] **Step 3:** `Base.astro` avec title/description/canonical/Open Graph (`og:image` `https://www.daybydoc.fr/og-image.png`), `twitter:card`, favicon `kit/logos/daybydoc-favicon.svg`.
- [ ] **Step 4:** `npm run build && npm run check:build` : les tests title, description, canonical, lang, polices passent. Commit `feat: socle styles, polices, layout SEO`.

### Task 3: Composants UI, en-tête, pied de page

**Files:**
- Create: `src/components/ui/{Dot,BrowserFrame,PhoneFrame}.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/StickyCta.astro`, `src/scripts/nav.ts`
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Produces: `<Dot />` (bille corail `0.19em`, `aria-hidden`) ; `<BrowserFrame src alt widths? loading?>` (barre 3 points + image, `astro:assets`) ; `<PhoneFrame src alt>` ; `Header` : logo couleur, liens `#fonctionnement #regles #profils #temoignage #faq` (libellés des maquettes), « Se connecter » -> `https://dbyd.fr`, bouton « Demander une démo » -> `#demo`, burger < 768 px (bouton `aria-expanded`/`aria-controls`, panneau, ferme sur clic de lien et `Escape`) ; `nav.ts` exporte `initNav(): void`. `Footer` : logo blanc, texte, liens `#demo`, `https://dbyd.fr`, `/mentions-legales`, `/confidentialite`, contact `mailto:contact@dbyd.fr`, « Conçu et maintenu par 9troisquarts. ».
- Pattern d'ancre : chaque `<section>` porte `scroll-margin-top` via `.section`.

- [ ] **Step 1:** Implémenter les composants à partir des blocs `header`/`footer` de `Accueil-3` et `Mobile-1` ; images en `astro:assets` depuis `src/assets/` (copier `kit/assets/*` et `kit/logos/*` utiles).
- [ ] **Step 2:** `StickyCta` : lien « Demander une démo » fixe en bas, `display:none` >= 768 px, `hidden` tant que le hero est visible et quand `#demo` est visible (IntersectionObserver dans `nav.ts`).
- [ ] **Step 3:** `npm run build && npm run check:build` (liens d'ancre à ce stade en attente des sections). Contrôle visuel 390 et 1440 px dans le navigateur intégré. Commit `feat: en-tête, pied de page, composants UI`.

### Task 4: Sections Hero, Preuves, Avant/après

**Files:**
- Create: `src/components/sections/{Hero,Preuves,AvantApres}.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Dot`, `BrowserFrame`, `PhoneFrame`, `.section*`, `.btn`.
- Produces: trois composants sans props ; ids `#preuves`, `#avant-apres` ; H1 unique dans Hero (« Vos plannings, répartis automatiquement, selon <strong>vos règles</strong> » + `Dot`). Hero : image `capture-hero-planning` en `loading="eager" fetchpriority="high"`. Avant/après : `<table>` sémantique (`th scope`) stylé en grille ; sur mobile `thead` masqué visuellement (`.sr-only`) et chaque ligne devient deux blocs étiquetés « Avant » / « Avec DaybyDoc ».

- [ ] **Step 1:** Reproduire structure, styles et textes depuis `Accueil.dc.html` (desktop) et les surcharges `Mobile-1.dc.html` (mobile : stats en ligne, hero empilé, `padding: 64px 16px`).
- [ ] **Step 2:** `npm run build && npm run check`, vérifier que les échecs des textes de ces trois sections disparaissent. Commit `feat: hero, preuves, avant/après`.

### Task 5: Sections Comment ça marche, Vos règles, Profils

**Files:**
- Create: `src/components/sections/{CommentCaMarche,VosRegles,Profils}.astro`, `src/scripts/profils.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: ids `#fonctionnement`, `#regles`, `#profils`. `Profils` rend **deux présentations depuis une même source de données** (`const profils: { id; titre; surtitre; items: string[]; image; alt; ordreDesktop; ordreMobile }[]`) : blocs alternés (>= 768 px : médecins, bureau, secrétariat ; avec `capture-gardes-souhaitees` en surimpression pour les médecins) et accordéon (< 768 px : bureau, secrétariat, médecins ; premier ouvert ; sans phrase d'intro ni bille sur le h2). Basculer par CSS (`display:none` sur l'autre), accordéon via `<button aria-expanded>` ; `profils.ts` exporte `initProfils(): void`. Sans JS, l'accordéon mobile reste déplié.

- [ ] **Step 1:** Implémenter depuis `Accueil-2` et `Mobile-2`. Étapes numérotées en `<ol>` ; cartes « Vos règles » en grille 2 colonnes (1 en mobile) à côté de `capture-detail-garde` (`object-fit: contain`).
- [ ] **Step 2:** `npm run build && npm run check`. Contrôle visuel 390 / 768 / 1024 / 1440. Commit `feat: fonctionnement, règles, profils`.

### Task 6: Sections Intégrations, Témoignage, Équipe, Déploiement

**Files:**
- Create: `src/components/sections/{Integrations,Temoignage,Equipe,Deploiement}.astro`, `src/scripts/video.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: ids `#integrations`, `#temoignage`, `#equipe`, `#deploiement`. `video.ts` exporte `initVideo(): void` : le bouton lecture (`aria-label="Lire la vidéo du témoignage de l'ADOPS59"`) remplace la vignette par `<iframe src="https://player.vimeo.com/video/1202756436?dnt=1&autoplay=1" allow="autoplay; fullscreen; picture-in-picture" title="Témoignage de l'ADOPS59">` et met le focus dessus. Sans JS : `<a href="https://vimeo.com/1202756436">` englobant la vignette. Vignette `vignette-video-adops59.jpg` avec badge « Vidéo sous-titrée ». Déploiement : frise horizontale >= 768 px, verticale < 768 px.

- [ ] **Step 1:** Implémenter depuis `Accueil-3`/`Mobile-3` (parties 8, 10 ; la partie 9 « Qui est derrière » est vide dans les maquettes, ne rien créer).
- [ ] **Step 2:** `npm run build && npm run check`. Commit `feat: intégrations, témoignage, équipe, déploiement`.

### Task 7: Sections FAQ et Démo (formulaire)

**Files:**
- Create: `src/components/sections/{Faq,Demo}.astro`, `src/scripts/faq.ts`

**Interfaces:**
- Produces: `faq.ts` exporte `initFaq(): void` (une seule réponse ouverte ; `aria-expanded` + `hidden` sur le panneau `aria-labelledby`/`aria-controls` ; première ouverte ; Entrée/Espace natifs via `<button>`). Sans JS : tous les panneaux visibles. 7 questions/réponses dans l'ordre des maquettes. Colonne gauche (intro, 3 rassurances, carte « Une autre question ? ») `position: sticky; top: 120px` >= 1100 px, masquée < 768 px. `Demo` : `<form name="demo" method="POST" action="/merci" data-netlify="true" netlify-honeypot="bot-field" novalidate>`, `<input type="hidden" name="form-name" value="demo">`, honeypot `<p hidden><label>Ne pas remplir <input name="bot-field"></label></p>`, champs `nom`(autocomplete name) `fonction`(select, valeurs = libellés) `structure` `email` `telephone` `nombre-medecins`(select) `message`, `required` sur les 4 premiers, bouton `type="submit"` « Demander une démo », mention « politique de confidentialité » -> `/confidentialite`. Chaque champ : `<label for>`, zone d'erreur `<p id="err-<champ>" role="alert">` vide.

- [ ] **Step 1:** Implémenter depuis `Accueil-3`/`Mobile-3` (sections 11 et 12).
- [ ] **Step 2:** `npm run build && npm run check` : les tests du formulaire passent. Commit `feat: faq, formulaire de démo`.

### Task 8: Scripts d'interaction, validation, animations

**Files:**
- Create: `src/scripts/{form,reveal,main}.ts`
- Modify: `src/layouts/Base.astro` (un seul `<script>` module chargeant `main.ts`)

**Interfaces:**
- Consumes: `initNav`, `initProfils`, `initVideo`, `initFaq`.
- Produces: `form.ts` exporte `initForm(form: HTMLFormElement): void` et `messageFor(input: HTMLInputElement | HTMLSelectElement): string`. Messages : `valueMissing` -> « Merci de renseigner ce champ. » (select : « Merci de faire un choix. ») ; `typeMismatch` e-mail -> « Cette adresse e-mail ne semble pas valide. » À l'envoi : si invalide, `preventDefault`, injecter le message dans `#err-<champ>`, `aria-invalid="true"`, focus sur le premier champ en erreur ; si honeypot rempli, ne rien envoyer. `reveal.ts` exporte `initReveal(): void` : IntersectionObserver ajoutant `.is-visible` à `[data-reveal]` (fade + 12 px, 400 ms), no-op si `matchMedia("(prefers-reduced-motion: reduce)")` ; sans JS le contenu reste visible (le masquage initial n'est appliqué que sous `.js`). `main.ts` appelle tout au `DOMContentLoaded`.

- [ ] **Step 1: Test** : étendre `check-build.test.mjs` pour vérifier `html` reçoit la classe `js` via script inline minimal et que `[data-reveal]` n'est masqué que sous `.js`. Ajouter `scripts/form.test.mjs` (jsdom en devDependency) : `messageFor` renvoie les 3 messages exacts ci-dessus ; un envoi avec e-mail `abc` empêche la soumission et remplit `#err-email`.
- [ ] **Step 2:** Lancer -> FAIL. **Step 3:** Implémenter les trois scripts. **Step 4:** Lancer -> PASS.
- [ ] **Step 5:** Vérifier à la main dans le navigateur : FAQ, menu, vidéo (aucun cookie avant clic, onglet réseau sans requête Vimeo avant clic), `prefers-reduced-motion`, JS désactivé. Commit `feat: interactions, validation, animations`.

### Task 9: Pages secondaires

**Files:**
- Create: `src/content/config.ts`, `src/content/legal/{mentions-legales,confidentialite}.md` (copie de `kit/contenus/*.md`), `src/layouts/Legal.astro`, `src/pages/{mentions-legales,confidentialite,merci,404}.astro`

**Interfaces:**
- Consumes: `Base.astro`, `Header`, `Footer`.
- Produces: pages légales rendues depuis la collection `legal` (H1 = titre du .md, tables stylées, largeur de lecture 720 px) ; `/merci` : H1 « Merci, votre demande est bien envoyée », courte phrase de suivi, lien « Retour à l'accueil » ; `/404` : H1 « Page introuvable », lien « Retour à l'accueil ». Textes de `/merci` et `/404` : proposition à valider par l'utilisateur à la relecture. `noindex` sur les deux. `[date de mise en ligne]` laissée telle quelle (point de recette).

- [ ] **Step 1:** Implémenter ; relier les liens du pied de page et du formulaire. `npm run build && npm run check:build` (pages, `noindex`). Commit `feat: pages légales, merci, 404`.

### Task 10: SEO, redirections, en-têtes, image de partage

**Files:**
- Create: `public/_redirects` (copie de `kit/contenus/_redirects`), `public/robots.txt`, `scripts/make-og.mjs`, `public/og-image.png`
- Modify: `netlify.toml`

**Interfaces:**
- Produces: `robots.txt` (`User-agent: *`, `Allow: /`, `Sitemap: https://www.daybydoc.fr/sitemap-index.xml`) ; `make-og.mjs` (sharp) : 1200×630, fond `#105064`, logo blanc centré ; `netlify.toml` : en-têtes `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Content-Security-Policy` (`default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-src https://player.vimeo.com; form-action 'self'`), `Cache-Control: public, max-age=31536000, immutable` sur `/fonts/*` et `/_astro/*`.

- [ ] **Step 1:** Générer l'image et l'ajouter. **Step 2:** `npm run build && npm run check:build` : fichiers de sortie présents. Commit `feat: SEO, redirections, en-têtes, image de partage`.

### Task 11: Vérification globale

**Files:**
- Create: `scripts/check-requests.mjs`

**Interfaces:**
- Produces: `check-requests.mjs` : lance `astro preview`, ouvre la page via le navigateur intégré (ou Playwright si présent) et échoue si une requête sort de `localhost`, si un cookie est posé avant clic vidéo, ou si une page à 320 px a `scrollWidth > clientWidth`.

- [ ] **Step 1:** `npm run check` -> tout PASS (textes inclus). Corriger les écarts un à un.
- [ ] **Step 2:** Comparaison visuelle aux maquettes à 390, 768, 1024, 1440 px (navigateur intégré), notant les écarts corrigés.
- [ ] **Step 3:** `npx lighthouse http://localhost:4321 --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo` : >= 90 dans chaque catégorie, sinon corriger (poids des images, préchargements, contrastes).
- [ ] **Step 4:** Parcours clavier complet (Tab, Entrée, Espace, Échap) et contrôle des cibles >= 44 px. Commit `test: vérifications finales`.

### Task 12: Mise en ligne et recette

**Files:**
- Create: `README.md` (installation, scripts, déploiement, marche à suivre OVH)

- [ ] **Step 1:** Demander l'accord de l'utilisateur, puis `git push -u origin main`.
- [ ] **Step 2 (utilisateur) :** connecter le dépôt à Netlify (build `npm run build`, publish `dist`), activer la détection des formulaires, ajouter la notification e-mail vers contact@dbyd.fr, définir `www.daybydoc.fr` comme domaine principal.
- [ ] **Step 3:** Sur l'adresse Netlify provisoire : envoi de bout en bout (demande visible dans Netlify, e-mail reçu, redirection `/merci`), refus d'un formulaire incomplet, recette du `BRIEF.md` cochée point par point.
- [ ] **Step 4 (utilisateur) :** renseigner la date de mise à jour dans la confidentialité, puis basculer les DNS chez OVH sans toucher aux MX ; vérifier HTTPS, redirection vers www, anciennes adresses ; résilier Squarespace après vérification.
