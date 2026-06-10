(function () {
    var body = document.body;
    var menuToggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            var opened = body.classList.toggle('nav-open');
            menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });

        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                body.classList.remove('nav-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-arrow.prev');
    var next = document.querySelector('.hero-arrow.next');
    var current = 0;
    var timer;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }

        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    if (slides.length) {
        showSlide(0);
        startCarousel();

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startCarousel();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startCarousel();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startCarousel();
            });
        }
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, '');
    }

    var searchInput = document.getElementById('siteSearch');
    var categoryFilter = document.getElementById('categoryFilter');
    var yearFilter = document.getElementById('yearFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-list .movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function prepareYears() {
        if (!yearFilter || !cards.length) {
            return;
        }

        var values = cards.map(function (card) {
            return card.getAttribute('data-year') || '';
        }).filter(Boolean);

        var unique = Array.from(new Set(values)).sort(function (a, b) {
            return b.localeCompare(a, 'zh-CN', { numeric: true });
        });

        unique.forEach(function (year) {
            var option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    function applyQueryFromUrl() {
        if (!searchInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : '');
        var category = categoryFilter ? categoryFilter.value : '';
        var year = yearFilter ? yearFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-category'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedCategory = !category || card.getAttribute('data-category') === category;
            var matchedYear = !year || card.getAttribute('data-year') === year;
            var matched = matchedKeyword && matchedCategory && matchedYear;

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    prepareYears();
    applyQueryFromUrl();
    filterCards();

    [searchInput, categoryFilter, yearFilter].forEach(function (element) {
        if (element) {
            element.addEventListener('input', filterCards);
            element.addEventListener('change', filterCards);
        }
    });

    var backTop = document.querySelector('.back-top');

    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
