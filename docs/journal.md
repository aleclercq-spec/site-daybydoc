# Journal

Ce qui a été fait, par date (du plus récent au plus ancien), puis ce qui reste à faire. À mettre à jour à chaque fin de session ou de livraison.

## À faire / en attente

- [ ] Recette sur l'adresse provisoire : envoi réel du formulaire (demande visible dans Netlify > Forms, e-mail reçu, redirection `/merci`), formulaire refusé s'il manque un champ, lecture de la vidéo Vimeo, affichage sur iPhone, Android, tablette et ordinateur (Chrome, Safari, Firefox).
- [ ] Netlify : activer la détection des formulaires, ajouter la notification e-mail vers contact@dbyd.fr, domaine principal `www.daybydoc.fr`.
- [ ] Renseigner `[date de mise en ligne]` dans `src/content/legal/confidentialite.md` (aucun test ne bloque sa mise en ligne telle quelle).
- [ ] Relire les textes de `/merci` et `/404` (rédigés sans maquette).
- [ ] Bascule DNS chez OVH (A / CNAME vers Netlify, ne toucher à aucun MX), vérifier HTTPS, redirection vers `www`, anciennes adresses ; résilier Squarespace ensuite.
- [ ] Décider si le bouton corail du hero doit s'étendre aux autres boutons.
- [ ] Optionnel : transférer le dépôt dans l'organisation `9troisquarts` ; supprimer les branches `feat/site-v1` et `feat/nouveau-hero` (déjà dans `main`).
- Mineurs laissés de côté à la relecture : double décalage des ancres (`scroll-padding-top` et `scroll-margin-top`, `--header-h` mobile à 64 px pour un en-tête de 73 px) ; honeypot rempli par un remplissage automatique : le bouton ne fait rien, sans message ; canonical présente sur `/merci` et `/404` ; `check:texts` ignoré sans `kit/` et sens unique maquette vers site ; quatre messages d'erreur en `role="alert"` annoncés d'un coup.

## 2026-11-24

- Nouveau hero appliqué (consigne `kit/daybydoc-hero/CONSIGNE.md`) : carte des secteurs en SVG inline, ordinateur dessiné en CSS, trois notifications, bandeau des activités, téléphone supprimé. Tests écrits d'abord (structure, textes, géométrie en navigateur). Lighthouse mobile 100 / 100 / 100 / 100. Captures ordinateur, tablette et mobile montrées avant la mise en ligne.
- Branche `feat/nouveau-hero` poussée, puis fusionnée dans `main` (avance rapide) et poussée sur accord de l'utilisateur.
- Déploiement Netlify réussi, confirmé par l'utilisateur.
- Mise en place de `CLAUDE.md` et de cette documentation.

## 2026-11-23

- Lecture du BRIEF, des six maquettes, du design system et des contenus ; conception et plan d'implémentation (`docs/superpowers/`).
- Site construit en 11 tâches : socle (tokens, polices, layout, SEO), en-tête et pied de page, les 12 sections de l'accueil, interactions (menu, accordéons, vidéo, formulaire, apparitions), pages légales, `/merci`, `/404`, SEO, redirections, en-têtes, image de partage, contrôles automatiques.
- Vérifications : aucune requête externe ni cookie, aucun débordement horizontal de 320 à 1440 px, Lighthouse mobile 99 / 100 / 100 / 100.
- Relecture finale indépendante : un point important corrigé (en-tête collant sans JavaScript en mobile), un point regradé et corrigé (champs d'espaces), sept mineurs laissés (voir « À faire »).
- Correction de la règle de l'e-mail (point exigé dans le domaine).
- Netlify : correction de la version de Node. Dépôt déplacé vers `aleclercq-spec/site-daybydoc` ; `main` et `feat/site-v1` poussées, `main` mise à jour par avance rapide avec le site complet.
- Projet Netlify `daybydoc` créé (équipe `tiers`, branche `main`, build `npm run build`, publication `dist`).
