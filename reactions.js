import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ksoqkpzjdjoglnfflfui.supabase.co";
const SUPABASE_KEY = "sb_publishable_4d_svQaLP_NzQ3KV3Qy20Q_KQzwuL_C";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const qs = new URLSearchParams(location.search);
const comicKey = qs.get("comic");
const chapter = qs.get("chapter");

const reactionId = `${comicKey}_${chapter}`;
const localKey = `reacted_${reactionId}`;

const buttons = document.querySelectorAll(".reaction-btn");
const counts = document.querySelectorAll(".reaction-count");

// Jeśli już głosował → blokujemy
if (localStorage.getItem(localKey)) {
  buttons.forEach(b => b.classList.add("clicked"));
}

// Ładowanie liczników
async function loadCounts() {
  const { data, error } = await supabase
    .from("reactions")
    .select("*")
    .eq("id", reactionId)
    .single();

  const arr = data?.counts || [0,0,0,0,0,0];

  counts.forEach((c, i) => c.textContent = arr[i]);
}

// Wysyłanie reakcji
async function sendReaction(index) {
  if (localStorage.getItem(localKey)) return;

  let { data, error } = await supabase
    .from("reactions")
    .select("*")
    .eq("id", reactionId)
    .single();

  if (error && error.code === "PGRST116") {
    const arr = [0,0,0,0,0,0];
    arr[index]++;
    await supabase.from("reactions").insert({ id: reactionId, counts: arr });
  } else {
    const arr = [...data.counts];
    arr[index]++;
    await supabase.from("reactions").update({ counts: arr }).eq("id", reactionId);
  }

  localStorage.setItem(localKey, "1");
  buttons.forEach(b => b.classList.add("clicked"));
  loadCounts();
}

// Obsługa kliknięć
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (localStorage.getItem(localKey)) return;
    const index = parseInt(btn.dataset.reaction);
    sendReaction(index);
  });
});

// Start
loadCounts();
