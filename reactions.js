import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ksoqkpzjdjoglnfflfui.supabase.co";
const SUPABASE_KEY = "sb_publishable_4d_svQaLP_NzQ3KV3Qy20Q_KQzwuL_C";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Pobranie parametrów z URL
const qs = new URLSearchParams(location.search);
const comicKey = qs.get("comic");
const chapter = qs.get("chapter");

// ID rekordu w Supabase
const reactionId = `${comicKey}_${chapter}`;
const localKey = `reacted_${reactionId}`;

// Elementy HTML
const buttons = document.querySelectorAll(".reaction-btn");
const counts = document.querySelectorAll(".reaction-count");


// ------------------------------
// ŁADOWANIE LICZNIKÓW
// ------------------------------
async function loadCounts() {
  const { data, error } = await supabase
    .from("reactions")
    .select("*")
    .eq("id", reactionId)
    .single();

  const arr = data?.counts || [0,0,0,0,0,0];

  // Ustaw liczniki
  counts.forEach((c, i) => c.textContent = arr[i]);

  // Zamroź tylko te guziki, które były kliknięte
  buttons.forEach((btn, i) => {
    if (localStorage.getItem(`${localKey}_${i}`)) {
      btn.classList.add("clicked");
      btn.style.opacity = ".4";
    }
  });
}


// ------------------------------
// WYSYŁANIE REAKCJI
// ------------------------------
async function sendReaction(index, btn) {

  // Blokada per guzik
  if (localStorage.getItem(`${localKey}_${index}`)) return;

  let { data, error } = await supabase
    .from("reactions")
    .select("*")
    .eq("id", reactionId)
    .single();

  // Jeśli brak rekordu → tworzymy
  let arr = data?.counts ? [...data.counts] : [0,0,0,0,0,0];
  arr[index]++;

  if (error && error.code === "PGRST116") {
    await supabase.from("reactions").insert({
      id: reactionId,
      counts: arr
    });
  } else {
    await supabase
      .from("reactions")
      .update({ counts: arr })
      .eq("id", reactionId);
  }

  // Zamrożenie tylko tego jednego guzika
  localStorage.setItem(`${localKey}_${index}`, "1");
  btn.classList.add("clicked");
  btn.style.opacity = ".4";

  loadCounts();
}


// ------------------------------
// PODWÓJNE KLIKNIĘCIE + PRZYCIEMNIENIE
// ------------------------------
let pending = null;
let timeoutId = null;

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const index = parseInt(btn.dataset.reaction);

    // Jeśli guzik już kliknięty wcześniej → ignoruj
    if (btn.classList.contains("clicked")) return;

    // DRUGIE KLIKNIĘCIE = POTWIERDZENIE
    if (pending === index) {
      clearTimeout(timeoutId);

      // przywróć normalny wygląd
      buttons.forEach(b => {
        if (!b.classList.contains("clicked")) b.style.opacity = "1";
      });

      pending = null;

      // wyślij reakcję
      sendReaction(index, btn);
      return;
    }

    // PIERWSZE KLIKNIĘCIE = WYBÓR
    pending = index;

    // przyciemnij wszystkie inne
    buttons.forEach(b => {
      if (b !== btn && !b.classList.contains("clicked")) {
        b.style.opacity = "0.3";
      }
    });

    // kliknięta ikona zostaje normalna
    btn.style.opacity = "1";

    // anulacja po 3 sekundach
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      pending = null;
      buttons.forEach(b => {
        if (!b.classList.contains("clicked")) b.style.opacity = "1";
      });
    }, 3000);
  });
});


// ------------------------------
// START
// ------------------------------
loadCounts();
