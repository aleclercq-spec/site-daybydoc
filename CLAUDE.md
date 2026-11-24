# Site vitrine DaybyDoc

Site statique Astro (5 pages) pour obtenir des demandes de démo d'ADOPS et de structures de permanence des soins. Déployé sur Netlify depuis la branche `main`. Domaine cible : `www.daybydoc.fr`.

## Commandes

```bash
npm run dev              # serveur de développement, http://localhost:4321
npm run build            # génère dist/
npm run check            # build + tous les contrôles (à lancer avant tout commit)
npm run check:requests   # contrôles en navigateur réel (Chrome requis), à lancer après un changement visuel
```

## Documentation du projet : règle à suivre

La documentation vit dans `docs/` et fait partie du projet : elle est versionnée avec le code. **Elle doit être tenue à jour à chaque modification, dans le même commit que le changement qu'elle décrit.** Un changement fini sans sa documentation n'est pas fini.

| Fichier | Contenu | À mettre à jour quand |
|---|---|---|
| `docs/fonctionnement.md` | Comment le site fonctionne : structure, sections, comportements, formulaire, design, SEO, sécurité, contrôles, déploiement | on ajoute, modifie ou retire une fonctionnalité, une section, un comportement, un réglage |
| `docs/decisions.md` | Chaque décision, avec sa date, ce qui a été choisi, **pourquoi**, ce qui a été écarté et ce que ça coûte si c'est faux | on prend un parti (design, technique, périmètre, outil), on s'écarte d'une consigne ou de la maquette |
| `docs/journal.md` | Ce qui a été fait, par date, du plus récent au plus ancien, et la liste « à faire / en attente » | à la fin de chaque session de travail ou après chaque livraison (branche poussée, fusion, déploiement) |

Règles d'écriture :
- En français, concis, factuel. Dates au format `AAAA-MM-JJ`.
- Une décision = une entrée dans `decisions.md`. Ne jamais réécrire l'historique : si une décision change, ajouter une nouvelle entrée qui remplace l'ancienne (« remplace la décision du … ») et marquer l'ancienne « remplacée ».
- Documenter le *pourquoi* et les limites connues, pas seulement le *quoi* : le code dit déjà ce qu'il fait.
- Garder `docs/fonctionnement.md` exact : il décrit l'état actuel du site, pas son histoire (l'histoire est dans `journal.md`).
- Ne jamais y mettre de secret, de mot de passe, de clé d'API ni de donnée personnelle de visiteur.
- Les documents de cadrage de départ restent dans `docs/superpowers/` (conception et plan du 2026-11-23) : ne pas les modifier, ils datent.
- En fin de tâche, relire les trois fichiers : s'ils ne reflètent pas le changement, les corriger avant de conclure.

## Règles de travail

- Les textes des maquettes sont repris à l'identique, sans reformulation. `npm run check:texts` compare les textes à `kit/` (dossier local, non versionné).
- Travailler sur une branche, jamais directement sur `main` : un push sur `main` déclenche un déploiement Netlify. Ne pousser et ne fusionner qu'avec l'accord de l'utilisateur.
- Ne jamais committer `kit/` (maquettes et assets sources, exclu par `.gitignore`).
- Corail (`#F28C6F`) en accent graphique ; seul bouton corail autorisé : celui du hero, avec texte teal foncé, jamais de texte blanc sur corail.
- Aucun cookie, aucune ressource tierce au chargement (le lecteur Vimeo ne se charge qu'au clic, avec `dnt=1`).
- Toute nouvelle règle de comportement ou de design s'accompagne d'un test dans `scripts/` écrit d'abord.
