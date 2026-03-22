/* ===================================================
   NETLIFY FUNCTION: send-konfigurator.js
   Lokacija: netlify/functions/send-konfigurator.js

   Šalje email sa:
     - Foto zida (attachment)
     - Odabrani dizajn
     - Kontakt podaci (ime, telefon, email)

   Koristi: Resend API (resend.com — besplatno 100/dan)

   Setup:
     1. Registruj se na resend.com (besplatno)
     2. Kreiraj API Key
     3. U Netlify → Site Settings → Environment Variables dodaj:
          RESEND_API_KEY = re_xxxxxxxxxxxx
          EMPFAENGER_EMAIL = tvoj@email.de
=================================================== */

exports.handler = async function(event) {

    // Samo POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // CORS headers — dozvoli poziv sa tvoje domene
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Ungültige Anfrage' })
        };
    }

    const {
        name       = '—',
        telefon    = '—',
        email      = '—',
        design     = '—',
        raum       = '—',
        photoBase64 = null,
        photoMime   = 'image/jpeg'
    } = data;

    // API Key und Empfänger aus Environment Variables
    const RESEND_API_KEY    = process.env.RESEND_API_KEY;
    const EMPFAENGER_EMAIL  = process.env.EMPFAENGER_EMAIL || 'info@wandvisionkk.de';

    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY fehlt in Environment Variables!');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server-Konfigurationsfehler' })
        };
    }

    // ---- Email HTML ----
    const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

      <div style="background: linear-gradient(135deg, #1E3A8A, #2563EB); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🖨 Neue Anfrage — WandVision K&K</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Konfigurator Anfrage eingegangen</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">

        <h2 style="color: #1E3A8A; font-size: 16px; margin: 0 0 20px;">📋 Kundendaten</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-weight: bold; color: #64748b; width: 40%; font-size: 13px;">👤 Name</td>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-left: none; border-radius: 0 6px 6px 0; color: #0f172a; font-size: 14px;">${escapeHtml(name)}</td>
          </tr>
          <tr><td colspan="2" style="height: 6px;"></td></tr>
          <tr>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-weight: bold; color: #64748b; font-size: 13px;">📞 Telefon</td>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-left: none; border-radius: 0 6px 6px 0; color: #0f172a; font-size: 14px;">
              <a href="tel:${escapeHtml(telefon)}" style="color: #2563EB; text-decoration: none;">${escapeHtml(telefon)}</a>
            </td>
          </tr>
          <tr><td colspan="2" style="height: 6px;"></td></tr>
          <tr>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-weight: bold; color: #64748b; font-size: 13px;">✉️ E-Mail</td>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-left: none; border-radius: 0 6px 6px 0; color: #0f172a; font-size: 14px;">${email !== '—' ? `<a href="mailto:${escapeHtml(email)}" style="color: #2563EB;">${escapeHtml(email)}</a>` : '—'}</td>
          </tr>
          <tr><td colspan="2" style="height: 6px;"></td></tr>
          <tr>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-weight: bold; color: #64748b; font-size: 13px;">🎨 Design</td>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-left: none; border-radius: 0 6px 6px 0; color: #0f172a; font-size: 14px;">${escapeHtml(design)}</td>
          </tr>
          <tr><td colspan="2" style="height: 6px;"></td></tr>
          <tr>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-weight: bold; color: #64748b; font-size: 13px;">🏠 Foto</td>
            <td style="padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-left: none; border-radius: 0 6px 6px 0; color: #0f172a; font-size: 14px;">${photoBase64 ? '✅ Foto beigefügt (siehe Anhang)' : '❌ Kein Foto hochgeladen'}</td>
          </tr>
        </table>

        ${photoBase64 ? `
        <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1E3A8A; font-size: 13px; font-weight: bold;">📎 Foto des Kunden ist als Anhang beigefügt.</p>
          <p style="margin: 6px 0 0; color: #64748b; font-size: 12px;">Dateiname: kunden-wand.jpg</p>
        </div>` : ''}

        <div style="margin-top: 28px; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
          <p style="margin: 0; color: #166534; font-size: 13px; font-weight: bold;">⚡ Bitte melden Sie sich innerhalb von 24 Stunden.</p>
        </div>

      </div>

      <div style="background: #1E3A8A; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">WandVision K&K · Hofherrnstrasse 67 · 73434 Aalen</p>
      </div>

    </div>`;

    // ---- Attachments ----
    const attachments = [];
    if (photoBase64) {
        // Ukloni data:image/jpeg;base64, prefix ako postoji
        const base64Data = photoBase64.includes(',')
            ? photoBase64.split(',')[1]
            : photoBase64;

        // Provjeri veličinu — Resend limit je 40MB, ali držimo na 8MB
        const sizeBytes = Buffer.byteLength(base64Data, 'base64');
        if (sizeBytes <= 8 * 1024 * 1024) {
            attachments.push({
                filename: 'kunden-wand.jpg',
                content:  base64Data
            });
        } else {
            console.warn('Foto zu groß für Anhang:', Math.round(sizeBytes / 1024 / 1024) + 'MB');
        }
    }

    // ---- Resend API Call ----
    const resendPayload = {
        from:        'WandVision K&K <noreply@wandvisionkk.de>',
        to:          [EMPFAENGER_EMAIL],
        reply_to:    email !== '—' ? email : undefined,
        subject:     `🖨 Neue Konfigurator-Anfrage von ${name}`,
        html:        htmlBody,
        attachments: attachments
    };

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method:  'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type':  'application/json'
            },
            body: JSON.stringify(resendPayload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend Fehler:', result);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Email konnte nicht gesendet werden', detail: result })
            };
        }

        console.log('Email gesendet:', result.id);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, id: result.id })
        };

    } catch (err) {
        console.error('Fetch Fehler:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Netzwerkfehler beim Senden' })
        };
    }
};

// XSS zaštita
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
