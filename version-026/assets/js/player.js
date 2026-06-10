(function () {
    window.createMoviePlayer = function (source) {
        var wrap = document.querySelector('[data-player]');

        if (!wrap) {
            return;
        }

        var video = wrap.querySelector('video');
        var overlay = wrap.querySelector('.player-overlay');
        var button = wrap.querySelector('.player-button');
        var status = wrap.querySelector('.player-status');
        var started = false;
        var hlsInstance = null;

        function showError() {
            if (status) {
                status.textContent = '视频加载失败，请稍后重试';
                status.classList.add('is-visible');
            }
        }

        function playVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (status) {
                        status.textContent = '点击播放器继续观看';
                        status.classList.add('is-visible');
                    }
                });
            }
        }

        function attachSource() {
            if (started) {
                playVideo();
                return;
            }

            started = true;
            video.setAttribute('controls', 'controls');

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.addEventListener('error', showError, { once: true });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
                return;
            }

            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.addEventListener('error', showError, { once: true });
        }

        if (overlay) {
            overlay.addEventListener('click', attachSource);
            overlay.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    attachSource();
                }
            });
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                attachSource();
            });
        }

        video.addEventListener('click', function () {
            if (!started) {
                attachSource();
                return;
            }

            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
