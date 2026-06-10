(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        initNavigation();
        initHero();
        initSearchPanels();
        initPlayer();
        initImageFallback();
    });

    function initNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5500);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function initSearchPanels() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-wrap]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var select = panel.querySelector("[data-type-filter]");
            var empty = panel.querySelector("[data-search-empty]");
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function matchType(value, text) {
                if (!value) {
                    return true;
                }
                if (value === "movie") {
                    return /电影|Movie/i.test(text);
                }
                if (value === "series") {
                    return /剧|Series|TV/i.test(text);
                }
                if (value === "animation") {
                    return /动画|动漫/i.test(text);
                }
                if (value === "variety") {
                    return /综艺/i.test(text);
                }
                return true;
            }

            function filter() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var typeValue = select ? select.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-year") || ""
                    ].join(" ").toLowerCase();
                    var typeText = (card.getAttribute("data-type") || "") + " " + (card.getAttribute("data-genre") || "");
                    var matched = (!keyword || haystack.indexOf(keyword) !== -1) && matchType(typeValue, typeText);
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.textContent = visible ? "" : "没有找到匹配影片";
                }
            }

            if (input) {
                input.addEventListener("input", filter);
            }
            if (select) {
                select.addEventListener("change", filter);
            }
        });
    }

    function initPlayer() {
        var video = document.getElementById("movie-player");
        if (!video) {
            return;
        }
        var cover = document.getElementById("player-cover");
        var trigger = document.getElementById("play-trigger");
        var attached = false;
        var hls = null;

        function attachStream() {
            if (attached) {
                return;
            }
            var streamUrl = video.getAttribute("data-stream");
            if (!streamUrl) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            attached = true;
        }

        function start(event) {
            if (event) {
                event.preventDefault();
            }
            attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", start);
        }
        if (cover) {
            cover.addEventListener("click", start);
            cover.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    start(event);
                }
            });
        }
        video.addEventListener("click", function () {
            if (!attached) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    function initImageFallback() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img"));
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });
    }
})();
