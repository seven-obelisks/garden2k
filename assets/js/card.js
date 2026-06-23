document.querySelectorAll(".clickable-card").forEach(function (card) {
  card.addEventListener("click", function (event) {
    if (event.target.closest("a, button")) return;

    window.location.href = card.dataset.href;
  });

  card.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") return;
    if (event.target.closest("a, button")) return;

    window.location.href = card.dataset.href;
  });
});