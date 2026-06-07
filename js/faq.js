const FAQPage = (() => {
 function toggleFAQ(questionEl) {
  const item = questionEl.closest('.faq-item');
  if (!item) return;
  const isActive = item.classList.contains('active');
  document.querySelectorAll('.faq-item.active').forEach(el => {
   el.classList.remove('active');
   var btn = el.querySelector('.faq-question');
   if (btn) btn.setAttribute('aria-expanded', 'false');
  });
  if (!isActive) {
   item.classList.add('active');
   questionEl.setAttribute('aria-expanded', 'true');
  }
 }
 function initCategoryFilter() {
  const btns = document.querySelectorAll('.faq-cat-btn');
  const items = document.querySelectorAll('.faq-item');
  if (!btns.length) return;
  btns.forEach(btn => {
   btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    items.forEach(item => {
     if (cat === 'all' || item.dataset.cat === cat) {
      item.classList.remove('faq-hidden');
     } else {
      item.classList.add('faq-hidden');
      item.classList.remove('active');
     }
    });
   });
  });
 }
 function initFAQClicks() {
  document.querySelectorAll('.faq-question').forEach(function(btn) {
   btn.addEventListener('click', function() {
    toggleFAQ(this);
   });
  });
 }
 function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
 }
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
 function init() {
  initCategoryFilter();
  initFAQClicks();
 }
 if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
 } else {
  init();
 }
 return {
  toggleFAQ,
  scrollToTop,
  toggleMobileMenu,
  closeMobileMenu,
 };
})();
