(function () {
  var items = document.querySelectorAll(".site-nav__item.has-children");
  var closeTimer = null;

  items.forEach(function (item) {
    item.addEventListener("mouseenter", function () {
      clearTimeout(closeTimer);
      items.forEach(function (i) {
        i.classList.remove("is-mega-open");
      });
      item.classList.add("is-mega-open");
    });

    item.addEventListener("mouseleave", function () {
      closeTimer = setTimeout(function () {
        item.classList.remove("is-mega-open");
      }, 250);
    });
  });
})();