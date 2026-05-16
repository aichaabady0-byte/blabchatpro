/**
 * ═══════════════════════════════════════════════════════════
 *  PELO AIRWAYS — script.js
 *  Gestion de la navigation, des sièges et du flux de réservation
 *  Appelle App.* (défini dans app.js / Firebase)
 * ═══════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
//  GARDE-FOU : s'assure qu'App existe même si app.js est vide
// ─────────────────────────────────────────────────────────────
window.App = window.App || {};
App.saveReservation = App.saveReservation || function(data) {
  console.log("[App.saveReservation] (stub) données reçues :", data);
  return Promise.resolve({ success: true, bookingId: "LOCAL_" + Date.now() });
};
App.getFlightInfo   = App.getFlightInfo   || function(id) {
  console.log("[App.getFlightInfo] (stub) id :", id);
  return Promise.resolve(null);
};
App.processPayment  = App.processPayment  || function(amount) {
  console.log("[App.processPayment] (stub) montant :", amount);
  return Promise.resolve({ success: true });
};
App.resetBooking    = App.resetBooking    || function() { location.reload(); };

// ─────────────────────────────────────────────────────────────
//  ÉTAT GLOBAL DE LA RÉSERVATION
// ─────────────────────────────────────────────────────────────
const state = {
  searchParams: { fromIata: "BOD", toIata: "", date: "", time: "" },
  availableFlights: [],       // vols retournés par la recherche
  selectedFlight: null,       // vol choisi
  selectedSeat: null,         // ex: "3C"
  takenSeats: [],             // sièges déjà occupés (générés aléatoirement)
  bookingResult: null,        // réponse de App.saveReservation
};

// ─────────────────────────────────────────────────────────────
//  DONNÉES SEED LOCALES (miroir de app.js pour fonctionnement offline)
// ─────────────────────────────────────────────────────────────
const LOCAL_FLIGHTS = [
  { id:"FL001", flightNumber:"PW101", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Barcelone",iata:"BCN"},  departureDate:"2026-06-10", departureTime:"07:30", arrivalTime:"09:15", durationMin:105, price:29.99, seatsAvailable:47,  status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL002", flightNumber:"PW102", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Lisbonne",iata:"LIS"},   departureDate:"2026-06-12", departureTime:"10:00", arrivalTime:"11:45", durationMin:105, price:34.99, seatsAvailable:112, status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL003", flightNumber:"PW203", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Rome",iata:"FCO"},       departureDate:"2026-06-15", departureTime:"14:20", arrivalTime:"16:40", durationMin:140, price:49.99, seatsAvailable:23,  status:"active",   aircraft:"Airbus A320"    },
  { id:"FL004", flightNumber:"PW304", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Amsterdam",iata:"AMS"},  departureDate:"2026-06-18", departureTime:"06:45", arrivalTime:"08:55", durationMin:130, price:39.99, seatsAvailable:0,   status:"full",     aircraft:"Boeing 737-800" },
  { id:"FL005", flightNumber:"PW405", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Dublin",iata:"DUB"},     departureDate:"2026-06-20", departureTime:"11:30", arrivalTime:"13:00", durationMin:150, price:44.99, seatsAvailable:78,  status:"active",   aircraft:"Airbus A320"    },
  { id:"FL006", flightNumber:"PW506", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Athènes",iata:"ATH"},    departureDate:"2026-06-22", departureTime:"08:00", arrivalTime:"11:30", durationMin:210, price:59.99, seatsAvailable:55,  status:"active",   aircraft:"Airbus A321"    },
  { id:"FL007", flightNumber:"PW607", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Prague",iata:"PRG"},     departureDate:"2026-06-25", departureTime:"16:10", arrivalTime:"18:50", durationMin:160, price:24.99, seatsAvailable:134, status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL008", flightNumber:"PW707", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Malte",iata:"MLA"},      departureDate:"2026-07-01", departureTime:"09:00", arrivalTime:"12:15", durationMin:195, price:54.99, seatsAvailable:88,  status:"active",   aircraft:"Airbus A320"    },
  { id:"FL009", flightNumber:"PW808", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Madrid",iata:"MAD"},     departureDate:"2026-07-05", departureTime:"13:00", arrivalTime:"14:45", durationMin:105, price:19.99, seatsAvailable:160, status:"active",   aircraft:"Boeing 737-800" },
  { id:"FL010", flightNumber:"PW909", from:{city:"Bordeaux",iata:"BOD"}, to:{city:"Barcelone",iata:"BCN"},  departureDate:"2026-06-05", departureTime:"15:30", arrivalTime:"17:15", durationMin:105, price:19.99, seatsAvailable:0,   status:"cancelled",aircraft:"Boeing 737-800" },
];

const LOCAL_DESTINATIONS = [
  { iata:"BCN", name:"Barcelone",  country:"Espagne",   imageUrl:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600", priceFrom:19.99 },
  { iata:"LIS", name:"Lisbonne",   country:"Portugal",  imageUrl:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600", priceFrom:34.99 },
  { iata:"FCO", name:"Rome",       country:"Italie",    imageUrl:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600", priceFrom:49.99 },
  { iata:"AMS", name:"Amsterdam",  country:"Pays-Bas",  imageUrl:"https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600", priceFrom:39.99 },
  { iata:"ATH", name:"Athènes",    country:"Grèce",     imageUrl:"https://images.unsplash.com/photo-1555993539-1732b0258235?w=600", priceFrom:59.99 },
  { iata:"MAD", name:"Madrid",     country:"Espagne",   imageUrl:"https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600", priceFrom:19.99 },
];

// ─────────────────────────────────────────────────────────────
//  HELPERS UI
// ─────────────────────────────────────────────────────────────

/** Affiche / masque le loader */
function setLoading(visible) {
  document.getElementById("loading-overlay").classList.toggle("visible", visible);
}

/** Toast notification */
function toast(message, type = "default") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/** Formate une durée en minutes → "1h 45min" */
function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${m} min`;
}

/** Formate un prix */
function formatPrice(p) {
  return p.toFixed(2).replace(".", ",") + " €";
}

/** Formate une date ISO → "10 juin 2026" */
function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const months = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

// ─────────────────────────────────────────────────────────────
//  STEPPER
// ─────────────────────────────────────────────────────────────
const STEPS = ["section-search","section-results","section-seat","section-payment","section-confirmation"];

function goToStep(sectionId) {
  // Cache toutes les sections
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  // Active la bonne
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");

  // Met à jour le stepper
  const stepIndex = STEPS.indexOf(sectionId); // 0-based
  ["step-1","step-2","step-3","step-4"].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("active","done");
    // stepIndex 0 = recherche (step-1)
    // stepIndex 1 = résultats → vol (step-2 active)
    // stepIndex 2 = siège (step-3 active)
    // stepIndex 3 = paiement (step-4 active)
    // stepIndex 4 = confirmation (tout done)
    if (stepIndex === 4) {
      el.classList.add("done");
    } else if (i + 1 < stepIndex) {
      el.classList.add("done");
    } else if (i + 1 === stepIndex) {
      el.classList.add("active");
    }
  });

  // Scroll top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
//  DESTINATIONS POPULAIRES
// ─────────────────────────────────────────────────────────────
function renderPopularDestinations(destinations) {
  const grid = document.getElementById("dest-grid");
  if (!grid) return;
  grid.innerHTML = destinations.map(d => `
    <div class="dest-card" onclick="quickSelectDestination('${d.iata}')">
      <img src="${d.imageUrl}" alt="${d.name}" loading="lazy" />
      <div class="dest-card-overlay"></div>
      <div class="dest-card-info">
        <div class="dest-city">${d.name}</div>
        <div class="dest-country">${d.country}</div>
        <div class="dest-price">À partir de ${formatPrice(d.priceFrom)}</div>
      </div>
    </div>
  `).join("");
}

/** Sélection rapide via carte destination */
function quickSelectDestination(iata) {
  const select = document.getElementById("to-city");
  if (select) {
    select.value = iata;
    toast(`Destination sélectionnée : ${iata}`, "default");
  }
}
window.quickSelectDestination = quickSelectDestination; // exposé au HTML

// ─────────────────────────────────────────────────────────────
//  RECHERCHE DE VOLS
// ─────────────────────────────────────────────────────────────

/** Filtre les heures selon la plage */
function matchesTimeSlot(departureTime, slot) {
  if (!slot) return true;
  const [h] = departureTime.split(":").map(Number);
  if (slot === "morning")   return h >= 6  && h < 12;
  if (slot === "afternoon") return h >= 12 && h < 18;
  if (slot === "evening")   return h >= 18;
  return true;
}

async function searchFlights() {
  const fromIata = document.getElementById("from-city").value;
  const toIata   = document.getElementById("to-city").value;
  const date     = document.getElementById("travel-date").value;
  const time     = document.getElementById("travel-time").value;

  // Validation
  if (!fromIata) { toast("Veuillez choisir une ville de départ.", "error"); return; }
  if (!toIata)   { toast("Veuillez choisir une destination.", "error"); return; }
  if (fromIata === toIata) { toast("Le départ et l'arrivée doivent être différents.", "error"); return; }

  state.searchParams = { fromIata, toIata, date, time };

  setLoading(true);

  try {
    // Tente d'abord via Firebase (searchFlights depuis app.js)
    let flights = [];
    if (typeof window.searchFlights === "function") {
      flights = await window.searchFlights({ fromIata, toIata, date });
    } else {
      // Fallback local
      await new Promise(r => setTimeout(r, 600)); // simule un délai réseau
      flights = LOCAL_FLIGHTS.filter(f => {
        if (f.from.iata !== fromIata || f.to.iata !== toIata) return false;
        if (f.status === "cancelled") return false;
        if (date && f.departureDate !== date) return false;
        return true;
      });
    }

    // Filtre par heure
    if (time) {
      flights = flights.filter(f => matchesTimeSlot(f.departureTime, time));
    }

    state.availableFlights = flights;
    renderFlightResults(flights, toIata);
    goToStep("section-results");
  } catch (err) {
    console.error("Erreur recherche de vols :", err);
    toast("Erreur lors de la recherche. Réessayez.", "error");
  } finally {
    setLoading(false);
  }
}

// ─────────────────────────────────────────────────────────────
//  AFFICHAGE DES RÉSULTATS
// ─────────────────────────────────────────────────────────────
function renderFlightResults(flights, toIata) {
  const list     = document.getElementById("flights-list");
  const title    = document.getElementById("results-title");
  const subtitle = document.getElementById("results-subtitle");

  const dest = LOCAL_DESTINATIONS.find(d => d.iata === toIata);
  title.textContent    = `Vols vers ${dest ? dest.name : toIata}`;
  subtitle.textContent = flights.length
    ? `${flights.length} vol${flights.length > 1 ? "s" : ""} trouvé${flights.length > 1 ? "s" : ""}`
    : "Aucun vol disponible pour ce trajet";

  if (flights.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
        <h3>Aucun vol disponible</h3>
        <p>Essayez avec d'autres dates ou une autre destination.</p>
      </div>`;
    return;
  }

  list.innerHTML = flights.map(f => buildFlightCard(f)).join("");
}

function buildFlightCard(f) {
  const badgeClass  = f.status === "full" ? "full" : f.status === "cancelled" ? "cancelled" : "";
  const badgeText   = f.status === "full" ? "Complet" : f.status === "cancelled" ? "Annulé" : "Disponible";
  const clickable   = f.status === "active" ? `onclick="selectFlight('${f.id}')" style="cursor:pointer;"` : `style="opacity:.6;cursor:not-allowed;"`;

  return `
    <div class="flight-card" ${clickable}>
      <div class="flight-header">
        <span class="flight-number">${f.flightNumber} · ${f.aircraft}</span>
        <span class="flight-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="flight-route">
        <div>
          <div class="route-time">${f.departureTime}</div>
          <div class="route-city">${f.from.iata}</div>
          <div class="route-iata">${f.from.city}</div>
        </div>
        <div class="route-mid">
          <div class="route-line">
            <div class="route-dash"></div>
            <span class="route-plane-icon">✈</span>
            <div class="route-dash"></div>
          </div>
          <div class="route-duration">${formatDuration(f.durationMin)}</div>
        </div>
        <div style="text-align:right;">
          <div class="route-time">${f.arrivalTime}</div>
          <div class="route-city">${f.to.iata}</div>
          <div class="route-iata">${f.to.city}</div>
        </div>
      </div>
      <div class="flight-footer">
        <div class="flight-meta">
          <span>📅 ${formatDate(f.departureDate)}</span>
          <span>💺 ${f.seatsAvailable > 0 ? `${f.seatsAvailable} places restantes` : "Aucune place"}</span>
        </div>
        <div>
          <div class="flight-price">${formatPrice(f.price)}<br><small>par passager</small></div>
        </div>
      </div>
    </div>`;
}

/** Sélectionne un vol et passe à l'étape siège */
function selectFlight(flightId) {
  const flight = state.availableFlights.find(f => f.id === flightId);
  if (!flight) return;
  if (flight.status !== "active") {
    toast("Ce vol n'est pas disponible.", "error");
    return;
  }
  state.selectedFlight = flight;
  state.selectedSeat   = null;

  renderSeatSection(flight);
  goToStep("section-seat");
}
window.selectFlight = selectFlight;

// ─────────────────────────────────────────────────────────────
//  SECTION SIÈGE
// ─────────────────────────────────────────────────────────────
const ROWS  = 10;
const COLS  = ["A","B","C","D","E","F"]; // 3+3 avec allée au milieu

/** Génère aléatoirement des sièges occupés (30–40% de rempli) */
function generateTakenSeats(seed) {
  const taken = [];
  // Utilise le flightId comme graine pour avoir des sièges cohérents
  let rng = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  function rand() { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return Math.abs(rng) / 0xffffffff; }

  for (let r = 1; r <= ROWS; r++) {
    for (const c of COLS) {
      if (rand() < 0.35) taken.push(`${r}${c}`);
    }
  }
  return taken;
}

function renderSeatSection(flight) {
  // Résumé du vol
  document.getElementById("seat-flight-summary").innerHTML = buildSummaryHTML(flight);
  document.getElementById("selected-seat-info").style.display = "none";
  document.getElementById("selected-seat-badge").textContent = "—";

  // Bouton désactivé jusqu'à sélection
  const btn = document.getElementById("proceed-to-payment");
  btn.disabled = true;
  btn.style.opacity = ".5";
  btn.style.cursor  = "not-allowed";

  // Génère les sièges occupés
  state.takenSeats = generateTakenSeats(flight.id);

  // Construit la grille
  const container = document.getElementById("seat-map");
  container.innerHTML = "";

  for (let r = 1; r <= ROWS; r++) {
    const row = document.createElement("div");
    row.className = "seat-row";

    // Numéro de rangée
    const numEl = document.createElement("div");
    numEl.className = "row-num";
    numEl.textContent = r;
    row.appendChild(numEl);

    // 6 sièges (A B C | allée | D E F)
    COLS.forEach((col, i) => {
      // Allée entre C et D
      if (i === 3) {
        const aisle = document.createElement("div");
        aisle.className = "aisle";
        row.appendChild(aisle);
      }

      const seatId   = `${r}${col}`;
      const isTaken  = state.takenSeats.includes(seatId);
      const seatEl   = document.createElement("div");
      seatEl.className = "seat" + (isTaken ? " taken" : "");
      seatEl.id        = `seat-${seatId}`;
      seatEl.textContent = col;
      seatEl.title       = isTaken ? "Occupé" : `Siège ${seatId}`;

      if (!isTaken) {
        seatEl.addEventListener("click", () => handleSeatClick(seatId));
      }

      row.appendChild(seatEl);
    });

    container.appendChild(row);
  }
}

function handleSeatClick(seatId) {
  // Désélectionne l'ancien
  if (state.selectedSeat) {
    const old = document.getElementById(`seat-${state.selectedSeat}`);
    if (old) old.classList.remove("selected");
  }

  // Si on reclique le même → désélection
  if (state.selectedSeat === seatId) {
    state.selectedSeat = null;
    document.getElementById("selected-seat-info").style.display = "none";
    const btn = document.getElementById("proceed-to-payment");
    btn.disabled = true;
    btn.style.opacity = ".5";
    btn.style.cursor  = "not-allowed";
    return;
  }

  // Sélectionne le nouveau
  state.selectedSeat = seatId;
  const el = document.getElementById(`seat-${seatId}`);
  if (el) el.classList.add("selected");

  // Met à jour l'info
  document.getElementById("selected-seat-info").style.display  = "flex";
  document.getElementById("selected-seat-badge").textContent = `Rangée ${seatId.slice(0,-1)} — Siège ${seatId.slice(-1)}`;

  // Active le bouton
  const btn = document.getElementById("proceed-to-payment");
  btn.disabled = false;
  btn.style.opacity = "1";
  btn.style.cursor  = "pointer";

  toast(`Siège ${seatId} sélectionné ✓`, "success");
}

// ─────────────────────────────────────────────────────────────
//  SECTION PAIEMENT
// ─────────────────────────────────────────────────────────────
function renderPaymentSection(flight) {
  // Résumé vol
  document.getElementById("payment-flight-summary").innerHTML = buildSummaryHTML(flight, state.selectedSeat);

  // Prix (toujours 0 Robux, mais on affiche le vrai prix barré)
  const taxes = (flight.price * 0.12).toFixed(2);
  document.getElementById("price-breakdown").innerHTML = `
    <div class="price-row">
      <span>Billet (1 passager)</span>
      <span>${formatPrice(flight.price)}</span>
    </div>
    <div class="price-row">
      <span>Taxes & frais</span>
      <span>${parseFloat(taxes).toFixed(2).replace(".",",")} €</span>
    </div>
    <div class="price-row">
      <span>Siège ${state.selectedSeat}</span>
      <span>Inclus</span>
    </div>
    <div class="price-row total">
      <span>Total</span>
      <span class="amount">0 Robux</span>
    </div>`;

  document.getElementById("pay-btn").textContent = `🔒 Payer maintenant — 0 Robux`;
}

// ─────────────────────────────────────────────────────────────
//  CONFIRMATION
// ─────────────────────────────────────────────────────────────
function renderConfirmation(bookingId) {
  const f = state.selectedFlight;

  document.getElementById("ticket-top").innerHTML = `
    <div class="ticket-route">
      ${f.from.iata}
      <span style="color:var(--accent);">→</span>
      ${f.to.iata}
    </div>
    <p style="color:var(--mist);font-size:.85rem;margin-bottom:1rem;">${f.from.city} → ${f.to.city}</p>
    <div class="ticket-grid">
      <div class="ticket-field">
        <span class="ticket-field-label">Date</span>
        <span class="ticket-field-value">${formatDate(f.departureDate)}</span>
      </div>
      <div class="ticket-field">
        <span class="ticket-field-label">Départ</span>
        <span class="ticket-field-value">${f.departureTime}</span>
      </div>
      <div class="ticket-field">
        <span class="ticket-field-label">Arrivée</span>
        <span class="ticket-field-value">${f.arrivalTime}</span>
      </div>
      <div class="ticket-field">
        <span class="ticket-field-label">Durée</span>
        <span class="ticket-field-value">${formatDuration(f.durationMin)}</span>
      </div>
    </div>`;

  document.getElementById("ticket-bottom").innerHTML = `
    <div class="ticket-grid">
      <div class="ticket-field">
        <span class="ticket-field-label">N° Vol</span>
        <span class="ticket-field-value">${f.flightNumber}</span>
      </div>
      <div class="ticket-field">
        <span class="ticket-field-label">Siège</span>
        <span class="ticket-field-value">${state.selectedSeat}</span>
      </div>
      <div class="ticket-field">
        <span class="ticket-field-label">Réservation</span>
        <span class="ticket-field-value" style="font-size:.8rem;">${String(bookingId).slice(-8).toUpperCase()}</span>
      </div>
      <div class="ticket-field">
        <span class="ticket-field-label">Appareil</span>
        <span class="ticket-field-value" style="font-size:.8rem;">${f.aircraft}</span>
      </div>
    </div>`;

  // Barcode décoratif
  const barcode = document.getElementById("barcode");
  barcode.innerHTML = Array.from({length:60}, (_,i) =>
    `<div class="barcode-bar" style="width:${Math.random()>0.3?2:1}px;height:${24+Math.random()*16}px;"></div>`
  ).join("");
}

// ─────────────────────────────────────────────────────────────
//  BUILDER HTML COMMUN : résumé du vol
// ─────────────────────────────────────────────────────────────
function buildSummaryHTML(flight, seat) {
  return `
    <div class="summary-route-row">
      <div>
        <div style="font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:.2rem;">Départ</div>
        <div class="summary-iata">${flight.from.iata}</div>
        <div style="opacity:.7;font-size:.85rem;">${flight.from.city}</div>
      </div>
      <div class="summary-arrow">✈</div>
      <div>
        <div style="font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:.2rem;">Arrivée</div>
        <div class="summary-iata">${flight.to.iata}</div>
        <div style="opacity:.7;font-size:.85rem;">${flight.to.city}</div>
      </div>
    </div>
    <div class="summary-details-grid">
      <div>
        <div class="summary-label">Date</div>
        <div class="summary-value">${formatDate(flight.departureDate)}</div>
      </div>
      <div>
        <div class="summary-label">Départ</div>
        <div class="summary-value">${flight.departureTime}</div>
      </div>
      <div>
        <div class="summary-label">Arrivée</div>
        <div class="summary-value">${flight.arrivalTime}</div>
      </div>
      <div>
        <div class="summary-label">Durée</div>
        <div class="summary-value">${formatDuration(flight.durationMin)}</div>
      </div>
      ${seat ? `<div><div class="summary-label">Siège</div><div class="summary-value">${seat}</div></div>` : ""}
      <div>
        <div class="summary-label">N° Vol</div>
        <div class="summary-value">${flight.flightNumber}</div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  PAIEMENT — PROCESSUS
// ─────────────────────────────────────────────────────────────
async function handlePayment() {
  if (!state.selectedFlight || !state.selectedSeat) {
    toast("Données manquantes.", "error");
    return;
  }

  setLoading(true);

  // Prépare les données de réservation
  const reservationData = {
    flightId:      state.selectedFlight.id,
    flightNumber:  state.selectedFlight.flightNumber,
    from:          state.selectedFlight.from,
    to:            state.selectedFlight.to,
    departureDate: state.selectedFlight.departureDate,
    departureTime: state.selectedFlight.departureTime,
    arrivalTime:   state.selectedFlight.arrivalTime,
    durationMin:   state.selectedFlight.durationMin,
    aircraft:      state.selectedFlight.aircraft,
    seat:          state.selectedSeat,
    price:         state.selectedFlight.price,
    totalPrice:    0, // 0 Robux !
    timestamp:     Date.now(),
  };

  try {
    // Appel Firebase (ou stub)
    const [payResult, saveResult] = await Promise.all([
      App.processPayment(0),
      App.saveReservation(reservationData),
    ]);

    state.bookingResult = saveResult;
    const bookingId = saveResult?.bookingId || "PELO-" + Date.now();

    renderConfirmation(bookingId);
    goToStep("section-confirmation");
    toast("Réservation confirmée ! 🎉", "success");
  } catch (err) {
    console.error("Erreur paiement :", err);
    toast("Erreur lors du paiement. Réessayez.", "error");
  } finally {
    setLoading(false);
  }
}

// ─────────────────────────────────────────────────────────────
//  INIT — ÉVÉNEMENTS
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // ── Date min = aujourd'hui
  const dateInput = document.getElementById("travel-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min   = today;
    dateInput.value = "2026-06-10"; // pré-rempli sur une date avec des vols
  }

  // ── Destinations populaires
  renderPopularDestinations(LOCAL_DESTINATIONS);

  // ── Bouton recherche
  document.getElementById("search-btn")?.addEventListener("click", searchFlights);

  // ── Swap villes (Bordeaux est toujours le départ dans cette version)
  document.getElementById("swap-btn")?.addEventListener("click", () => {
    toast("Tous les vols partent de Bordeaux-Mérignac.", "default");
  });

  // ── Navigation retour
  document.getElementById("back-to-search")?.addEventListener("click", () => goToStep("section-search"));
  document.getElementById("back-to-results")?.addEventListener("click", () => goToStep("section-results"));
  document.getElementById("back-to-seat")?.addEventListener("click",    () => goToStep("section-seat"));

  // ── Vers paiement
  document.getElementById("proceed-to-payment")?.addEventListener("click", () => {
    if (!state.selectedSeat) { toast("Veuillez choisir un siège.", "error"); return; }
    renderPaymentSection(state.selectedFlight);
    goToStep("section-payment");
  });

  // ── Payer
  document.getElementById("pay-btn")?.addEventListener("click", handlePayment);

  // ── Init step visuel
  goToStep("section-search");
});

// ─────────────────────────────────────────────────────────────
//  EXPOSE LES FONCTIONS UTILES POUR app.js ET POUR LE HTML
// ─────────────────────────────────────────────────────────────
window.PeloUI = {
  goToStep,
  toast,
  setLoading,
  getState: () => state,
  formatDate,
  formatPrice,
  formatDuration,
};
