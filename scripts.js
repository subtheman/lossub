var currentSlide = 0;
var totalSlides = 2;

function changeSlide(dir) {
  currentSlide = (currentSlide + dir + totalSlides) % totalSlides;
  updateCarousel();
}

function goToSlide(n) {
  currentSlide = n;
  updateCarousel();
}

function updateCarousel() {
  var slides = document.querySelector('.carousel-slides');
  var dots = document.querySelectorAll('.dot');
  if (slides) slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
  dots.forEach(function(d, i) { d.classList.toggle('active', i === currentSlide); });
}

function toggleMenu() {
  var menu = document.getElementById('mobile-menu');
  var btn = document.getElementById('hamburger');
  if (menu) menu.classList.toggle('open');
  if (btn) btn.classList.toggle('open');
}

function closeMenu() {
  var menu = document.getElementById('mobile-menu');
  var btn = document.getElementById('hamburger');
  if (menu) menu.classList.remove('open');
  if (btn) btn.classList.remove('open');
}

// Auto-advance carousel every 5 seconds
setInterval(function() { changeSlide(1); }, 5000);

// ── EMAILJS INIT ─────────────────────────────────────────
if (typeof emailjs !== 'undefined') {
  emailjs.init('bYr7GpESyw248ykR8');
}

const EMAILJS_SERVICE  = 'service_x2loys9';
const EMAILJS_TEMPLATE = 'template_ud685x3';
const SITE_URL = window.location.origin + window.location.pathname;

// ── DATOS DEL PLAYER ──────────────────────────────────────
const BASE_URL = 'https://lossub.com.ar/';
const TRACKS = [
  { num: '01', title: 'Vengador tóxico',        file: '01 Vengador toxico.m4a',        duration: '3:34' },
  { num: '02', title: 'Algo bueno',              file: '02 Algo bueno.m4a',              duration: '3:40' },
  { num: '03', title: 'Camino a marte',          file: '03 Camino a marte.m4a',          duration: '4:40' },
  { num: '04', title: 'Puro corazón',            file: '04 Puro corazon.m4a',            duration: '3:18' },
  { num: '05', title: 'Plástico',                file: '05 Plastico.m4a',                duration: '2:34' },
  { num: '06', title: 'Pesca',                   file: '06 Pesca.m4a',                   duration: '3:04' },
  { num: '07', title: 'Solos en la gran ciudad', file: '07 Solos en la gran ciudad.m4a', duration: '3:14' },
  { num: '08', title: 'La eternidad',            file: '08 La eternidad.m4a',            duration: '2:32' },
  { num: '09', title: 'Nuestra última canción',  file: '09 Nuestra ultima cancion.m4a',  duration: '3:42' },
];

let npCurrent = 0;
let npPlaying = false;
const npAudio = document.getElementById('audio-player');

function npBuildTracklist() {
  const list = document.getElementById('np-track-list');
  if (!list) return;
  list.innerHTML = '';
  TRACKS.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'np-track-row' + (i === 0 ? ' active' : '');
    row.dataset.index = i;
    row.innerHTML = `
      <span class="np-track-num">${t.num}</span>
      <span class="np-track-name">${t.title}</span>
      <span class="np-track-dur">${t.duration}</span>
    `;
    row.addEventListener('click', () => npLoadTrack(i, true));
    list.appendChild(row);
  });
}

function npLoadTrack(index, autoplay) {
  npCurrent = index;
  const t = TRACKS[index];
  npAudio.src = BASE_URL + encodeURIComponent(t.file);
  const titleEl = document.getElementById('np-now-title');
  if (titleEl) titleEl.textContent = t.title;
  const fill = document.getElementById('np-progress-fill');
  if (fill) fill.style.width = '0%';
  const cur = document.getElementById('np-time-current');
  if (cur) cur.textContent = '0:00';
  const tot = document.getElementById('np-time-total');
  if (tot) tot.textContent = t.duration;
  document.querySelectorAll('.np-track-row').forEach((r, i) => {
    r.classList.toggle('active', i === index);
  });
  if (autoplay) {
    npAudio.play().then(() => npSetPlaying(true)).catch(() => {});
  } else {
    npSetPlaying(false);
  }
}

function npSetPlaying(val) {
  npPlaying = val;
  const iconPlay = document.getElementById('np-icon-play');
  const iconPause = document.getElementById('np-icon-pause');
  if (iconPlay) iconPlay.style.display = val ? 'none' : 'block';
  if (iconPause) iconPause.style.display = val ? 'block' : 'none';
}

function npFormatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function npInitListeners() {
  const btnPlay = document.getElementById('np-btn-play');
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (!npAudio.src || npAudio.src === window.location.href) {
        npLoadTrack(npCurrent, true);
        return;
      }
      if (npPlaying) {
        npAudio.pause(); npSetPlaying(false);
      } else {
        npAudio.play().then(() => npSetPlaying(true)).catch(() => {});
      }
    });
  }

  const btnNext = document.getElementById('np-btn-next');
  if (btnNext) btnNext.addEventListener('click', () => npLoadTrack((npCurrent + 1) % TRACKS.length, true));

  const btnPrev = document.getElementById('np-btn-prev');
  if (btnPrev) btnPrev.addEventListener('click', () => {
    if (npAudio.currentTime > 3) {
      npAudio.currentTime = 0;
    } else {
      npLoadTrack((npCurrent - 1 + TRACKS.length) % TRACKS.length, true);
    }
  });

  if (npAudio) {
    npAudio.addEventListener('timeupdate', () => {
      if (npAudio.duration) {
        const fill = document.getElementById('np-progress-fill');
        if (fill) fill.style.width = (npAudio.currentTime / npAudio.duration * 100) + '%';
        const cur = document.getElementById('np-time-current');
        if (cur) cur.textContent = npFormatTime(npAudio.currentTime);
        const tot = document.getElementById('np-time-total');
        if (tot) tot.textContent = npFormatTime(npAudio.duration);
      }
    });
    npAudio.addEventListener('ended', () => npLoadTrack((npCurrent + 1) % TRACKS.length, true));
  }

  const progressBar = document.getElementById('np-progress-bar');
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (npAudio.duration) npAudio.currentTime = pct * npAudio.duration;
    });
  }
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/';
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function mostrarPlayer() {
  const discoForm = document.getElementById('disco-form');
  const discoCheck = document.getElementById('disco-check-email');
  const player = document.getElementById('player');
  if (discoForm) discoForm.style.display = 'none';
  if (discoCheck) discoCheck.style.display = 'none';
  if (player) {
    player.classList.remove('hidden');
    player.classList.add('visible');
  }
  setTimeout(() => {
    npBuildTracklist();
    npInitListeners();
  }, 50);
}

function enviarVerificacion() {
  const emailInput = document.getElementById('disco-email');
  const email = emailInput ? emailInput.value.trim() : '';
  if (!email || !email.includes('@')) { alert('Ingresá un email válido.'); return; }

  const verifyUrl = SITE_URL + '?disco=ok&email=' + encodeURIComponent(email);

  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_email: email,
    verify_url: verifyUrl
  }).then(() => {
    const discoForm = document.getElementById('disco-form');
    const discoEmailSent = document.getElementById('disco-email-sent');
    const discoCheck = document.getElementById('disco-check-email');
    if (discoForm) discoForm.style.display = 'none';
    if (discoEmailSent) discoEmailSent.textContent = email;
    if (discoCheck) discoCheck.style.display = 'flex';
  }).catch(err => {
    console.error('EmailJS error:', err);
    alert('Hubo un error enviando el mail. Intentá de nuevo.');
  });
}

function suscribir() {
  const emailInput = document.getElementById('newsletter-email');
  const email = emailInput ? emailInput.value.trim() : '';
  if (!email || !email.includes('@')) { alert('Ingresá un email válido.'); return; }
  guardarEmail(email, 'newsletter');
  if (emailInput) emailInput.value = '';
  const msg = document.getElementById('newsletter-msg');
  if (msg) msg.style.display = 'inline';
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ8qWnUhjbNoSAgrIQouFqPYLben2HBYIFF5sqttLUKQQVAlue-qdSLs-vO0T_pHzqfw/exec';

function guardarEmail(email, origen) {
  if (SCRIPT_URL === 'TU_GOOGLE_APPS_SCRIPT_URL_AQUI') {
    console.log('Email a guardar:', email, '| Origen:', origen);
    return;
  }
  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, origen, fecha: new Date().toISOString() })
  }).catch(e => console.error('Error guardando email:', e));
}

function enviarContacto() {
  const nombre = document.getElementById('contacto-nombre').value.trim();
  const email = document.getElementById('contacto-email').value.trim();
  const mensaje = document.getElementById('contacto-mensaje').value.trim();
  if (!nombre || !email || !mensaje) { alert('Completá todos los campos.'); return; }
  if (!email.includes('@')) { alert('Ingresá un email válido.'); return; }
  fetch('https://formspree.io/f/xzdaokrj', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ nombre, email, mensaje })
  }).then(() => {
    document.getElementById('contacto-nombre').value = '';
    document.getElementById('contacto-email').value = '';
    document.getElementById('contacto-mensaje').value = '';
    const msg = document.getElementById('contacto-msg');
    if (msg) {
      msg.style.display = 'inline';
      setTimeout(() => { msg.style.display = 'none'; }, 3000);
    }
  }).catch(err => {
    console.error('Error enviando contacto:', err);
    alert('Hubo un error enviando el mensaje. Intentá de nuevo.');
  });
}

function initPage() {
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleMenu);

  document.querySelectorAll('.mobile-menu a').forEach((anchor) => {
    anchor.addEventListener('click', closeMenu);
  });

  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

  document.querySelectorAll('.carousel-dots .dot').forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  const btnSuscribir = document.getElementById('btn-suscribir');
  if (btnSuscribir) btnSuscribir.addEventListener('click', suscribir);

  const btnVerificar = document.getElementById('btn-verificar');
  if (btnVerificar) btnVerificar.addEventListener('click', enviarVerificacion);

  const btnContacto = document.getElementById('btn-contacto');
  if (btnContacto) btnContacto.addEventListener('click', enviarContacto);

  const params = new URLSearchParams(window.location.search);
  if (params.get('disco') === 'ok') {
    const email = params.get('email') || '';
    setCookie('lossub_verified', 'true', 365);
    if (email) guardarEmail(decodeURIComponent(email), 'disco_verificado');
    mostrarPlayer();
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (getCookie('lossub_verified') === 'true') {
    mostrarPlayer();
  }
}

window.addEventListener('DOMContentLoaded', initPage);
