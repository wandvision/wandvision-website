const EinsatzPage = (() => {
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
 function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
 }
 function toggleMobileMenu() {
  if (window.WandVision) WandVision.toggleMobileMenu();
 }
 function closeMobileMenu() {
  if (window.WandVision) WandVision.closeMobileMenu();
 }
 function init() {
  initActiveSector();
  initIconTilt();
 }
 document.addEventListener('DOMContentLoaded', init);
 return {
  scrollToTop,
  toggleMobileMenu,
  closeMobileMenu,
 };
})();
