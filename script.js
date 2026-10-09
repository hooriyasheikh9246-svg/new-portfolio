(function () {
    var doc = document.documentElement;
    var body = document.body;
    doc.classList.add('js-ready');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var header = document.getElementById('siteHeader');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primaryNav');
    var progress = document.querySelector('.scroll-progress');
    var veil = document.querySelector('.page-veil');

    function setNav(open) {
        body.classList.toggle('nav-open', open);
        if (toggle) {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }
    }

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            setNav(!body.classList.contains('nav-open'));
        });

        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) setNav(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setNav(false);
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 720) setNav(false);
        });
    }

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var y = window.pageYOffset || doc.scrollTop;
            var max = doc.scrollHeight - window.innerHeight;
            if (header) header.classList.toggle('scrolled', y > 15);
            if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealItems.forEach(function (item) {
            observer.observe(item);
        });
    } else {
        revealItems.forEach(function (item) {
            item.classList.add('in');
        });
    }

    document.querySelectorAll('[data-year]').forEach(function (node) {
        node.textContent = new Date().getFullYear();
    });

    if (finePointer && !reduceMotion) {
        var glow = document.querySelector('.cursor-glow');
        if (glow) {
            window.addEventListener('pointermove', function (e) {
                if (e.pointerType !== 'mouse') return;
                glow.classList.add('on');
                glow.style.transform = 'translate3d(' + (e.clientX - 240) + 'px,' + (e.clientY - 240) + 'px,0)';
            }, { passive: true });
        }
    }

    var form = document.querySelector('.contact-form');

    if (form && window.fetch && window.FormData) {
        var status = form.querySelector('.form-status');
        var button = form.querySelector('.submit-btn');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            button.disabled = true;
            status.className = 'form-status';
            status.textContent = 'Sending message...';

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            }).then(function (res) {
                if (res.ok) {
                    form.reset();
                    status.textContent = 'Thank you, your message has been sent successfully.';
                    status.classList.add('ok');
                } else {
                    status.textContent = 'Something went wrong. Please email directly.';
                    status.classList.add('err');
                }
            }).catch(function () {
                status.textContent = 'Network error. Please check your connection.';
                status.classList.add('err');
            }).then(function () {
                button.disabled = false;
            });
        });
    }
})();