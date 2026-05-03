const WandVision = (function() {
 'use strict';
 function debounce(fn, delay) {
  var timer;
  return function() {
   var args = arguments;
   clearTimeout(timer);
   timer = setTimeout(function() { fn.apply(null, args); }, delay);
  };
 }
 // Configurator state now managed by KonfiguratorModal
 const PRICING = {
  standard: {
   putz: 170,
   beton: 170,
   holz: 180,
   glas: 190,
   boden: 210
  },
  premium: {
   putz: 200,
   beton: 200,
   holz: 210,
   glas: 230,
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
  var preFilter = sessionStorage.getItem('galleryFilter');
  if (preFilter) {
   sessionStorage.removeItem('galleryFilter');
   var targetBtn = document.querySelector('.filter-btn[data-filter="' + preFilter + '"]');
   if (targetBtn) targetBtn.click();
  }
 }
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
 function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
   anchor.addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (!href || href === '#') return;
    var target;
    try { target = document.querySelector(href); } catch(err) { return; }
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
 function toggleMobileMenu() {
 const menu = document.getElementById('nav-menu');
 const toggle = document.querySelector('.mobile-menu-toggle');
 const navbar = document.getElementById('navbar');
 if (!menu) return;
 // Read offsetHeight BEFORE mutation to avoid forced reflow
 const navH = navbar ? navbar.offsetHeight : 70;
 const isActive = menu.classList.toggle('active');
 menu.style.top = navH + 'px';
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
 var activeRoomCard = null;
 function transformRoom(roomId) {
  var card = document.getElementById('room-' + roomId);
  if (!card) return;
  if (card === activeRoomCard) return;
  if (activeRoomCard) {
   activeRoomCard.classList.remove('transformed');
   var oldPrompt = activeRoomCard.querySelector('.room-config-prompt');
   if (oldPrompt) {
    oldPrompt.classList.remove('visible');
    setTimeout(function() { oldPrompt.remove(); }, 300);
   }
  }
  activeRoomCard = card;
 }
 function showRoomPrompt(card) {
  var old = card.querySelector('.room-config-prompt');
  if (old) old.remove();
  var prompt = document.createElement('div');
  prompt.className = 'room-config-prompt';
  prompt.innerHTML =
   '<p><i class="fas fa-magic"></i> Beeindruckend! Möchten Sie Ihren eigenen Bereich so gestalten?</p>' +
   '<div class="room-prompt-buttons">' +
    '<button class="btn-prompt-yes" onclick="WandVision.openFreshConfigurator()">' +
     '<i class="fas fa-arrow-right"></i> Ja, jetzt konfigurieren' +
    '</button>' +
    '<button class="btn-prompt-no" onclick="WandVision.dismissRoomPrompt(event)">' +
     'Nein, danke' +
    '</button>' +
   '</div>';
  var preview = card.querySelector('.room-preview');
  if (preview && preview.nextSibling) {
   card.insertBefore(prompt, preview.nextSibling);
  } else {
   card.appendChild(prompt);
  }
  requestAnimationFrame(function() {
   prompt.classList.add('visible');
  });
 }
 function dismissRoomPrompt(evtOrBtn) {
  var btn = (evtOrBtn && evtOrBtn.target) ? evtOrBtn.target : evtOrBtn;
  var prompt = btn ? btn.closest('.room-config-prompt') : null;
  if (prompt) {
   prompt.classList.remove('visible');
   setTimeout(function() { prompt.remove(); }, 300);
  }
  if (activeRoomCard) {
   activeRoomCard.classList.remove('transformed');
   activeRoomCard = null;
  }
 }
 function openFreshConfigurator() {
  document.querySelectorAll('.room-config-prompt').forEach(function(el) {
   el.remove();
  });
  KonfiguratorModal.open();
 }
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
    if (triggered) return;
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
     triggered = true;
     setTimeout(function() {
      preview.querySelectorAll('.magic-star').forEach(function(s) {
       s.style.animation = 'star-fadeout 0.5s ease forwards';
      });
      setTimeout(function() {
       preview.querySelectorAll('.magic-star').forEach(function(s) {
        s.remove();
       });
       card.classList.add('transformed');
       showRoomPrompt(card);
      }, 500);
     }, 300);
    }
   }, i * 35);
  }
 }
 var currentGalleryIndex = 0;
 var galleryItems = [];
 function openLightbox(item) {
  galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  currentGalleryIndex = galleryItems.indexOf(item);
  showGalleryImage(currentGalleryIndex);
  var lightbox = document.getElementById('lightbox');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
 }
 function showGalleryImage(idx) {
  var items = galleryItems.length ? galleryItems : Array.from(document.querySelectorAll('.gallery-item'));
  if (idx < 0) idx = items.length - 1;
  if (idx >= items.length) idx = 0;
  currentGalleryIndex = idx;
  var item = items[idx];
  var img = item.querySelector('img');
  var overlay = item.querySelector('.gallery-overlay');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  if (!img || !lightboxImg) return;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  if (overlay && lightboxCaption) {
   var h4 = overlay.querySelector('h4');
   var p  = overlay.querySelector('p');
   lightboxCaption.textContent = (h4 ? h4.textContent : '') + (p ? ' – ' + p.textContent : '');
  }
 }
 function lightboxGalleryPrev() {
  showGalleryImage(currentGalleryIndex - 1);
 }
 function lightboxGalleryNext() {
  showGalleryImage(currentGalleryIndex + 1);
 }
 function closeLightbox() {
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
   lightbox.classList.remove('active');
   document.body.style.overflow = '';
  }
 }
 var VIDEO_PLAYLIST = [];
 var currentVideoIndex = 0;
 var videoCtaTimer1 = null;
 var videoCtaTimer2 = null;
 function buildVideoPlaylist() {
  VIDEO_PLAYLIST = [];
  document.querySelectorAll('.video-card').forEach(function(card) {
   var source = card.querySelector('source');
   var src    = source ? source.src : '';
   var title  = card.querySelector('.video-info h3') ? card.querySelector('.video-info h3').textContent : '';
   var desc   = card.querySelector('.video-info p')  ? card.querySelector('.video-info p').textContent  : '';
   if (src) VIDEO_PLAYLIST.push({ src: src, title: title, desc: desc });
  });
 }
 function openVideoLightbox(src, title, desc) {
  var idx = 0;
  for (var i = 0; i < VIDEO_PLAYLIST.length; i++) {
   if (VIDEO_PLAYLIST[i].src === src) { idx = i; break; }
  }
  openVideoByIndex(idx);
 }
 function onVideoPlaying() {
  clearTimeout(videoCtaTimer1);
  clearTimeout(videoCtaTimer2);
  var lbVideo = document.getElementById('video-lightbox-player');
  if (lbVideo) lbVideo.removeEventListener('playing', onVideoPlaying);
 }
 function openVideoByIndex(idx) {
  var lb      = document.getElementById('video-lightbox');
  var lbVideo = document.getElementById('video-lightbox-player');
  var lbCap   = document.getElementById('video-lightbox-caption');
  if (!lb || !lbVideo) return;
  currentVideoIndex = idx;
  var entry = VIDEO_PLAYLIST[idx] || {};
  resetLightboxCta();
  lbVideo.src = entry.src || '';
  if (lbCap) lbCap.textContent = (entry.title || '') + (entry.desc ? ' – ' + entry.desc : '');
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
  lbVideo.load();
  lbVideo.play().catch(function() {});
  var nav70shown  = false;
  var conv80shown = false;
  lbVideo.ontimeupdate = function() {
   if (!lbVideo.duration) return;
   var pct = lbVideo.currentTime / lbVideo.duration;
   if (!nav70shown  && pct >= 0.70) { nav70shown  = true; showLightboxNav();  }
   if (!conv80shown && pct >= 0.80) { conv80shown = true; showLightboxConv(); }
  };
  clearTimeout(videoCtaTimer1);
  clearTimeout(videoCtaTimer2);
  videoCtaTimer1 = setTimeout(function() {
   if (!nav70shown)  { nav70shown  = true; showLightboxNav();  }
  }, 20000);
  videoCtaTimer2 = setTimeout(function() {
   if (!conv80shown) { conv80shown = true; showLightboxConv(); }
  }, 25000);
  lbVideo.addEventListener('playing', onVideoPlaying);
 }
 function showLightboxNav() {
  ['vlb-nav-btns', 'vlb-nav-btns-right', 'vlb-mobile-nav-row'].forEach(function(id) {
   var el = document.getElementById(id);
   if (el && !el.classList.contains('visible')) el.classList.add('visible');
  });
 }
 function showLightboxConv() {
  ['vlb-conv-btns', 'vlb-conv-btns-right', 'vlb-mobile-conv-row'].forEach(function(id) {
   var el = document.getElementById(id);
   if (el && !el.classList.contains('visible')) el.classList.add('visible');
  });
 }
 function resetLightboxCta() {
  ['vlb-nav-btns', 'vlb-nav-btns-right', 'vlb-conv-btns', 'vlb-conv-btns-right',
   'vlb-mobile-nav-row', 'vlb-mobile-conv-row'].forEach(function(id) {
   var el = document.getElementById(id);
   if (el) el.classList.remove('visible');
  });
  clearTimeout(videoCtaTimer1);
  clearTimeout(videoCtaTimer2);
 }
 function lightboxPrev() {
  if (currentVideoIndex <= 0) return;
  openVideoByIndex(currentVideoIndex - 1);
 }
 function lightboxNext() {
  if (currentVideoIndex >= VIDEO_PLAYLIST.length - 1) {
   closeVideoLightbox();
   return;
  }
  openVideoByIndex(currentVideoIndex + 1);
 }
 function lightboxGoConfigurator() {
  closeVideoLightbox();
  closeLightbox();
  setTimeout(function() {
   KonfiguratorModal.open();
  }, 300);
 }
 function lightboxGoPreise() {
  closeVideoLightbox();
  closeLightbox();
  setTimeout(function() {
   var target = document.getElementById('preise');
   if (target) {
    var navH = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 70;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navH - 20, behavior: 'smooth' });
   }
  }, 300);
 }
 function closeVideoLightbox() {
  var lb      = document.getElementById('video-lightbox');
  var lbVideo = document.getElementById('video-lightbox-player');
  if (!lb) return;
  lb.classList.remove('active');
  document.body.style.overflow = '';
  clearTimeout(videoCtaTimer1);
  clearTimeout(videoCtaTimer2);
  if (lbVideo) {
   lbVideo.ontimeupdate = null;
   lbVideo.pause();
   lbVideo.removeAttribute('src');
   lbVideo.load();
  }
  resetLightboxCta();
 }
 function toggleFAQ(questionEl) {
  const item = questionEl.parentElement;
  const allItems = document.querySelectorAll('.faq-item');
  allItems.forEach(function(i) {
   if (i !== item) i.classList.remove('active');
  });
  item.classList.toggle('active');
 }
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
 function showConfigurator() {
  KonfiguratorModal.open();
 }
 function closeConfigurator() {
  KonfiguratorModal.close();
 }
 function resetConfigurator() {
  // Handled by KonfiguratorModal
 }
 function startConfigurator() {
  KonfiguratorModal.open();
 }
 function showStep(n) {
  // Handled by KonfiguratorModal
 }
 function nextStep3() { KonfiguratorModal.goStep(3); }
 function nextStep4() { KonfiguratorModal.goStep(4); }
 // Legacy stubs — all configurator logic now in konfigurator-modal.js
 function openCamera() {}
 function capturePhoto() {}
 function stopCamera() {}
 function handlePhotoSelect() {}
 function showPhotoPreview() {}
 function retakePhoto() {}
 function selectDesign() {}
 function submitRequest(event) { if (event) event.preventDefault(); }
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
   var cardIndex = (function() {
    var cards = document.querySelectorAll('.video-card');
    for (var ci = 0; ci < cards.length; ci++) {
     if (cards[ci] === card) return ci;
    }
    return 0;
   })();
   function openInLightbox(e) {
    e.preventDefault();
    e.stopPropagation();
    openVideoByIndex(cardIndex);
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
 function initBoden3DTilt() {
 const card  = document.getElementById('boden3dCard');
 const inner = document.getElementById('boden3dInner');
 const shine = document.getElementById('boden3dShine');
 if (!card || !inner) return;
 const MAX_TILT = 25;
 card.addEventListener('mousemove', function(e) {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top)  / rect.height;
  applyTilt(x, y, '0.05s ease', 1.03);
 });
 card.addEventListener('mouseleave', function() {
  resetTilt();
 });
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
  // Read all layout values first (before any mutations)
  const trackW = track.offsetWidth;
  const cardW = (trackW - gap * (visible - 1)) / visible;
  const scrollPos = carouselIndex * (cardW + gap);
  // Batch all DOM mutations in rAF to avoid forced reflow
  requestAnimationFrame(function() {
   cards.forEach(function(card) {
    card.style.flex = '0 0 ' + cardW + 'px';
    card.style.width = cardW + 'px';
    card.style.minWidth = '0';
    card.style.maxWidth = cardW + 'px';
   });
   track.scrollTo({ left: scrollPos, behavior: 'smooth' });
   var dots = document.querySelectorAll('.carousel-dot');
   dots.forEach(function(dot, i) {
    dot.classList.toggle('active', i === carouselIndex);
   });
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
 function createSparkle() {
  const targets = document.querySelectorAll(
   '.logo-title .vision, .footer-logo-title .wand, .footer-logo-title .kk'
  );
  if (!targets.length) return;
  targets.forEach(function(target) {
   if (Math.random() > 0.5) return;
   const sparkle = document.createElement('span');
   // Read layout BEFORE DOM mutation to avoid forced reflow
   const targetW = target.offsetWidth;
   const targetH = target.offsetHeight;
   const x = Math.random() * targetW;
   const y = Math.random() * targetH;
   sparkle.classList.add('sparkle');
   sparkle.style.left = x + 'px';
   sparkle.style.top  = y + 'px';
   const size = Math.random() * 10 + 6;
   sparkle.style.transform = 'scale(' + (size / 10) + ')';
   target.appendChild(sparkle);
   setTimeout(function() { sparkle.remove(); }, 800);
  });
 }
 function submitBodenForm(e) {
  e.preventDefault();
  var btn         = document.getElementById('boden3dSubmit');
  var success     = document.getElementById('boden3dSuccess');
  var flaeche     = document.getElementById('bodenFlaeche').value;
  var oberflaeche = document.getElementById('bodenOberflaeche').value;
  var email       = document.getElementById('bodenEmail').value;
  var name        = document.getElementById('bodenName').value;
  var telefon     = document.getElementById('bodenTelefon').value;
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
   document.getElementById('bodenEmail').focus();
   return;
  }
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Wird gesendet...</span>';
  var nachricht = 'Bodendruck-Anfrage';
  if (flaeche)     nachricht += ' — ' + flaeche + ' m²';
  if (oberflaeche) nachricht += ' auf ' + oberflaeche;
  fetch('/.netlify/functions/send-konfigurator', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
    typ:         'Bodendruck-Anfrage',
    name:        name || 'Nicht angegeben',
    email:       email,
    telefon:     telefon || 'Nicht angegeben',
    flaeche:     flaeche ? flaeche + ' m²' : 'Nicht angegeben',
    oberflaeche: oberflaeche || 'Nicht angegeben',
    design:      'Bodendruck',
    nachricht:   nachricht
   })
  })
  .then(function() {
   btn.style.display = 'none';
   if (success) success.style.display = 'block';
   document.getElementById('boden3dForm').reset();
  })
  .catch(function() {
   btn.style.display = 'none';
   if (success) success.style.display = 'block';
  });
 }
 function init() {
  buildVideoPlaylist();
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
 document.querySelectorAll('.room-preview').forEach(function(preview) {
  preview.addEventListener('click', function(e) {
   const card = preview.closest('.room-card');
   if (card) createParticles(e, card);
  });
 });
  setInterval(createSparkle, 800);
 }
 function handleHashOnLoad() {
  var hash = window.location.hash;
  if (!hash) return;
  var target = document.querySelector(hash);
  if (!target) return;
  setTimeout(function() {
   target.scrollIntoView({ behavior: 'smooth' });
  }, 200);
 }
 window.addEventListener('load', handleHashOnLoad);
 document.addEventListener('DOMContentLoaded', init);
 return {
  carouselNext:            carouselNext,
  carouselPrev:            carouselPrev,
  carouselGoTo:            carouselGoTo,
  toggleMobileMenu:        toggleMobileMenu,
  closeMobileMenu:         closeMobileMenu,
  transformRoom:           transformRoom,
  dismissRoomPrompt:       dismissRoomPrompt,
  openFreshConfigurator:   openFreshConfigurator,
  lightboxGalleryPrev:     lightboxGalleryPrev,
  lightboxGalleryNext:     lightboxGalleryNext,
  openLightbox:            openLightbox,
  closeLightbox:           closeLightbox,
  submitBodenForm:         submitBodenForm,
  openVideoLightbox:       openVideoLightbox,
  closeVideoLightbox:      closeVideoLightbox,
  lightboxPrev:            lightboxPrev,
  lightboxNext:            lightboxNext,
  lightboxGoConfigurator:  lightboxGoConfigurator,
  lightboxGoPreise:        lightboxGoPreise,
  toggleFAQ:               toggleFAQ,
  calculatePrice:          calculatePrice,
  showConfigurator:        showConfigurator,
  closeConfigurator:       closeConfigurator,
  startConfigurator:       startConfigurator,
  nextStep3:               nextStep3,
  nextStep4:               nextStep4,
  openCamera:              openCamera,
  capturePhoto:            capturePhoto,
  handlePhotoSelect:       handlePhotoSelect,
  retakePhoto:             retakePhoto,
  selectDesign:            selectDesign,
  submitRequest:           submitRequest,
  acceptCookies:           acceptCookies,
  declineCookies:          declineCookies,
  scrollToTop:             scrollToTop
 };
})();