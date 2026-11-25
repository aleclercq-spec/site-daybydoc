# Journal

Ce qui a été fait, par date (du plus récent au plus ancien), puis ce qui reste à faire. À mettre à jour à chaque fin de session ou de livraison.

## À faire / en attente

- [ ] Valider les retouches du 2026-11-25 (branche `feat/retouches-maquette`, non poussée) : rendu des cartes en fond (taille, opacité), comportement de la frise sur mobile, formulaire. Puis pousser et fusionner sur accord.
- [ ] **Avant de fusionner :** créer la boîte ou l'alias contact@daybydoc.fr chez OVH (le site l'affichera) ; décider si les mentions légales, la confidentialité et la notification Netlify passent aussi à cette adresse.
- [ ] Recette sur l'adresse provisoire : reste l'affichage sur iPhone, Android, tablette et ordinateur (Chrome, Safari, Firefox) et le formulaire refusé s'il manque un champ. Validés par l'utilisateur le 2026-11-24 : envoi réel du formulaire, lecture de la vidéo Vimeo, affichage mobile.
- [ ] Netlify : domaine principal `www.daybydoc.fr` (à faire avec la bascule DNS).
- [ ] Renseigner `[date de mise en ligne]` dans `src/content/legal/confidentialite.md` (aucun test ne bloque sa mise en ligne telle quelle).
- [ ] Relire les textes de `/merci` et `/404` (rédigés sans maquette).
- [ ] Bascule DNS chez OVH (A / CNAME vers Netlify, ne toucher à aucun MX), vérifier HTTPS, redirection vers `www`, anciennes adresses ; résilier Squarespace ensuite.
- [ ] Décider si le bouton corail du hero doit s'étendre aux autres boutons.
- [ ] Optionnel : transférer le dépôt dans l'organisation `9troisquarts`.
- Mineurs laissés de côté à la relecture : double décalage des ancres (`scroll-padding-top` et `scroll-margin-top`, `--header-h` mobile à 64 px pour un en-tête de 73 px) ; honeypot rempli par un remplissage automatique : le bouton ne fait rien, sans message ; canonical présente sur `/merci` et `/404` ; `check:texts` ignoré sans `kit/` et sens unique maquette vers site ; quatre messages d'erreur en `role="alert"` annoncés d'un coup.

## 2026-11-25

- Neuf commentaires de l'utilisateur sur le design Claude Design appliqués sur la branche `feat/retouches-maquette` (voir `decisions.md`) : titre et ordre des étapes, puces centrées, cartes en fond (avant/après, vos règles), cercle de la frise au survol, formulaire prénom + nom, contact@daybydoc.fr. Tests écrits d'abord (structure, formulaire, textes connus, puces, cartes, survol en Chrome) ; `npm run check` et `check:requests` verts. Rien n'est poussé ni fusionné : à valider par l'utilisateur sur le rendu local.
- Maquettes Claude Design (6 planches) mises à jour avec les mêmes retouches, version 149 du design.
- Branches fusionnées supprimées (locales et GitHub).

## 2026-11-24

- Formulaire : au premier essai, l'envoi aboutissait à « Page introuvable » car la détection des formulaires était désactivée dans Netlify (Forms > Enable form detection). Activée par l'utilisateur, site redéployé : le formulaire `demo` est listé et l'envoi de test fonctionne. Notification e-mail vers contact@dbyd.fr créée, confirmée par lien, e-mail de test reçu (tout confirmé par l'utilisateur). Aucun changement de code.
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
