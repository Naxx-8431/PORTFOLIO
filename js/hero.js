/* =========================================================
   HERO — scroll-linked "read-along" headline
   · Lines rise out of masks on load (after fonts are ready, so no reflow)
   · While the hero is pinned, words light up 1:1 with scroll progress
     (continuous, reversible feedback: scroll back and they dim again)
   · The first line starts lit so the page never opens dark
   · No scroll listener: an IntersectionObserver runs a rAF loop only
     while the hero is on screen
   · Reduced motion / unpinned layouts: everything lit, nothing moves
   ========================================================= */
(function () {
    'use strict';

    var hero = document.querySelector('.hero');
    var title = document.getElementById('hero-title');
    if (!hero || !title) return;

    var pin = hero.querySelector('.hero-pin');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Split each line into word spans (screen readers get the plain heading) ----
    var words = [];
    var firstLineCount = 0;
    var full = title.textContent.replace(/\s+/g, ' ').trim();

    title.querySelectorAll('.ln-in').forEach(function (line, li) {
        var parts = line.textContent.trim().split(/\s+/);
        line.textContent = '';
        parts.forEach(function (word, wi) {
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = word;
            line.appendChild(s);
            if (wi < parts.length - 1) line.appendChild(document.createTextNode(' '));
            words.push(s);
        });
        if (li === 0) firstLineCount = parts.length;
        line.setAttribute('aria-hidden', 'true');
    });
    title.setAttribute('aria-label', 'Mohammed Naif. ' + full);

    var N = words.length;
    var lastF = -1;

    function setLit(f) {
        if (Math.abs(f - lastF) < 0.004) return;
        lastF = f;
        for (var i = 0; i < N; i++) {
            var o = Math.max(0, Math.min(1, f - i));
            words[i].style.setProperty('--lit', o.toFixed(3));
        }
    }

    function progress() {
        var dist = hero.offsetHeight - pin.offsetHeight;
        if (dist <= 1) return 1;                         // not pinned (short screens, reduced motion)
        var p = -hero.getBoundingClientRect().top / dist;
        return Math.max(0, Math.min(1, p));
    }

    function update() {
        var p = progress();
        // Light the remaining words over the first 80% of the pinned scroll
        var f = firstLineCount + (N - firstLineCount + 0.001) * Math.min(1, p / 0.8);
        setLit(f);
    }

    // ---- Load-in ---------------------------------------------------------------
    function reveal() { hero.classList.add('is-in'); }
    if (reduce) {
        setLit(N);
        reveal();
        return;
    }
    update();
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 900); })])
        .then(function () { requestAnimationFrame(reveal); });

    // ---- Scroll-linked loop, only while the hero is visible ------------------------
    var running = false;
    function loop() {
        if (!running) return;
        update();
        requestAnimationFrame(loop);
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            var vis = entries[0].isIntersecting;
            if (vis && !running) { running = true; requestAnimationFrame(loop); }
            else if (!vis) { running = false; update(); }
        }).observe(hero);
    } else {
        setLit(N);
    }

    window.addEventListener('resize', function () { lastF = -1; update(); });
})();
