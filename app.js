// ═══════════════════════════════════════════════════════════════
//  PELO AIRWAYS — app.js
//  Firebase : Auth + Firestore + Realtime DB
//  Admin    : aichaabady0@gmail.com
// ═══════════════════════════════════════════════════════════════

import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics }                         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
}                                               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection, doc,
  setDoc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
  serverTimestamp, writeBatch,
}                                               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getDatabase, ref, set, get, push,
}                                               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ─────────────────────────────────────────
//  CONFIG & INIT
// ─────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyD7nXt2AKL5ugYwMiLEyBizZ7O8eEAjeI8",
  authDomain:        "pelo-airways.firebaseapp.com",
  databaseURL:       "https://pelo-airways-default-rtdb.firebaseio.com",
  projectId:         "pelo-airways",
  storageBucket:     "pelo-airways.firebasestorage.app",
  messagingSenderId: "467053762663",
  appId:             "1:467053762663:web:e48a493fe1bade54cf5cc2",
  measurementId:     "G-0PHJLT1YHC",
};

const firebaseApp = initializeApp(firebaseConfig);
const analytics   = getAnalytics(firebaseApp);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);
const rtdb        = getDatabase(firebaseApp);

export const ADMIN_EMAIL = "aichaabady0@gmail.com";

// ─────────────────────────────────────────
//  SEED DATA
// ─────────────────────────────────────────
const SEED_DESTINATIONS = [
  { id:"dest_BCN", name:"Barcelone",   country:"Espagne",            iata:"BCN", airport:"Barcelone-El Prat",       description:"Capitale de la Catalogne, Sagrada Família et plages magnifiques.",   imageUrl:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600", popular:true  },
  { id:"dest_LIS", name:"Lisbonne",    country:"Portugal",           iata:"LIS", airport:"Humberto Delgado",         description:"Tramways colorés, pastéis de nata et couchers de soleil inoubliables.", imageUrl:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600", popular:true  },
  { id:"dest_DUB", name:"Dublin",      country:"Irlande",            iata:"DUB", airport:"Aéroport de Dublin",       description:"Pubs chaleureux, verdure et culture celtique authentique.",           imageUrl:"https://images.unsplash.com/photo-1549918864-48ac978761a4?w=600", popular:false },
  { id:"dest_ROM", name:"Rome",        country:"Italie",             iata:"FCO", airport:"Leonardo da Vinci",        description:"Colisée, Vatican, fontaine de Trevi — la Ville Éternelle.",          imageUrl:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600", popular:true  },
  { id:"dest_AMS", name:"Amsterdam",   country:"Pays-Bas",           iata:"AMS", airport:"Schiphol",                 description:"Canaux romantiques, musées world-class et vélos partout.",           imageUrl:"https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600", popular:true  },
  { id:"dest_ATH", name:"Athènes",     country:"Grèce",              iata:"ATH", airport:"Elefthérios-Venizélos",   description:"L'Acropole, l'histoire vivante et les meilleures tavernes.",          imageUrl:"https://images.unsplash.com/photo-1555993539-1732b0258235?w=600", popular:true  },
  { id:"dest_PRG", name:"Prague",      country:"République Tchèque", iata:"PRG", airport:"Václav Havel",            description:"La ville aux cent clochers, médiévale et magique.",                   imageUrl:"https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=600", popular:false },
  { id:"dest_MLA", name:"Malte",       country:"Malte",              iata:"MLA", airport:"Int. de Malte",           description:"Île méditerranéenne aux eaux turquoise et à l'histoire millénaire.", imageUrl:"https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=600", popular:false },
  { id:"dest_MAD", name:"Madrid",      country:"Espagne",            iata:"MAD", airport:"Adolfo Suárez Barajas",   description:"Prado, tapas, flamenco — la capitale vibrante de l'Espagne.",         imageUrl:"https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600", popular:true  },
  { id:"dest_VIE", name:"Vienne",      country:"Autriche",           iata:"VIE", airport:"Schwechat",               description:"Palais impériaux, cafés historiques et musique classique.",           imageUrl:"https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600", popular:false },
];

const SEED_FLIGHTS = [
  { id:"FL001", flightNumber:"PW101", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Barcelone",iata:"BCN",airport:"El Prat"},         departureDate:"2026-06-10", departureTime:"07:30", arrivalTime:"09:15", durationMin:105, price:29.99, seatsTotal:189, seatsAvailable:47,  status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL002", flightNumber:"PW102", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Lisbonne",iata:"LIS",airport:"Humberto Delgado"}, departureDate:"2026-06-12", departureTime:"10:00", arrivalTime:"11:45", durationMin:105, price:34.99, seatsTotal:189, seatsAvailable:112, status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL003", flightNumber:"PW203", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Rome",iata:"FCO",airport:"Leonardo da Vinci"},    departureDate:"2026-06-15", departureTime:"14:20", arrivalTime:"16:40", durationMin:140, price:49.99, seatsTotal:189, seatsAvailable:23,  status:"active",   aircraft:"Airbus A320"    },
  { id:"FL004", flightNumber:"PW304", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Amsterdam",iata:"AMS",airport:"Schiphol"},        departureDate:"2026-06-18", departureTime:"06:45", arrivalTime:"08:55", durationMin:130, price:39.99, seatsTotal:189, seatsAvailable:0,   status:"full",     aircraft:"Boeing 737-800" },
  { id:"FL005", flightNumber:"PW405", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Dublin",iata:"DUB",airport:"Aéroport de Dublin"}, departureDate:"2026-06-20", departureTime:"11:30", arrivalTime:"13:00", durationMin:150, price:44.99, seatsTotal:189, seatsAvailable:78,  status:"active",   aircraft:"Airbus A320"    },
  { id:"FL006", flightNumber:"PW506", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Athènes",iata:"ATH",airport:"Elefthérios"},       departureDate:"2026-06-22", departureTime:"08:00", arrivalTime:"11:30", durationMin:210, price:59.99, seatsTotal:189, seatsAvailable:55,  status:"active",   aircraft:"Airbus A321"    },
  { id:"FL007", flightNumber:"PW607", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Prague",iata:"PRG",airport:"Václav Havel"},       departureDate:"2026-06-25", departureTime:"16:10", arrivalTime:"18:50", durationMin:160, price:24.99, seatsTotal:189, seatsAvailable:134, status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL008", flightNumber:"PW707", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Malte",iata:"MLA",airport:"Int. de Malte"},       departureDate:"2026-07-01", departureTime:"09:00", arrivalTime:"12:15", durationMin:195, price:54.99, seatsTotal:189, seatsAvailable:88,  status:"active",   aircraft:"Airbus A320"    },
  { id:"FL009", flightNumber:"PW808", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Madrid",iata:"MAD",airport:"Adolfo Suárez"},      departureDate:"2026-07-05", departureTime:"13:00", arrivalTime:"14:45", durationMin:105, price:19.99, seatsTotal:189, seatsAvailable:160, status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL010", flightNumber:"PW909", from:{city:"Bordeaux",iata:"BOD",airport:"Bordeaux-Mérignac"}, to:{city:"Barcelone",iata:"BCN",airport:"El Prat"},         departureDate:"2026-06-05", departureTime:"15:30", arrivalTime:"17:15", durationMin:105, price:19.99, seatsTotal:189, seatsAvailable:0,   status:"cancelled", aircraft:"Boeing 737-800" },
];

const SEED_PROMOTIONS = [
  { id:"promo_summer",     title:"Les bons plans de l'été",   subtitle:"",                              description:"Partez cet été à prix mini sur toutes nos destinations.",              priceFrom:24.99, badgeText:"À partir de 24,99 €", startDate:"2026-05-01", endDate:"2026-08-31", active:true,  priority:1 },
  { id:"promo_graduation", title:"Ils ont survécu à la fac ?", subtitle:"Il est temps de faire une pause", description:"Récompensez-les avec une carte cadeau Pelo Airways de 25 € ou plus.", priceFrom:25.00, badgeText:"Carte cadeau",         startDate:"2026-06-01", endDate:"2026-07-31", active:true,  priority:2 },
  { id:"promo_autumn",     title:"Automne en Europe",         subtitle:"",                              description:"Escapades d'automne à prix doux. Barcelone, Lisbonne, Prague...",      priceFrom:19.99, badgeText:"Dès 19,99 €",          startDate:"2026-09-01", endDate:"2026-11-30", active:false, priority:3 },
];

const SEED_ADS = [
  { id:"ad_hero_01",    title:"Vols pas chers vers l'Europe",    description:"Réservez maintenant et économisez jusqu'à 60%.", ctaText:"Voir les offres", ctaLink:"search.html", position:"hero",    active:true  },
  { id:"ad_banner_01",  title:"Location de voiture dès 15€/jour", description:"Partenaires vérifiés dans tous nos aéroports.", ctaText:"Réserver",       ctaLink:"#",           position:"banner",  active:true  },
  { id:"ad_sidebar_01", title:"Hôtels à prix réduit",            description:"Plus de 10 000 hôtels négociés pour vous.",      ctaText:"Découvrir",      ctaLink:"#",           position:"sidebar", active:true  },
  { id:"ad_sidebar_02", title:"Assurance voyage",                description:"Voyagez l'esprit tranquille dès 4,99€.",         ctaText:"En savoir plus", ctaLink:"#",           position:"sidebar", active:false },
];

// ─────────────────────────────────────────
//  SEEDER
// ─────────────────────────────────────────
export async function seedAll() {
  try {
    const batch = writeBatch(db);
    for (const d of SEED_DESTINATIONS) batch.set(doc(db,"destinations",d.id), {...d, createdAt:serverTimestamp()});
    for (const f of SEED_FLIGHTS)      batch.set(doc(db,"flights",f.id),      {...f, createdAt:serverTimestamp()});
    for (const p of SEED_PROMOTIONS)   batch.set(doc(db,"promotions",p.id),   {...p, createdAt:serverTimestamp()});
    for (const a of SEED_ADS)          batch.set(doc(db,"ads",a.id),          {...a, createdAt:serverTimestamp()});
    await batch.commit();
    await set(ref(rtdb,"stats"), { totalFlights:SEED_FLIGHTS.length, activeFlights:SEED_FLIGHTS.filter(f=>f.status==="active").length, totalDestinations:SEED_DESTINATIONS.length, visitors:0 });
    console.log("✅ Seed terminé !");
    return true;
  } catch(e) { console.error("Seed error:", e); return false; }
}

// ─────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────
export async function registerUser(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(db,"users",cred.user.uid), {
    uid: cred.user.uid, email, displayName,
    role: email === ADMIN_EMAIL ? "admin" : "user",
    bookings: [], createdAt: serverTimestamp(), lastLogin: serverTimestamp(),
  });
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await updateDoc(doc(db,"users",cred.user.uid), { lastLogin: serverTimestamp() }).catch(()=>{});
  return cred.user;
}

export async function logoutUser() { await signOut(auth); }

export function onAuthChange(cb) { return onAuthStateChanged(auth, cb); }

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db,"users",uid));
  return snap.exists() ? snap.data() : null;
}

export async function isAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  if (user.email === ADMIN_EMAIL) return true;
  const p = await getUserProfile(user.uid);
  return p?.role === "admin";
}

export function currentUser() { return auth.currentUser; }

// ─────────────────────────────────────────
//  DESTINATIONS
// ─────────────────────────────────────────
export async function getAllDestinations() {
  const snap = await getDocs(collection(db,"destinations"));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function getPopularDestinations() {
  const q = query(collection(db,"destinations"), where("popular","==",true));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function getDestinationById(id) {
  const snap = await getDoc(doc(db,"destinations",id));
  return snap.exists() ? {id:snap.id,...snap.data()} : null;
}
export async function addDestination(data)      { return await addDoc(collection(db,"destinations"), {...data, createdAt:serverTimestamp()}); }
export async function updateDestination(id,data){ await updateDoc(doc(db,"destinations",id), {...data, updatedAt:serverTimestamp()}); }
export async function deleteDestination(id)     { await deleteDoc(doc(db,"destinations",id)); }

// ─────────────────────────────────────────
//  VOLS
// ─────────────────────────────────────────
export async function getActiveFlights() {
  const q = query(collection(db,"flights"), where("status","==","active"), orderBy("departureDate"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function getAllFlights() {
  const snap = await getDocs(query(collection(db,"flights"), orderBy("departureDate")));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function searchFlights({fromIata, toIata, date}) {
  let constraints = [
    collection(db,"flights"),
    where("from.iata","==",fromIata),
    where("to.iata","==",toIata),
  ];
  const q = query(...constraints);
  const snap = await getDocs(q);
  let results = snap.docs.map(d=>({id:d.id,...d.data()})).filter(f=>f.status!=="cancelled");
  if (date) results = results.filter(f=>f.departureDate===date);
  return results;
}
export async function getFlightById(id) {
  const snap = await getDoc(doc(db,"flights",id));
  return snap.exists() ? {id:snap.id,...snap.data()} : null;
}
export async function addFlight(data)      { return await addDoc(collection(db,"flights"), {...data, createdAt:serverTimestamp()}); }
export async function updateFlight(id,data){ await updateDoc(doc(db,"flights",id), {...data, updatedAt:serverTimestamp()}); }
export async function deleteFlight(id)     { await deleteDoc(doc(db,"flights",id)); }
export async function setFlightStatus(id,status){ await updateDoc(doc(db,"flights",id), {status, updatedAt:serverTimestamp()}); }

// ─────────────────────────────────────────
//  RÉSERVATIONS
// ─────────────────────────────────────────
export async function createBooking(flightId, passengers) {
  const user = auth.currentUser;
  if (!user) throw new Error("Connectez-vous pour réserver.");
  const flight = await getFlightById(flightId);
  if (!flight) throw new Error("Vol introuvable.");
  if (flight.status === "cancelled") throw new Error("Ce vol est annulé.");
  if (flight.seatsAvailable < passengers.length) throw new Error("Pas assez de places.");

  const totalPrice = flight.price * passengers.length;
  const ref_ = await addDoc(collection(db,"bookings"), {
    flightId, flightNumber: flight.flightNumber,
    userId: user.uid, userEmail: user.email,
    passengers, passengersCount: passengers.length,
    totalPrice, status: "confirmed",
    createdAt: serverTimestamp(),
    flight: { from:flight.from, to:flight.to, departureDate:flight.departureDate, departureTime:flight.departureTime, arrivalTime:flight.arrivalTime, durationMin:flight.durationMin },
  });

  const newSeats = flight.seatsAvailable - passengers.length;
  await updateDoc(doc(db,"flights",flightId), {
    seatsAvailable: newSeats,
    status: newSeats <= 0 ? "full" : "active",
    updatedAt: serverTimestamp(),
  });

  const uSnap = await getDoc(doc(db,"users",user.uid));
  const prev  = uSnap.data()?.bookings || [];
  await updateDoc(doc(db,"users",user.uid), { bookings:[...prev,ref_.id] });

  return { bookingId: ref_.id, totalPrice };
}

export async function getUserBookings() {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(collection(db,"bookings"), where("userId","==",user.uid), orderBy("createdAt","desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

export async function getAllBookings() {
  const snap = await getDocs(query(collection(db,"bookings"), orderBy("createdAt","desc")));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

export async function cancelBooking(bookingId) {
  const snap = await getDoc(doc(db,"bookings",bookingId));
  if (!snap.exists()) throw new Error("Réservation introuvable.");
  const booking = snap.data();
  const user    = auth.currentUser;
  if (booking.userId !== user?.uid && user?.email !== ADMIN_EMAIL) throw new Error("Accès refusé.");
  const flight = await getFlightById(booking.flightId);
  if (flight && flight.status !== "cancelled") {
    await updateDoc(doc(db,"flights",booking.flightId), {
      seatsAvailable: flight.seatsAvailable + booking.passengersCount,
      status: "active", updatedAt: serverTimestamp(),
    });
  }
  await updateDoc(doc(db,"bookings",bookingId), { status:"cancelled", cancelledAt:serverTimestamp() });
}

// ─────────────────────────────────────────
//  PROMOTIONS
// ─────────────────────────────────────────
export async function getActivePromotions() {
  const q = query(collection(db,"promotions"), where("active","==",true), orderBy("priority"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function getAllPromotions() {
  const snap = await getDocs(collection(db,"promotions"));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function addPromotion(data)      { return await addDoc(collection(db,"promotions"), {...data, createdAt:serverTimestamp()}); }
export async function updatePromotion(id,data){ await updateDoc(doc(db,"promotions",id), {...data, updatedAt:serverTimestamp()}); }
export async function deletePromotion(id)     { await deleteDoc(doc(db,"promotions",id)); }

// ─────────────────────────────────────────
//  PUBS
// ─────────────────────────────────────────
export async function getAdsByPosition(position) {
  const q = query(collection(db,"ads"), where("position","==",position), where("active","==",true));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function getAllAds() {
  const snap = await getDocs(collection(db,"ads"));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function addAd(data)      { return await addDoc(collection(db,"ads"), {...data, createdAt:serverTimestamp()}); }
export async function updateAd(id,data){ await updateDoc(doc(db,"ads",id), {...data, updatedAt:serverTimestamp()}); }
export async function toggleAd(id,active){ await updateDoc(doc(db,"ads",id), {active, updatedAt:serverTimestamp()}); }
export async function deleteAd(id)     { await deleteDoc(doc(db,"ads",id)); }

// ─────────────────────────────────────────
//  ADMIN — USERS
// ─────────────────────────────────────────
export async function getAllUsers() {
  const snap = await getDocs(collection(db,"users"));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function promoteToAdmin(uid){ await updateDoc(doc(db,"users",uid), {role:"admin"}); }
export async function demoteToUser(uid)  { await updateDoc(doc(db,"users",uid), {role:"user"}); }

// ─────────────────────────────────────────
//  REALTIME DB
// ─────────────────────────────────────────
export async function getLiveStats() {
  const snap = await get(ref(rtdb,"stats"));
  return snap.exists() ? snap.val() : {};
}
export async function incrementVisitors() {
  const snap = await get(ref(rtdb,"stats/visitors"));
  await set(ref(rtdb,"stats/visitors"), (snap.exists()?snap.val():0)+1);
}
export async function sendSupportMessage(name,email,message) {
  await push(ref(rtdb,"support"), { name, email, message, timestamp:Date.now(), read:false });
}
export async function getSupportMessages() {
  const snap = await get(ref(rtdb,"support"));
  if (!snap.exists()) return [];
  const obj = snap.val();
  return Object.entries(obj).map(([id,v])=>({id,...v})).sort((a,b)=>b.timestamp-a.timestamp);
}

export { firebaseApp, auth, db, rtdb, analytics };
