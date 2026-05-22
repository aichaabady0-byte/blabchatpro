/**
 * ═══════════════════════════════════════════════════════════
 *  PELO AIRWAYS — app.js  (CÔTÉ NAVIGATEUR)
 *  Intégration Firebase Auth + Firestore + Realtime DB
 *  Admin : aichaabady0@gmail.com
 *
 *  Ce fichier expose l'objet global `App` avec :
 *    • App.saveReservation(data)  → Enregistre la réservation en DB
 *    • App.getFlightInfo(id)      → Récupère un vol par son ID
 *    • App.processPayment(amount) → Simule le paiement
 *    • App.resetBooking()         → Remet le site à zéro
 *    • App.FileFac                → Gestionnaire de fiches FileFac
 *
 *  script.js vérifie l'existence de ces fonctions AVANT d'appeler
 *  ce fichier, donc tout fonctionne même si vous videz ce fichier.
 * ═══════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
//  IMPORTS FIREBASE (ES Modules CDN)
//  Décommentez ces lignes si vous utilisez ce fichier en module
//  (ajoutez type="module" sur la balise <script src="app.js"> dans index.html)
// ─────────────────────────────────────────────────────────────
/*
import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged }          from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc,
  addDoc, getDoc, updateDoc,
  serverTimestamp,
}                                               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getDatabase, ref, set, get, push,
}                                               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
*/

// ─────────────────────────────────────────────────────────────
//  CONFIG FIREBASE
// ─────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyD7nXt2AKL5ugYwMiLEyBizZ7O8eEAjeI8",
  authDomain:        "pelo-airways.firebaseapp.com",
  databaseURL:       "https://pelo-airways-default-rtdb.firebaseio.com",
  projectId:         "pelo-airways",
  storageBucket:     "pelo-airways.firebasestorage.app",
  messagingSenderId: "467053762663",
  appId:             "1:467053762663:web:e48a493fe1bade54cf5cc2",
  measurementId:     "G-0PHJLT1YHC",
};

const ADMIN_EMAIL = "aichaabady0@gmail.com";

// ─────────────────────────────────────────────────────────────
//  OBJET APP GLOBAL
// ─────────────────────────────────────────────────────────────
window.App = {

  // ───────────────────────────────────────────────
  //  App.saveReservation(data)
  // ───────────────────────────────────────────────
  saveReservation: async function(data) {
    console.log("[App.saveReservation] Enregistrement de la réservation :", data);

    /*
     *  ── IMPLÉMENTATION FIREBASE ──
     *  try {
     *    const user = auth.currentUser;
     *    const docRef = await addDoc(collection(db, "bookings"), {
     *      ...data,
     *      userId:    user ? user.uid   : "anonymous",
     *      userEmail: user ? user.email : "anonymous",
     *      status:    "confirmed",
     *      createdAt: serverTimestamp(),
     *    });
     *    const flightRef = doc(db, "flights", data.flightId);
     *    const flightSnap = await getDoc(flightRef);
     *    if (flightSnap.exists()) {
     *      const flight = flightSnap.data();
     *      const newSeats = Math.max(0, flight.seatsAvailable - 1);
     *      await updateDoc(flightRef, {
     *        seatsAvailable: newSeats,
     *        status: newSeats <= 0 ? "full" : "active",
     *      });
     *    }
     *    return { success: true, bookingId: docRef.id };
     *  } catch (err) {
     *    console.error("[App.saveReservation] Erreur :", err);
     *    return { success: false, bookingId: null, error: err.message };
     *  }
     */

    // ── STUB ──────────────────────────────────────
    const bookingId = "PELO-" + Date.now();
    try {
      const bookings = JSON.parse(localStorage.getItem("pelo_bookings") || "[]");
      bookings.push({ ...data, bookingId, savedAt: new Date().toISOString() });
      localStorage.setItem("pelo_bookings", JSON.stringify(bookings));
    } catch (e) { /* localStorage peut être bloqué */ }

    return { success: true, bookingId };
  },

  // ───────────────────────────────────────────────
  //  App.getFlightInfo(id)
  // ───────────────────────────────────────────────
  getFlightInfo: async function(id) {
    console.log("[App.getFlightInfo] Récupération du vol :", id);
    /*
     *  FIREBASE :
     *  try {
     *    const snap = await getDoc(doc(db, "flights", id));
     *    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
     *  } catch (err) {
     *    console.error("[App.getFlightInfo] Erreur :", err);
     *    return null;
     *  }
     */
    return null;
  },

  // ───────────────────────────────────────────────
  //  App.processPayment(amount)
  // ───────────────────────────────────────────────
  processPayment: async function(amount) {
    console.log("[App.processPayment] Traitement du paiement :", amount, "€");
    await new Promise(resolve => setTimeout(resolve, 800));
    const transactionId = "TXN-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    console.log("[App.processPayment] Transaction simulée :", transactionId);
    return { success: true, transactionId };
  },

  // ───────────────────────────────────────────────
  //  App.resetBooking()
  // ───────────────────────────────────────────────
  resetBooking: function() {
    console.log("[App.resetBooking] Réinitialisation de la réservation.");
    location.reload();
  },

  // ───────────────────────────────────────────────
  //  App.getCurrentUser()
  // ───────────────────────────────────────────────
  getCurrentUser: function() {
    /*  return auth.currentUser; */
    return null;
  },

  // ───────────────────────────────────────────────
  //  App.getUserBookings()
  // ───────────────────────────────────────────────
  getUserBookings: async function() {
    /*
     *  FIREBASE :
     *  const user = auth.currentUser;
     *  if (!user) return [];
     *  const q = query(
     *    collection(db, "bookings"),
     *    where("userId", "==", user.uid),
     *    orderBy("createdAt", "desc")
     *  );
     *  const snap = await getDocs(q);
     *  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
     */
    try {
      return JSON.parse(localStorage.getItem("pelo_bookings") || "[]");
    } catch { return []; }
  },

  // ───────────────────────────────────────────────
  //  App.FileFac — Gestionnaire de fiches
  //  Utilisé par filefac.html pour stocker/récupérer
  //  les fiches en localStorage.
  //
  //  Clé localStorage : "filefac_fiches"
  //  Chaque fiche :
  //    { id, titre, type, fileName, details, createdAt, updatedAt }
  // ───────────────────────────────────────────────
  FileFac: {
    DB: "filefac_fiches",

    /** Charge toutes les fiches depuis localStorage */
    load() {
      try {
        return JSON.parse(localStorage.getItem(this.DB)) || [];
      } catch {
        return [];
      }
    },

    /** Persiste le tableau complet en localStorage */
    save(fiches) {
      try {
        localStorage.setItem(this.DB, JSON.stringify(fiches));
      } catch (e) {
        console.error("[App.FileFac] Erreur localStorage :", e);
      }
    },

    /**
     * Crée ou met à jour une fiche.
     * Si une fiche avec le même id existe → mise à jour.
     * Sinon → ajout en tête de liste.
     */
    upsert(fiche) {
      const list = this.load();
      const idx  = list.findIndex(f => f.id === fiche.id);
      if (idx >= 0) {
        list[idx] = fiche;
      } else {
        list.unshift(fiche);
      }
      this.save(list);
      console.log("[App.FileFac] Fiche sauvegardée :", fiche.id, fiche.titre);
    },

    /**
     * Supprime une fiche par son ID.
     */
    remove(id) {
      const list = this.load().filter(f => f.id !== id);
      this.save(list);
      console.log("[App.FileFac] Fiche supprimée :", id);
    },

    /**
     * Récupère une fiche par son ID.
     */
    get(id) {
      return this.load().find(f => f.id === id) || null;
    },

    /**
     * Vide toutes les fiches (debug).
     */
    clear() {
      this.save([]);
      console.log("[App.FileFac] Toutes les fiches supprimées.");
    },
  },

};

// ─────────────────────────────────────────────────────────────
//  INITIALISATION FIREBASE (décommenter pour activer)
// ─────────────────────────────────────────────────────────────
/*
const firebaseApp = initializeApp(FIREBASE_CONFIG);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);
const rtdb        = getDatabase(firebaseApp);

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("[App] Utilisateur connecté :", user.email);
  } else {
    console.log("[App] Utilisateur non connecté.");
  }
});

console.log("[App] Firebase initialisé ✓");
*/

// ─────────────────────────────────────────────────────────────
//  LOG DE DÉMARRAGE
// ─────────────────────────────────────────────────────────────
console.log("[Pelo Airways] app.js chargé ✓ — Mode : stub local (Firebase non connecté)");
console.log("[Pelo Airways] Pour activer Firebase, décommentez les imports et l'init en haut de ce fichier.");
