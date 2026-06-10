(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = one("[data-menu-toggle]");
    var menu = one("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    all("[data-carousel]").forEach(function (carousel) {
      var slides = all("[data-slide]", carousel);
      var dots = all("[data-carousel-dot]", carousel);
      var prev = one("[data-carousel-prev]", carousel);
      var next = one("[data-carousel-next]", carousel);
      if (!slides.length) {
        return;
      }
      var index = 0;
      var timer = null;

      function show(target) {
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
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
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    });
  }

  function initFilters() {
    var forms = all("[data-filter-form]");
    if (!forms.length) {
      return;
    }
    forms.forEach(function (form) {
      var input = one("[data-search-input]", form);
      var region = one("[data-region-filter]", form);
      var type = one("[data-type-filter]", form);
      var cards = all(".searchable-card");
      var empty = one("[data-empty-state]");

      function apply() {
        var query = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var typeValue = normalize(type ? type.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type")
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
          var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var showCard = matchesQuery && matchesRegion && matchesType;
          card.hidden = !showCard;
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayer(videoId, url) {
    var video = document.getElementById(videoId);
    if (!video || !url) {
      return;
    }
    var box = video.closest("[data-player]");
    var button = box ? one("[data-player-button]", box) : null;
    var message = box ? one("[data-player-message]", box) : null;
    var hls = null;

    function showMessage() {
      if (message) {
        message.hidden = false;
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function bind() {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showMessage();
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else {
        showMessage();
      }
    }

    function play() {
      hideButton();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showMessage();
        });
      }
    }

    bind();

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("play", hideButton);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initCarousel();
    initFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
