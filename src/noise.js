// Ruido blanco sintetizado con Web Audio. No hay archivos de audio: todo se genera en el navegador.
// Cada "voz" es un colchón de ruido filtrado con envolvente propia: el siseo de la cámara al cambiar
// de vista, el arranque del proyector al abrir un corto y el corte seco al cerrarlo.
const STORAGE_KEY = 'ethan:sonido';
const listeners = new Set();

let ctx = null;
let master = null;
let noise = null;
let booted = false;
let enabled = read();

function read() {
  try { return localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { return true; }
}
function write(value) {
  try { localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off'); } catch { /* Modo privado: la preferencia solo dura la sesión. */ }
}

// El contexto se crea perezosamente: los navegadores solo lo permiten tras un gesto del usuario.
// Si el entorno lo bloquea, `booted` evita reintentarlo en cada interacción y la web sigue en silencio.
function boot() {
  if (ctx || booted) return ctx;
  booted = true;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = .55;
    master.connect(ctx.destination);
    const frames = Math.floor(ctx.sampleRate * 2);
    noise = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  } catch {
    ctx = null;
  }
  return ctx;
}

function hiss({ duration = .5, peak = .2, type = 'bandpass', from = 1800, to = 700, q = .7, attack = .012 }) {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  source.playbackRate.value = .85 + Math.random() * .3;

  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  filter.frequency.setValueAtTime(from, now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(to, 40), now + duration);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);

  source.connect(filter).connect(gain).connect(master);
  source.start(now);
  source.stop(now + duration + .05);
}

function rumble({ duration = .6, peak = .12, frequency = 52 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(frequency * .55, now + duration);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + .05);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + duration + .05);
}

function voice(play) {
  return () => {
    if (!enabled || !boot()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => { /* Sin gesto previo no suena: no es un error. */ });
    try { play(); } catch { /* Si el grafo falla, la web sigue funcionando en silencio. */ }
    ping();
  };
}

function ping() {
  for (const listener of listeners) listener({ enabled, hot: true });
  clearTimeout(ping.timer);
  ping.timer = setTimeout(() => { for (const listener of listeners) listener({ enabled, hot: false }); }, 420);
}

export const sound = {
  get enabled() { return enabled; },
  set enabled(value) {
    enabled = Boolean(value);
    write(enabled);
    if (enabled && boot() && ctx.state === 'suspended') ctx.resume().catch(() => {});
    for (const listener of listeners) listener({ enabled, hot: false });
  },
  toggle() { this.enabled = !enabled; return enabled; },
  subscribe(listener) { listeners.add(listener); listener({ enabled, hot: false }); return () => listeners.delete(listener); },

  // Cambio de vista: barrido de ruido blanco, como una cámara que corta.
  cut: voice(() => { hiss({ duration: .62, peak: .24, from: 2600, to: 420, q: .6 }); rumble({ duration: .4, peak: .07, frequency: 68 }); }),
  // El proyector arrancando antes de un corto.
  projector: voice(() => { hiss({ duration: .9, peak: .16, type: 'lowpass', from: 1100, to: 380, q: 1 }); rumble({ duration: .9, peak: .13, frequency: 46 }); }),
  // Cierre: un golpe corto y seco.
  slam: voice(() => { hiss({ duration: .16, peak: .22, type: 'highpass', from: 900, to: 2400, q: .5 }); rumble({ duration: .22, peak: .1, frequency: 90 }); }),
  // Roce de cinta para microinteracciones.
  tape: voice(() => hiss({ duration: .09, peak: .05, type: 'highpass', from: 2200, to: 5200, q: .4, attack: .004 })),
};
