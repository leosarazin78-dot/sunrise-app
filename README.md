# 🌅 Sunrise — Réveil vocal intelligent

## Déployer sur Vercel en 5 minutes

### Prérequis
- Un compte GitHub (gratuit) → https://github.com
- Un compte Vercel (gratuit) → https://vercel.com

---

### Étape 1 : Installer les outils

Si tu n'as pas encore Node.js et Git :

```bash
# macOS (avec Homebrew)
brew install node git

# Ou télécharge directement :
# Node.js → https://nodejs.org (prends la version LTS)
# Git → https://git-scm.com
```

Vérifie que tout marche :
```bash
node --version    # doit afficher v18+ ou v20+
git --version     # doit afficher git version 2.x
```

---

### Étape 2 : Préparer le projet

```bash
# Va dans le dossier du projet (là où tu as décompressé le ZIP)
cd sunrise-deploy

# Installe les dépendances
npm install

# Teste en local
npm run dev
```

→ Ouvre http://localhost:5173 dans ton navigateur. Tu devrais voir l'app Sunrise.

---

### Étape 3 : Créer le repo GitHub

```bash
# Initialise Git
git init
git add .
git commit -m "🌅 Sunrise v1 — premier déploiement"

# Crée un repo sur GitHub (va sur github.com → New Repository → "sunrise-app")
# Puis connecte-le :
git remote add origin https://github.com/TON-USERNAME/sunrise-app.git
git branch -M main
git push -u origin main
```

---

### Étape 4 : Déployer sur Vercel

1. Va sur **https://vercel.com** et connecte-toi avec ton compte GitHub
2. Clique sur **"Add New Project"**
3. Sélectionne ton repo **sunrise-app**
4. Vercel détecte automatiquement que c'est un projet Vite
5. Clique sur **"Deploy"**
6. Attends 30-60 secondes...
7. **C'est en ligne !** Tu reçois une URL du type `sunrise-app.vercel.app`

---

### Étape 5 : Installer sur iPhone (PWA)

1. Ouvre **Safari** sur ton iPhone
2. Va sur ton URL Vercel (ex: `sunrise-app.vercel.app`)
3. Appuie sur le bouton **Partager** (carré avec flèche vers le haut)
4. Scrolle et appuie sur **"Sur l'écran d'accueil"**
5. Nomme l'app "Sunrise" et appuie sur **Ajouter**
6. L'icône Sunrise apparaît sur ton écran d'accueil comme une vraie app !

---

### Étape 6 : Domaine personnalisé (optionnel)

Si tu veux une URL propre comme `sunrise-alarm.fr` :

1. Achète un domaine sur OVH, Gandi ou Namecheap (~10€/an)
2. Dans Vercel → Settings → Domains → ajoute ton domaine
3. Configure les DNS comme indiqué par Vercel
4. HTTPS est automatique et gratuit

---

## Commandes utiles

```bash
npm run dev       # Lance en local (développement)
npm run build     # Compile pour la production
npm run preview   # Prévisualise le build de production
```

## Structure du projet

```
sunrise-deploy/
├── public/
│   ├── manifest.json    ← Config PWA (nom, icônes, couleurs)
│   ├── sw.js            ← Service Worker (cache offline)
│   ├── icon-192.png     ← Icône app petite
│   └── icon-512.png     ← Icône app grande
├── src/
│   ├── main.jsx         ← Point d'entrée React
│   └── App.jsx          ← L'app Sunrise complète
├── index.html           ← Page HTML racine
├── package.json         ← Dépendances npm
├── vite.config.js       ← Config du bundler Vite
└── README.md            ← Ce fichier
```

## Mises à jour

Pour déployer une mise à jour :
```bash
# Modifie tes fichiers, puis :
git add .
git commit -m "✨ nouvelle feature"
git push
```
Vercel redéploie automatiquement en ~30 secondes.

---

## Prochaines étapes vers l'App Store

Ce prototype PWA valide le concept. Pour l'App Store iOS :
1. Convertir en React Native (`npx react-native init SunriseApp`)
2. Migrer la logique React (90% réutilisable)
3. Ajouter les modules natifs (notifications, audio background)
4. Tester via TestFlight
5. Soumettre via App Store Connect (compte Apple Developer 99€/an)
