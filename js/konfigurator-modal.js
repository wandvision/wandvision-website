/* ===================================================
   WANDVISION K&K — Konfigurator Modal
   Self-contained: CSS + HTML + Logik
   
   Verwendung:
     <script src="js/konfigurator-modal.js" defer></script>
     <button onclick="KonfiguratorModal.open()">Konfigurieren</button>
   
   Benötigt: Font Awesome (für Icons)
=================================================== */

var KonfiguratorModal = (function() {
  'use strict';

  var initialized = false;
  var selectedPhoto = null;
  var selectedDesign = null;
  var selectedDruckart = null;
  var selectedZeitrahmen = null;
  var cameraStream = null;
  var TOTAL_STEPS = 8;

  // Detect base path from script location
  // e.g. script at "/js/konfigurator-modal.js" → basePath = "/"
  // e.g. script at "js/konfigurator-modal.js" → basePath = ""
  var basePath = (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      var idx = src.indexOf('konfigurator-modal.js');
      if (idx !== -1) {
        // Get everything before "js/konfigurator-modal.js"
        var path = src.substring(0, idx).replace(/js\/$/, '');
        return path;
      }
    }
    return '';
  })();

  function imgPath(file) {
    return basePath + 'images/' + file;
  }

  // =============================================
  // CSS
  // =============================================
  var modalCSS = [
    '.km-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(5px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease}',
    '.km-overlay.active{opacity:1;visibility:visible}',
    '.km-card{background:#fff;border-radius:20px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;padding:35px 30px;position:relative;transform:translateY(20px);transition:transform 0.3s ease;box-shadow:0 24px 80px rgba(0,0,0,0.25)}',
    '.km-overlay.active .km-card{transform:translateY(0)}',
    '.km-close{position:absolute;top:15px;right:20px;background:none;border:none;font-size:1.8rem;color:#000;cursor:pointer;line-height:1;touch-action:manipulation;z-index:2}',
    '.km-close:hover{color:#333}',
    '.km-step{display:none}',
    '.km-step.active{display:block}',
    '.km-icon{text-align:center;margin-bottom:20px}',
    '.km-icon img{width:70px;height:70px;display:block;margin:0 auto;object-fit:contain;filter:drop-shadow(0 5px 15px rgba(30,58,138,0.3))}',
    '.km-step h3{font-family:"Montserrat",sans-serif;font-size:1.35rem;color:#1E3A8A;text-align:center;margin:0 0 8px;line-height:1.2}',
    '.km-step>p{text-align:center;color:#64748B;font-size:0.92rem;margin:0 0 24px;line-height:1.6}',
    '.km-btn-primary{width:100%;padding:14px 28px;background:linear-gradient(135deg,#1E3A8A 0%,#3B82F6 100%);color:#fff;border:none;border-radius:50px;font-size:1rem;font-weight:700;font-family:"Poppins",sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.25s ease;min-height:50px;touch-action:manipulation;margin-top:20px}',
    '.km-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(30,58,138,0.35)}',
    '.km-btn-primary:disabled{opacity:0.7;cursor:not-allowed;transform:none}',
    '.km-progress{display:flex;gap:4px;margin-bottom:24px}',
    '.km-progress-dot{flex:1;height:4px;border-radius:2px;background:#E2E8F0;transition:background 0.3s ease}',
    '.km-progress-dot.done{background:#3B82F6}',
    '.km-progress-dot.current{background:#1E3A8A}',
    '.km-camera-buttons{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px}',
    '.km-btn-camera,.km-btn-upload{padding:12px 22px;border-radius:50px;font-weight:600;font-size:0.9rem;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.25s ease;min-height:46px;touch-action:manipulation;font-family:"Poppins",sans-serif}',
    '.km-btn-camera{background:linear-gradient(135deg,#1E3A8A,#3B82F6);color:#fff;border:none}',
    '.km-btn-upload{background:#fff;color:#1E3A8A;border:2px solid #3B82F6}',
    '.km-photo-preview{text-align:center;margin-bottom:10px}',
    '.km-photo-preview img{max-width:100%;max-height:250px;border-radius:15px;display:block;margin:0 auto}',
    '.km-btn-retake{margin-top:10px;background:none;border:2px solid #E2E8F0;color:#64748B;padding:8px 18px;border-radius:50px;font-size:0.85rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:"Poppins",sans-serif;transition:all 0.2s ease}',
    '.km-btn-retake:hover{border-color:#3B82F6;color:#3B82F6}',
    '.km-design-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}',
    '.km-design-option{border-radius:10px;overflow:hidden;cursor:pointer;border:3px solid transparent;transition:all 0.25s ease;touch-action:manipulation}',
    '.km-design-option:hover{transform:scale(0.97)}',
    '.km-design-option.selected{border-color:#3B82F6;box-shadow:0 0 20px rgba(59,130,246,0.4)}',
    '.km-design-option img{width:100%;height:90px;object-fit:cover;display:block}',
    '.km-design-option span{display:block;padding:8px;text-align:center;font-weight:600;font-size:0.82rem;background:#F8FAFF}',
    '.km-masse-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:8px}',
    '.km-field{display:flex;flex-direction:column;gap:6px}',
    '.km-field label{font-size:0.82rem;font-weight:700;color:#1E3A8A;text-transform:uppercase;letter-spacing:0.03em;display:flex;align-items:center;gap:6px}',
    '.km-field label i{color:#3B82F6;font-size:0.85rem}',
    '.km-input,.km-select{padding:14px 16px;border:2px solid #E2E8F0;border-radius:10px;font-size:1rem;font-family:"Poppins",sans-serif;color:#0F172A;background:#FAFBFF;transition:all 0.2s ease;min-height:50px;width:100%;box-sizing:border-box}',
    '.km-input:focus,.km-select:focus{outline:none;border-color:#2563EB;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,0.08)}',
    '.km-select{cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%2364748B\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;padding-right:40px}',
    '.km-flaeche-result{display:none;align-items:center;gap:10px;background:#DBEAFE;border:1px solid rgba(37,99,235,0.15);border-radius:10px;padding:12px 16px;margin-top:8px;font-size:0.95rem;color:#1E3A8A;font-weight:600}',
    '.km-flaeche-result.visible{display:flex}',
    '.km-flaeche-result i{color:#2563EB;font-size:1rem}',
    '.km-flaeche-result strong{font-size:1.1rem;color:#3B82F6}',
    '.km-druckart-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
    '.km-druckart-option{display:flex;flex-direction:column;align-items:center;gap:6px;padding:20px 12px;border:2px solid #E2E8F0;border-radius:14px;background:#FAFBFF;cursor:pointer;transition:all 0.25s ease;text-align:center;touch-action:manipulation}',
    '.km-druckart-option:hover{border-color:#60A5FA;background:#DBEAFE;transform:translateY(-2px)}',
    '.km-druckart-option.selected{border-color:#2563EB;background:#DBEAFE;box-shadow:0 0 0 3px rgba(37,99,235,0.12),0 4px 16px rgba(37,99,235,0.15)}',
    '.km-druckart-icon{width:48px;height:48px;border-radius:12px;background:#DBEAFE;color:#2563EB;display:flex;align-items:center;justify-content:center;font-size:1.3rem;transition:all 0.25s ease}',
    '.km-druckart-option.selected .km-druckart-icon{background:linear-gradient(135deg,#1E3A8A,#3B82F6);color:#fff}',
    '.km-druckart-option strong{font-size:0.88rem;color:#1E3A8A;line-height:1.2}',
    '.km-druckart-option span{font-size:0.72rem;color:#64748B;line-height:1.3}',
    '.km-details-fields{display:flex;flex-direction:column;gap:18px}',
    '.km-zeitrahmen-row{display:flex;gap:8px;flex-wrap:wrap}',
    '.km-zeit-btn{flex:1;min-width:0;padding:12px 10px;border:2px solid #E2E8F0;border-radius:10px;background:#FAFBFF;color:#0F172A;font-family:"Poppins",sans-serif;font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.25s ease;display:flex;flex-direction:column;align-items:center;gap:4px;touch-action:manipulation}',
    '.km-zeit-btn i{color:#3B82F6;font-size:1rem}',
    '.km-zeit-btn:hover{border-color:#60A5FA;background:#DBEAFE}',
    '.km-zeit-btn.selected{border-color:#2563EB;background:#DBEAFE;color:#1E3A8A;box-shadow:0 0 0 3px rgba(37,99,235,0.12)}',
    '.km-zeit-btn.selected i{color:#2563EB}',
    '.km-form{display:flex;flex-direction:column;gap:16px}',
    '.km-success{text-align:center}',
    '.km-success-icon{font-size:3.5rem;color:#059669;margin-bottom:16px}',
    '.km-success-box{background:#F8FAFF;padding:20px;border-radius:14px;margin-bottom:20px;text-align:left}',
    '.km-success-box p{font-size:0.9rem!important;margin:0 0 8px!important;color:#0F172A!important;text-align:left!important}',
    '.km-quick-buttons{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:16px 0}',
    '.km-btn-wa,.km-btn-call{padding:12px 22px;border-radius:50px;font-weight:600;font-size:0.9rem;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s ease;min-height:46px;touch-action:manipulation;text-decoration:none}',
    '.km-btn-wa{background:#25D366;color:#fff}',
    '.km-btn-call{background:#3B82F6;color:#fff}',
    '.km-btn-wa:hover,.km-btn-call:hover{transform:scale(1.03)}',
    '.km-testimonial{background:#F8FAFF;padding:16px;border-radius:14px;text-align:center;margin-top:16px}',
    '.km-testimonial .km-stars{font-size:1rem;margin-bottom:6px}',
    '.km-testimonial p{font-style:italic;font-size:0.88rem!important;margin:0 0 6px!important;color:#374151!important}',
    '.km-testimonial span{font-size:0.8rem;color:#64748B;font-weight:600}',
    '.km-note{text-align:center;font-size:0.78rem;color:#64748B;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px}',
    '.km-note i{color:#F59E0B;font-size:0.78rem}',
    '@media(max-width:600px){.km-overlay{padding:10px}.km-card{padding:24px 18px;max-height:95vh;border-radius:16px}.km-step h3{font-size:1.1rem}.km-step>p{font-size:0.85rem;margin-bottom:16px}.km-icon img{width:55px;height:55px}.km-design-grid{grid-template-columns:repeat(3,1fr);gap:8px}.km-design-option img{height:65px}.km-design-option span{padding:6px;font-size:0.75rem}.km-druckart-grid{grid-template-columns:1fr 1fr;gap:8px}.km-druckart-option{padding:14px 8px}.km-druckart-icon{width:40px;height:40px;font-size:1.1rem}.km-druckart-option strong{font-size:0.8rem}.km-druckart-option span{font-size:0.68rem}.km-zeitrahmen-row{flex-direction:column}.km-zeit-btn{flex-direction:row;justify-content:center;padding:10px 14px}.km-camera-buttons{flex-direction:column;align-items:stretch}.km-btn-camera,.km-btn-upload{justify-content:center;width:100%}.km-btn-primary{padding:13px 20px;font-size:0.95rem}.km-masse-row{gap:10px}.km-progress{margin-bottom:18px}.km-close{top:10px;right:14px;font-size:1.5rem}.km-quick-buttons{flex-direction:column;align-items:stretch}.km-btn-wa,.km-btn-call{justify-content:center;width:100%}.km-success-box{padding:16px}.km-testimonial{padding:14px}}',
    '@media(max-width:768px){.km-input,.km-select,.km-form input{font-size:16px!important}}',
    '@media(max-width:380px){.km-card{padding:20px 14px}.km-design-grid{grid-template-columns:repeat(2,1fr)}.km-design-option img{height:80px}.km-druckart-grid{grid-template-columns:1fr}.km-step h3{font-size:1rem}.km-icon img{width:45px;height:45px}}'
  ].join('\n');

  // =============================================
  // HTML HELPERS
  // =============================================
  function progressDots(current) {
    var html = '';
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var cls = 'km-progress-dot';
      if (i < current) cls += ' done';
      else if (i === current) cls += ' current';
      html += '<div class="' + cls + '"></div>';
    }
    return html;
  }

  function designOption(name, img, label) {
    return '<div class="km-design-option" onclick="KonfiguratorModal.selectDesign(\'' + name + '\', this)">' +
      '<img src="' + img + '" alt="' + label + '" loading="lazy">' +
      '<span>' + label + '</span>' +
    '</div>';
  }

  function druckartOption(name, icon, label, desc) {
    return '<div class="km-druckart-option" onclick="KonfiguratorModal.selectDruckart(\'' + name + '\', this)">' +
      '<div class="km-druckart-icon"><i class="fas ' + icon + '"></i></div>' +
      '<strong>' + label + '</strong>' +
      '<span>' + desc + '</span>' +
    '</div>';
  }

  // =============================================
  // BUILD HTML
  // =============================================
  function buildHTML() {
    return '' +
    '<div class="km-card">' +
      '<button class="km-close" onclick="KonfiguratorModal.close()" aria-label="Schließen">&times;</button>' +

      // STEP 1
      '<div class="km-step" data-step="1">' +
        '<div class="km-progress">' + progressDots(1) + '</div>' +
        '<div class="km-icon"><img src="' + imgPath('zid-icon.png') + '" alt="WandVision"></div>' +
        '<h3>Willkommen beim Wandkonfigurator!</h3>' +
        '<p>Lassen Sie uns gemeinsam Ihre perfekte Wandgestaltung planen. In wenigen Schritten erhalten Sie Ihr persönliches Angebot.</p>' +
        '<button class="km-btn-primary" onclick="KonfiguratorModal.goStep(2)">' +
          '<i class="fas fa-arrow-right"></i> Los geht\'s' +
        '</button>' +
      '</div>' +

      // STEP 2
      '<div class="km-step" data-step="2">' +
        '<div class="km-progress">' + progressDots(2) + '</div>' +
        '<div class="km-icon"><img src="' + imgPath('zid-icon.png') + '" alt="Foto"></div>' +
        '<h3>Foto Ihrer Wand</h3>' +
        '<p>Laden Sie ein Foto Ihrer Wand hoch oder nehmen Sie ein neues auf.</p>' +
        '<div class="km-camera-buttons" id="km-camera-buttons">' +
          '<label for="km-camera-capture" class="km-btn-camera"><i class="fas fa-camera"></i> Foto aufnehmen</label>' +
          '<input type="file" id="km-camera-capture" accept="image/*" capture="environment" style="display:none">' +
          '<label for="km-photo-upload" class="km-btn-upload"><i class="fas fa-upload"></i> Foto hochladen</label>' +
          '<input type="file" id="km-photo-upload" accept="image/*" style="display:none">' +
        '</div>' +
        '<div class="km-photo-preview" id="km-photo-preview" style="display:none">' +
          '<img id="km-preview-img" src="" alt="Vorschau">' +
          '<button class="km-btn-retake" onclick="KonfiguratorModal.retakePhoto()"><i class="fas fa-redo"></i> Neues Foto</button>' +
        '</div>' +
        '<button class="km-btn-primary" id="km-btn-to-step3" onclick="KonfiguratorModal.goStep(3)" style="display:none">' +
          '<i class="fas fa-arrow-right"></i> Weiter zum Design' +
        '</button>' +
      '</div>' +

      // STEP 3
      '<div class="km-step" data-step="3">' +
        '<div class="km-progress">' + progressDots(3) + '</div>' +
        '<div class="km-icon"><img src="' + imgPath('zid-icon.png') + '" alt="Design"></div>' +
        '<h3>Wählen Sie Ihr Design</h3>' +
        '<p>Welches Motiv gefällt Ihnen am besten?</p>' +
        '<div class="km-design-grid">' +
          designOption('Natur Landschaft', imgPath('design-1.jpg'), 'Natur') +
          designOption('Modern Abstrakt', imgPath('design-2.jpg'), 'Modern') +
          designOption('Klassisch Elegant', imgPath('design-3.jpg'), 'Klassisch') +
          designOption('Urban Street Art', imgPath('design-4.jpg'), 'Urban') +
          designOption('Minimalistisch', imgPath('design-5.jpg'), 'Minimal') +
          designOption('Eigenes Motiv', imgPath('design-custom.jpg'), 'Eigenes') +
        '</div>' +
        '<button class="km-btn-primary" id="km-btn-to-step4" onclick="KonfiguratorModal.goStep(4)" style="display:none">' +
          '<i class="fas fa-arrow-right"></i> Weiter' +
        '</button>' +
      '</div>' +

      // STEP 4
      '<div class="km-step" data-step="4">' +
        '<div class="km-progress">' + progressDots(4) + '</div>' +
        '<div class="km-icon"><img src="' + imgPath('zid-icon.png') + '" alt="Maße"></div>' +
        '<h3>Wie groß ist die Fläche?</h3>' +
        '<p>Geben Sie die ungefähren Maße an — das hilft uns bei der Kalkulation.</p>' +
        '<div class="km-masse-row">' +
          '<div class="km-field"><label><i class="fas fa-arrows-alt-h"></i> Breite (m)</label>' +
            '<input type="number" id="km-breite" class="km-input" placeholder="z.B. 4.5" min="0.1" max="50" step="0.1" inputmode="decimal"></div>' +
          '<div class="km-field"><label><i class="fas fa-arrows-alt-v"></i> Höhe (m)</label>' +
            '<input type="number" id="km-hoehe" class="km-input" placeholder="z.B. 2.5" min="0.1" max="20" step="0.1" inputmode="decimal"></div>' +
        '</div>' +
        '<div class="km-flaeche-result" id="km-flaeche-result">' +
          '<i class="fas fa-ruler-combined"></i> <span>Gesamtfläche: <strong id="km-flaeche-value">0</strong> m²</span>' +
        '</div>' +
        '<button class="km-btn-primary" onclick="KonfiguratorModal.goStep(5)"><i class="fas fa-arrow-right"></i> Weiter</button>' +
      '</div>' +

      // STEP 5
      '<div class="km-step" data-step="5">' +
        '<div class="km-progress">' + progressDots(5) + '</div>' +
        '<div class="km-icon"><img src="' + imgPath('zid-icon.png') + '" alt="Druckart"></div>' +
        '<h3>Welche Druckart wünschen Sie?</h3>' +
        '<p>Wählen Sie die passende Drucktechnik für Ihr Projekt.</p>' +
        '<div class="km-druckart-grid">' +
          druckartOption('Wanddruck (Standard)', 'fa-border-all', 'Wanddruck', 'Direktdruck auf Ihre Wand') +
          druckartOption('3D Effekt-Druck', 'fa-cube', '3D Effekt', 'Dreidimensionale Tiefenwirkung') +
          druckartOption('Bodendruck', 'fa-layer-group', 'Bodendruck', 'Rutschfester Direktdruck') +
          druckartOption('Sonderflächen', 'fa-columns', 'Sonderflächen', 'Säulen, Fassaden & mehr') +
        '</div>' +
        '<button class="km-btn-primary" id="km-btn-to-step6" onclick="KonfiguratorModal.goStep(6)" style="display:none">' +
          '<i class="fas fa-arrow-right"></i> Weiter' +
        '</button>' +
      '</div>' +

      // STEP 6
      '<div class="km-step" data-step="6">' +
        '<div class="km-progress">' + progressDots(6) + '</div>' +
        '<div class="km-icon"><img src="' + imgPath('zid-icon.png') + '" alt="Details"></div>' +
        '<h3>Erzählen Sie uns mehr</h3>' +
        '<p>Ein paar Details helfen uns, Ihr Angebot besser vorzubereiten.</p>' +
        '<div class="km-details-fields">' +
          '<div class="km-field"><label><i class="fas fa-layer-group"></i> Oberfläche</label>' +
            '<select id="km-oberflaeche" class="km-select">' +
              '<option value="">Bitte wählen...</option>' +
              '<option value="Putz">Putz</option><option value="Beton">Beton</option>' +
              '<option value="Holz">Holz</option><option value="Glas">Glas</option>' +
              '<option value="Fliesen">Fliesen</option><option value="Metall">Metall</option>' +
              '<option value="Sonstige">Sonstige</option><option value="Nicht sicher">Nicht sicher</option>' +
            '</select></div>' +
          '<div class="km-field"><label><i class="fas fa-door-open"></i> Raumtyp</label>' +
            '<select id="km-raumtyp" class="km-select">' +
              '<option value="">Bitte wählen...</option>' +
              '<option value="Wohnzimmer">Wohnzimmer</option><option value="Büro">Büro</option>' +
              '<option value="Restaurant/Café">Restaurant / Café</option><option value="Hotel">Hotel</option>' +
              '<option value="Praxis/Klinik">Praxis / Klinik</option><option value="Laden/Showroom">Laden / Showroom</option>' +
              '<option value="Sonstiges">Sonstiges</option>' +
            '</select></div>' +
          '<div class="km-field"><label><i class="fas fa-calendar-alt"></i> Gewünschter Zeitrahmen</label>' +
            '<div class="km-zeitrahmen-row">' +
              '<button type="button" class="km-zeit-btn" onclick="KonfiguratorModal.selectZeit(\'Flexibel\',this)"><i class="fas fa-clock"></i> Flexibel</button>' +
              '<button type="button" class="km-zeit-btn" onclick="KonfiguratorModal.selectZeit(\'In 2–4 Wochen\',this)"><i class="fas fa-calendar-check"></i> 2–4 Wochen</button>' +
              '<button type="button" class="km-zeit-btn" onclick="KonfiguratorModal.selectZeit(\'Dringend\',this)"><i class="fas fa-bolt"></i> Dringend</button>' +
            '</div></div>' +
        '</div>' +
        '<button class="km-btn-primary" onclick="KonfiguratorModal.goStep(7)"><i class="fas fa-arrow-right"></i> Weiter zu Kontaktdaten</button>' +
      '</div>' +

      // STEP 7
      '<div class="km-step" data-step="7">' +
        '<div class="km-progress">' + progressDots(7) + '</div>' +
        '<div class="km-icon"><img src="' + imgPath('zid-icon.png') + '" alt="Kontakt"></div>' +
        '<h3>Ihre Kontaktdaten</h3>' +
        '<p>Fast geschafft! Wie können wir Sie erreichen?</p>' +
        '<div class="km-form">' +
          '<div class="km-field"><label for="km-name">Name *</label>' +
            '<input type="text" id="km-name" class="km-input" placeholder="Ihr Name" required autocomplete="name"></div>' +
          '<div class="km-field"><label for="km-telefon">Telefon *</label>' +
            '<input type="tel" id="km-telefon" class="km-input" placeholder="+49 151 234 567 89" required inputmode="tel" autocomplete="tel"></div>' +
          '<div class="km-field"><label for="km-email">E-Mail (optional)</label>' +
            '<input type="email" id="km-email" class="km-input" placeholder="ihre@email.de" inputmode="email" autocomplete="email"></div>' +
        '</div>' +
        '<button class="km-btn-primary" id="km-submit-btn" onclick="KonfiguratorModal.submit()">' +
          '<i class="fas fa-paper-plane"></i> Anfrage absenden</button>' +
        '<p class="km-note"><i class="fas fa-shield-alt"></i> Kostenlos & unverbindlich · Antwort innerhalb 24h</p>' +
      '</div>' +

      // STEP 8
      '<div class="km-step" data-step="8">' +
        '<div class="km-success">' +
          '<div class="km-success-icon"><i class="fas fa-check-circle"></i></div>' +
          '<h3>Vielen Dank!</h3>' +
          '<p>Ihre Anfrage wurde erfolgreich übermittelt.</p>' +
          '<div class="km-success-box">' +
            '<p><strong>Was passiert jetzt?</strong></p>' +
            '<p>✅ Wir melden uns innerhalb von 24 Stunden</p>' +
            '<p>✅ Sie erhalten ein unverbindliches Angebot</p>' +
            '<p>✅ Gemeinsam planen wir Ihr Projekt</p>' +
          '</div>' +
          '<p style="font-weight:600;text-align:center;margin-bottom:12px;font-size:0.95rem;color:#0F172A;">Oder kontaktieren Sie uns direkt</p>' +
          '<div class="km-quick-buttons">' +
            '<a href="https://wa.me/+4917641608973" class="km-btn-wa" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>' +
            '<a href="tel:+4917641608973" class="km-btn-call"><i class="fas fa-phone-alt"></i> Anrufen</a>' +
          '</div>' +
          '<div class="km-testimonial">' +
            '<div class="km-stars">⭐⭐⭐⭐⭐</div>' +
            '<p>"Super schnelle Antwortzeit und sehr professionelle Beratung!"</p>' +
            '<span>— Maria S., Aalen</span>' +
          '</div>' +
          '<button class="km-btn-primary" onclick="KonfiguratorModal.close()" style="background:linear-gradient(135deg,#059669,#34d399);">' +
            '<i class="fas fa-check"></i> Verstanden</button>' +
        '</div>' +
      '</div>' +

    '</div>';
  }

  // =============================================
  // INIT
  // =============================================
  function init() {
    if (initialized) return;
    initialized = true;

    // Inject CSS
    if (!document.getElementById('km-style')) {
      var style = document.createElement('style');
      style.id = 'km-style';
      style.textContent = modalCSS;
      document.head.appendChild(style);
    }

    // Create overlay
    var overlay = document.createElement('div');
    overlay.id = 'km-overlay';
    overlay.className = 'km-overlay';
    overlay.onclick = function(e) { if (e.target === overlay) close(); };
    overlay.innerHTML = buildHTML();
    document.body.appendChild(overlay);

    // Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') close();
    });

    // Photo listeners
    var camIn = document.getElementById('km-camera-capture');
    var uplIn = document.getElementById('km-photo-upload');
    if (camIn) camIn.addEventListener('change', handlePhotoSelect);
    if (uplIn) uplIn.addEventListener('change', handlePhotoSelect);

    // Maße live calc
    var bEl = document.getElementById('km-breite');
    var hEl = document.getElementById('km-hoehe');
    if (bEl) bEl.addEventListener('input', calcFlaeche);
    if (hEl) hEl.addEventListener('input', calcFlaeche);
  }

  // =============================================
  // NAVIGATION
  // =============================================
  function open() {
    init();
    reset();
    goStep(1);
    document.getElementById('km-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    var overlay = document.getElementById('km-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    stopCamera();
    setTimeout(reset, 400);
  }

  function goStep(n) {
    var steps = document.querySelectorAll('#km-overlay .km-step');
    steps.forEach(function(s) { s.classList.remove('active'); });
    var target = document.querySelector('#km-overlay .km-step[data-step="' + n + '"]');
    if (target) {
      target.classList.add('active');
      var prog = target.querySelector('.km-progress');
      if (prog) prog.innerHTML = progressDots(n);
    }
    var card = document.querySelector('#km-overlay .km-card');
    if (card) card.scrollTop = 0;
  }

  // =============================================
  // RESET
  // =============================================
  function reset() {
    selectedPhoto = null;
    selectedDesign = null;
    selectedDruckart = null;
    selectedZeitrahmen = null;
    stopCamera();

    var ids = {
      'km-photo-preview': 'none', 'km-btn-to-step3': 'none',
      'km-btn-to-step4': 'none', 'km-btn-to-step6': 'none'
    };
    for (var id in ids) {
      var el = document.getElementById(id);
      if (el) el.style.display = ids[id];
    }
    var camBtns = document.getElementById('km-camera-buttons');
    if (camBtns) camBtns.style.display = 'flex';

    var previewImg = document.getElementById('km-preview-img');
    if (previewImg) previewImg.src = '';

    // File inputs
    ['km-camera-capture', 'km-photo-upload'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });

    // Selections
    document.querySelectorAll('#km-overlay .km-design-option, #km-overlay .km-druckart-option').forEach(function(d) {
      d.classList.remove('selected');
    });
    document.querySelectorAll('#km-overlay .km-zeit-btn').forEach(function(b) {
      b.classList.remove('selected');
    });

    // Inputs
    ['km-breite', 'km-hoehe', 'km-name', 'km-telefon', 'km-email'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });

    var flaecheRes = document.getElementById('km-flaeche-result');
    if (flaecheRes) flaecheRes.classList.remove('visible');

    // Selects
    ['km-oberflaeche', 'km-raumtyp'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.selectedIndex = 0;
    });

    // Submit btn
    var btn = document.getElementById('km-submit-btn');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Anfrage absenden';
    }
  }

  // =============================================
  // PHOTO
  // =============================================
  function handlePhotoSelect(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      selectedPhoto = e.target.result;
      var preview = document.getElementById('km-photo-preview');
      var img = document.getElementById('km-preview-img');
      var btn = document.getElementById('km-btn-to-step3');
      var camBtns = document.getElementById('km-camera-buttons');
      if (preview) preview.style.display = 'block';
      if (img) img.src = e.target.result;
      if (btn) btn.style.display = 'flex';
      if (camBtns) camBtns.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function retakePhoto() {
    selectedPhoto = null;
    var preview = document.getElementById('km-photo-preview');
    var btn = document.getElementById('km-btn-to-step3');
    var camBtns = document.getElementById('km-camera-buttons');
    if (preview) preview.style.display = 'none';
    if (btn) btn.style.display = 'none';
    if (camBtns) camBtns.style.display = 'flex';
    ['km-camera-capture', 'km-photo-upload'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(function(t) { t.stop(); });
      cameraStream = null;
    }
  }

  // =============================================
  // SELECTIONS
  // =============================================
  function selectDesign(name, el) {
    selectedDesign = name;
    document.querySelectorAll('#km-overlay .km-design-option').forEach(function(d) { d.classList.remove('selected'); });
    el.classList.add('selected');
    var btn = document.getElementById('km-btn-to-step4');
    if (btn) btn.style.display = 'flex';
  }

  function selectDruckart(name, el) {
    selectedDruckart = name;
    document.querySelectorAll('#km-overlay .km-druckart-option').forEach(function(d) { d.classList.remove('selected'); });
    el.classList.add('selected');
    var btn = document.getElementById('km-btn-to-step6');
    if (btn) btn.style.display = 'flex';
  }

  function selectZeit(name, el) {
    selectedZeitrahmen = name;
    document.querySelectorAll('#km-overlay .km-zeit-btn').forEach(function(b) { b.classList.remove('selected'); });
    el.classList.add('selected');
  }

  function calcFlaeche() {
    var b = parseFloat(document.getElementById('km-breite').value);
    var h = parseFloat(document.getElementById('km-hoehe').value);
    var res = document.getElementById('km-flaeche-result');
    var val = document.getElementById('km-flaeche-value');
    if (b > 0 && h > 0) {
      if (val) val.textContent = (Math.round(b * h * 100) / 100).toLocaleString('de-DE');
      if (res) res.classList.add('visible');
    } else {
      if (res) res.classList.remove('visible');
    }
  }

  // =============================================
  // SUBMIT
  // =============================================
  function submit() {
    var name = document.getElementById('km-name').value.trim();
    var telefon = document.getElementById('km-telefon').value.trim();
    var emailEl = document.getElementById('km-email');
    var email = emailEl ? emailEl.value.trim() : '';

    if (!name || !telefon) {
      alert('Bitte füllen Sie Name und Telefon aus.');
      return;
    }

    var btn = document.getElementById('km-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
    }

    getOptimizedPhoto(function(photoData) {
      var breiteVal = document.getElementById('km-breite').value;
      var hoeheVal = document.getElementById('km-hoehe').value;
      var flaecheStr = '';
      if (breiteVal && hoeheVal) {
        flaecheStr = (Math.round(parseFloat(breiteVal) * parseFloat(hoeheVal) * 100) / 100) + ' m² (' + breiteVal + ' × ' + hoeheVal + ' m)';
      }

      var oberflEl = document.getElementById('km-oberflaeche');
      var raumEl = document.getElementById('km-raumtyp');

      var payload = {
        name:        name,
        telefon:     telefon,
        email:       email || '—',
        design:      selectedDesign || 'nicht gewählt',
        druckart:    selectedDruckart || 'nicht gewählt',
        flaeche:     flaecheStr || 'nicht angegeben',
        oberflaeche: (oberflEl ? oberflEl.value : '') || 'nicht angegeben',
        raumtyp:     (raumEl ? raumEl.value : '') || 'nicht angegeben',
        zeitrahmen:  selectedZeitrahmen || 'nicht angegeben',
        raum:        photoData ? 'Foto hochgeladen' : 'kein Foto',
        photoBase64: photoData || null,
        photoMime:   'image/jpeg'
      };

            fetch('https://script.google.com/macros/s/AKfycbyRylYbMI1-2pnPLQ8RD3LvFZ9-vWTW_xRhQKzg7ooSuNZ7BA4MEm8hc8-TOCVoCaI/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      })
      .then(function() { goStep(8); })
      .catch(function(err) { console.error(err); goStep(8); })
      .finally(function() {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Anfrage absenden';
        }
      });
    });
  }

  function getOptimizedPhoto(callback) {
    if (!selectedPhoto) { callback(null); return; }
    if (selectedPhoto.length < 2000000) { callback(selectedPhoto); return; }
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var MAX = 1200;
      var w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = function() { callback(selectedPhoto); };
    img.src = selectedPhoto;
  }

  // =============================================
  // PUBLIC API
  // =============================================
  return {
    open:           open,
    close:          close,
    goStep:         goStep,
    selectDesign:   selectDesign,
    selectDruckart: selectDruckart,
    selectZeit:     selectZeit,
    retakePhoto:    retakePhoto,
    submit:         submit
  };

})();
