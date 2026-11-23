# Site vitrine DaybyDoc

Site statique (Astro) de présentation de DaybyDoc. Objectif : obtenir des demandes de démo d'ADOPS et de structures de permanence des soins. Déployé sur Netlify, domaine `www.daybydoc.fr`.

## Développement

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
npm run check      # build + contrôles (structure, textes des maquettes, formulaire, vidéo, animations)
npm run check:requests   # navigateur réel (Chrome requis) : requêtes tierces, cookies, débordements 320-1440 px
npm run og         # régénère public/og-image.png (logo blanc sur teal)
```

`npm run check:texts` compare les textes de `kit/maquettes/` (dossier local non versionné) à la page construite ; il est ignoré si `kit/` est absent.

## Structure

- `src/components/sections/` : une section de l'accueil par fichier (Hero, Preuves, AvantApres, CommentCaMarche, VosRegles, Profils, Integrations, Temoignage, Equipe, Deploiement, Faq, Demo).
- `src/scripts/` : JavaScript minimal (menu, accordéons, vidéo Vimeo au clic, validation du formulaire, apparitions).
- `src/content/legal/` : mentions légales et confidentialité (Markdown).
- `public/` : polices Poppins (woff2), `_redirects` (anciennes adresses Squarespace), `robots.txt`, image Open Graph.
- `netlify.toml` : commande de build, en-têtes de sécurité et de cache.

## Mise en ligne (Netlify)

1. Netlify > Add new site > Import from Git > ce dépôt. Build : `npm run build`, publication : `dist` (déjà dans `netlify.toml`).
2. Forms : vérifier que la détection des formulaires est active ; le formulaire `demo` apparaît après le premier déploiement.
3. Forms > Form notifications > e-mail vers `contact@dbyd.fr`.
4. Domain management : `www.daybydoc.fr` en domaine principal, `daybydoc.fr` redirige vers lui.
5. Tester sur l'adresse provisoire `*.netlify.app` (recette du BRIEF), puis seulement basculer le DNS.

## Bascule DNS (OVH) et Squarespace

Le domaine reste chez OVH (ne pas le transférer). Remplacer uniquement les enregistrements A / CNAME qui pointent vers Squarespace par ceux indiqués par Netlify. **Ne toucher à aucun enregistrement MX.** Résilier Squarespace une fois le nouveau site vérifié (HTTPS actif, redirection vers www, anciennes adresses redirigées).

## À renseigner avant le lancement

- Date de mise à jour dans `src/content/legal/confidentialite.md` (`[date de mise en ligne]`).
- Relire les textes des pages `/merci` et `/404` (rédigés sans maquette).
