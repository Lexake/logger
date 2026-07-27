# Contribuer à @lex0u/logger

Merci de vouloir contribuer ! Voici comment procéder.

## Setup

```bash
git clone https://github.com/Lex0u/logger.git
cd logger
npm install
npm run dev
```

## Workflow

1. Fork le repo et crée une branche depuis `main` (`feat/ma-fonctionnalite` ou `fix/mon-bug`)
2. Développe en respectant le style existant (TypeScript strict)
3. Ajoute/adapte les tests si besoin
4. Vérifie que `npm run build` et `npm test` passent
5. Ouvre une Pull Request en remplissant le template

```bash
git checkout -b "feat/ma-fonctionnalite"
git add .
git commit -m "feat/ma-fonctionnalite"
git push -u origin feat/ma-fonctionnalite
```

## Convention de commits

On suit une convention simple :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `refactor:` changement de code sans impact fonctionnel
- `docs:` documentation uniquement
- `chore:` maintenance (deps, config, CI)

## Signaler un bug ou proposer une idée

Utilise les templates d'issues disponibles (🐛 Bug report / ✨ Feature request).
