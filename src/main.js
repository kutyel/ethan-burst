import { sound } from './noise.js';

const films = [
  { id: 1, title: 'Antes del sí', subtitle: 'La belleza de la espera', category: 'super8' },
  { id: 2, title: 'A flor de piel', subtitle: 'Los pequeños grandes momentos', category: 'cinematic' },
  { id: 3, title: 'Sal, sol y nosotros', subtitle: 'La libertad de ser vosotros', category: 'super8' },
  { id: 4, title: 'A donde tú vayas', subtitle: 'Un viaje para recordar', category: 'super8' },
  { id: 5, title: 'Cuando cae el sol', subtitle: 'El escenario de una historia', category: 'cinematic' },
  { id: 6, title: 'La última canción', subtitle: 'Que el mundo siga esperando', category: 'cinematic' },
];
const VIEWS = ['home', 'films', 'about', 'contact'];
const LABELS = { home: 'Inicio', films: 'Films', about: 'About', contact: 'Contacto' };
const TITLES = {
  home: 'Ethan Burst — Raw & Super 8 Wedding Films',
  films: 'Films — Ethan Burst',
  about: 'About, el detrás de cámaras — Ethan Burst',
  contact: 'Contacto — Ethan Burst',
};
const format = category => (category === 'super8' ? 'SUPER 8' : 'CINEMATIC');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/* Estática de televisión pintada a mano sobre un lienzo diminuto y escalado con píxeles duros. */
function staticPainter(canvas) {
  const context = canvas.getContext('2d');
  const frame = context.createImageData(canvas.width, canvas.height);
  let request = 0;
  let last = 0;
  function paint(time) {
    request = requestAnimationFrame(paint);
    if (time - last < 55) return; // ~18 fps: el parpadeo se lee más analógico que a 60
    last = time;
    const pixels = frame.data;
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = pixels[i + 1] = pixels[i + 2] = Math.random() * 255;
      pixels[i + 3] = 255;
    }
    context.putImageData(frame, 0, 0);
  }
  return {
    start() { if (!request) request = requestAnimationFrame(paint); },
    stop() { cancelAnimationFrame(request); request = 0; context.clearRect(0, 0, canvas.width, canvas.height); },
  };
}

/* CATÁLOGO -------------------------------------------------------------- */
const grid = document.querySelector('#film-grid');
grid.innerHTML = films.map(film => `<article class="film-card" data-category="${film.category}"><button class="film-visual" data-film="${film.id}" style="--poster:url('/media/film-${film.id}.jpg')" aria-label="Reproducir ${film.title}"><img src="/media/film-${film.id}.jpg" alt="${film.subtitle}, un fragmento de boda de Ethan Burst" loading="lazy" width="2048" height="1152"><video muted loop playsinline preload="none" data-src="/media/film-${film.id}.mp4" aria-hidden="true" tabindex="-1"></video><span class="film-split" aria-hidden="true"></span><span class="film-number">0${film.id} /</span><span class="film-format">${format(film.category)}</span><span class="film-play">▶<span>VER FILM</span></span><span class="film-corner">↗</span></button><div class="film-info"><div><h3>${film.title}</h3><p>${film.subtitle}</p></div><span class="film-info-index">(0${film.id})</span></div></article>`).join('');

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  sound.tape();
  document.querySelectorAll('[data-filter]').forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
  let count = 0;
  document.querySelectorAll('.film-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; else card.querySelector('video').pause(); });
  document.querySelector('.film-count').textContent = `(0${count})`;
  document.querySelector('#filter-status').textContent = `${count} películas visibles`;
}));

/* SONIDO ---------------------------------------------------------------- */
const soundToggle = document.querySelector('#sound-toggle');
const soundLabel = document.querySelector('#sound-label');
sound.subscribe(({ enabled, hot }) => {
  soundToggle.setAttribute('aria-pressed', String(enabled));
  soundLabel.textContent = enabled ? 'Sonido on' : 'Sonido off';
  soundToggle.classList.toggle('is-hot', enabled && hot);
});
soundToggle.addEventListener('click', () => { if (sound.toggle()) sound.tape(); });

/* NAVEGACIÓN ------------------------------------------------------------ */
const sections = [...document.querySelectorAll('.view')];
const gate = document.querySelector('#gate');
const gateLabel = document.querySelector('#gate-label');
const gateStatic = staticPainter(document.querySelector('#gate-static'));
const dialog = document.querySelector('#film-dialog');
let current = '';
let navigating = false;
let queued = null;

function parseHash(hash) {
  const raw = hash.replace(/^#\/?/, '').replace(/\/+$/, '').toLowerCase();
  return VIEWS.includes(raw) ? raw : 'home';
}

function swap(view) {
  for (const section of sections) {
    const active = section.dataset.view === view;
    section.classList.remove('is-entering');
    section.hidden = !active;
    if (active) { void section.offsetWidth; section.classList.add('is-entering'); }
  }
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = TITLES[view];
  const previous = current;
  current = view;
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (previous) document.querySelector(`#view-${view}`).focus({ preventScroll: true });
  syncHero();
}

async function navigate(view) {
  if (view === current) return;
  if (navigating) { queued = view; return; }
  navigating = true;
  const back = VIEWS.indexOf(view) < VIEWS.indexOf(current);
  sound.cut();
  if (reducedMotion.matches) {
    swap(view);
  } else {
    gate.dataset.dir = back ? 'back' : 'fwd';
    gateLabel.textContent = LABELS[view];
    gateStatic.start();
    gate.classList.remove('is-out');
    gate.classList.add('is-running');
    await wait(330);
    swap(view);
    gate.classList.add('is-out');
    await wait(410);
    gate.classList.remove('is-running', 'is-out');
    gateStatic.stop();
  }
  navigating = false;
  if (queued) { const next = queued; queued = null; navigate(next); }
}

window.addEventListener('hashchange', () => navigate(parseHash(location.hash)));
// Un clic sobre la vista actual no dispara hashchange: ahí solo hay que cerrar el menú.
document.querySelectorAll('[data-nav]').forEach(link => link.addEventListener('click', closeMenu));

/* MENÚ MÓVIL ------------------------------------------------------------ */
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
menuToggle.addEventListener('click', () => {
  mobileNav.hidden = !mobileNav.hidden;
  menuToggle.setAttribute('aria-expanded', String(!mobileNav.hidden));
  sound.tape();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); } });

/* VÍDEO DE FONDO -------------------------------------------------------- */
const heroVideo = document.querySelector('.hero-video');
const motionToggle = document.querySelector('#motion-toggle');
let backgroundEnabled = !reducedMotion.matches && !navigator.connection?.saveData;
let heroVisible = true;
function updateMotionLabel() {
  motionToggle.textContent = heroVideo.paused ? 'Reproducir fondo ▷' : 'Pausar fondo Ⅱ';
  motionToggle.setAttribute('aria-label', heroVideo.paused ? 'Reproducir vídeo de fondo' : 'Pausar vídeo de fondo');
}
async function playBackground() {
  if (!heroVideo.getAttribute('src')) heroVideo.src = '/media/film-3.mp4';
  try { await heroVideo.play(); } catch { /* Si el navegador bloquea la reproducción, queda el póster. */ }
  updateMotionLabel();
}
function syncHero() {
  if (backgroundEnabled && heroVisible && current === 'home' && !document.hidden && !dialog.open) playBackground();
  else heroVideo.pause();
}
motionToggle.addEventListener('click', () => { backgroundEnabled = heroVideo.paused; syncHero(); });
heroVideo.addEventListener('play', updateMotionLabel);
heroVideo.addEventListener('pause', updateMotionLabel);
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncHero(); }, { threshold: .1 }).observe(heroVideo);
reducedMotion.addEventListener('change', event => {
  if (!event.matches) return;
  backgroundEnabled = false;
  heroVideo.pause();
  document.querySelectorAll('.film-visual video').forEach(video => video.pause());
});

/* PREVISUALIZACIÓN EN LAS FICHAS ---------------------------------------- */
document.querySelectorAll('.film-visual').forEach(button => {
  const video = button.querySelector('video');
  const preview = async () => {
    if (reducedMotion.matches || navigator.connection?.saveData) return;
    if (!video.src) video.src = video.dataset.src;
    try { await video.play(); } catch { /* Si no puede reproducirse, se queda la imagen. */ }
  };
  button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') preview(); });
  button.addEventListener('pointerleave', () => { video.pause(); button.classList.remove('previewing'); });
  button.addEventListener('blur', () => { video.pause(); button.classList.remove('previewing'); });
  video.addEventListener('playing', () => { if (button.matches(':hover')) button.classList.add('previewing'); else video.pause(); });
});

/* REPRODUCTOR CON OBTURADOR --------------------------------------------- */
const player = document.querySelector('#film-player');
const shutter = document.querySelector('#shutter');
const shutterStatic = staticPainter(document.querySelector('#shutter-static'));
let closing = false;

async function openFilm(id) {
  const film = films.find(item => item.id === id);
  document.querySelector('#dialog-title').textContent = film.title;
  document.querySelector('#dialog-format').textContent = `${format(film.category)} / FRAGMENTO 0${film.id}`;
  document.querySelector('#video-error').hidden = true;
  document.querySelector('#video-download').href = `/media/film-${film.id}.mp4`;
  player.poster = `/media/film-${film.id}.jpg`;
  player.src = `/media/film-${film.id}.mp4`;
  document.querySelectorAll('video').forEach(video => { if (video !== player) video.pause(); });

  shutter.classList.remove('is-open');
  shutter.classList.add('is-loading');
  shutterStatic.start();
  sound.projector();
  dialog.showModal();
  document.body.classList.add('modal-open');
  await wait(reducedMotion.matches ? 0 : 520);
  shutter.classList.remove('is-loading');
  shutter.classList.add('is-open');
  shutterStatic.stop();
  player.play().catch(() => { /* Sin autoplay quedan los controles nativos. */ });
}

// Idempotente: la llama tanto el cierre propio como el evento `close` nativo (Escape, back del sistema).
function resetPlayer() {
  player.pause();
  if (player.getAttribute('src')) { player.removeAttribute('src'); player.load(); }
  shutter.classList.remove('is-open', 'is-loading');
  shutterStatic.stop();
  document.body.classList.remove('modal-open');
  syncHero();
}

async function closeFilm() {
  if (!dialog.open || closing) return;
  closing = true;
  player.pause();
  sound.slam();
  shutter.classList.remove('is-open');
  await wait(reducedMotion.matches ? 0 : 300);
  dialog.close();
  resetPlayer();
  closing = false;
}

document.querySelectorAll('[data-film]').forEach(button => button.addEventListener('click', () => openFilm(Number(button.dataset.film))));
document.querySelector('#close-film').addEventListener('click', closeFilm);
document.querySelector('#film-contact').addEventListener('click', closeFilm);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeFilm(); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeFilm();
});
dialog.addEventListener('close', resetPlayer);
player.addEventListener('error', () => { if (player.getAttribute('src')) document.querySelector('#video-error').hidden = false; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause());
  else syncHero();
});

/* FORMULARIO ------------------------------------------------------------ */
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const date = new Date(`${data.get('date')}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  document.querySelector('#inquiry-text').value = `¡Hola, Ethan!\n\nSomos ${data.get('names')}.\nEmail: ${data.get('email')}\nFecha: ${date}\nLugar: ${data.get('location')}\n\n${data.get('story')}\n\nNos gustaría conocer tu disponibilidad y propuesta. ¡Gracias!`;
  document.querySelector('#inquiry-result').hidden = false;
  document.querySelector('#copy-status').textContent = '';
  document.querySelector('#inquiry-text').focus();
  sound.tape();
});
document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  const text = document.querySelector('#inquiry-text');
  try { await navigator.clipboard.writeText(text.value); document.querySelector('#copy-status').textContent = 'Texto copiado. Puedes pegarlo en el formulario de Ethan.'; }
  catch { text.focus(); text.select(); document.querySelector('#copy-status').textContent = 'Selecciona y copia el texto con Ctrl+C o ⌘C.'; }
});
document.querySelector('#year').textContent = new Date().getFullYear();

/* ARRANQUE -------------------------------------------------------------- */
swap(parseHash(location.hash));
if (!location.hash) history.replaceState(null, '', '#/');
