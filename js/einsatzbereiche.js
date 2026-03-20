/* ===================================
   EINSATZBEREICHE PAGE — einsatzbereiche.js
   WandVision K&K
=================================== */

const EinsatzPage = (() => {

    /* ── SCROLL REVEAL ── */
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    /* ── NAVBAR SCROLL ── */
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    /* ── SMOOTH SCROLL for anchor links (hero pills → sections) ── */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const id = anchor.getAttribute('href');
                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    const offset = 80; // navbar height
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    /* ── ACTIVE SECTOR HIGHLIGHT on scroll ── */
    function initActiveSector() {
        const sectors = document.querySelectorAll('.eb-sector-section');
        const pills = document.querySelectorAll('.eb-hero-pill');

        if (!sectors.length || !pills.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    pills.forEach(pill => {
                        const href = pill.getAttribute('href').replace('#', '');
                        pill.style.background = href === id
                            ? 'rgba(255,255,255,0.35)'
                            : 'rgba(255,255,255,0.15)';
                    });
                }
            });
        }, { threshold: 0.4 });

        sectors.forEach(s => observer.observe(s));
    }

    /* ── ICON TILT on mouse move (desktop only) ── */
    function initIconTilt() {
        if (window.innerWidth < 768) return;

        document.querySelectorAll('.eb-sector-icon-wrap').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                card.style.transform = `translateY(-6px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.03)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ── SCROLL TO TOP ── */
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function initScrollToTop() {
        const btn = document.getElementById('scroll-to-top');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
    }

    /* ── COOKIES ── */
    function initCookies() {
        const banner = document.getElementById('cookie-banner');
        if (!banner) return;
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => banner.classList.add('visible'), 1500);
        }
    }
    function acceptCookies() {
        localStorage.setItem('cookieConsent', 'accepted');
        const b = document.getElementById('cookie-banner');
        if (b) b.classList.remove('visible');
    }
    function declineCookies() {
        localStorage.setItem('cookieConsent', 'declined');
        const b = document.getElementById('cookie-banner');
        if (b) b.classList.remove('visible');
    }

    /* ── MOBILE MENU ── */
    function toggleMobileMenu() {
        if (window.WandVision) WandVision.toggleMobileMenu();
    }
    function closeMobileMenu() {
        if (window.WandVision) WandVision.closeMobileMenu();
    }

    /* ── INIT ── */
    function init() {
        initReveal();
        initNavbar();
        initSmoothScroll();
        initActiveSector();
        initIconTilt();
        initScrollToTop();
        initCookies();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        scrollToTop,
        acceptCookies,
        declineCookies,
        toggleMobileMenu,
        closeMobileMenu,
    };
})();
