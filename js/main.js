(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ========================================
    // FOOTER YEAR
    // ========================================
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================
    // LENIS SMOOTH SCROLL
    // ========================================
    var lenis = null;
    if (typeof Lenis !== 'undefined' && !reduceMotion.matches) {
        lenis = new Lenis({
            duration: 0.8,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            smoothWheel: true,
            syncTouch: false
        });
        (function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        })(0);
    }

    function scrollToTarget(target) {
        var isTop = target.id === 'top';
        var offset = isTop ? 0 : -72;
        if (lenis) {
            lenis.scrollTo(isTop ? 0 : target, { offset: offset });
        } else {
            var y = isTop ? 0 : target.getBoundingClientRect().top + window.pageYOffset + offset;
            window.scrollTo({ top: y, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
    }

    // ========================================
    // MENU (header bar grows into a panel)
    // ========================================
    var menuBtn = document.getElementById('menu-btn');
    var menu = document.getElementById('menu');

    function setMenu(open) {
        root.classList.toggle('menu-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.inert = !open;
        document.querySelectorAll('main, footer').forEach(function (el) { el.inert = open; });
        if (lenis) { open ? lenis.stop() : lenis.start(); }
        else { document.body.style.overflow = open ? 'hidden' : ''; }
        if (open) {
            var first = menu.querySelector('a');
            if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
        }
    }

    if (menuBtn && menu) {
        menu.inert = true;
        menuBtn.addEventListener('click', function () {
            setMenu(!root.classList.contains('menu-open'));
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && root.classList.contains('menu-open')) {
                setMenu(false);
                menuBtn.focus();
            }
        });
        document.addEventListener('click', function (e) {
            if (root.classList.contains('menu-open') && !e.target.closest('#hdr')) setMenu(false);
        });
    }

    // In-page anchors
    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        var id = link.getAttribute('href');
        if (!id || id.length <= 1) return;
        var target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        if (root.classList.contains('menu-open')) setMenu(false);
        scrollToTarget(target);
        if (history.replaceState) history.replaceState(null, '', id === '#top' ? location.pathname : id);
    });

    // ========================================
    // THEME (header icon + footer row)
    // ========================================
    var themeBtn = document.getElementById('theme-toggle');
    var themeRow = document.getElementById('theme-row');
    var themeRowLabel = document.getElementById('theme-row-label');

    function syncTheme() {
        var dark = root.getAttribute('data-theme') === 'dark';
        if (themeBtn) {
            themeBtn.querySelector('i').className = dark ? 'bi bi-sun' : 'bi bi-moon';
            themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        }
        if (themeRowLabel) themeRowLabel.textContent = dark ? 'Dark' : 'Light';
    }

    function toggleTheme() {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
        syncTheme();
    }

    syncTheme();
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (themeRow) themeRow.addEventListener('click', toggleTheme);

    // ========================================
    // COLUMN DOTS — one per layout column (12 desktop / 4 mobile)
    // ========================================
    var dots = document.querySelector('.dot-matrix');
    function sizeDots() {
        if (!dots) return;
        var cols = window.innerWidth >= 768 ? 12 : 4;
        dots.style.setProperty('--cell', (dots.clientWidth / cols).toFixed(2) + 'px');
    }
    sizeDots();
    window.addEventListener('resize', sizeDots);

    // ========================================
    // PIXEL ICONS (7×7 dot grids → SVG)
    // ========================================
    var PIXELS = {
        monitor: ['1111111', '1000001', '1000001', '1000001', '1111111', '0001000', '0111110'],
        server: ['1111111', '1000011', '1111111', '0000000', '1111111', '1000011', '1111111'],
        layers: ['0001000', '0110110', '1000001', '0110110', '1001001', '0110110', '0001000'],
        bolt: ['0000110', '0001100', '0011000', '0111110', '0001100', '0011000', '0110000']
    };
    document.querySelectorAll('[data-pixel]').forEach(function (el) {
        var grid = PIXELS[el.getAttribute('data-pixel')];
        if (!grid) return;
        var circles = '';
        grid.forEach(function (row, y) {
            row.split('').forEach(function (bit, x) {
                if (bit === '1') circles += '<circle cx="' + (x * 4 + 2) + '" cy="' + (y * 4 + 2) + '" r="1.5"/>';
            });
        });
        el.innerHTML = '<svg viewBox="0 0 28 28" fill="currentColor">' + circles + '</svg>';
    });

    // ========================================
    // SCROLL REVEAL
    // ========================================
    var revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
                    return c.hasAttribute('data-reveal');
                });
                el.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(el)), 4) * 80 + 'ms';
                el.classList.add('is-in');
                io.unobserve(el);
            });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }

    // ========================================
    // BLUR-UP IMAGES
    // ========================================
    document.querySelectorAll('.tile-media img').forEach(function (img) {
        function done() { img.classList.add('is-loaded'); }
        if (img.complete) done();
        else {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        }
    });

    // ========================================
    // EMAIL — Gmail compose on desktop, native mail app on touch
    // ========================================
    var emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.addEventListener('click', function (e) {
            if (window.matchMedia('(pointer: coarse)').matches) return;
            var win = window.open('https://mail.google.com/mail/?view=cm&fs=1&to=mnaif7605@gmail.com', '_blank');
            if (win) { win.opener = null; e.preventDefault(); }
        });
    }

    // ========================================
    // CONTACT FORM (EmailJS)
    // ========================================
    (function () {
        var form = document.getElementById('contact-form');
        var btn = document.getElementById('submit-btn');
        var status = document.getElementById('form-status');
        if (!form || !btn || !status) return;

        var idle = btn.innerHTML;
        var timer = null;

        function say(type, msg) {
            clearTimeout(timer);
            status.className = 'form-status' + (type ? ' is-' + type : '');
            status.textContent = msg;
        }

        function validate() {
            var ok = true;
            form.querySelectorAll('input, textarea').forEach(function (f) {
                var valid = f.checkValidity() && f.value.trim() !== '';
                f.closest('.field').classList.toggle('is-invalid', !valid);
                f.setAttribute('aria-invalid', String(!valid));
                if (!valid && ok) { f.focus(); ok = false; }
            });
            return ok;
        }

        form.addEventListener('input', function (e) {
            var field = e.target.closest('.field');
            if (field && e.target.checkValidity() && e.target.value.trim()) {
                field.classList.remove('is-invalid');
                e.target.setAttribute('aria-invalid', 'false');
            }
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validate()) return say('error', 'Please fill in your name, a valid email and a message.');
            if (!window.emailjs) return say('error', 'Form unavailable — email mnaif7605@gmail.com directly.');

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Sending…</span>';
            say('', '');

            emailjs.send('service_68ip7uq', 'template_mttqm7v', {
                user_name: form.user_name.value.trim(),
                user_email: form.user_email.value.trim(),
                message: form.message.value.trim()
            }).then(function () {
                say('success', "Message sent successfully! I'll get back to you soon.");
                form.reset();
                timer = setTimeout(function () { say('', ''); }, 6000);
            }, function () {
                say('error', 'Oops! Something went wrong. Please try again or email me directly.');
            }).then(function () {
                btn.disabled = false;
                btn.innerHTML = idle;
            });
        });
    })();
})();
