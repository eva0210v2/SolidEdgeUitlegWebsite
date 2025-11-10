// CONFIG - pas deze waarden aan
const RECIPIENT_EMAIL = 'eva.fortes.tijdelijk@gmail.com';
const FORM_ENDPOINT = 'https://formspree.io/f/xanawroe'; // jouw Formspree-endpoint

// UI bindings
const form = document.getElementById('feedbackForm');
const result = document.getElementById('result');
const mailtoBtn = document.getElementById('mailtoBtn');
const messageEl = document.getElementById('message');
const nameEl = document.getElementById('name');
const charcount = document.getElementById('charcount');


messageEl.addEventListener('input', ()=>{
charcount.textContent = messageEl.value.length + ' / ' + messageEl.maxLength;
});


// Fallback: open user's mail client
mailtoBtn.addEventListener('click', ()=>{
const name = encodeURIComponent(nameEl.value || '');
const body = encodeURIComponent(messageEl.value || '');
const subject = encodeURIComponent('Feedback van website' + (name ? ' - ' + name : ''));
const mailto = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
window.location.href = mailto;
});


// Submit - prefer FORM_ENDPOINT if configured, anders open mailto
form.addEventListener('submit', async (e)=>{
e.preventDefault();
result.textContent = '';
result.className = '';


// Basic client-side validation
if(!nameEl.value.trim() || !messageEl.value.trim()){
result.className = 'error';
result.textContent = 'Vul alsjeblieft zowel je naam als je bericht in.';
return;
}


if(FORM_ENDPOINT){
// Gebruik fetch naar een service zoals Formspree
const payload = new FormData();
payload.append('name', nameEl.value.trim());
payload.append('message', messageEl.value.trim());


try{
const res = await fetch(FORM_ENDPOINT, {method:'POST', body:payload, headers:{'Accept':'application/json'}});
if(res.ok){
form.reset();
charcount.textContent = '0 / ' + messageEl.maxLength;
result.className = 'success';
result.textContent = 'Dank! Je feedback is verzonden.';
} else {
const data = await res.json().catch(()=>null);
throw new Error((data && data.error) ? data.error : 'Verzenden mislukt');
}
}catch(err){
result.className = 'error';
result.textContent = 'Er ging iets mis bij het verzenden: ' + err.message + '. Probeer de knop "Open in e-mailprogramma" als alternatief.';
}


} else {
// Fallback: open mail client
const name = encodeURIComponent(nameEl.value.trim());
const body = encodeURIComponent(messageEl.value.trim());
const subject = encodeURIComponent('Feedback van website' + (name ? ' - ' + name : ''));
const mailto = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
// try to open mail client
window.location.href = mailto;
}
});


// Accessibility: focus first input on load
window.addEventListener('load', ()=>{ nameEl.focus(); });