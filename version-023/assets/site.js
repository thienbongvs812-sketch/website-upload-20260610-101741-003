
(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var input = document.querySelector("[data-search-input]");
        var region = document.querySelector("[data-region-filter]");
        var type = document.querySelector("[data-type-filter]");
        var year = document.querySelector("[data-year-filter]");
        var reset = document.querySelector("[data-reset-filter]");
        var count = document.querySelector("[data-result-count]");
        if (!cards.length || !input || !region || !type || !year) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var q = normalize(input.value);
            var r = region.value;
            var t = type.value;
            var y = year.value;
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && card.getAttribute("data-region") !== r) {
                    ok = false;
                }
                if (t && card.getAttribute("data-type") !== t) {
                    ok = false;
                }
                if (y && card.getAttribute("data-year") !== y) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        input.addEventListener("input", apply);
        region.addEventListener("change", apply);
        type.addEventListener("change", apply);
        year.addEventListener("change", apply);
        if (reset) {
            reset.addEventListener("click", function () {
                input.value = "";
                region.value = "";
                type.value = "";
                year.value = "";
                apply();
            });
        }
        apply();
    }

    function setupPlayer() {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("main-play-button");
        if (!video || typeof pageVideoUrl === "undefined") {
            return;
        }

        var initialized = false;
        var hlsInstance = null;

        function attach() {
            if (initialized) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = pageVideoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(pageVideoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = pageVideoUrl;
            }
            initialized = true;
        }

        function play() {
            attach();
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupFilters();
        setupPlayer();
    });
}());
