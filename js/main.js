/* ===================================
   WANDVISION K&K - MAIN JAVASCRIPT
   Mobile Optimized - Complete Version
=================================== */

const WandVision = (function() {
    'use strict';

    /* ===================================
       UTILITY FUNCTIONS
    =================================== */
    function debounce(fn, delay) {
        var timer;
        return function() {
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() { fn.apply(null, args); }, delay);
        };
    }

    /* ===================================
       STATE
    =================================== */
    let selectedPhoto = null;
    let selectedDesign = null;
    let cameraStream = null;

    /* ===================================
       PRICING
    =================================== */
    const PRICING = {
        standard: {
            putz: 150,
            beton: 165,
            holz: 170,
            glas: 180,
            boden: 200
        },
        premium: {
            putz: 200,
            beton: 220,
            holz: 230,
            glas: 250,
            boden: 250
        }
    };

    const SURFACE_NAMES = {
        putz: 'Putz (Standard)',
        beton: 'Beton',
        holz: 'Holz',
        glas: 'Glas',
        boden: 'Bodendruck'
    };

    /* ===================================
       GALLERY FILTER
    =================================== */
    function initGalleryFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (!filterBtns.length) return;

        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');

                const filter = btn.getAttribute('data-filter');

                galleryItems.forEach(function(item) {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        item.style.opacity = '0';
                        item.style.transition = '';
                        setTimeout(function() {
                            item.style.transition = 'opacity 0.4s ease';
                            item.style.opacity = '1';
                        }, 10);
                    } else {
                        item.style.display = 'none';
                        item.style.opacity = '';
                        item.style.transition = '';
                    }
                });
            });
        });
    }

    /* ===================================
       VIDEO LAZY LOAD
    =================================== */
    function initVideoLazyLoad() {
        if (!('IntersectionObserver' in window)) return;
        const videos = document.querySelectorAll('.local-video[preload="none"]');
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.getAttribute('data-loaded') !== 'true') {
                        video.preload = 'metadata';
                        video.setAttribute('data-loaded', 'true');
                        observer.unobserve(video);
                    }
                }
            });
        }, { rootMargin: '200px' });
        videos.forEach(function(video) { observer.observe(video); });
    }

    /* ===================================
       SMOOTH SCROLL
    =================================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    const navHeight = document.querySelector('.navbar') ?
                        document.querySelector('.navbar').offsetHeight : 70;
                    const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                    window.scrollTo({ top: targetPos, behavior: 'smooth' });
                    closeMobileMenu();
                }
            });
        });
    }

    /* ===================================
       NAVBAR SCROLL
    =================================== */
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        window.addEventListener('scroll', debounce(function() {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
                navbar.style.boxShadow = '0 5px 20px rgba(30,58,138,0.2)';
                navbar.style.background = 'rgba(255,255,255,0.98)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.boxShadow = '0 2px 10px rgba(30,58,138,0.1)';
                navbar.style.background = '#ffffff';
            }
        }, 50), { passive: true });
    }

    /* ===================================
       SCROLL TO TOP
    =================================== */
    function initScrollToTop() {
        const btn = document.getElementById('scroll-to-top');
        if (!btn) return;
        window.addEventListener('scroll', debounce(function() {
            if (window.pageYOffset > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, 100), { passive: true });
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ===================================
       MOBILE MENU
    =================================== */
    function toggleMobileMenu() {
    const menu = document.getElementById('nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navbar = document.getElementById('navbar');
    if (!menu) return;
    menu.style.top = (navbar ? navbar.offsetHeight : 70) + 'px';
    const isActive = menu.classList.toggle('active');
    if (toggle) {
        toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        toggle.classList.toggle('active', isActive);
    }
    document.body.style.overflow = isActive ? 'hidden' : '';
}

    function closeMobileMenu() {
    const menu = document.getElementById('nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (!menu) return;
    menu.classList.remove('active');
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('active');
    }
    document.body.style.overflow = '';
}

    /* ===================================
       ROOM TRANSFORMATION
    =================================== */
    function transformRoom(roomId) {
        const card = document.getElementById('room-' + roomId);
        if (!card) return;
        setTimeout(function() {
            showConfigurator();
        }, 8000);
    }
        /* ===================================
       PARTICLE EXPLOSION
    =================================== */
            function createParticles(e, card) {
        const preview = card.querySelector('.room-preview');
        const rect = preview.getBoundingClientRect();
        const startX = (e.clientX || (e.touches && e.touches[0].clientX) || rect.width / 2) - rect.left;
        const startY = (e.clientY || (e.touches && e.touches[0].clientY) || rect.height / 2) - rect.top;

        const colors = ['#FFD700', '#F5C518', '#FFC200', '#B8860B', '#FFED4A'];
        const totalStars = 160;
        const stars = [];
        let placed = 0;
        const half = Math.floor(totalStars * 0.8);
        let triggered = false;

        for (let i = 0; i < totalStars; i++) {
            setTimeout(function() {
                if (triggered) return; // ← ne dodaj više zvjezdica nakon triggera

                const star = document.createElement('span');
                star.classList.add('magic-star');

                const spread = (placed / totalStars);
                const rx = (Math.random() - 0.5) * rect.width * spread * 2;
                const ry = (Math.random() - 0.5) * rect.height * spread * 2;
                const x = Math.min(Math.max(startX + rx, 5), rect.width - 5);
                const y = Math.min(Math.max(startY + ry, 5), rect.height - 5);
                const size = Math.random() * 12 + 6;
                const color = colors[Math.floor(Math.random() * colors.length)];

                star.style.cssText = `
                    left: ${x}px;
                    top: ${y}px;
                    width: ${size}px;
                    height: ${size}px;
                    color: ${color};
                `;
                star.innerHTML = '★';
                preview.appendChild(star);
                stars.push(star);
                placed++;

                if (placed === half) {
                    triggered = true; // ← zaustavi dodavanje novih
                    setTimeout(function() {
                        // Ukloni SVE zvjezdice koje su u preview-u
                        preview.querySelectorAll('.magic-star').forEach(function(s) {
                            s.style.animation = 'star-fadeout 0.5s ease forwards';
                        });
                        setTimeout(function() {
                            preview.querySelectorAll('.magic-star').forEach(function(s) {
                                s.remove();
                            });
                            card.classList.add('transformed');
                        }, 500);
                    }, 300);
                }

            }, i * 35);
        }
    }



        /* ===================================
       LIGHTBOX
    =================================== */
    function openLightbox(item) {
        const img = item.querySelector('img');
        const overlay = item.querySelector('.gallery-overlay');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        if (!lightbox || !img) return;

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        if (overlay) {
            const h4 = overlay.querySelector('h4');
            const p = overlay.querySelector('p');
            lightboxCaption.textContent = (h4 ? h4.textContent : '') + (p ? ' – ' + p.textContent : '');
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function openVideoLightbox(src, title, desc) {
        const lb = document.getElementById('video-lightbox');
        const lbVideo = document.getElementById('video-lightbox-player');
        const lbCaption = document.getElementById('video-lightbox-caption');
        if (!lb || !lbVideo) return;

        lbVideo.src = src;
        if (lbCaption) lbCaption.textContent = title + (desc ? ' – ' + desc : '');
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
        lbVideo.play();
    }

    function closeVideoLightbox() {
        const lb = document.getElementById('video-lightbox');
        const lbVideo = document.getElementById('video-lightbox-player');
        if (!lb) return;
        lb.classList.remove('active');
        document.body.style.overflow = '';
        if (lbVideo) {
            lbVideo.pause();
            lbVideo.removeAttribute('src');
            lbVideo.load();
        }
    
}


    /* ===================================
       FAQ
    =================================== */
    function toggleFAQ(questionEl) {
        const item = questionEl.parentElement;
        const allItems = document.querySelectorAll('.faq-item');
        allItems.forEach(function(i) {
            if (i !== item) i.classList.remove('active');
        });
        item.classList.toggle('active');
    }

    /* ===================================
       PRICE CALCULATOR
    =================================== */
    function calculatePrice() {
        const breite = parseFloat(document.getElementById('breite').value);
        const hoehe = parseFloat(document.getElementById('hoehe').value);
        const oberflaeche = document.getElementById('oberflaeche').value;
        const qualitaet = document.getElementById('qualitaet').value;

        if (!breite || !hoehe || breite <= 0 || hoehe <= 0) {
            alert('Bitte geben Sie gültige Maße ein.');
            return;
        }

        const flaeche = Math.round(breite * hoehe * 100) / 100;
        const preisQm = PRICING[qualitaet][oberflaeche];
        const gesamtpreis = Math.round(flaeche * preisQm);

        document.getElementById('result-flaeche').textContent = flaeche + ' m²';
        document.getElementById('result-oberflaeche').textContent = SURFACE_NAMES[oberflaeche];
        document.getElementById('result-qualitaet').textContent = qualitaet === 'standard' ? 'Standard' : 'Premium';
        document.getElementById('result-preis-qm').textContent = preisQm + ' €';
        document.getElementById('result-total').textContent = gesamtpreis.toLocaleString('de-DE') + ' €';

        const resultEl = document.getElementById('calculator-result');
        resultEl.style.display = 'block';
        resultEl.style.animation = 'fadeIn 0.4s ease';
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* ===================================
       CONFIGURATOR
    =================================== */
    function showConfigurator() {
        const popup = document.getElementById('configurator-popup');
        if (popup) {
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeConfigurator() {
        const popup = document.getElementById('configurator-popup');
        if (popup) {
            popup.classList.remove('active');
            document.body.style.overflow = '';
        }
        stopCamera();
    }

    function startConfigurator() {
        showStep(2);
    }

    function showStep(n) {
        for (let i = 1; i <= 5; i++) {
            const step = document.getElementById('step-' + i);
            if (step) step.style.display = i === n ? 'block' : 'none';
        }
    }

    function nextStep3() {
        if (!selectedPhoto) {
            alert('Bitte laden Sie zuerst ein Foto hoch.');
            return;
        }
        showStep(3);
    }

    function nextStep4() {
        if (!selectedDesign) {
            alert('Bitte wählen Sie ein Design aus.');
            return;
        }
        showStep(4);
    }

    /* ===================================
       CAMERA
    =================================== */
    function openCamera() {
        const preview = document.getElementById('camera-preview');
        if (!preview) return;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })
            .then(function(stream) {
                cameraStream = stream;
                preview.srcObject = stream;
                preview.style.display = 'block';
                preview.play();

                const oldBtn = document.getElementById('btn-capture-dynamic');
                if (oldBtn) oldBtn.remove();

                const captureBtn = document.createElement('button');
                captureBtn.id = 'btn-capture-dynamic';
                captureBtn.className = 'btn-camera-take';
                captureBtn.innerHTML = '<i class="fas fa-camera"></i> Aufnehmen';
                captureBtn.style.marginTop = '10px';
                captureBtn.onclick = capturePhoto;
                preview.parentNode.insertBefore(captureBtn, preview.nextSibling);
            })
            .catch(function(e) {
                console.warn('Camera error:', e);
                navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    cameraStream = stream;
                    preview.srcObject = stream;
                    preview.style.display = 'block';
                    preview.play();

                    const oldBtn = document.getElementById('btn-capture-dynamic');
                    if (oldBtn) oldBtn.remove();

                    const captureBtn = document.createElement('button');
                    captureBtn.id = 'btn-capture-dynamic';
                    captureBtn.className = 'btn-camera-take';
                    captureBtn.innerHTML = '<i class="fas fa-camera"></i> Aufnehmen';
                    captureBtn.style.marginTop = '10px';
                    captureBtn.onclick = capturePhoto;
                    preview.parentNode.insertBefore(captureBtn, preview.nextSibling);
                })
                .catch(function(e2) {
                    console.warn('Camera fallback error:', e2);
                    alert('Kamera nicht verfügbar. Bitte laden Sie ein Foto hoch.');
                });
            });
        } else {
            alert('Ihr Browser unterstützt keine Kamera. Bitte laden Sie ein Foto hoch.');
        }
    }

    function capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        showPhotoPreview(dataUrl);
        stopCamera();
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(function(t) { t.stop(); });
            cameraStream = null;
        }
        const preview = document.getElementById('camera-preview');
        if (preview) preview.style.display = 'none';
    }

    function handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) { showPhotoPreview(e.target.result); };
        reader.readAsDataURL(file);
    }

    function showPhotoPreview(src) {
        selectedPhoto = src;
        const previewDiv = document.getElementById('photo-preview');
        const previewImg = document.getElementById('preview-img');
        const nextBtn = document.getElementById('btn-next-design');
        if (previewDiv) previewDiv.style.display = 'block';
        if (previewImg) previewImg.src = src;
        if (nextBtn) nextBtn.style.display = 'flex';
    }

    function retakePhoto() {
        selectedPhoto = null;
        const previewDiv = document.getElementById('photo-preview');
        const nextBtn = document.getElementById('btn-next-design');
        if (previewDiv) previewDiv.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }

    /* ===================================
       DESIGN SELECTION
    =================================== */
    function selectDesign(name, el) {
        selectedDesign = name;
        document.querySelectorAll('.design-option').forEach(function(d) {
            d.classList.remove('selected');
        });
        el.classList.add('selected');
        const nextBtn = document.getElementById('btn-next-contact');
        if (nextBtn) nextBtn.style.display = 'flex';
    }

    /* ===================================
       SUBMIT REQUEST
    =================================== */
    function submitRequest(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const telefon = document.getElementById('telefon').value;
    if (!name || !telefon) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    const form = event.target;
    const formData = new FormData(form);

    fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
    })
    .then(function() {
        showStep(5);
    })
    .catch(function(error) {
        console.error('Form error:', error);
        showStep(5);
    });
}


    /* ===================================
       COOKIES
    =================================== */
    function initCookieBanner() {
        if (localStorage.getItem('cookiesAccepted')) return;
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            setTimeout(function() {
                banner.classList.add('active');
            }, 1500);
        }
    }

    function acceptCookies() {
        localStorage.setItem('cookiesAccepted', 'true');
        hideCookieBanner();
    }

    function declineCookies() {
        localStorage.setItem('cookiesAccepted', 'declined');
        hideCookieBanner();
    }

    function hideCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.3s ease';
            setTimeout(function() { banner.classList.remove('active'); }, 300);
        }
    }

        /* ===================================
       KEYBOARD ACCESSIBILITY
    =================================== */
    function initKeyboard() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
                closeConfigurator();
                closeMobileMenu();
                closeVideoLightbox();
            }
        });

        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) closeLightbox();
            });
        }

        const popup = document.getElementById('configurator-popup');
        if (popup) {
            popup.addEventListener('click', function(e) {
                if (e.target === popup) closeConfigurator();
            });
        }

        const videoLbClose = document.querySelector('#video-lightbox .lightbox-close');
        if (videoLbClose) {
            videoLbClose.addEventListener('click', closeVideoLightbox);
            videoLbClose.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeVideoLightbox();
            });
        }

        const videoLb = document.getElementById('video-lightbox');
        if (videoLb) {
            videoLb.addEventListener('click', function(e) {
                if (e.target === videoLb) closeVideoLightbox();
            });
        }
    }


    /* ===================================
       INTERSECTION OBSERVER (animacije)
    =================================== */
    function initAnimations() {
        if (!('IntersectionObserver' in window)) return;
        const elements = document.querySelectorAll(
            '.leistung-card, .testimonial-card, .gallery-item, .video-card, .faq-item, .feature-card'
        );
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeIn 0.5s ease forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elements.forEach(function(el) {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    /* ===================================
       VIDEO PLAYERS
    =================================== */
        function initVideoPlayers() {
        const videoCards = document.querySelectorAll('.video-card');

        videoCards.forEach(function(card) {
            const video = card.querySelector('.local-video');
            const overlay = card.querySelector('.video-play-overlay');
            if (!video || !overlay) return;

            const source = video.querySelector('source');
            const src = source ? source.src : video.src;
            const title = card.querySelector('.video-info h3') ? card.querySelector('.video-info h3').textContent : '';
            const desc = card.querySelector('.video-info p') ? card.querySelector('.video-info p').textContent : '';

            function openInLightbox(e) {
                e.preventDefault();
                e.stopPropagation();
                openVideoLightbox(src, title, desc);
            }

            overlay.addEventListener('click', function(e) {
    const icon = overlay.querySelector('i');
    const iconRect = icon.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const margin = 20;
    if (x >= iconRect.left - margin && x <= iconRect.right + margin &&
        y >= iconRect.top - margin && y <= iconRect.bottom + margin) {
        openInLightbox(e);
    }
});
overlay.addEventListener('touchend', function(e) {
    const touch = e.changedTouches[0];
    const icon = overlay.querySelector('i');
    const iconRect = icon.getBoundingClientRect();
    const x = touch.clientX;
    const y = touch.clientY;
    const margin = 20;
    if (x >= iconRect.left - margin && x <= iconRect.right + margin &&
        y >= iconRect.top - margin && y <= iconRect.bottom + margin) {
        openInLightbox(e);
    }
}, { passive: false });
        });
    }



    /* ===================================
       BODENDRUCK 3D TILT
    =================================== */
    function initBoden3DTilt() {
    const card  = document.getElementById('boden3dCard');
    const inner = document.getElementById('boden3dInner');
    const shine = document.getElementById('boden3dShine');
    if (!card || !inner) return;

    const MAX_TILT = 25;

    // ── DESKTOP: mousemove ──
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top)  / rect.height;
        applyTilt(x, y, '0.05s ease', 1.03);
    });

    card.addEventListener('mouseleave', function() {
        resetTilt();
    });

    // ── MOBILE: touchmove ──
    card.addEventListener('touchmove', function(e) {
    const touch = e.touches[0];
    const rect  = card.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top)  / rect.height;
    applyTilt(x, y, '0.05s ease', 1.03);
}, { passive: true });

    card.addEventListener('touchend', function() {
        resetTilt();
    });

    // ── HELPER funkcije ──
    function applyTilt(x, y, transition, scale) {
        const rotY =  (x - 0.5) * MAX_TILT * 2;
        const rotX = -(y - 0.5) * MAX_TILT;

        inner.style.transition = 'transform ' + transition;
        inner.style.transform  =
            'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(' + scale + ')';
        inner.style.boxShadow  =
            (rotY * 2) + 'px ' + (rotX * 2) + 'px 60px rgba(0,0,0,0.7), ' +
            '0 0 0 1px rgba(255,255,255,0.1)';

        if (shine) {
            shine.style.background =
                'radial-gradient(circle at ' + (x * 100) + '% ' + (y * 100) + '%, ' +
                'rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)';
        }
    }

    function resetTilt() {
        inner.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        inner.style.transform  = 'rotateX(8deg) rotateY(0deg) scale(1)';
        inner.style.boxShadow  =
            '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)';
        if (shine) {
            shine.style.background =
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)';
        }
    }
}


    /* ===================================
       SCROLL REVEAL
    =================================== */

    /* ================================================
       VIDEO KARUSEL — scrollLeft metoda (bulletproof)
       ================================================ */
    let carouselIndex = 0;
    const TOTAL_VIDEOS = 5;

    function getVisibleCount() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function carouselNext() {
        const visible = getVisibleCount();
        const maxIndex = TOTAL_VIDEOS - visible;
        carouselIndex = carouselIndex >= maxIndex ? 0 : carouselIndex + 1;
        updateCarousel();
    }

    function carouselPrev() {
        const visible = getVisibleCount();
        const maxIndex = TOTAL_VIDEOS - visible;
        carouselIndex = carouselIndex <= 0 ? maxIndex : carouselIndex - 1;
        updateCarousel();
    }

    function carouselGoTo(index) {
        carouselIndex = index;
        updateCarousel();
    }

    function updateCarousel() {
        const track = document.getElementById('videoCarouselTrack');
        if (!track) return;

        const visible = getVisibleCount();
        const gap = visible === 1 ? 0 : 24;
        const cards = track.querySelectorAll('.video-card');
        if (!cards.length) return;

        // Postavi sirinu kartice na osnovu broja vidljivih
        const trackW = track.offsetWidth;
        const cardW = (trackW - gap * (visible - 1)) / visible;

        cards.forEach(function(card) {
            card.style.flex = '0 0 ' + cardW + 'px';
            card.style.width = cardW + 'px';
            card.style.minWidth = '0';
            card.style.maxWidth = cardW + 'px';
        });

        // Scroll do tocne pozicije
        const scrollPos = carouselIndex * (cardW + gap);
        track.scrollTo({ left: scrollPos, behavior: 'smooth' });

        // Update dots
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === carouselIndex);
        });
    }

    function initCarouselSwipe() {
        const track = document.getElementById('videoCarouselTrack');
        if (!track) return;

        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        track.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) carouselNext();
                else carouselPrev();
            }
            isDragging = false;
        }, { passive: true });

        window.addEventListener('resize', debounce(function() {
            carouselIndex = 0;
            updateCarousel();
        }, 200));
    }

        function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15 });
        reveals.forEach(function(el) { observer.observe(el); });
    }

    /* ===================================
       GOLD SPARKLES
    =================================== */
    function createSparkle() {
        const targets = document.querySelectorAll(
            '.logo-title .vision, .footer-logo-title .wand, .footer-logo-title .kk'
        );
        if (!targets.length) return;
        targets.forEach(function(target) {
            if (Math.random() > 0.5) return;
            const sparkle = document.createElement('span');
            sparkle.classList.add('sparkle');
            const x = Math.random() * target.offsetWidth;
            const y = Math.random() * target.offsetHeight;
            sparkle.style.left = x + 'px';
            sparkle.style.top  = y + 'px';
            const size = Math.random() * 10 + 6;
            sparkle.style.transform = 'scale(' + (size / 10) + ')';
            target.appendChild(sparkle);
            setTimeout(function() { sparkle.remove(); }, 800);
        });
    }

    /* ===================================
       INIT
    =================================== */
    function init() {
        initCarouselSwipe();
    initGalleryFilter();
        initVideoPlayers();
        initVideoLazyLoad();
        initSmoothScroll();
        initNavbarScroll();
        initScrollToTop();
        initKeyboard();
        initCookieBanner();
        initAnimations();
        initBoden3DTilt();
        initScrollReveal();
		    // PARTICLES na room preview klik
    document.querySelectorAll('.room-preview').forEach(function(preview) {
        preview.addEventListener('click', function(e) {
            const card = preview.closest('.room-card');
            if (card) createParticles(e, card);
        });
        preview.addEventListener('touchstart', function(e) {
            const card = preview.closest('.room-card');
            if (card) createParticles(e, card);
        }, { passive: true });
    });

        setInterval(createSparkle, 800);
    }

    document.addEventListener('DOMContentLoaded', init);

        /* ===================================
       PUBLIC API
    =================================== */
    return {
        carouselNext:       carouselNext,
        carouselPrev:       carouselPrev,
        carouselGoTo:       carouselGoTo,
        toggleMobileMenu:   toggleMobileMenu,
        closeMobileMenu:    closeMobileMenu,
        transformRoom:      transformRoom,
        openLightbox:       openLightbox,
        closeLightbox:      closeLightbox,
        openVideoLightbox:  openVideoLightbox,
        closeVideoLightbox: closeVideoLightbox,
        toggleFAQ:          toggleFAQ,
        calculatePrice:     calculatePrice,
        showConfigurator:   showConfigurator,
        closeConfigurator:  closeConfigurator,
        startConfigurator:  startConfigurator,
        nextStep3:          nextStep3,
        nextStep4:          nextStep4,
        openCamera:         openCamera,
        capturePhoto:       capturePhoto,
        handlePhotoSelect:  handlePhotoSelect,
        retakePhoto:        retakePhoto,
        selectDesign:       selectDesign,
        submitRequest:      submitRequest,
        acceptCookies:      acceptCookies,
        declineCookies:     declineCookies,
        scrollToTop:        scrollToTop
    };

})();

