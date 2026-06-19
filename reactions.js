// ------------------------------
// PODWÓJNE KLIKNIĘCIE + PRZYCIEMNIENIE + „POTWIERDŹ” + ANULACJA POZA
// ------------------------------
let pending = null;
let timeoutId = null;
let confirmMode = false;

function cancelPending() {
  pending = null;
  confirmMode = false;
  clearTimeout(timeoutId);

  document.querySelectorAll(".confirm-label").forEach(el => el.remove());

  buttons.forEach(b => {
    if (!b.classList.contains("clicked")) b.style.opacity = "1";
  });
}

buttons.forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();

    const index = parseInt(btn.dataset.reaction);

    if (btn.classList.contains("clicked")) return;

    // ⭐ DRUGIE KLIKNIĘCIE = POTWIERDZENIE
    if (confirmMode && pending === index) {
      cancelPending();

      // ⭐ NATYCHMIAST BLOKUJEMY GUZIK WIZUALNIE
      btn.classList.add("clicked");
      btn.style.opacity = ".4";

      sendReaction(index, btn);
      return;
    }

    // ⭐ PIERWSZE KLIKNIĘCIE
    pending = index;
    confirmMode = true;

    document.querySelectorAll(".confirm-label").forEach(el => el.remove());

    buttons.forEach(b => {
      if (b !== btn && !b.classList.contains("clicked")) {
        b.style.opacity = "0.3";
      }
    });

    btn.style.opacity = "1";

    const label = document.createElement("div");
    label.className = "confirm-label";
    label.textContent = "potwierdź";
    label.style.color = "white";
    label.style.fontSize = "12px";
    label.style.marginTop = "4px";
    label.style.opacity = "0.8";
    btn.parentElement.appendChild(label);

    clearTimeout(timeoutId);
    timeoutId = setTimeout(cancelPending, 5000);
  });
});

// ANULACJA KLIKNIĘCIEM POZA
document.addEventListener("click", e => {
  if (!e.target.closest(".reaction-btn")) {
    cancelPending();
  }
});
