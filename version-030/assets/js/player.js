var AppPlayer = (function () {
  function mount(config) {
    var root = document.getElementById(config.root);
    var video = document.getElementById(config.video);
    var button = document.getElementById(config.button);
    var url = config.url;
    var hls = null;
    var initialized = false;

    if (!root || !video || !button || !url) {
      return;
    }

    function attach() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function play() {
      attach();
      button.classList.add("is-hidden");
      video.controls = true;

      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    root.addEventListener("click", function (event) {
      if (event.target === video && video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  return {
    mount: mount
  };
})();
