document.addEventListener("DOMContentLoaded", () => {

  // 💕 Corazones flotando
  const hearts = document.getElementById('hearts');
  function makeHeart() {
    const h = document.createElement('div'); h.className = 'heart';
    const size = Math.random() * 12 + 8; h.style.width = h.style.height = size + 'px';
    h.style.left = Math.random() * 100 + 'vw'; h.style.bottom = '-20px';

    const hue = getComputedStyle(document.documentElement)
      .getPropertyValue('--heart-hue')
      .trim() || '345';
    h.style.background = `hsl(${hue},80%,${65 + Math.random() * 10}%)`;

    h.style.setProperty('--dur', 10 + Math.random() * 8 + 's');
    hearts.appendChild(h); setTimeout(() => h.remove(), 15000);
  }
  setInterval(makeHeart, 400);

  // 💕 Fechas base
  const metDate = new Date('2025-07-16T00:00:00');
  const startDate = new Date('2025-09-07T00:00:00');

  // 🔢 Días juntos
  function updateDaysTogether() {
    const now = new Date();
    const days = Math.floor((now - startDate) / 86400000);
    const el = document.getElementById('daysTogether');
    if (el) el.textContent = days >= 0 ? days : 0;
  }

  // ⏱️ Duración relación
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

  // 🔗 Scroll suave
  const goT = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const goTimeline = document.getElementById('goTimeline');
  const goLetter = document.getElementById('goLetter');
  if (goTimeline) goTimeline.onclick = () => goT('timeline');
  if (goLetter) goLetter.onclick = () => goT('carta');

  // ▶️ Audio
  const audio = document.getElementById('audio');
  if (audio) {
    const loopBtn = document.getElementById('toggleLoop');
    const muteBtn = document.getElementById('muteBtn');
    if (loopBtn) loopBtn.onclick = () => {
      audio.loop = !audio.loop;
      loopBtn.textContent = 'Loop: ' + (audio.loop ? 'on' : 'off');
    };
    if (muteBtn) muteBtn.onclick = () => {
      audio.muted = !audio.muted;
      muteBtn.textContent = audio.muted ? 'Activar sonido' : 'Silenciar';
    };
  }

  // =========================
  //   SELECTOR DE CANCIONES
  // =========================
  (function initSongSelector() {
    const select = document.getElementById('songSelect');
    const audio = document.getElementById('audio');
    if (!select || !audio) return;

    const VOL_KEY = 'amor_volume';
    const LOOP_KEY = 'amor_loop';
    const MOOD_KEY = 'amor_mood';
    const SONG_KEY = 'amor_song';

    const savedVolume = (() => {
      const v = parseFloat(localStorage.getItem(VOL_KEY));
      return isNaN(v) ? 0.6 : Math.min(1, Math.max(0, v));
    })();
    const savedLoop = localStorage.getItem(LOOP_KEY) === 'true';

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

    audio.volume = savedVolume;
    audio.addEventListener('volumechange', () => {
      if (!audio.muted) {
        localStorage.setItem(VOL_KEY, (audio.volume || 0).toFixed(2));
      }
    })();

    const tracks = [
      { name: 'Nuestra canción', src: '/cancion/cancion.mp3', mood: 'romantica' },
      { name: 'Me recuerda a ti', src: '/cancion/me-recuerda-a-ti.mp3', mood: 'chill' },
      { name: 'Cuando te conocí', src: '/cancion/cuando-te-conoci.mp3', mood: 'romantica' },
    ];

    const volRange = document.getElementById('volRange');
    const volPct = document.getElementById('volPct');
    if (volRange && volPct) {
      const initPct = Math.round((audio.muted ? 0 : audio.volume) * 100);
      volRange.value = initPct;
      volPct.textContent = initPct + '%';
      volRange.addEventListener('input', () => {
        const v = Math.max(0, Math.min(100, parseInt(volRange.value || '0', 10)));
        const f = v / 100;
        audio.muted = false;
        audio.volume = f;
        volPct.textContent = v + '%';
        localStorage.setItem('amor_volume', f.toFixed(2));
      });
    }
  })();

  function applyMood(mood) {
    document.body.classList.remove('mood-romantica', 'mood-bachata', 'mood-chill');
    if (mood) {
      document.body.classList.add(`mood-${mood}`);
      localStorage.setItem(MOOD_KEY, mood);
    }
  }

  async function fadeVolumeTo(el, target = 0.6, duration = 500) {
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
      await fadeVolumeTo(el, 0.0, fade);
      el.src = newSrc;
      el.load();
      try { await el.play(); } catch (_) { }
      await fadeVolumeTo(el, targetVol, fade);
    } catch (_) { }
  }

  const savedSong = localStorage.getItem(SONG_KEY);
  select.value = (savedSong && tracks.some(t => t.src === savedSong)) ? savedSong : tracks[0].src;

  async function setTrack(src) {
    const t = tracks.find(x => x.src === src);
    applyMood(t?.mood);
    const sv = parseFloat(localStorage.getItem('amor_volume'));
    const target = isNaN(sv) ? (audio.volume || 0.6) : sv;
    await crossfadeTo(audio, src, target, 500);
    localStorage.setItem('amor_song', src);
  }

  select.innerHTML = '';
  tracks.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.src;
    opt.textContent = t.name;
    select.appendChild(opt);
  });

  setTrack(select.value);
  select.addEventListener('change', () => setTrack(select.value));
})();

// =========================
//   GALERÍA COMPLETA (Cloudinary + filtros + lightbox)
// =========================
(function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const chips = document.getElementById('filterChips');
  const uplForm = document.getElementById('uplForm');
  const uplInput = document.getElementById('uplInput');
  const uplBtn = document.getElementById('uplBtn');

  // ----- Filtros
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

  // ----- Cloudinary Upload
  const CLOUD_NAME = window.CLOUD_NAME || '';
  const UPLOAD_PRESET = window.UPLOAD_PRESET || '';

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

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
    grid.prepend(fig);
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

        uplBtn.disabled = true;
        const prevLabel = uplBtn.textContent;
        uplBtn.textContent = 'Subiendo...';

        try {
          const res = await fetch(endpoint, { method: 'POST', body: formData });
          if (!res.ok) throw new Error('Error al subir');
          const data = await res.json();

          const isVideo = data.resource_type === 'video';
          appendMediaToGrid({
            url: data.secure_url,
            type: isVideo ? 'video' : 'image',
            caption: file.name,
            poster: data.thumbnail_url || (isVideo ? data.secure_url + '#t=0.1' : '')
          });
        } catch (err) {
          console.error(err);
          alert('No se pudo subir. Intenta de nuevo.');
        } finally {
          uplBtn.disabled = false;
          uplBtn.textContent = prevLabel;
        }
      }
      uplInput.value = '';
    });
  }
});
