/* ===================================
   FAQ PAGE — faq.js
   WandVision K&K
=================================== */

const FAQPage = (() => {

    /* ── ACCORDION ── */
    function toggleFAQ(questionEl) {
        const item = questionEl.closest('.faq-item');
        const isActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item.active').forEach(el => {
            el.classList.remove('active');
        });

        // Open clicked (unless it was already open)
        if (!isActive) {
            item.classList.add('active');
        }
    }

    /* ── CATEGORY FILTER ── */
    function initCategoryFilter() {
        const btns = document.querySelectorAll('.faq-cat-btn');
        const items = document.querySelectorAll('.faq-item');

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.cat;

                // Active state on button
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter items
                items.forEach(item => {
                    if (cat === 'all' || item.dataset.cat === cat) {
                        item.classList.remove('faq-hidden');
                    } else {
                        item.classList.add('faq-hidden');
                        item.classList.remove('active'); // close if hidden
                    }
                });
            });
        });
    }

    /* ── SCROLL REVEAL ── */
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

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

    /* ── SMOOTH SCROLL for anchor links ── */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
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
        hideCookieBanner();
    }
    function declineCookies() {
        localStorage.setItem('cookieConsent', 'declined');
        hideCookieBanner();
    }
    function hideCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.remove('visible');
    }

    /* ── MOBILE MENU (reuse from main.js if available) ── */
    function toggleMobileMenu() {
        if (window.WandVision && WandVision.toggleMobileMenu) {
            WandVision.toggleMobileMenu();
        }
    }
    function closeMobileMenu() {
        if (window.WandVision && WandVision.closeMobileMenu) {
            WandVision.closeMobileMenu();
        }
    }

    /* ── INIT ── */
    function init() {
        initReveal();
        initNavbar();
        initSmoothScroll();
        initScrollToTop();
        initCategoryFilter();
        initCookies();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        toggleFAQ,
        scrollToTop,
        acceptCookies,
        declineCookies,
        toggleMobileMenu,
        closeMobileMenu,
    };
})();
