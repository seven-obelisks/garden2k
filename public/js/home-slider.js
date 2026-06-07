(function () {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".slide"));
  const prev = slider.querySelector("[data-prev]");
  const next = slider.querySelector("[data-next]");
  let current = 0;

  function showSlide(index) {
    slides[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
  }

  if (prev) {
    prev.addEventListener("click", () => showSlide(current - 1));
  }

  if (next) {
    next.addEventListener("click", () => showSlide(current + 1));
  }

  setInterval(() => showSlide(current + 1), 6000);
})();