# Décisions

Une entrée par décision, de la plus récente à la plus ancienne. On ne réécrit pas l'historique : une décision qui change est remplacée par une nouvelle entrée.

Format : **date, titre** — choix — pourquoi — ce qui a été écarté — coût si c'est faux.

## 2026-11-25

**Maquettes Claude Design mises à jour avec les mêmes retouches** (même jour, remplace la mention « les maquettes n'ont pas été modifiées » de l'entrée ci-dessous) — les six planches (ordinateur 1 à 3, mobile 1 à 3) reprennent les retouches : titre, ordre et puces des étapes, carte en fond (fichier `carte-fond.svg` téléversé dans le design), formulaire prénom / nom, contact@daybydoc.fr, cercle de la frise au survol (planche ordinateur seulement ; le mobile n'a pas de survol et garde le cercle sur l'étape 1). Pourquoi : demandé par l'utilisateur, pour que maquette et site restent d'accord. Coût : le commentaire « centrer les pictos » reste non traité aussi dans les maquettes ; `kit/` (copie locale) n'est pas mis à jour et diffère des maquettes, `check:texts` s'appuie encore sur lui.

**Retouches issues des commentaires sur le design Claude Design « Site DaybyDoc V1 »** — neuf commentaires de l'utilisateur appliqués au site (ordinateur et mobile). Les maquettes du design n'ont pas été modifiées : le site fait désormais foi sur ces points. Pourquoi : l'utilisateur a validé sur le design, puis demandé de « prendre en compte » ses commentaires. Coût : `kit/` (maquettes locales) n'est plus identique au site sur trois textes ; `check:texts` les connaît par `KNOWN_DIFFS` (`scripts/check-texts.test.mjs`).
- Titre « Comment ça marche » : « Un fonctionnement simple, pensé pour vous simplifier la vie » (remplace « Trois temps, une seule application »). Une première proposition du même jour (« Simple à utiliser, pratique pour tous ») a été remplacée par celle-ci.
- Étapes : titre au-dessus de la capture, paragraphe dessous ; puces 1, 2, 3 centrées avec un trait de chaque côté.
- Carte des secteurs en fond des sections avant/après et vos règles, en **variante décorative** (sans pastilles ni icônes), à opacité réduite et cadrée à droite hors du texte. Écarté : inclure la carte du hero telle quelle (trop chargée derrière du texte), l'insérer en SVG dans le HTML (3 copies, 10 Ko chacune, lue par les lecteurs d'écran). Coût : un fichier SVG de plus ; les réglages (taille, position, opacité) sont à ajuster au goût.
- Frise du déploiement : le cercle corail suit l'étape survolée. Sur mobile il suit l'étape touchée (pas de survol réel) ; à confirmer par l'utilisateur.
- Formulaire : « Nom et prénom » devient deux champs, prénom puis nom (côte à côte sur ordinateur, e-mail sur toute la largeur). Le champ Netlify `nom` devient `prenom` + `nom` ; les demandes déjà reçues gardent l'ancien format.
- Contact public : **contact@daybydoc.fr** dans le pied de page et la FAQ, à la place de contact@dbyd.fr. **Non traité :** les mentions légales, la politique de confidentialité et les données structurées (Organization 9troisquarts) gardent contact@dbyd.fr ; la notification Netlify des demandes reste sur contact@dbyd.fr (réglage Netlify). Coût : si la boîte contact@daybydoc.fr n'existe pas chez OVH, les messages des visiteurs sont perdus ; à créer ou rediriger avant la mise en ligne de cette branche.
- « Centrer les pictos » (intégrations) : précisé par l'utilisateur (« centre les 5 pictos sur chaque paragraphe ») ; picto, titre et texte de chacun des 5 éléments centrés, sur le site et dans les maquettes (version 150). Écarté : centrer le picto seul au-dessus d'un texte à gauche (décalage visuel). Coût : section « Connecté à vos outils » entièrement centrée, à annuler en une ligne si le texte doit rester à gauche.

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
