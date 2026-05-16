const express = require('express');
const path = require('path');
const app = express();

// Option B : Rediriger spécifiquement la racine '/' vers le fichier index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
    // Ajuste le chemin si ton fichier est dans un sous-dossier (ex: 'public/index.html')
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
