const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

// 1. Configurer EJS comme moteur de vue
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Servir les fichiers statiques (CSS, JS côté client)
// Tout ce qui est dans 'public' est accessible directement (ex: /css/styles.css)
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES (Redirections) ---

// Page d'accueil
app.get('/', (req, res) => {
    res.render('index', { 
        title: "Hidden snake",
        date: new Date().toLocaleDateString("fr-FR") // Exemple de donnée dynamique
    });
});

// Page des Conditions Générales (Là où est le jeu)
app.get('/politique', (req, res) => {
    res.render('privacy', { 
        title: "Politique de Confidentialité",
        date: new Date().toLocaleDateString("fr-FR")
    });
});

app.get('/index', (req, res) => {
    res.render('index', { 
        title: "Hidden snake",
        date: new Date().toLocaleDateString("fr-FR") // Exemple de donnée dynamique
    });
});

app.get('/snake_nokia', (req, res) => {
    res.render('snake_nokia', { 
        title: "Hidden snake",
        date: new Date().toLocaleDateString("fr-FR") // Exemple de donnée dynamique
    });
});

app.get('/snake_discord', (req, res) => {
    res.render('snake_discord', { 
        title: "Hidden snake",
        date: new Date().toLocaleDateString("fr-FR") // Exemple de donnée dynamique
    });
});

app.get('/snake_arcade', (req, res) => {
    res.render('snake_arcade', { 
        title: "Hidden snake",
        date: new Date().toLocaleDateString("fr-FR") // Exemple de donnée dynamique
    });
});

app.get('/hacker_corner', (req, res) => {
    res.render('hacker_corner', { 
        title: "Hidden snake",
        date: new Date().toLocaleDateString("fr-FR") // Exemple de donnée dynamique
    });
});

app.get('/api/my-ip', (req, res) => {
    // Récupère l'IP (gère les cas derrière un proxy comme Heroku ou Nginx)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.json({ ip: ip });
});

// Redirection pour toute autre page (404)
app.use((req, res) => {
    res.status(404).render('index', { title: "Page introuvable" });
});

app.listen(PORT, () => {
    console.log(`🐍 Serveur prêt sur http://localhost:${PORT}`);
});