(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function() {
        nav.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      var current = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
          play();
        });
      });
      if (prev) {
        prev.addEventListener("click", function() {
          show(current - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          show(current + 1);
          play();
        });
      }
      carousel.addEventListener("mouseenter", function() {
        window.clearInterval(timer);
      });
      carousel.addEventListener("mouseleave", play);
      show(0);
      play();
    }

    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var target = form.getAttribute("action") || "search.html";
        window.location.href = target + "?q=" + encodeURIComponent(input.value.trim());
      });
    });

    var searchInput = document.getElementById("site-search-input");
    var categoryFilter = document.getElementById("filter-category");
    var yearFilter = document.getElementById("filter-year");
    var typeFilter = document.getElementById("filter-type");
    var clearButton = document.querySelector("[data-search-clear]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var status = document.querySelector("[data-filter-status]");

    function getQuery() {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");
      var category = categoryFilter ? categoryFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var keywords = normalize(card.getAttribute("data-keywords"));
        var matchQuery = !query || keywords.indexOf(query) !== -1;
        var matchCategory = !category || card.getAttribute("data-category") === category;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchType = !type || card.getAttribute("data-type") === type;
        var showCard = matchQuery && matchCategory && matchYear && matchType;
        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0 && cards.length > 0);
      }
      if (status && cards.length > 0) {
        status.textContent = visible > 0 ? "匹配内容已更新，可直接进入详情观看。" : "暂无匹配影片，可调整关键词或筛选条件。";
      }
    }

    if (searchInput && cards.length) {
      var initial = getQuery();
      if (initial) {
        searchInput.value = initial;
      }
      searchInput.addEventListener("input", applyFilters);
      if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
      }
      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
      }
      if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
      }
      if (clearButton) {
        clearButton.addEventListener("click", function() {
          searchInput.value = "";
          if (categoryFilter) {
            categoryFilter.value = "";
          }
          if (yearFilter) {
            yearFilter.value = "";
          }
          if (typeFilter) {
            typeFilter.value = "";
          }
          applyFilters();
          searchInput.focus();
        });
      }
      applyFilters();
    }
  });
})();
