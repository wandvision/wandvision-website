var KonfiguratorModal = (function() {
  var initialized = false;
  var modalCSS = ".pm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease}.pm-overlay.active{opacity:1;visibility:visible}.pm-card{background:#fff;border-radius:16px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;padding:36px 32px;position:relative;transform:translateY(20px);transition:transform 0.3s ease;box-shadow:0 24px 80px rgba(0,0,0,0.25)}.pm-overlay.active .pm-card{transform:translateY(0)}.pm-close{position:absolute;top:14px;right:18px;background:none;border:none;font-size:1.8rem;color:#64748B;cursor:pointer;line-height:1;transition:color 0.2s ease;padding:4px}.pm-close:hover{color:#0F172A}.pm-header{text-align:center;margin-bottom:24px}.pm-icon{width:56px;height:56px;background:linear-gradient(135deg,#F59E0B,#FBBF24);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#fff;margin:0 auto 14px;box-shadow:0 8px 24px rgba(245,158,11,0.35)}.pm-header h2{font-size:1.3rem;color:#1E3A8A;margin-bottom:8px}.pm-header p{font-size:0.9rem;color:#64748B;line-height:1.6}.pm-fields{display:flex;flex-direction:column;gap:16px}.pm-field{display:flex;flex-direction:column;gap:5px}.pm-field label{font-size:0.82rem;font-weight:600;color:#1E3A8A;text-transform:uppercase;letter-spacing:0.03em}.pm-field input,.pm-field textarea{padding:12px 14px;border:2px solid #E2E8F0;border-radius:10px;font-size:0.95rem;font-family:inherit;color:#0F172A;transition:border-color 0.2s ease,box-shadow 0.2s ease;background:#F8FAFF}.pm-field input:focus,.pm-field textarea:focus{outline:none;border-color:#F59E0B;box-shadow:0 0 0 3px rgba(245,158,11,0.15)}.pm-field textarea{resize:vertical;min-height:80px}.pm-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pm-submit{width:100%;padding:14px;background:linear-gradient(135deg,#F59E0B,#FBBF24);color:#1a1a1a;border:none;border-radius:50px;font-size:1rem;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.2s ease,box-shadow 0.2s ease;margin-top:4px}.pm-submit:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,158,11,0.4)}.pm-submit:disabled{opacity:0.7;cursor:not-allowed;transform:none}.pm-note{text-align:center;font-size:0.8rem;color:#64748B;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:2px}.pm-note i{color:#F59E0B;font-size:0.78rem}.pm-success{text-align:center;padding:20px 0}.pm-success-icon{font-size:3.5rem;color:#059669;margin-bottom:16px}.pm-success h2{font-size:1.4rem;color:#1E3A8A;margin-bottom:10px}.pm-success p{font-size:0.95rem;color:#64748B;line-height:1.7;margin-bottom:24px;max-width:360px;margin-left:auto;margin-right:auto}@media(max-width:600px){.pm-card{padding:28px 20px}.pm-row{grid-template-columns:1fr}.pm-header h2{font-size:1.15rem}}";

  function init() {
    if (initialized) return;
    initialized = true;

    if (!document.getElementById('kmStyle')) {
      var style = document.createElement('style');
      style.id = 'kmStyle';
      style.textContent = modalCSS;
      document.head.appendChild(style);
    }

    var overlay = document.createElement('div');
    overlay.id = 'kmOverlay';
    overlay.className = 'pm-overlay';
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    overlay.innerHTML =
      '<div class="pm-card">' +
        '<button class="pm-close" onclick="KonfiguratorModal.close()" aria-label="Schließen">&times;</button>' +
        '<div id="kmForm">' +
          '<div class="pm-header">' +
            '<div class="pm-icon"><i class="fas fa-star"></i></div>' +
            '<h2>Projekt-Anfrage</h2>' +
            '<p>Beschreiben Sie Ihr Projekt — wir erstellen Ihnen ein individuelles Angebot.</p>' +
          '</div>' +
          '<div class="pm-fields">' +
            '<div class="pm-field">' +
              '<label for="kmName">Ihr Name *</label>' +
              '<input type="text" id="kmName" placeholder="Max Mustermann" required>' +
            '</div>' +
            '<div class="pm-field">' +
              '<label for="kmEmail">E-Mail-Adresse *</label>' +
              '<input type="email" id="kmEmail" placeholder="ihre@email.de" required>' +
            '</div>' +
            '<div class="pm-row">' +
              '<div class="pm-field">' +
                '<label for="kmFlaeche">Fläche in m²</label>' +
                '<input type="number" id="kmFlaeche" placeholder="z.B. 25" min="1">' +
              '</div>' +
              '<div class="pm-field">' +
                '<label for="kmTelefon">Telefon</label>' +
                '<input type="tel" id="kmTelefon" placeholder="+49 ...">' +
              '</div>' +
            '</div>' +
            '<div class="pm-field">' +
              '<label for="kmNachricht">Ihre Nachricht</label>' +
              '<textarea id="kmNachricht" rows="3" placeholder="Beschreiben Sie kurz Ihr Projekt, den Raum oder Ihre Wünsche..."></textarea>' +
            '</div>' +
            '<button class="pm-submit" id="kmSubmitBtn" onclick="KonfiguratorModal.submit()">' +
              '<i class="fas fa-star"></i> Anfrage absenden' +
            '</button>' +
            '<p class="pm-note"><i class="fas fa-shield-alt"></i> Kostenlos & unverbindlich · Antwort innerhalb 24h</p>' +
          '</div>' +
        '</div>' +
        '<div id="kmSuccess" class="pm-success" style="display:none">' +
          '<div class="pm-success-icon"><i class="fas fa-check-circle"></i></div>' +
          '<h2>Vielen Dank!</h2>' +
          '<p>Ihre Anfrage ist eingegangen. Wir melden uns innerhalb von 24 Stunden mit einem individuellen Angebot.</p>' +
          '<button class="pm-submit" onclick="KonfiguratorModal.close()" style="background:var(--gradient-primary);">' +
            '<i class="fas fa-check"></i> Verstanden' +
          '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') close();
    });
  }

  function open() {
    init();
    reset();
    document.getElementById('kmOverlay').classList.add('active');
  }

  function close() {
    var overlay = document.getElementById('kmOverlay');
    if (overlay) overlay.classList.remove('active');
    setTimeout(reset, 400);
  }

  function reset() {
    var form = document.getElementById('kmForm');
    var success = document.getElementById('kmSuccess');
    if (form) form.style.display = 'block';
    if (success) success.style.display = 'none';
    var fields = ['kmName', 'kmEmail', 'kmFlaeche', 'kmTelefon', 'kmNachricht'];
    for (var i = 0; i < fields.length; i++) {
      var el = document.getElementById(fields[i]);
      if (el) el.value = '';
    }
    var btn = document.getElementById('kmSubmitBtn');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-star"></i> Anfrage absenden';
    }
  }

  function submit() {
    var name = document.getElementById('kmName').value.trim();
    var email = document.getElementById('kmEmail').value.trim();
    var flaeche = document.getElementById('kmFlaeche').value;
    var telefon = document.getElementById('kmTelefon').value.trim();
    var nachricht = document.getElementById('kmNachricht').value.trim();

    if (!name || !email) {
      alert('Bitte füllen Sie Name und E-Mail aus.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    var btn = document.getElementById('kmSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';

    var payload = {
      name: name,
      email: email,
      telefon: telefon || '—',
      design: 'Projekt-Anfrage' + (flaeche ? ' (' + flaeche + ' m²)' : ''),
      raum: nachricht || '—'
    };

    fetch('/.netlify/functions/send-konfigurator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      document.getElementById('kmForm').style.display = 'none';
      document.getElementById('kmSuccess').style.display = 'block';
    })
    .catch(function() {
      document.getElementById('kmForm').style.display = 'none';
      document.getElementById('kmSuccess').style.display = 'block';
    });
  }

  return { open: open, close: close, submit: submit };
})();
