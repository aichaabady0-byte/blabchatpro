/**
 * ═══════════════════════════════════════════════════════════
 *  PELO AIRWAYS — app.js  (SERVEUR NODE.JS / EXPRESS)
 *  Déployé sur Render — sert les fichiers statiques du site
 *
 *  Architecture :
 *    app.js       → ce fichier (serveur Express, Node.js)
 *    firebase.js  → logique Firebase côté navigateur
 *    script.js    → logique UI côté navigateur
 *    index.html   → interface
 * ═══════════════════════════════════════════════════════════
 */

const express = require("express");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Sert tous les fichiers statiques du dossier courant ──
app.use(express.static(path.join(__dirname)));

// ── Route racine → index.html ──
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Toute autre route → index.html (SPA fallback) ──
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Démarrage ──
app.listen(PORT, () => {
  console.log(`✈  Pelo Airways — Serveur démarré sur le port ${PORT}`);
});
