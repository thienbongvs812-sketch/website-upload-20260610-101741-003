(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNavigation() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === current);
      });
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var scope = area.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var keyword = area.querySelector("[data-filter-keyword]");
      var year = area.querySelector("[data-filter-year]");
      var region = area.querySelector("[data-filter-region]");
      var type = area.querySelector("[data-filter-type]");
      function value(node) {
        return node ? node.value.trim().toLowerCase() : "";
      }
      function apply() {
        var q = value(keyword);
        var y = value(year);
        var r = value(region);
        var t = value(type);
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && (card.getAttribute("data-year") || "").toLowerCase() !== y) {
            ok = false;
          }
          if (r && (card.getAttribute("data-region") || "").toLowerCase() !== r) {
            ok = false;
          }
          if (t && (card.getAttribute("data-type") || "").toLowerCase() !== t) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      }
      [keyword, year, region, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && keyword) {
        keyword.value = q;
        apply();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupCarousel();
    setupFilters();
  });
})();

function initPlayer(playerId, streamUrl) {
  var video = document.getElementById(playerId);
  if (!video) {
    return;
  }
  var card = video.closest(".player-card");
  var button = document.querySelector('[data-player-button="' + playerId + '"]');
  var attached = false;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    attach();
    if (card) {
      card.classList.add("is-playing");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  video.addEventListener("play", function () {
    if (card) {
      card.classList.add("is-playing");
    }
  });
  video.addEventListener("click", start);
  if (button) {
    button.addEventListener("click", start);
  }
}
