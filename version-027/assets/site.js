(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.querySelector("[data-player-overlay]");
        var attached = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachAndPlay() {
            function start() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            if (attached) {
                start();
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", start, { once: true });
                video.load();
                start();
                return;
            }

            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, start);
                } else {
                    video.src = streamUrl;
                    video.addEventListener("loadedmetadata", start, { once: true });
                    video.load();
                    start();
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", attachAndPlay);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                attachAndPlay();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                showSlide(idx);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-card-grid]");
        var empty = document.querySelector("[data-empty-state]");

        if (panel && grid) {
            var input = panel.querySelector("[data-filter-input]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var sortSelect = panel.querySelector("[data-sort-select]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function textOf(card) {
                return [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.category
                ].join(" ").toLowerCase();
            }

            function applyFilters() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matched = true;
                    if (query && textOf(card).indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && card.dataset.year !== year) {
                        matched = false;
                    }
                    if (type && card.dataset.type !== type) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            function applySort() {
                var mode = sortSelect ? sortSelect.value : "default";
                var sorted = cards.slice();

                if (mode === "year") {
                    sorted.sort(function (a, b) {
                        return String(b.dataset.year).localeCompare(String(a.dataset.year), "zh-Hans-CN", { numeric: true });
                    });
                } else if (mode === "title") {
                    sorted.sort(function (a, b) {
                        return String(a.dataset.title).localeCompare(String(b.dataset.title), "zh-Hans-CN");
                    });
                }

                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                applyFilters();
            }

            [input, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            if (sortSelect) {
                sortSelect.addEventListener("change", applySort);
            }

            applySort();
        }
    });
})();
