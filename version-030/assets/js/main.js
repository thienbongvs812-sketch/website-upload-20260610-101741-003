(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function filterCards(value) {
      var terms = normalize(value).split(" ").filter(Boolean);

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title"));
        var matched = terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });

        card.classList.toggle("is-hidden", terms.length > 0 && !matched);
      });
    }

    forms.forEach(function (form) {
      var input = form.querySelector("input[name='q']");

      if (input && initial) {
        input.value = initial;
      }

      form.addEventListener("submit", function (event) {
        if (cards.length > 0) {
          event.preventDefault();
          filterCards(input ? input.value : "");
          window.history.replaceState(null, "", input && input.value ? "?q=" + encodeURIComponent(input.value) : window.location.pathname);
        }
      });
    });

    if (cards.length > 0 && initial) {
      filterCards(initial);
    }

    var filterBar = document.querySelector("[data-filter-bar]");

    if (filterBar) {
      filterBar.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter-value]");

        if (!button) {
          return;
        }

        filterBar.querySelectorAll("[data-filter-value]").forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        filterCards(button.getAttribute("data-filter-value") || "");
      });
    }
  });
})();
