const filterButtons = document.querySelectorAll(".event-filter-tag");
const eventCards = document.querySelectorAll(".event-list-card[data-tags]");
const clearButton = document.querySelector(".event-filter-clear");

if (filterButtons.length && eventCards.length) {
  const activeTags = new Set();

  function applyFilter() {
    eventCards.forEach(function (card) {
      const cardTags = card.dataset.tags ? card.dataset.tags.split(",") : [];
      const matches =
        activeTags.size === 0 ||
        cardTags.some(function (tag) {
          return activeTags.has(tag);
        });

      card.classList.toggle("is-hidden", !matches);
    });

    if (clearButton) {
      clearButton.hidden = activeTags.size === 0;
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const tag = button.dataset.tag;
      const isActive = button.getAttribute("aria-pressed") === "true";

      if (isActive) {
        activeTags.delete(tag);
      } else {
        activeTags.add(tag);
      }

      button.setAttribute("aria-pressed", String(!isActive));
      button.classList.toggle("is-active", !isActive);

      applyFilter();
    });
  });

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      activeTags.clear();

      filterButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", "false");
        button.classList.remove("is-active");
      });

      applyFilter();
    });
  }
}