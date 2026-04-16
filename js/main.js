/* ============================================================
   Stretching for Women — landing page scripts
   - Reveal-on-scroll animations
   - Waiting list form handling
   - Year stamp
   ============================================================ */

(function () {
    'use strict';

    // ------- Strip /index.html from the address bar -------
    if (window.location.pathname.endsWith('/index.html')) {
        history.replaceState(null, '', window.location.pathname.replace('/index.html', '/'));
    }

    // ------- Year stamp -------
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ------- Reveal on scroll -------
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // ------- Waiting list form -------
    var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzdyebkl';

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function setupForm(form) {
        if (!form) return;

        var input = form.querySelector('input[type="email"]');
        var honeypot = form.querySelector('input[name="_gotcha"]');
        var button = form.querySelector('button[type="submit"]');
        var note = form.querySelector('.waitlist-note');
        var success = form.querySelector('.waitlist-success');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!input) return;

            // Honeypot — bots fill this; real users don't see it
            if (honeypot && honeypot.value) {
                showSuccess();
                return;
            }

            var email = input.value.trim();

            if (!isValidEmail(email)) {
                input.focus();
                input.setCustomValidity('Please enter a valid email.');
                input.reportValidity();
                input.addEventListener('input', function once() {
                    input.setCustomValidity('');
                    input.removeEventListener('input', once);
                }, { once: true });
                return;
            }

            form.classList.add('is-loading');

            function showSuccess() {
                form.classList.remove('is-loading');
                if (note) note.hidden = true;
                if (input) input.hidden = true;
                if (button) button.hidden = true;
                if (success) success.hidden = false;

                var redirected = false;
                function goToThanks() {
                    if (redirected) return;
                    redirected = true;
                    window.location.href = '/thanks.html';
                }

                if (typeof window.fbq === 'function') {
                    window.fbq('track', 'Lead');
                }
                if (typeof window.gtag === 'function') {
                    // Use event_callback so redirect waits for GA4 to flush
                    window.gtag('event', 'waitlist_signup', {
                        method: 'email',
                        event_callback: goToThanks
                    });
                    // Fallback in case gtag callback never fires
                    setTimeout(goToThanks, 1200);
                } else {
                    setTimeout(goToThanks, 600);
                }
            }

            fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: email, source: 'waitlist' })
            })
                .then(function (res) {
                    if (!res.ok) throw new Error('Submission failed');
                    showSuccess();
                })
                .catch(function () {
                    form.classList.remove('is-loading');
                    if (note) {
                        note.textContent = 'Something went wrong. Please try again.';
                        note.style.color = '#8B1D1D';
                    }
                });
        });
    }

    setupForm(document.getElementById('waitlist-form'));
    setupForm(document.getElementById('waitlist-form-2'));

    // ------- Smooth anchor with offset for sticky nav -------
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = a.getAttribute('href');
            if (!id || id === '#') return;
            var target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            var offset = 70;
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

})();
