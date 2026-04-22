# Creative To-Do List App

Une application To-Do List moderne réalisée avec **HTML, CSS, JavaScript, Bootstrap** et un **backend Node.js/Express** pour l’authentification des utilisateurs.

## Fonctionnalités

- Inscription et connexion utilisateur.
- Authentification avec JWT.
- Ajout, modification, suppression des tâches.
- Marquer une tâche comme terminée.
- Filtrer les tâches : toutes, actives, terminées.
- Recherche rapide.
- Priorité des tâches.
- Date limite.
- Interface simple, créative et responsive.

## Technologies utilisées

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5

### Backend
- Node.js
- Express.js
- bcryptjs
- jsonwebtoken
- cors
- dotenv

## Structure du projet

```bash
todo-app/
├─ frontend/
│  ├─ index.html
│  ├─ style.css
│  └─ app.js
├─ backend/
│  ├─ server.js
│  ├─ .env
│  └─ package.json
└─ README.md
```

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Hanane-ELFADIL/todo-app.git
cd todo-app
```

### 2. Installer le backend

```bash
cd backend
npm install
```

Si besoin, installe manuellement les dépendances :

```bash
npm install express cors dotenv jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

### 3. Configurer le fichier `.env`

Créer un fichier `.env` dans le dossier `backend` :

```env
PORT=3000
JWT_SECRET=ma_cle_secrete
```

### 4. Lancer le backend

```bash
npm run dev
```

Le serveur tourne sur :

```bash
http://localhost:3000
```

### 5. Lancer le frontend

Ouvre `frontend/index.html` avec **Live Server** dans VS Code.
