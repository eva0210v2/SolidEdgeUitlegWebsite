// ✅ CONFIG
const RECIPIENT_EMAIL = 'eva.fortes.tijdelijk@gmail.com';
const FORM_ENDPOINT = 'https://formspree.io/f/xanawroe';

// ✅ Initialiseer feedbackformulier
function initFeedbackForm() {
  const form = document.getElementById('feedbackForm');
  if (!form) return; // feedbackpagina niet zichtbaar

  console.log("✅ Feedbackformulier gevonden en geactiveerd");

  const result = document.getElementById('result');
  const mailtoBtn = document.getElementById('mailtoBtn');
  const messageEl = document.getElementById('message');
  const nameEl = document.getElementById('name');
  const charcount = document.getElementById('charcount');

  // tekenenteller
  messageEl.addEventListener('input', () => {
    charcount.textContent = messageEl.value.length + ' / ' + messageEl.maxLength;
  });

  // mailto fallback
  mailtoBtn.addEventListener('click', () => {
    const name = encodeURIComponent(nameEl.value || '');
    const body = encodeURIComponent(messageEl.value || '');
    const subject = encodeURIComponent('Feedback van website' + (name ? ' - ' + name : ''));
    const mailto = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  });

  // formulier verzenden
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    result.textContent = '';
    result.className = '';

    if (!nameEl.value.trim() || !messageEl.value.trim()) {
      result.className = 'error';
      result.textContent = 'Vul alsjeblieft zowel je naam als je bericht in.';
      return;
    }

    if (FORM_ENDPOINT) {
      const payload = new FormData();
      payload.append('name', nameEl.value.trim());
      payload.append('message', messageEl.value.trim());

      // optioneel e-mailveld
      const emailEl = document.getElementById('email');
      payload.append('email', emailEl?.value.trim() || 'no-reply@example.com');
      payload.append('_replyto', emailEl?.value.trim() || 'no-reply@example.com');

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: payload,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          charcount.textContent = '0 / ' + messageEl.maxLength;
          result.className = 'success';
          result.textContent = 'Dank! Je feedback is verzonden.';
        } else {
          throw new Error('Verzenden mislukt');
        }
      } catch (err) {
        result.className = 'error';
        result.textContent = 'Er ging iets mis bij het verzenden: ' + err.message;
      }
    } else {
      const name = encodeURIComponent(nameEl.value.trim());
      const body = encodeURIComponent(messageEl.value.trim());
      const subject = encodeURIComponent('Feedback van website' + (name ? ' - ' + name : ''));
      const mailto = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
    }
  }); // 👈 dit haakje ontbrak in jouw code!
}

// ✅ Eventlistener om formulier te activeren zodra content geladen is
document.addEventListener('contentUpdated', () => {
  console.log("📄 contentUpdated gedetecteerd — feedbackscript actief");
  initFeedbackForm();
});
