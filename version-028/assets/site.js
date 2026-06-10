(function () {
    var header = document.querySelector('[data-site-header]');
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    var backTop = document.querySelector('[data-back-top]');

    function updateHeader() {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > 12);
        }

        if (backTop) {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === activeIndex);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                showSlide(position);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var search = document.querySelector('[data-filter-search]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var emptyState = document.querySelector('[data-empty-state]');

    function appendOptions(select, values) {
        if (!select) {
            return;
        }

        values.forEach(function (value) {
            if (!value) {
                return;
            }

            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function uniqueValues(attribute) {
        var set = new Set();

        cards.forEach(function (card) {
            var value = card.getAttribute(attribute) || '';
            if (value) {
                set.add(value);
            }
        });

        return Array.prototype.slice.call(set).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function filterCards() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();

            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }

            if (regionValue && card.getAttribute('data-region') !== regionValue) {
                matched = false;
            }

            if (typeValue && card.getAttribute('data-type') !== typeValue) {
                matched = false;
            }

            if (yearValue && card.getAttribute('data-year') !== yearValue) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (cards.length) {
        appendOptions(region, uniqueValues('data-region'));
        appendOptions(type, uniqueValues('data-type'));
        appendOptions(year, uniqueValues('data-year'));

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && search) {
            search.value = query;
        }

        [search, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        filterCards();
    }
})();
