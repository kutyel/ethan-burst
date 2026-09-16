const films = [
  { id: 1, title: 'Antes del sí', subtitle: 'La belleza de la espera', category: 'super8' },
  { id: 2, title: 'A flor de piel', subtitle: 'Los pequeños grandes momentos', category: 'cinematic' },
  { id: 3, title: 'Sal, sol y nosotros', subtitle: 'La libertad de ser vosotros', category: 'super8' },
  { id: 4, title: 'A donde tú vayas', subtitle: 'Un viaje para recordar', category: 'super8' },
  { id: 5, title: 'Cuando cae el sol', subtitle: 'El escenario de una historia', category: 'cinematic' },
  { id: 6, title: 'La última canción', subtitle: 'Que el mundo siga esperando', category: 'cinematic' },
];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const grid = document.querySelector('#film-grid');
grid.innerHTML = films.map(film => `<article class="film-card" data-category="${film.category}"><button class="film-visual" data-film="${film.id}" aria-label="Reproducir ${film.title}"><img src="/media/film-${film.id}.jpg" alt="${film.subtitle}, un fragmento de boda de Ethan Burst" loading="lazy" width="2048" height="1152"><video muted loop playsinline preload="none" data-src="/media/film-${film.id}.mp4" aria-hidden="true" tabindex="-1"></video><span class="film-number">0${film.id} /</span><span class="film-format">${film.category === 'super8' ? 'SUPER 8' : 'CINEMATIC'}</span><span class="film-play">▶<span>VER FILM</span></span><span class="film-corner">↗</span></button><div class="film-info"><div><h3>${film.title}</h3><p>${film.subtitle}</p></div><span class="film-info-index">(0${film.id})</span></div></article>`).join('');

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
  let count = 0;
  document.querySelectorAll('.film-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; else card.querySelector('video').pause(); });
  document.querySelector('.film-count').textContent = `(0${count})`;
  document.querySelector('#filter-status').textContent = `${count} películas visibles`;
}));

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
menuToggle.addEventListener('click', () => { mobileNav.hidden = !mobileNav.hidden; menuToggle.setAttribute('aria-expanded', String(!mobileNav.hidden)); });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); } });

const heroVideo = document.querySelector('.hero-video');
const motionToggle = document.querySelector('#motion-toggle');
let backgroundEnabled = !reducedMotion.matches && !navigator.connection?.saveData;
function updateMotionLabel() { motionToggle.textContent = heroVideo.paused ? 'Reproducir fondo ▷' : 'Pausar fondo Ⅱ'; motionToggle.setAttribute('aria-label', heroVideo.paused ? 'Reproducir vídeo de fondo' : 'Pausar vídeo de fondo'); }
async function playBackground() { if (!heroVideo.getAttribute('src')) heroVideo.src = '/media/film-3.mp4'; try { await heroVideo.play(); } catch { /* The poster remains visible if autoplay is blocked. */ } updateMotionLabel(); }
motionToggle.addEventListener('click', () => { backgroundEnabled = heroVideo.paused; if (backgroundEnabled) playBackground(); else heroVideo.pause(); });
heroVideo.addEventListener('play', updateMotionLabel);
heroVideo.addEventListener('pause', updateMotionLabel);
const heroObserver = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && backgroundEnabled && !document.hidden && !dialog.open) playBackground(); else heroVideo.pause(); }, { threshold: .1 });
const dialog = document.querySelector('#film-dialog');
heroObserver.observe(heroVideo);
reducedMotion.addEventListener('change', event => { if (event.matches) { backgroundEnabled = false; heroVideo.pause(); document.querySelectorAll('.film-visual video').forEach(video => video.pause()); } });

document.querySelectorAll('.film-visual').forEach(button => {
  const video = button.querySelector('video');
  const preview = async () => { if (reducedMotion.matches || navigator.connection?.saveData) return; if (!video.src) video.src = video.dataset.src; try { await video.play(); } catch { /* Keep the image when a preview cannot play. */ } };
  button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') preview(); });
  button.addEventListener('pointerleave', () => { video.pause(); button.classList.remove('previewing'); });
  button.addEventListener('blur', () => { video.pause(); button.classList.remove('previewing'); });
  video.addEventListener('playing', () => { if (button.matches(':hover')) button.classList.add('previewing'); else video.pause(); });
});

const player = document.querySelector('#film-player');
document.querySelectorAll('[data-film]').forEach(button => button.addEventListener('click', () => {
  const film = films.find(item => item.id === Number(button.dataset.film));
  document.querySelector('#dialog-title').textContent = film.title;
  document.querySelector('#dialog-format').textContent = `${film.category === 'super8' ? 'SUPER 8' : 'CINEMATIC'} / FRAGMENTO 0${film.id}`;
  document.querySelector('#video-error').hidden = true;
  document.querySelector('#video-download').href = `/media/film-${film.id}.mp4`;
  player.poster = `/media/film-${film.id}.jpg`;
  player.src = `/media/film-${film.id}.mp4`;
  document.querySelectorAll('video').forEach(video => video.pause());
  dialog.showModal(); document.body.classList.add('modal-open');
  player.play().catch(() => {});
}));
document.querySelector('#close-film').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); player.load(); document.body.classList.remove('modal-open'); if (backgroundEnabled && heroVideo.getBoundingClientRect().bottom > 0) playBackground(); });
player.addEventListener('error', () => { if (player.getAttribute('src')) document.querySelector('#video-error').hidden = false; });
document.querySelector('#film-contact').addEventListener('click', () => dialog.close());
document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause()); else if (backgroundEnabled && !dialog.open && heroVideo.getBoundingClientRect().bottom > 0) playBackground(); });

document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const date = new Date(`${data.get('date')}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  document.querySelector('#inquiry-text').value = `¡Hola, Ethan!\n\nSomos ${data.get('names')}.\nEmail: ${data.get('email')}\nFecha: ${date}\nLugar: ${data.get('location')}\n\n${data.get('story')}\n\nNos gustaría conocer tu disponibilidad y propuesta. ¡Gracias!`;
  document.querySelector('#inquiry-result').hidden = false;
  document.querySelector('#copy-status').textContent = '';
  document.querySelector('#inquiry-text').focus();
});
document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  const text = document.querySelector('#inquiry-text');
  try { await navigator.clipboard.writeText(text.value); document.querySelector('#copy-status').textContent = 'Texto copiado. Puedes pegarlo en el formulario de Ethan.'; }
  catch { text.focus(); text.select(); document.querySelector('#copy-status').textContent = 'Selecciona y copia el texto con Ctrl+C o ⌘C.'; }
});
document.querySelector('#year').textContent = new Date().getFullYear();
