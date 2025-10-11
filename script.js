// 💕 Corazones flotando
const hearts = document.getElementById('hearts');
function makeHeart() {
  const h = document.createElement('div'); h.className = 'heart';
  const size = Math.random() * 12 + 8; h.style.width = h.style.height = size + 'px';
  h.style.left = Math.random() * 100 + 'vw'; h.style.bottom = '-20px';

  // 🔽 lee el tono desde CSS (varía con el mood)
  const hue = getComputedStyle(document.documentElement)
    .getPropertyValue('--heart-hue')
    .trim() || '345';
  h.style.background = `hsl(${hue},80%,${65 + Math.random() * 10}%)`;

  h.style.setProperty('--dur', 10 + Math.random() * 8 + 's');
  hearts.appendChild(h); setTimeout(() => h.remove(), 15000);
}
setInterval(makeHeart, 400);

// 💕 Fechas base
const metDate = new Date('2025-07-16T00:00:00'); // nos conocimos (no se usa, pero se mantiene)
const startDate = new Date('2025-09-07T00:00:00'); // novios

// 🔢 Días como novios
function updateDaysTogether() {
  const now = new Date();
  const days = Math.floor((now - startDate) / 86400000);
  const el = document.getElementById('daysTogether');
  if (el) el.textContent = days >= 0 ? days : 0;
}

// ⏱️ Duración exacta (años, meses, días)
function updateRelationshipDuration() {
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }

  const yearsText = years > 0 ? `${years} año${years > 1 ? 's' : ''}` : '';
  const monthsText = months > 0 ? `${months} mes${months > 1 ? 'es' : ''}` : '';
  const daysText = days > 0 ? `${days} día${days > 1 ? 's' : ''}` : '';
  const parts = [yearsText, monthsText, daysText].filter(Boolean).join(', ');
  const result = parts || 'recién comenzamos 💞';
  document.getElementById('relationshipDuration').innerHTML = `Llevamos juntos <strong>${result}</strong> 💖`;
}

// 🗓️ Utilidades de fechas
const fmt = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
function addMonthsKeepDay(d, m) { const x = new Date(d); x.setMonth(x.getMonth() + m); x.setDate(d.getDate()); return x; }

// 🎯 Próximo hito mensual SIN saltar al siguiente mes por error
function nextMonthlyMilestone(now) {
  const mCand = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  let candidate = addMonthsKeepDay(startDate, Math.max(0, mCand));
  if (sameDay(now, candidate)) {
    return { mode: 'today', date: candidate, number: mCand }; // hoy es el hito
  }
  if (now < candidate) {
    return { mode: 'upcoming', date: candidate, number: mCand }; // falta para el hito mCand
  }
  const nxt = addMonthsKeepDay(startDate, Math.max(0, mCand + 1));
  return { mode: 'upcoming', date: nxt, number: mCand + 1 }; // siguiente hito
}

// ⏳ Render del contador mensual + aniversarios
function updateMonthCounter() {
  const now = new Date();
  const info = nextMonthlyMilestone(now);
  const el = document.getElementById('monthCounter');
  if (!el) return;

  if (info.mode === 'today') {
    if (info.number > 0 && info.number % 12 === 0) {
      const years = info.number / 12;
      el.innerHTML = `🎉 ¡Feliz aniversario número ${years}! (${fmt(info.date)}) 💖✨`;
    } else if (info.number > 0) {
      el.innerHTML = `¡Feliz mes número ${info.number}! (${fmt(info.date)}) ✨`;
    } else {
      el.innerHTML = `💫 ¡Hoy empezamos oficialmente! (${fmt(info.date)})`;
    }
    return;
  }

  const diff = info.date - now;
  const s = Math.floor(diff / 1000);
  const dd = Math.floor(s / 86400);
  const hh = Math.floor((s % 86400) / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;

  const label = (info.number > 0 && info.number % 12 === 0)
    ? `aniversario número ${info.number / 12}`
    : `${info.number}° mes`;

  el.innerHTML = `Faltan <strong>${dd}</strong>d <strong>${String(hh).padStart(2, '0')}</strong>h <strong>${String(mm).padStart(2, '0')}</strong>m <strong>${String(ss).padStart(2, '0')}</strong>s para nuestro <strong>${label}</strong> (${fmt(info.date)}) ✨`;
}

// 🔗 Navegación suave
document.getElementById('goTimeline').onclick = () => document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
document.getElementById('goLetter').onclick = () => document.getElementById('carta').scrollIntoView({ behavior: 'smooth' });

// ▶️ Audio básico
const audio = document.getElementById('audio');
if (audio) {
  const loopBtn = document.getElementById('toggleLoop');
  const muteBtn = document.getElementById('muteBtn');
  loopBtn.onclick = () => { audio.loop = !audio.loop; loopBtn.textContent = 'Loop: ' + (audio.loop ? 'on' : 'off'); };
  muteBtn.onclick = () => { audio.muted = !audio.muted; muteBtn.textContent = audio.muted ? 'Activar sonido' : 'Silenciar'; };
}

// 🔊 Autoplay amigable (sin tocar tu <audio>)
const enableBtn = document.getElementById('enableSound');
async function tryAutoplay() {
  if (!audio) return;
  audio.volume = 0.0;      // empieza suave
  audio.muted = true;     // necesario para permitir autoplay en muchos navegadores
  try {
    await audio.play();     // intento de autoplay silencioso
    const unlock = () => {
      audio.muted = false;
      const sv = parseFloat(localStorage.getItem('amor_volume'));
      const target = isNaN(sv) ? 0.6 : sv;   // si no hay guardado, 0.6
      fadeVolume(target);                     // usa tu función fadeVolume existente
      // Si prefieres tu nueva función suave:
      // fadeVolumeTo(audio, target, 500);

      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    };
  } catch (err) {
    if (enableBtn) { enableBtn.classList.add('onscreen'); }
  }
}
function fadeVolume(target = 0.6, step = 0.05, interval = 80) {
  try { audio.volume = Math.max(0, Math.min(1, audio.volume)); } catch (e) { }
  const timer = setInterval(() => {
    const next = (audio.volume || 0) + step;
    audio.volume = next;
    if (next >= target) { clearInterval(timer); audio.volume = target; }
  }, interval);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryAutoplay);
} else {
  tryAutoplay();
}
enableBtn && enableBtn.addEventListener('click', async () => {
  try {
    audio.muted = false;
    if (audio.paused) await audio.play();
    const sv = parseFloat(localStorage.getItem('amor_volume'));
    const target = isNaN(sv) ? 0.6 : sv;
    fadeVolume(target);                   // o: fadeVolumeTo(audio, target, 500);
    enableBtn.classList.remove('onscreen');
  } catch (e) { }
});

// ⏱️ Intervalos
function tickAll() { updateMonthCounter(); updateRelationshipDuration(); updateDaysTogether(); }
tickAll();
setInterval(tickAll, 1000);
// =========================
//   MODO OSCURO
// =========================
(function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const KEY = 'amor_theme';
  const apply = (mode) => {
    if (mode === 'dark') { document.body.classList.add('dark'); btn.textContent = '☀️ Modo claro'; }
    else { document.body.classList.remove('dark'); btn.textContent = '🌙 Modo oscuro'; }
    localStorage.setItem(KEY, mode);
  };
  const saved = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved ? saved : (prefersDark ? 'dark' : 'light'));
  btn.addEventListener('click', () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    apply(next);
  });
})();

// =========================
//   SELECTOR DE CANCIONES
// =========================
(function initSongSelector() {
  const select = document.getElementById('songSelect');
  const audio = document.getElementById('audio');
  if (!select || !audio) return;

  // ===== Persistencia keys =====
  const VOL_KEY = 'amor_volume';
  const LOOP_KEY = 'amor_loop';
  const MOOD_KEY = 'amor_mood';
  const SONG_KEY = 'amor_song';

  // ===== Preferencias guardadas =====
  const savedVolume = (() => {
    const v = parseFloat(localStorage.getItem(VOL_KEY));
    return isNaN(v) ? 0.6 : Math.min(1, Math.max(0, v));
  })();
  const savedLoop = localStorage.getItem(LOOP_KEY) === 'true';

  // === Aplicar loop/volumen guardados y persistir cambios ===
  // Loop
  audio.loop = savedLoop;
  const loopBtn = document.getElementById('toggleLoop');
  if (loopBtn) {
    loopBtn.textContent = 'Loop: ' + (audio.loop ? 'on' : 'off');
    loopBtn.onclick = () => {
      audio.loop = !audio.loop;
      loopBtn.textContent = 'Loop: ' + (audio.loop ? 'on' : 'off');
      localStorage.setItem(LOOP_KEY, audio.loop);
    };
  }

  // Volumen inicial + persistencia
  audio.volume = savedVolume;
  audio.addEventListener('volumechange', () => {
    if (!audio.muted) {
      localStorage.setItem(VOL_KEY, (audio.volume || 0).toFixed(2));
    }
  });
  // ==== Slider de volumen (link real con <audio>)
  const volRange = document.getElementById('volRange');
  const volPct = document.getElementById('volPct');

  if (volRange && volPct) {
    // iniciar con el volumen actual del audio (ya pusimos savedVolume arriba)
    const initPct = Math.round((audio.muted ? 0 : audio.volume) * 100);
    volRange.value = initPct;
    volPct.textContent = initPct + '%';

    // Cambios desde el slider -> afectan al audio y se guardan
    volRange.addEventListener('input', () => {
      const v = Math.max(0, Math.min(100, parseInt(volRange.value || '0', 10)));
      const f = v / 100;
      audio.muted = false;
      audio.volume = f;
      volPct.textContent = v + '%';
      localStorage.setItem('amor_volume', f.toFixed(2));
    });

    // Cambios desde el control nativo del <audio> -> reflejar en slider
    audio.addEventListener('volumechange', () => {
      const v = Math.round((audio.volume || 0) * 100);
      volRange.value = v;
      volPct.textContent = v + '%';
    });
  }


  // ===== Moods =====
  function applyMood(mood) {
    document.body.classList.remove('mood-romantica', 'mood-bachata', 'mood-chill');
    if (mood) {
      document.body.classList.add(`mood-${mood}`);
      localStorage.setItem(MOOD_KEY, mood);
    }
  }

  // ===== Efectos de volumen =====
  function fadeVolumeTo(el, target = 0.6, duration = 500) {
    target = Math.min(1, Math.max(0, target));
    const start = el.volume || 0;
    const diff = target - start;
    const steps = Math.max(1, Math.floor(duration / 40));
    let n = 0;
    return new Promise(res => {
      const timer = setInterval(() => {
        n++;
        el.volume = start + (diff * (n / steps));
        if (n >= steps) { clearInterval(timer); el.volume = target; res(); }
      }, 40);
    });
  }

  async function crossfadeTo(el, newSrc, targetVol = savedVolume, fade = 500) {
    try {
      await fadeVolumeTo(el, 0.0, fade);   // fade out
      el.src = newSrc;
      el.load();
      try { await el.play(); } catch (_) { }
      await fadeVolumeTo(el, targetVol, fade); // fade in
    } catch (_) { }
  }

  // ===== Lista de canciones =====
  const tracks = [
    { name: 'Nuestra canción', src: '/cancion/cancion.mp3', mood: 'romantica' },
    { name: 'Me recuerda a ti', src: '/cancion/me-recuerda-a-ti.mp3', mood: 'chill' },
    { name: 'Cuando te conocí', src: '/cancion/cuando-te-conoci.mp3', mood: 'romantica' },
  ];

  // Poblar <select>
  select.innerHTML = '';
  tracks.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.src;
    opt.textContent = t.name;
    select.appendChild(opt);
  });

  // Cargar último mood si existe
  const lastMood = localStorage.getItem(MOOD_KEY);
  if (lastMood) applyMood(lastMood);

  // Helper: mood por src
  function moodFor(src) {
    const t = tracks.find(x => x.src === src);
    return t ? t.mood : null;
  }

  // Estado inicial (última canción válida o la primera)
  const savedSong = localStorage.getItem(SONG_KEY);
  select.value = (savedSong && tracks.some(t => t.src === savedSong))
    ? savedSong
    : tracks[0].src;

  // setTrack: mood + crossfade + persistencia
  async function setTrack(src) {
    applyMood(moodFor(src));
    const sv = parseFloat(localStorage.getItem('amor_volume'));
    const target = isNaN(sv) ? (audio.volume || 0.6) : sv;
    await crossfadeTo(audio, src, target, 500);
    localStorage.setItem('amor_song', src);
  }

  // Inicializar
  setTrack(select.value);

  // Al cambiar en el selector
  select.addEventListener('change', () => setTrack(select.value));
})();
// =========================
//   GALERÍA: filtros + lightbox (con videos)
// =========================
(function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return; // solo corre en galeria.html

  const chips = document.getElementById('filterChips');
  const items = Array.from(grid.querySelectorAll('.gitem'));
  let current = -1; // índice del visible activo en lightbox

  // ---- filtros
  if (chips) {
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip'); if (!btn) return;
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      items.forEach(it => {
        const tags = (it.dataset.tags || '').split(',').map(s => s.trim());
        const show = (f === '*') || tags.includes(f);
        it.style.display = show ? '' : 'none';
      });
    });
  }

  // ---- lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbVideo = document.getElementById('lbVideo');
  const lbCap = document.getElementById('lbCap');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbClose = document.getElementById('lbClose');

  function visibles() {
    return items.filter(it => it.style.display !== 'none');
  }
  function isVideo(node) {
    return (node?.dataset?.type || '').toLowerCase() === 'video';
  }
  function showImage(node) {
    const img = node.querySelector('img');
    lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.style.display = 'none';
    lbImg.style.display = 'block';
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
  }
  function showVideo(node) {
    const poster = node.dataset.poster || '';
    const src = node.dataset.src || '';
    lbImg.style.display = 'none';
    lbImg.removeAttribute('src');
    lbVideo.style.display = 'block';
    if (poster) lbVideo.setAttribute('poster', poster); else lbVideo.removeAttribute('poster');
    lbVideo.src = src;
    lbVideo.load();
    // el usuario ya interactuó (click), la mayoría de navegadores lo permiten
    lbVideo.play().catch(() => { /* si no puede autoplay, igual quedan controles */ });
  }

  function openAt(idx) {
    const vis = visibles(); if (!vis.length) return;
    current = Math.max(0, Math.min(idx, vis.length - 1));
    const node = vis[current];
    if (isVideo(node)) showVideo(node); else showImage(node);
    lbCap.textContent = node.querySelector('figcaption')?.textContent || '';
    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden', 'false');
  }
  function closeLB() {
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden', 'true');
    // detener video si estaba reproduciéndose
    try { lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); } catch (_) { }
    current = -1;
  }
  function showDir(dir) {
    const vis = visibles(); if (!vis.length) return;
    current = (current + dir + vis.length) % vis.length;
    const node = vis[current];
    if (isVideo(node)) showVideo(node); else showImage(node);
    lbCap.textContent = node.querySelector('figcaption')?.textContent || '';
  }

  // abrir con click en tarjeta
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.gitem'); if (!card || card.style.display === 'none') return;
    const vis = visibles();
    const idx = vis.indexOf(card);
    openAt(idx);
  });

  // controles
  lbClose.addEventListener('click', closeLB);
  lbPrev.addEventListener('click', () => showDir(-1));
  lbNext.addEventListener('click', () => showDir(+1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });

  // teclado
  window.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') showDir(-1);
    if (e.key === 'ArrowRight') showDir(+1);
  }, { passive: true });
})();
// =========================
//   GALERÍA: filtros + lightbox + subida Cloudinary
// =========================
(function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return; // solo corre en galeria.html

  // ----- Filtros
  const chips = document.getElementById('filterChips');
  const items = () => Array.from(grid.querySelectorAll('.gitem'));
  if (chips) {
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip'); if (!btn) return;
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      items().forEach(it => {
        const tags = (it.dataset.tags || '').split(',').map(s => s.trim());
        const show = (f === '*') || tags.includes(f);
        it.style.display = show ? '' : 'none';
      });
    });
  }

  // ----- Lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbVideo = document.getElementById('lbVideo');
  const lbCap = document.getElementById('lbCap');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbClose = document.getElementById('lbClose');
  let current = -1;

  const visibles = () => items().filter(it => it.style.display !== 'none');
  const isVideo = (node) => (node?.dataset?.type || '').toLowerCase() === 'video';

  function showImage(node) {
    const img = node.querySelector('img');
    lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.style.display = 'none';
    lbImg.style.display = 'block';
    lbImg.src = img.src; lbImg.alt = img.alt || '';
  }
  function showVideo(node) {
    const poster = node.dataset.poster || '';
    const src = node.dataset.src || '';
    lbImg.style.display = 'none'; lbImg.removeAttribute('src');
    lbVideo.style.display = 'block';
    if (poster) lbVideo.setAttribute('poster', poster); else lbVideo.removeAttribute('poster');
    lbVideo.src = src; lbVideo.load();
    lbVideo.play().catch(() => { });
  }
  function openAt(idx) {
    const vis = visibles(); if (!vis.length) return;
    current = Math.max(0, Math.min(idx, vis.length - 1));
    const node = vis[current];
    if (isVideo(node)) showVideo(node); else showImage(node);
    lbCap.textContent = node.querySelector('figcaption')?.textContent || '';
    lb.classList.remove('hidden'); lb.setAttribute('aria-hidden', 'false');
  }
  function closeLB() {
    lb.classList.add('hidden'); lb.setAttribute('aria-hidden', 'true');
    try { lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); } catch (_) { }
    current = -1;
  }
  function showDir(dir) {
    const vis = visibles(); if (!vis.length) return;
    current = (current + dir + vis.length) % vis.length;
    const node = vis[current];
    if (isVideo(node)) showVideo(node); else showImage(node);
    lbCap.textContent = node.querySelector('figcaption')?.textContent || '';
  }

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.gitem'); if (!card || card.style.display === 'none') return;
    const vis = visibles();
    const idx = vis.indexOf(card);
    openAt(idx);
  });
  lbClose.addEventListener('click', closeLB);
  lbPrev.addEventListener('click', () => showDir(-1));
  lbNext.addEventListener('click', () => showDir(+1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  window.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') showDir(-1);
    if (e.key === 'ArrowRight') showDir(+1);
  }, { passive: true });

  // ----- Uploader (Cloudinary unsigned, endpoint 'auto')
  const uplForm = document.getElementById('uplForm');
  const uplInput = document.getElementById('uplInput');
  const uplBtn = document.getElementById('uplBtn');

  // ⚠️ Rellena con tus valores reales
  const CLOUD_NAME = 'TU_CLOUD_NAME';
  const UPLOAD_PRESET = 'TU_UPLOAD_PRESET';

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  // Helper: crear <figure> y añadirlo al grid
  function appendMediaToGrid({ url, type, caption, poster }) {
    const fig = document.createElement('figure');
    fig.className = 'gitem';
    fig.dataset.tags = type === 'video' ? 'videos' : 'nosotros';

    if (type === 'video') {
      fig.dataset.type = 'video';
      fig.dataset.src = url;
      fig.dataset.poster = poster || '';
      const img = document.createElement('img');
      img.src = poster || (url + '#t=0.1');
      img.alt = caption || 'Video'; img.loading = 'lazy';
      fig.appendChild(img);
    } else {
      const img = document.createElement('img');
      img.src = url; img.alt = caption || 'Foto'; img.loading = 'lazy';
      fig.appendChild(img);
    }
    const fc = document.createElement('figcaption');
    fc.textContent = caption || (type === 'video' ? 'Nuevo video' : 'Nueva foto');
    fig.appendChild(fc);

    grid.prepend(fig); // al inicio
  }

  if (uplBtn && uplInput) {
    uplBtn.addEventListener('click', () => uplInput.click());
    uplInput.addEventListener('change', async () => {
      const files = Array.from(uplInput.files || []);
      if (!files.length) return;

      for (const file of files) {
        const okType = /^(image\/(jpeg|png|webp|gif)|video\/mp4)$/i;
        if (!okType.test(file.type)) { alert('Formato no permitido'); continue; }
        if (file.size > 10 * 1024 * 1024) { alert('Máximo 10MB'); continue; }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        // Si no pusiste folder en el preset:
        // formData.append('folder', 'galeria');

        uplBtn.disabled = true; const prevLabel = uplBtn.textContent;
        uplBtn.textContent = 'Subiendo...';
        try {
          const res = await fetch(endpoint, { method: 'POST', body: formData });
          if (!res.ok) throw new Error('Error subiendo');
          const data = await res.json();

          const isVideo = data.resource_type === 'video';
          const entry = {
            url: data.secure_url,
            type: isVideo ? 'video' : 'image',
            caption: file.name,
            poster: data.thumbnail_url || (isVideo ? data.secure_url + '#t=0.1' : '')
          };
          appendMediaToGrid(entry);
        } catch (err) {
          console.error(err);
          alert('No se pudo subir. Intenta de nuevo.');
        } finally {
          uplBtn.disabled = false; uplBtn.textContent = prevLabel;
        }
      }
      uplInput.value = '';
    });
  }
})();
