(function () {
    function setupPlayer(root) {
        var video = root.querySelector('video');
        var overlay = root.querySelector('[data-player-overlay]');
        var button = root.querySelector('[data-play-button]');
        var source = video ? video.getAttribute('data-source') : '';
        var ready = false;
        var hlsInstance = null;

        function prepare() {
            if (!video || !source || ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function start() {
            if (!video) {
                return;
            }

            prepare();
            video.controls = true;

            if (overlay) {
                overlay.classList.add('player-overlay-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('player-overlay-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
