# 漢字道 · Kanji-dō

Application web pour apprendre les kanji et le japonais — leçons 1 à 7.

## 🚀 Déploiement gratuit sur GitHub Pages

### Étape 1 — Créer un compte GitHub
Rendez-vous sur [github.com](https://github.com) et créez un compte gratuit.

### Étape 2 — Créer un nouveau dépôt
1. Cliquez sur **New repository**
2. Nommez-le `kanji-app` (ou ce que vous voulez)
3. Cochez **Public**
4. Cliquez **Create repository**

### Étape 3 — Uploader les fichiers
Glissez-déposez ces 4 fichiers dans votre dépôt :
- `index.html`
- `style.css`
- `app.js`
- `data.js`

### Étape 4 — Activer GitHub Pages
1. Allez dans **Settings** → **Pages**
2. Source : **Deploy from a branch**
3. Branch : **main** → **/root**
4. Cliquez **Save**

### Étape 5 — Accéder à votre site
Après ~2 minutes, votre site sera accessible à :
`https://VOTRE_NOM.github.io/kanji-app/`

---

## 📚 Fonctionnalités

| Mode | Description | Points |
|------|-------------|--------|
| **Liste** | Parcourir les kanji par leçon avec toutes les lectures | — |
| **Flashcards** | Flip kanji → lectures + sens | +2 pts |
| **QCM** | Choisir la bonne lecture parmi 4 options | +5 pts |
| **Orthographe** | Taper la lecture ou le sens | +3 pts |
| **Mémoire** | Retrouver les paires kanji/sens | +10 pts |

## 🗂 Structure

```
kanji-app/
├── index.html   # Structure HTML
├── style.css    # Styles (thème encre japonaise)
├── app.js       # Logique des jeux
└── data.js      # Base de données des kanji (leçons 1-7)
```

## ➕ Ajouter des kanji

Dans `data.js`, ajoutez une entrée :
```js
{ kanji:"漢", on:["カン"], kun:["おとこ"], meaning:"Han, kanji", lecon:8 },
```
