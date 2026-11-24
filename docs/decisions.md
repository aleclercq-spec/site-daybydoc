# Décisions

Une entrée par décision, de la plus récente à la plus ancienne. On ne réécrit pas l'historique : une décision qui change est remplacée par une nouvelle entrée.

Format : **date, titre** — choix — pourquoi — ce qui a été écarté — coût si c'est faux.

## 2026-11-24

**Nouveau hero, bouton corail limité au hero** — la consigne `kit/daybydoc-hero/CONSIGNE.md` demande des boutons corail. Appliqué uniquement au bouton du hero (fond corail, texte `#082832`). Pourquoi : « le reste de la page ne change pas » ; le contraste est de 6,4:1 et le BRIEF n'interdit que le texte blanc sur corail. Remplace en partie la décision « boutons teal » du 2026-11-23 pour ce seul bouton. Coût : le hero a un bouton corail, les autres sections un bouton teal ou blanc ; à harmoniser si l'utilisateur le souhaite.

**Mise en page « ordinateur » du hero dès 1280 px** — en dessous, le visuel passe sous le texte. Pourquoi : entre 1180 et 1279 px la colonne de droite (528 px) est trop étroite pour les trois notifications sans chevauchement (vérifié en navigateur). Écarté : réduire les notifications. Coût : sur un écran de 1180 à 1279 px, le visuel est empilé alors qu'il tiendrait presque.

**Logo : on garde celui du site** — le `logo-daybydoc-couleur.svg` fourni avec le hero pèse 12 Ko contre 4 Ko ; il ne diffère que par un manifeste C2PA (métadonnées de provenance), le tracé est le même. Pourquoi : « le reste de la page ne change pas » et poids inutile. Coût : aucun visible.

**`kit/daybydoc-hero` reste local** — non versionné, comme tout `kit/`. Le contrôle `check:texts` s'en sert pour le texte du hero (les hero des six planches d'origine sont ignorés).

## 2026-11-23

**Dépôt déplacé vers `aleclercq-spec/site-daybydoc`** (compte personnel) — pourquoi : l'organisation `9troisquarts` n'était pas accessible depuis Netlify (installation de l'app à approuver), le dépôt personnel se connecte directement. Coût : le site client est dans un dépôt personnel ; pour que l'équipe le maintienne, transférer le dépôt dans l'organisation (GitHub > Settings > Transfer) et reconnecter Netlify.

**Netlify : Node 24 imposé** (`NODE_VERSION` dans `netlify.toml`) — Astro 7 exige Node >= 22.23.4 et Netlify peut utiliser une version plus ancienne par défaut.

**E-mail : un point est exigé dans le domaine** (attribut `pattern`) — `type="email"` accepte `a@b`, ce qui ferait arriver des demandes inutilisables. Actif aussi sans JavaScript. Coût : refuse les adresses sans point (réseaux internes), sans objet pour un site public.

**Un champ obligatoire rempli d'espaces est refusé** — identique à un champ vide.

**En-tête non collant sans JavaScript sous 1024 px** — sans JavaScript le menu reste déplié (281 px à 320 px de large) et masquerait les titres visés par les ancres. Trouvé à la relecture finale.

**Stack : Astro statique, CSS natif, scripts sans framework** — imposé par le BRIEF. Écarté : Tailwind, framework d'îles (poids inutile pour 5 pages).

**Boutons : teal sur fond clair, blanc sur fond teal** (option « Teal » de la maquette) — le BRIEF limite le corail à l'accent graphique. Validé par l'utilisateur. Voir l'entrée du 2026-11-24 pour le hero.

**Mobile et ordinateur : on suit la maquette de chaque format** — accordéon des profils sur mobile (ordre bureau, secrétariat, médecins, sans la phrase d'intro), colonne de gauche de la FAQ masquée sur mobile. Validé par l'utilisateur.

**`kit/` (maquettes, assets sources) hors du dépôt** — le dépôt ne contient que le site. Validé par l'utilisateur. Coût : `check:texts` est ignoré sur un clone sans `kit/`.

**Menu replié sous 1024 px (et non 768)** — cinq liens, « Se connecter » et le bouton ne tiennent pas en tablette. Les blocs profils passent en une colonne et la frise de déploiement devient verticale sous 1024 px pour la même raison ; les intégrations passent en trois colonnes sous 1100 px.

**Header et footer inclus par `Base.astro`** — pas de slots : évite de les répéter sur chaque page. Sans JavaScript, le burger est masqué et la navigation reste visible.

**Tableau avant/après en `div role="table"`** (ARIA) plutôt qu'en `<table>` — `display: grid` sur un vrai tableau perd sa sémantique sur certains Safari. En-têtes de colonne masqués visuellement (`sr-only`) sur mobile. Coût : de vieux Safari peuvent retirer ces rôles de l'arbre d'accessibilité (non testé sur VoiceOver).

**Accordéons (FAQ, profils) : `aria-expanded` rendu côté serveur, repli en CSS `:has()` sous `.js`** — pas de flash de contenu déplié ; sans JavaScript tout est visible.

**`novalidate` ajouté par le script** — sans JavaScript, la validation native reste active.

**Apparitions au défilement : masquage conditionné à `.reveal-ready`** (posée par le script quand l'observateur est actif) et non à `.js` — évite un contenu définitivement masqué si le script échoue.

**Vidéo : le lien de repli vers Vimeo devient un `<button>`** à l'initialisation du script — vrai bouton accessible, repli sans JavaScript.

**Pages légales depuis des `.md`** (collection Astro `legal`, sans frontmatter ; titre et description passés par la page) ; `white-space: pre-line` pour conserver les retours à la ligne des coordonnées.

**Textes de `/merci` et `/404` rédigés sans maquette** — à relire par l'utilisateur.

**Canonical sans `index.html`** — calculée depuis le chemin de la page ; `/merci` et `/404` ont aussi une canonical bien qu'en `noindex` (point mineur laissé).

**Contrôles de non-régression en `node:test`** (structure, textes, formulaire, vidéo, animations) et en Chrome (`check:requests`, hors `npm run check` car Chrome est requis).
