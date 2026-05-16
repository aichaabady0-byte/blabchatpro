const express = require('express');
const path = require('path');
const app = express();

// 1. Sert tous les fichiers statiques (le CSS, le JS du client, les images)
// On considère ici que tes fichiers (index.html, style.css, etc.) sont directement à la racine ou dans un dossier.
// Si tes fichiers sont dans un dossier nommé "public", remplace '.' par 'public'
app.use(express.static(path.join(__dirname, '.')));

// 2. Redirige la racine du site vers index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. Écoute sur le port fourni par Render (ou 3000 en local)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Le site est en ligne sur http://localhost:${PORT}`);
});