/**
 * ═══════════════════════════════════════════════════════════
 *  PELO AIRWAYS — app.js
 *  Intégration Firebase Auth + Firestore + Realtime DB
 *  Admin : aichaabady0@gmail.com
 *
 *  Ce fichier expose l'objet global `App` avec :
 *    • App.saveReservation(data)  → Enregistre la réservation en DB
 *    • App.getFlightInfo(id)      → Récupère un vol par son ID
 *    • App.processPayment(amount) → Simule le paiement
 *    • App.resetBooking()         → Remet le site à zéro
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
//  Votre configuration est déjà prête ci-dessous.
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
//  Toutes les fonctions sont disponibles via window.App
// ─────────────────────────────────────────────────────────────
window.App = {

  // ───────────────────────────────────────────────
  //  App.saveReservation(data)
  //  Enregistre une réservation dans Firestore.
  //
  //  @param {Object} data — Données de réservation :
  //    {
  //      flightId, flightNumber,
  //      from: { city, iata },
  //      to:   { city, iata },
  //      departureDate, departureTime, arrivalTime,
  //      durationMin, aircraft,
  //      seat, price, totalPrice, timestamp
  //    }
  //  @returns {Promise<{ success: boolean, bookingId: string }>}
  // ───────────────────────────────────────────────
  saveReservation: async function(data) {
    console.log("[App.saveReservation] Enregistrement de la réservation :", data);

    /*
     *  ── IMPLÉMENTATION FIREBASE (à décommenter une fois Firebase initialisé) ──
     *
     *  try {
     *    const user = auth.currentUser;
     *    const docRef = await addDoc(collection(db, "bookings"), {
     *      ...data,
     *      userId:    user ? user.uid   : "anonymous",
     *      userEmail: user ? user.email : "anonymous",
     *      status:    "confirmed",
     *      createdAt: serverTimestamp(),
     *    });
     *
     *    // Met à jour les sièges disponibles du vol
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
     *
     *    return { success: true, bookingId: docRef.id };
     *  } catch (err) {
     *    console.error("[App.saveReservation] Erreur :", err);
     *    return { success: false, bookingId: null, error: err.message };
     *  }
     */

    // ── STUB (fonctionne sans Firebase) ──────────────────────
    // Génère un ID local et sauvegarde dans localStorage
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
  //  Récupère les informations d'un vol depuis Firestore.
  //
  //  @param {string} id — ID du vol (ex: "FL001")
  //  @returns {Promise<Object|null>}
  // ───────────────────────────────────────────────
  getFlightInfo: async function(id) {
    console.log("[App.getFlightInfo] Récupération du vol :", id);

    /*
     *  ── IMPLÉMENTATION FIREBASE ──
     *
     *  try {
     *    const snap = await getDoc(doc(db, "flights", id));
     *    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
     *  } catch (err) {
     *    console.error("[App.getFlightInfo] Erreur :", err);
     *    return null;
     *  }
     */

    // ── STUB ──────────────────────────────────────
    return null; // script.js utilise ses données locales en fallback
  },

  // ───────────────────────────────────────────────
  //  App.processPayment(amount)
  //  Traite le paiement (fictif — toujours 0 Robux ici).
  //
  //  @param {number} amount — Montant en euros (ou 0)
  //  @returns {Promise<{ success: boolean, transactionId: string }>}
  // ───────────────────────────────────────────────
  processPayment: async function(amount) {
    console.log("[App.processPayment] Traitement du paiement :", amount, "€");

    /*
     *  ── INTÉGRATION STRIPE / PAYMENT PROVIDER ──
     *
     *  Exemple avec Stripe :
     *  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
     *    payment_method: { card: cardElement }
     *  });
     *  if (error) throw new Error(error.message);
     *  return { success: true, transactionId: paymentIntent.id };
     */

    // ── STUB : simulation d'un délai de paiement ──
    await new Promise(resolve => setTimeout(resolve, 800));
    const transactionId = "TXN-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    console.log("[App.processPayment] Transaction simulée :", transactionId);
    return { success: true, transactionId };
  },

  // ───────────────────────────────────────────────
  //  App.resetBooking()
  //  Remet l'application à l'état initial (retour page recherche).
  // ───────────────────────────────────────────────
  resetBooking: function() {
    console.log("[App.resetBooking] Réinitialisation de la réservation.");

    // Recharge la page pour repartir de zéro
    location.reload();
  },

  // ───────────────────────────────────────────────
  //  App.getCurrentUser()
  //  [OPTIONNEL] Retourne l'utilisateur Firebase connecté.
  //  @returns {Object|null}
  // ───────────────────────────────────────────────
  getCurrentUser: function() {
    /*
     *  return auth.currentUser;
     */
    return null; // stub
  },

  // ───────────────────────────────────────────────
  //  App.getUserBookings()
  //  [OPTIONNEL] Récupère l'historique des réservations de l'utilisateur.
  //  @returns {Promise<Array>}
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

    // ── STUB : lit depuis localStorage ────────────
    try {
      return JSON.parse(localStorage.getItem("pelo_bookings") || "[]");
    } catch { return []; }
  },

};

// ─────────────────────────────────────────────────────────────
//  INITIALISATION FIREBASE
//  Décommentez ce bloc une fois que vos imports ES Module
//  sont actifs (voir en-tête du fichier).
// ─────────────────────────────────────────────────────────────
/*
const firebaseApp = initializeApp(FIREBASE_CONFIG);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);
const rtdb        = getDatabase(firebaseApp);

// Écoute l'état de connexion
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
