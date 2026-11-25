# Fonctionnement du site

État actuel du site. L'historique est dans `journal.md`, les raisons des choix dans `decisions.md`.

## Vue d'ensemble

- **Technique :** site statique Astro 7 (CSS natif, JavaScript minimal sans framework), images optimisées par `astro:assets` (WebP), polices Poppins hébergées (`public/fonts`, 400/500/600/700, `font-display: swap`).
- **Pages :** `/` (accueil), `/merci`, `/mentions-legales`, `/confidentialite`, `/404`. Sortie en `dist/<page>.html` (`build.format: "file"`, `trailingSlash: "never"`).
- **Hébergement :** Netlify (projet `daybydoc`, équipe `tiers`), déployé à chaque push sur `main` du dépôt `aleclercq-spec/site-daybydoc` (premier déploiement réussi, confirmé par l'utilisateur le 2026-11-24). Domaine cible `www.daybydoc.fr` (DNS chez OVH, pas encore basculé).
- **Aucun cookie, aucun outil de mesure, aucune ressource tierce au chargement.** Le seul service externe est le lecteur Vimeo, chargé après un clic.

## Structure du code

```
src/
  assets/            images et logos sources (captures, photo, logos SVG, carte des secteurs)
  components/
    Header, Footer, StickyCta
    ui/              Dot (bille corail), BrowserFrame, PhoneFrame
    sections/        une section de l'accueil par fichier
  content/legal/     mentions-legales.md, confidentialite.md (collection Astro "legal")
  layouts/           Base.astro (head, SEO, JSON-LD, en-tête, pied de page), Legal.astro
  pages/             index, merci, mentions-legales, confidentialite, 404
  scripts/           nav, profils, video, faq, form, reveal, main (point d'entrée)
  styles/            tokens.css, fonts.css, base.css
public/              _redirects, robots.txt, og-image.png, favicon.svg, fonts/
scripts/             contrôles automatiques (voir « Contrôles »)
netlify.toml         build, Node 24, en-têtes de sécurité et de cache
```

## Page d'accueil : sections et fonds

Ordre et alternance blanc / teal (`.section--white` / `.section--teal`) :

| # | Section | id | Fond |
|---|---|---|---|
| 1 | Hero | `hero` | teal |
| 2 | Preuves (ADOPS85, ADOPS59) | `preuves` | blanc |
| 3 | Avant / avec DaybyDoc (carte en fond) | `avant-apres` | teal |
| 4 | Comment ça marche (3 étapes) | `fonctionnement` | blanc |
| 5 | Vos règles (carte en fond) | `regles` | teal |
| 6 | Profils (médecins, bureau, secrétariat) | `profils` | blanc |
| 7 | Intégrations et sécurité | `integrations` | teal |
| 8 | Témoignage (vidéo) | `temoignage` | blanc |
| 9 | Équipe 9troisquarts | `equipe` | teal |
| 10 | Déploiement (5 étapes) | `deploiement` | blanc |
| 11 | FAQ | `faq` | teal |
| 12 | Demande de démo (formulaire) | `demo` | blanc |

Les textes sont ceux des maquettes, à l'identique, sauf les retouches du 2026-11-25 listées dans `decisions.md` (titre de « Comment ça marche », champs prénom / nom, adresse de contact). Chaque section est autonome (HTML + CSS dans son fichier `.astro`).

### Hero

Texte à gauche (surtitre, titre 46 px avec « vos règles » en gras et bille corail, sous-titre, bouton corail « Demander une démo », lien vers le témoignage). Visuel à droite :
- la carte des secteurs (`src/assets/carte-secteurs.svg`) en SVG inline, décorative (`aria-hidden`) ;
- un ordinateur portable dessiné en CSS avec la capture du planning (image chargée en priorité) ;
- trois notifications : « Régulation · Nuit du samedi », « Échange accepté », « Garde vacante pourvue » ;
- en bas, sur toute la largeur, le bandeau des quatre activités (Régulation, Gardes de secteur, Maisons médicales de garde, Médecins mobiles).

Mises en page : ≥ 1280 px côte à côte (hero de 809 px de haut, compris dans un écran 1440 × 900 avec l'en-tête) ; de 768 à 1279 px visuel sous le texte, trois notifications ; < 768 px texte, puis visuel (deux notifications seulement), puis bandeau sur deux colonnes. La carte ne passe jamais sous le texte, ni les notifications ni l'ordinateur sur la pastille centrale de la régulation (vérifié par `check:requests`).

## Comportements

- **En-tête :** collant en haut. Liens d'ancre vers les sections (`scroll-padding-top` / `scroll-margin-top` pour ne pas masquer les titres), « Se connecter » vers `https://dbyd.fr`. Sous 1024 px, menu replié derrière un burger (`aria-expanded`, Échap pour fermer). Sans JavaScript, le menu reste déplié et l'en-tête n'est pas collant.
- **Barre « Demander une démo » (mobile) :** fixe en bas sous 768 px, visible une fois le hero passé et masquée quand la section `#demo` est visible.
- **Profils :** trois blocs alternés dès 768 px (une colonne sous 1024 px) ; accordéon sous 768 px (ordre bureau, secrétariat, médecins, un seul ouvert, le premier ouvert au chargement).
- **FAQ :** accordéon, première question ouverte, une seule ouverte à la fois, `aria-expanded`, accessible au clavier. Panneaux repliés uniquement si JavaScript est actif. Colonne de gauche collante dès 1100 px, masquée sous 768 px.
- **Comment ça marche :** dans chaque étape, de haut en bas : puce numérotée (centrée, un trait de chaque côté), titre, capture, paragraphe. Titre de la section : « Un fonctionnement simple, pensé pour vous simplifier la vie ».
- **Cartes en fond (avant/après, vos règles) :** la carte des secteurs, variante décorative `src/assets/carte-fond.svg` (sans pastilles ni icônes), posée en fond de section par la classe `.has-map` (`src/styles/base.css`) et les variables `--map`, `--map-size`, `--map-pos`, `--map-opacity` réglées dans chaque section. En CSS uniquement : rien dans le HTML, donc ignorée des lecteurs d'écran ; sans interaction. Sections en `overflow: hidden`.
- **Déploiement (frise) :** le cercle corail est sur l'étape 1 au repos ; au survol d'une étape il se déplace sur elle (l'étape 1 reprend alors la petite puce). Sur mobile, il suit l'étape touchée (le survol reste actif après un toucher). Transition coupée si l'utilisateur demande moins d'animations.
- **Vidéo :** la vignette locale s'affiche avec un lien de repli vers Vimeo ; au clic, un script remplace le lien par un bouton, puis charge `https://player.vimeo.com/video/1202756436?dnt=1&autoplay=1` dans un iframe. Aucun cookie avant le clic.
- **Apparitions au défilement :** éléments `data-reveal` qui apparaissent en fondu. Actif seulement si le script est démarré (classe `reveal-ready`) et si l'utilisateur n'a pas demandé moins d'animations.

## Formulaire de démo

- Netlify Forms : `<form name="demo" method="POST" action="/merci" data-netlify="true" netlify-honeypot="bot-field">` avec `form-name` caché et champ piège `bot-field`.
- Champs : prénom, nom, fonction, structure, e-mail (obligatoires) ; téléphone, nombre de médecins, message (facultatifs). Noms envoyés à Netlify : `prenom`, `nom`, `fonction`, `structure`, `email`, `telephone`, `nombre-medecins`, `message`. Les demandes reçues avant le 2026-11-25 n'ont qu'un champ `nom` (nom et prénom ensemble).
- Validation (`src/scripts/form.ts`) : messages en français sous chaque champ, focus sur le premier champ en erreur. Un champ obligatoire rempli d'espaces est refusé. L'e-mail exige un point dans le domaine (attribut `pattern`, actif aussi sans JavaScript). `novalidate` est ajouté par le script : sans JavaScript, la validation native du navigateur reste active. Honeypot rempli : aucun envoi.
- Après envoi : Netlify redirige vers `/merci`. Les demandes apparaissent dans Netlify > Forms ; l'e-mail de notification vers contact@dbyd.fr se règle dans l'interface Netlify (hors du code ; réglé et confirmé le 2026-11-25). Prérequis : « Form detection » activée dans Netlify > Forms, sinon l'envoi aboutit à une page introuvable ; la détection ne s'applique qu'au déploiement suivant son activation.

## Design

- Couleurs : teal `#105064` principal ; corail `#F28C6F` en accent graphique (bille, puces, repères). Seul bouton corail : celui du hero, avec texte teal foncé `#082832` (contraste 6,4:1). Autres boutons : teal sur fond clair, blanc sur fond teal.
- Tokens dans `src/styles/tokens.css` (issus du design system). Les sections teal redéfinissent les variables de couleur de texte ; `.card` les rétablit pour les cartes posées sur du teal.
- Focus visible (anneau 3 px), zones cliquables ≥ 44 px, contrastes AA.
- Breakpoints : mobile < 768 px, tablette 768–1279 px, ordinateur ≥ 1280 px (hero) ; l'en-tête se replie sous 1024 px, les profils passent en une colonne sous 1024 px.

## SEO

- Title `DaybyDoc - Planning des gardes ADOPS et maisons médicales`, meta description, canonical sans `index.html`, Open Graph, `twitter:card`.
- Données structurées Organization (9troisquarts) et SoftwareApplication (DaybyDoc) sur l'accueil.
- `sitemap-index.xml` généré (sans `/merci` ni `/404`), `robots.txt`, `og-image.png` (1200 × 630, générée par `npm run og`).
- `/merci` et `/404` en `noindex`.
- `_redirects` : `/home`, `/cart`, `/search` vers `/` (anciennes adresses Squarespace).

## Sécurité (netlify.toml)

En-têtes : `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, Content-Security-Policy (`frame-src` limité à `player.vimeo.com`, `form-action 'self'`, scripts et styles en ligne autorisés car Astro en insère), cache `immutable` d'un an sur `/fonts/*` et `/_astro/*`. Node 24 imposé au build.

## Contrôles automatiques (`scripts/`)

| Commande | Ce qu'elle vérifie |
|---|---|
| `npm run check` | build, puis les quatre contrôles ci-dessous |
| `check:build` | structure de `dist/` : un seul H1, titre et description, ancres, formulaire Netlify, images avec dimensions, sections, pages, sitemap, robots, redirections, en-têtes |
| `check:texts` | tous les textes des maquettes (`kit/`) sont présents dans la page (ignoré si `kit/` est absent) |
| `check:form` | validation du formulaire (jsdom) |
| `check:video` | le lecteur Vimeo n'est injecté qu'au clic, avec `dnt=1` |
| `check:reveal` | animations désactivées si le mouvement est réduit |
| `check:requests` | en Chrome : aucune requête externe ni cookie, aucun défilement horizontal de 320 à 1440 px, géométrie du hero, en-tête non collant sans JavaScript, puces centrées, cartes en fond présentes, cercle de la frise au survol (Chrome requis, hors `npm run check`) |

Dernière mesure Lighthouse mobile (2026-11-24) : performance 100, accessibilité 100, bonnes pratiques 100, SEO 100.

## Limites connues

Voir « À faire » dans `journal.md` : recette sur appareils réels à terminer (formulaire, vidéo et mobile déjà validés le 2026-11-24) ; date de mise à jour de la confidentialité à renseigner ; textes de `/merci` et `/404` à relire.
