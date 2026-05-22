/**
 * ═══════════════════════════════════════════════════════════
 *  PELO AIRWAYS — server.js  (SERVEUR NODE.JS / EXPRESS)
 *  Déployé sur Render — sert les fichiers statiques du site
 *
 *  Architecture :
 *    server.js    → ce fichier (serveur Express, Node.js)
 *    app.js       → logique Firebase + FileFac côté navigateur
 *    script.js    → logique UI côté navigateur
 *    index.html   → interface principale
 *    filefac.html → gestionnaire de fiches FileFac
 * ═══════════════════════════════════════════════════════════
 */

const express = require("express");
const path    = require("path");
const app     = express();
const PORT    = process.env.PORT || 3000;

// ── Sert tous les fichiers statiques du dossier courant ──
app.use(express.static(path.join(__dirname)));

// ── Route racine → index.html ──
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Route filefac directe (sans extension) ──
app.get("/filefac", (req, res) => {
  res.sendFile(path.join(__dirname, "filefac.html"));
});

// ── Route FileFac : /f/:token ──────────────────────────────
// DOIT être avant le fallback * sinon index.html intercepte tout
// Le token est décodé côté client dans filefac.html (checkRoute)
app.get("/f/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "filefac.html"));
});

// ── Toute autre route → index.html (SPA fallback) ──
// CE BLOC DOIT TOUJOURS ÊTRE EN DERNIER
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Démarrage ──
app.listen(PORT, () => {
  console.log(`✈  Pelo Airways — Serveur démarré sur le port ${PORT}`);
});
