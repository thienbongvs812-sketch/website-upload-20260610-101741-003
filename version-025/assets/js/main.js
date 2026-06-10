(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupHeader() {
        var header = qs('[data-site-header]');
        var menuToggle = qs('[data-menu-toggle]');
        var mobileNav = qs('[data-mobile-nav]');
        var backTop = qs('[data-back-top]');
        function updateScroll() {
            var scrolled = window.scrollY > 18;
            if (header) {
                header.classList.toggle('scrolled', scrolled);
            }
            if (backTop) {
                backTop.classList.toggle('show', window.scrollY > 420);
            }
        }
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
                document.body.classList.toggle('menu-open', mobileNav.classList.contains('open'));
            });
        }
        if (backTop) {
            backTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function setupFilters() {
        var panel = qs('[data-filter-panel]');
        var cards = qsa('[data-movie-card]');
        if (!panel || !cards.length) {
            return;
        }
        var keyword = qs('[data-filter-keyword]', panel);
        var year = qs('[data-filter-year]', panel);
        var type = qs('[data-filter-type]', panel);
        var category = qs('[data-filter-category]', panel);
        var reset = qs('[data-filter-reset]', panel);
        var params = new URLSearchParams(window.location.search);
        var incoming = params.get('q') || '';
        if (keyword && incoming) {
            keyword.value = incoming;
        }
        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }
        function apply() {
            var q = normalize(keyword && keyword.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            var c = normalize(category && category.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var okKeyword = !q || text.indexOf(q) !== -1;
                var okYear = !y || normalize(card.getAttribute('data-year')) === y;
                var okType = !t || normalize(card.getAttribute('data-type')) === t;
                var okCategory = !c || normalize(card.getAttribute('data-category')) === c;
                card.classList.toggle('hidden', !(okKeyword && okYear && okType && okCategory));
            });
        }
        [keyword, year, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (keyword) {
                    keyword.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (category) {
                    category.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function setupPlayer() {
        var box = qs('[data-player]');
        if (!box) {
            return;
        }
        var video = qs('[data-player-video]', box);
        var overlay = qs('[data-player-overlay]', box);
        var message = qs('[data-player-message]', box);
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-src');
        function showMessage(text) {
            if (!message || !text) {
                return;
            }
            message.textContent = text;
            message.classList.add('show');
        }
        if (src) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('视频加载失败，请稍后重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                showMessage('当前浏览器需要 HLS 播放支持');
            }
        }
        function toggle() {
            if (video.paused) {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        showMessage('请再次点击播放');
                    });
                }
            } else {
                video.pause();
            }
        }
        if (overlay) {
            overlay.addEventListener('click', toggle);
        }
        video.addEventListener('click', toggle);
        video.addEventListener('play', function () {
            box.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            box.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
            box.classList.remove('playing');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHeader();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
