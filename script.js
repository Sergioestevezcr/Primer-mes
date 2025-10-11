// Ejecuta TODO el script cuando el DOM esté listo (evita null/undefined)
window.addEventListener("DOMContentLoaded", () => {

  // 💕 Corazones flotando
  const hearts = document.getElementById('hearts');
  function makeHeart() {
    const h = document.createElement('div'); h.className = 'heart';
    const size = Math.random() * 12 + 8; h.style.width = h.style.height = size + 'px';
    h.style.left = Math.random() * 100 + 'vw'; h.style.bottom = '-20px';
    const hue = getComputedStyle(document.documentElement).getPropertyValue('--heart-hue').trim() || '345';
    h.style.background = `hsl(${hue},80%,${65 + Math.random() * 10}%)`;
    h.style.setProperty('--dur', 10 + Math.random() * 8 + 's');
    hearts && hearts.appendChild(h);
    setTimeout(() => h.remove(), 15000);
  }
  setInterval(makeHeart, 400);

  // 💕 Fechas base
  const metDate = new Date('2025-07-16T00:00:00');
  const startDate = new Date('2025-09-07T00:00:00');

  // 🔢 Días juntos
  function updateDaysTogether() {
    const el = document.getElementById('daysTogether');
    if (!el) return;
    const now = new Date();
    const days = Math.floor((now - startDate) / 86400000);
    el.textContent = days >= 0 ? days : 0;
  }

  // ⏱️ Duración relación
  function updateRelationshipDuration() {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    if (days < 0) { const prev = new Date(now.getFullYear(), now.getMonth(), 0); days += prev.getDate(); months--; }
    if (months < 0) { months += 12; years--; }
    const y = years > 0 ? `${years} año${years > 1 ? 's' : ''}` : '';
    const m = months > 0 ? `${months} mes${months > 1 ? 'es' : ''}` : '';
    const d = days > 0 ? `${days} día${days > 1 ? 's' : ''}` : '';
    const txt = [y, m, d].filter(Boolean).join(', ') || 'recién comenzamos 💞';
    const el = document.getElementById('relationshipDuration');
    if (el) el.innerHTML = `Llevamos juntos <strong>${txt}</strong> 💖`;
  }

  // 🗓️ Utilidades de fechas y contador mensual
  const fmt = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const addMonthsKeepDay = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); x.setDate(d.getDate()); return x; };
  function nextMonthlyMilestone(now) {
    const mCand = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    let candidate = addMonthsKeepDay(startDate, Math.max(0, mCand));
    if (sameDay(now, candidate)) return { mode: 'today', date: candidate, number: mCand };
    if (now < candidate) return { mode: 'upcoming', date: candidate, number: mCand };
    const nxt = addMonthsKeepDay(startDate, Math.max(0, mCand + 1));
    return { mode: 'upcoming', date: nxt, number: mCand + 1 };
  }
  function updateMonthCounter() {
    const el = document.getElementById('monthCounter'); if (!el) return;
    const now = new Date(); const info = nextMonthlyMilestone(now);
    if (info.mode === 'today') {
      if (info.number > 0 && info.number % 12 === 0) {
        el.innerHTML = `🎉 ¡Feliz aniversario número ${info.number / 12}! (${fmt(info.date)}) 💖✨`;
      } else if (info.number > 0) {
        el.innerHTML = `¡Feliz mes número ${info.number}! (${fmt(info.date)}) ✨`;
      } else {
        el.innerHTML = `💫 ¡Hoy empezamos oficialmente! (${fmt(info.date)})`;
      }
      return;
    }
    const s = Math.floor((info.date - now) / 1000);
    const dd = Math.floor(s / 86400), hh = Math.floor((s % 86400) / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
    const label = (info.number > 0 && info.number % 12 === 0) ? `aniversario número ${info.number / 12}` : `${info.number}° mes`;
    el.innerHTML = `Faltan <strong>${dd}</strong>d <strong>${String(hh).padStart(2, '0')}</strong>h <strong>${String(mm).padStart(2, '0')}</strong>m <strong>${String(ss).padStart(2, '0')}</strong>s para nuestro <strong>${label}</strong> (${fmt(info.date)}) ✨`;
  }

  // 🔗 Scroll suave
  const go = id => { const el = document.getElementById(id); el && el.scrollIntoView({ behavior: 'smooth' }); };
  const goTimeline = document.getElementById('goTimeline'); if (goTimeline) goTimeline.onclick = () => go('timeline');
  const goLetter = document.getElementById('goLetter'); if (goLetter) goLetter.onclick = () => go('carta');

  // ▶️ Audio básico + botones
  const audio = document.getElementById('audio');
  if (audio) {
    const loopBtn = document.getElementById('toggleLoop');
    const muteBtn = document.getElementById('muteBtn');
    if (loopBtn) loopBtn.onclick = () => { audio.loop = !audio.loop; loopBtn.textContent = 'Loop: ' + (audio.loop ? 'on' : 'off'); };
    if (muteBtn) muteBtn.onclick = () => { audio.muted = !audio.muted; muteBtn.textContent = audio.muted ? 'Activar sonido' : 'Silenciar'; };
  }

  // 🔊 Autoplay amigable
  const enableBtn = document.getElementById('enableSound');
  function fadeVolume(target = 0.6, step = 0.05, interval = 80) {
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, audio.volume || 0));
    const t = setInterval(() => { const next = (audio.volume || 0) + step; audio.volume = next; if (next >= target) { clearInterval(t); audio.volume = target; } }, interval);
  }
  async function tryAutoplay() {
    if (!audio) return;
    audio.volume = 0.0; audio.muted = true;
    try {
      await audio.play();
      const unlock = () => { audio.muted = false; const sv = parseFloat(localStorage.getItem('amor_volume')); fadeVolume(isNaN(sv) ? 0.6 : sv); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    } catch { enableBtn && enableBtn.classList.add('onscreen'); }
  }
  tryAutoplay();
  enableBtn && enableBtn.addEventListener('click', async () => {
    try { audio.muted = false; if (audio.paused) await audio.play(); const sv = parseFloat(localStorage.getItem('amor_volume')); fadeVolume(isNaN(sv) ? 0.6 : sv); enableBtn.classList.remove('onscreen'); } catch { }
  });

  // ⏱️ Intervalos de contadores
  function tickAll() { updateMonthCounter(); updateRelationshipDuration(); updateDaysTogether(); }
  tickAll();
  setInterval(tickAll, 1000);

  // =========================
  //   SELECTOR DE CANCIONES
  // =========================
  (function initSongSelector() {
    const select = document.getElementById('songSelect');
    const audio = document.getElementById('audio');
    if (!select || !audio) return;

    // 💾 Claves
    const VOL_KEY = 'amor_volume', LOOP_KEY = 'amor_loop', MOOD_KEY = 'amor_mood', SONG_KEY = 'amor_song';

    // Preferencias guardadas
    const savedVolume = (() => { const v = parseFloat(localStorage.getItem(VOL_KEY)); return isNaN(v) ? 0.6 : Math.min(1, Math.max(0, v)); })();
    const savedLoop = localStorage.getItem(LOOP_KEY) === 'true';

    // Aplica loop/volumen
    audio.loop = savedLoop;
    const loopBtn = document.getElementById('toggleLoop');
    if (loopBtn) {
      loopBtn.textContent = 'Loop: ' + (audio.loop ? 'on' : 'off');
      loopBtn.onclick = () => { audio.loop = !audio.loop; loopBtn.textContent = 'Loop: ' + (audio.loop ? 'on' : 'off'); localStorage.setItem(LOOP_KEY, audio.loop); };
    }
    audio.volume = savedVolume;
    const volRange = document.getElementById('volRange');
    const volPct = document.getElementById('volPct');
    if (volRange && volPct) {
      const initPct = Math.round((audio.muted ? 0 : audio.volume) * 100);
      volRange.value = initPct; volPct.textContent = initPct + '%';
      volRange.addEventListener('input', () => {
        const v = Math.max(0, Math.min(100, parseInt(volRange.value || '0', 10)));
        const f = v / 100; audio.muted = false; audio.volume = f; volPct.textContent = v + '%'; localStorage.setItem(VOL_KEY, f.toFixed(2));
      });
      audio.addEventListener('volumechange', () => { const v = Math.round((audio.volume || 0) * 100); volRange.value = v; volPct.textContent = v + '%'; if (!audio.muted) localStorage.setItem(VOL_KEY, (audio.volume || 0).toFixed(2)); });
    }

    // Moods
    function applyMood(mood) {
      document.body.classList.remove('mood-romantica', 'mood-bachata', 'mood-chill');
      if (mood) { document.body.classList.add(`mood-${mood}`); localStorage.setItem(MOOD_KEY, mood); }
    }

    async function fadeVolumeTo(el, target = 0.6, duration = 500) {
      target = Math.min(1, Math.max(0, target)); const start = el.volume || 0; const diff = target - start; const steps = Math.max(1, Math.floor(duration / 40));
      let n = 0; return new Promise(res => { const t = setInterval(() => { n++; el.volume = start + (diff * (n / steps)); if (n >= steps) { clearInterval(t); el.volume = target; res(); } }, 40); });
    }
    async function crossfadeTo(el, newSrc, targetVol = savedVolume, fade = 500) {
      try { await fadeVolumeTo(el, 0.0, fade); el.src = newSrc; el.load(); try { await el.play(); } catch { } await fadeVolumeTo(el, targetVol, fade); } catch { }
    }

    // Lista de canciones
    const tracks = [
      { name: 'Nuestra canción', src: '/cancion/cancion.mp3', mood: 'romantica' },
      { name: 'Me recuerda a ti', src: '/cancion/me-recuerda-a-ti.mp3', mood: 'chill' },
      { name: 'Cuando te conocí', src: '/cancion/cuando-te-conoci.mp3', mood: 'romantica' },
    ];
    select.innerHTML = ''; tracks.forEach(t => { const o = document.createElement('option'); o.value = t.src; o.textContent = t.name; select.appendChild(o); });

    const lastMood = localStorage.getItem(MOOD_KEY); if (lastMood) applyMood(lastMood);
    const moodFor = src => (tracks.find(x => x.src === src)?.mood || null);

    const savedSong = localStorage.getItem(SONG_KEY);
    select.value = (savedSong && tracks.some(t => t.src === savedSong)) ? savedSong : tracks[0].src;

    async function setTrack(src) {
      applyMood(moodFor(src));
      const sv = parseFloat(localStorage.getItem(VOL_KEY));
      const target = isNaN(sv) ? (audio.volume || 0.6) : sv;
      await crossfadeTo(audio, src, target, 500);
      localStorage.setItem(SONG_KEY, src);
    }

    setTrack(select.value);
    select.addEventListener('change', () => setTrack(select.value));
  })();

  // =========================
  //   GALERÍA (Cloudinary + filtros + lightbox + subida)
  // =========================
  (function initGallery() {
    const grid = document.getElementById('galleryGrid'); if (!grid) return;

    // Filtros
    const chips = document.getElementById('filterChips');
    const items = () => Array.from(grid.querySelectorAll('.gitem'));
    chips && chips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip'); if (!btn) return;
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      items().forEach(it => {
        const tags = (it.dataset.tags || '').split(',').map(s => s.trim());
        it.style.display = (f === '*' || tags.includes(f)) ? '' : 'none';
      });
    });

    // Lightbox
    const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'),
      lbVideo = document.getElementById('lbVideo'), lbCap = document.getElementById('lbCap'),
      lbPrev = document.getElementById('lbPrev'), lbNext = document.getElementById('lbNext'),
      lbClose = document.getElementById('lbClose');
    const isVid = node => (node?.dataset?.type || '').toLowerCase() === 'video';
    const visibles = () => items().filter(it => it.style.display !== 'none');
    let current = -1;
    function showImage(node) { const img = node.querySelector('img'); lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.style.display = 'none'; lbImg.style.display = 'block'; lbImg.src = img.src; lbImg.alt = img.alt || ''; }
    function showVideo(node) { const poster = node.dataset.poster || ''; const src = node.dataset.src || ''; lbImg.style.display = 'none'; lbImg.removeAttribute('src'); lbVideo.style.display = 'block'; poster ? lbVideo.setAttribute('poster', poster) : lbVideo.removeAttribute('poster'); lbVideo.src = src; lbVideo.load(); lbVideo.play().catch(() => { }); }
    function openAt(i) { const vis = visibles(); if (!vis.length) return; current = Math.max(0, Math.min(i, vis.length - 1)); const n = vis[current]; isVid(n) ? showVideo(n) : showImage(n); lbCap.textContent = n.querySelector('figcaption')?.textContent || ''; lb.classList.remove('hidden'); lb.setAttribute('aria-hidden', 'false'); }
    function closeLB() { lb.classList.add('hidden'); lb.setAttribute('aria-hidden', 'true'); try { lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); } catch { } current = -1; }
    function move(dir) { const vis = visibles(); if (!vis.length) return; current = (current + dir + vis.length) % vis.length; const n = vis[current]; isVid(n) ? showVideo(n) : showImage(n); lbCap.textContent = n.querySelector('figcaption')?.textContent || ''; }

    grid.addEventListener('click', (e) => { const card = e.target.closest('.gitem'); if (!card || card.style.display === 'none') return; const vis = visibles(); openAt(vis.indexOf(card)); });
    lbClose.addEventListener('click', closeLB); lbPrev.addEventListener('click', () => move(-1)); lbNext.addEventListener('click', () => move(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    window.addEventListener('keydown', (e) => { if (lb.classList.contains('hidden')) return; if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); }, { passive: true });

    // Subida a Cloudinary (usa hardcode o variables expuestas en window)
    const uplInput = document.getElementById('uplInput'), uplBtn = document.getElementById('uplBtn');
    const CLOUD_NAME = window.CLOUD_NAME;
    const UPLOAD_PRESET = window.UPLOAD_PRESET;
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    function appendMedia({ url, type, caption, poster }) {
      const fig = document.createElement('figure'); fig.className = 'gitem'; fig.dataset.tags = type === 'video' ? 'videos' : 'nosotros';
      if (type === 'video') { fig.dataset.type = 'video'; fig.dataset.src = url; fig.dataset.poster = poster || ''; const img = document.createElement('img'); img.src = poster || (url + '#t=0.1'); img.alt = caption || 'Video'; img.loading = 'lazy'; fig.appendChild(img); }
      else { const img = document.createElement('img'); img.src = url; img.alt = caption || 'Foto'; img.loading = 'lazy'; fig.appendChild(img); }
      const fc = document.createElement('figcaption'); fc.textContent = caption || (type === 'video' ? 'Nuevo video' : 'Nueva foto'); fig.appendChild(fc);
      grid.prepend(fig);
    }

    if (uplBtn && uplInput) {
      uplBtn.addEventListener('click', () => uplInput.click());
      uplInput.addEventListener('change', async () => {
        const files = Array.from(uplInput.files || []); if (!files.length) return;
        for (const file of files) {
          const ok = /^(image\/(jpeg|png|webp|gif)|video\/mp4)$/i; if (!ok.test(file.type)) { alert('Formato no permitido'); continue; }
          if (file.size > 10 * 1024 * 1024) { alert('Máximo 10MB'); continue; }
          const form = new FormData(); form.append('file', file); form.append('upload_preset', UPLOAD_PRESET);
          uplBtn.disabled = true; const txt = uplBtn.textContent; uplBtn.textContent = 'Subiendo...';
          try {
            const res = await fetch(endpoint, { method: 'POST', body: form }); if (!res.ok) throw new Error('Error en subida');
            const data = await res.json(); const isVideo = (data.resource_type === 'video');
            appendMedia({ url: data.secure_url, type: isVideo ? 'video' : 'image', caption: file.name, poster: data.thumbnail_url || (isVideo ? data.secure_url + '#t=0.1' : '') });
          } catch (err) { console.error(err); alert('No se pudo subir. Intenta de nuevo.'); }
          finally { uplBtn.disabled = false; uplBtn.textContent = txt; }
        }
        uplInput.value = '';
      });
    }
  })();

}); // fin DOMContentLoaded
