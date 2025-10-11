// 💕 Corazones flotando
const hearts = document.getElementById('hearts');
function makeHeart() {
  const h = document.createElement('div'); h.className = 'heart';
  const size = Math.random() * 12 + 8; h.style.width = h.style.height = size + 'px';
  h.style.left = Math.random() * 100 + 'vw'; h.style.bottom = '-20px';
  const hue = getComputedStyle(document.documentElement)
    .getPropertyValue('--heart-hue').trim() || '345';
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

// ⏱️ Duración exacta
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
  const parts = [y, m, d].filter(Boolean).join(', ') || 'recién comenzamos 💞';
  const el = document.getElementById('relationshipDuration');
  if (el) el.innerHTML = `Llevamos juntos <strong>${parts}</strong> 💖`;
}

// 🗓️ Próximo hito
function addMonthsKeepDay(d, m) { const x = new Date(d); x.setMonth(x.getMonth() + m); x.setDate(d.getDate()); return x; }
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function nextMonthlyMilestone(now) {
  const mCand = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  let candidate = addMonthsKeepDay(startDate, Math.max(0, mCand));
  if (sameDay(now, candidate)) return { mode: 'today', date: candidate, number: mCand };
  if (now < candidate) return { mode: 'upcoming', date: candidate, number: mCand };
  const nxt = addMonthsKeepDay(startDate, Math.max(0, mCand + 1));
  return { mode: 'upcoming', date: nxt, number: mCand + 1 };
}

// ⏳ Render del contador mensual
function updateMonthCounter() {
  const now = new Date();
  const info = nextMonthlyMilestone(now);
  const el = document.getElementById('monthCounter');
  if (!el) return;

  if (info.mode === 'today') {
    if (info.number > 0 && info.number % 12 === 0)
      el.innerHTML = `🎉 ¡Feliz aniversario número ${info.number / 12}! (${info.date.toLocaleDateString()}) 💖✨`;
    else if (info.number > 0)
      el.innerHTML = `¡Feliz mes número ${info.number}! (${info.date.toLocaleDateString()}) ✨`;
    else el.innerHTML = `💫 ¡Hoy empezamos oficialmente! (${info.date.toLocaleDateString()})`;
    return;
  }

  const diff = info.date - now;
  const dd = Math.floor(diff / 86400000);
  const hh = Math.floor((diff % 86400000) / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);

  const label = (info.number > 0 && info.number % 12 === 0)
    ? `aniversario número ${info.number / 12}`
    : `${info.number}° mes`;

  el.innerHTML = `Faltan <strong>${dd}</strong>d <strong>${hh}</strong>h <strong>${mm}</strong>m <strong>${ss}</strong>s para nuestro <strong>${label}</strong> ✨`;
}

// ⏱️ Intervalos
function tickAll() { updateMonthCounter(); updateRelationshipDuration(); updateDaysTogether(); }
tickAll();
setInterval(tickAll, 1000);

// =========================
// 🌙 Modo oscuro
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
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved ? saved : (prefersDark ? 'dark' : 'light'));
  btn.addEventListener('click', () => apply(document.body.classList.contains('dark') ? 'light' : 'dark'));
})();

// =========================
// 🎵 REPRODUCTOR DE MÚSICA COMPLETO
// =========================
(function initMusicPlayer() {
  const audio = document.getElementById("audio");
  const select = document.getElementById("songSelect");
  const loopBtn = document.getElementById("toggleLoop");
  const muteBtn = document.getElementById("muteBtn");
  const volRange = document.getElementById("volRange");
  const volPct = document.getElementById("volPct");
  const tip = document.getElementById("autoplayTip");

  if (!audio || !select) return;

  // 🔑 Claves locales
  const VOL_KEY = "amor_volume";
  const SONG_KEY = "amor_song";
  const LOOP_KEY = "amor_loop";
  const MOOD_KEY = "amor_mood";

  // 🎶 Lista de canciones
  const tracks = [
    { name: "Nuestra canción", src: "/cancion/cancion.mp3", mood: "romantica" },
    { name: "Me recuerda a ti", src: "/cancion/me-recuerda-a-ti.mp3", mood: "chill" },
    { name: "Cuando te conocí", src: "/cancion/cuando-te-conoci.mp3", mood: "romantica" },
  ];

  // 📦 Recuperar preferencias guardadas
  const savedVolume = (() => {
    const v = parseFloat(localStorage.getItem(VOL_KEY));
    return isNaN(v) ? 0.6 : Math.min(1, Math.max(0, v));
  })();
  const savedLoop = localStorage.getItem(LOOP_KEY) === "true";
  const savedSong = localStorage.getItem(SONG_KEY);
  const savedMood = localStorage.getItem(MOOD_KEY);

  // 🎨 Función para aplicar “mood”
  function applyMood(mood) {
    document.body.classList.remove("mood-romantica", "mood-bachata", "mood-chill");
    if (mood) {
      document.body.classList.add(`mood-${mood}`);
      localStorage.setItem(MOOD_KEY, mood);
    }
  }
  if (savedMood) applyMood(savedMood);

  function moodFor(src) {
    const t = tracks.find((x) => x.src === src);
    return t ? t.mood : null;
  }

  // 🎚 Fade suave
  function fadeVolumeTo(el, target = 0.6, duration = 700) {
    target = Math.min(1, Math.max(0, target));
    const start = el.volume || 0;
    const diff = target - start;
    const steps = Math.max(1, Math.floor(duration / 40));
    let n = 0;
    return new Promise((res) => {
      const timer = setInterval(() => {
        n++;
        el.volume = start + diff * (n / steps);
        if (n >= steps) {
          clearInterval(timer);
          el.volume = target;
          res();
        }
      }, 40);
    });
  }

  // 🔁 Crossfade entre canciones
  async function crossfadeTo(el, newSrc, targetVol = savedVolume, fade = 700) {
    try {
      await fadeVolumeTo(el, 0.0, fade);
      el.src = newSrc;
      el.load();
      await el.play().catch(() => { });
      await fadeVolumeTo(el, targetVol, fade);
    } catch (e) {
      console.error("Crossfade error:", e);
    }
  }

  // 🧩 Poblar selector
  select.innerHTML = "";
  tracks.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.src;
    opt.textContent = t.name;
    select.appendChild(opt);
  });

  // 📀 Cargar canción inicial
  if (savedSong && tracks.some((t) => t.src === savedSong)) {
    select.value = savedSong;
  } else {
    select.value = tracks[0].src;
  }

  async function setTrack(src) {
    applyMood(moodFor(src));
    await crossfadeTo(audio, src, audio.volume || savedVolume, 700);
    localStorage.setItem(SONG_KEY, src);
  }

  setTrack(select.value);

  // =========================
  // 🔊 CONTROLES DE AUDIO
  // =========================
  audio.volume = savedVolume;
  audio.loop = savedLoop;

  // 🎛 Loop
  if (loopBtn) {
    loopBtn.textContent = "Loop: " + (audio.loop ? "on" : "off");
    loopBtn.onclick = () => {
      audio.loop = !audio.loop;
      loopBtn.textContent = "Loop: " + (audio.loop ? "on" : "off");
      localStorage.setItem(LOOP_KEY, audio.loop);
    };
  }

  // 🔇 Silenciar
  if (muteBtn) {
    muteBtn.onclick = () => {
      audio.muted = !audio.muted;
      muteBtn.textContent = audio.muted ? "Activar sonido" : "Silenciar";
    };
  }

  // 🎚 Barra de volumen
  if (volRange && volPct) {
    volRange.value = Math.round((audio.volume || 0) * 100);
    volPct.textContent = volRange.value + "%";

    volRange.addEventListener("input", () => {
      const v = Math.max(0, Math.min(100, parseInt(volRange.value || "0", 10)));
      const f = v / 100;
      audio.muted = false;
      audio.volume = f;
      volPct.textContent = v + "%";
      localStorage.setItem(VOL_KEY, f.toFixed(2));
    });

    audio.addEventListener("volumechange", () => {
      const v = Math.round((audio.volume || 0) * 100);
      volRange.value = v;
      volPct.textContent = v + "%";
    });
  }

  // =========================
  // 🎵 BOTÓN FLOTANTE DE AUTOPLAY
  // =========================
  if (tip) {
    async function tryPlay() {
      try {
        await audio.play();
        tip.classList.remove("onscreen");
      } catch {
        tip.classList.add("onscreen");
      }
    }
    tip.addEventListener("click", tryPlay);
    audio.addEventListener("pause", () => tip.classList.add("onscreen"));
    audio.addEventListener("play", () => tip.classList.remove("onscreen"));
    if (audio.paused) tip.classList.add("onscreen");
    tryPlay();
  }

  // 🎶 Cambio manual de canción
  select.addEventListener("change", () => setTrack(select.value));
})();
// =========================
// 💌 Toast romántico: Canción actual
// =========================
(function initSongToast() {
  const toast = document.getElementById("songToast");
  const songTitle = document.getElementById("songTitle");
  const heart = toast?.querySelector(".heart-icon");
  const audio = document.getElementById("audio");
  const select = document.getElementById("songSelect");
  if (!toast || !songTitle || !audio || !select) return;

  // 💓 Animación y vibración
  function showToast(title) {
    songTitle.textContent = title;
    toast.classList.remove("hidden");
    toast.classList.add("visible");

    // vibración ligera (si el dispositivo lo soporta)
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

    // animación de corazón
    if (heart) {
      heart.classList.add("beat");
      setTimeout(() => heart.classList.remove("beat"), 2500);
    }

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.classList.remove("visible");
      toast.classList.add("hidden");
    }, 4000);
  }

  // Mostrar cuando cambia canción o inicia reproducción
  audio.addEventListener("play", () => {
    const current = select.selectedOptions[0]?.textContent || "Canción";
    showToast(current);
  });

  select.addEventListener("change", () => {
    const current = select.selectedOptions[0]?.textContent || "Canción";
    showToast(current);
  });
})();


// =========================
// 🌸 GALERÍA CLOUDINARY COMPLETA
// =========================
(function initGalleryCloudinary() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  // Elementos de subida
  const openModal = document.getElementById("openModalBtn");
  const modal = document.getElementById("uploadModal");
  const closeModal = document.getElementById("closeModalBtn");
  const uplForm = document.getElementById("uplForm");
  const uplBtn = document.getElementById("uplBtn");
  const uplInput = document.getElementById("uplInput");
  const uplCat = document.getElementById("uplCategory");
  const uplCap = document.getElementById("uplCaption");
  const previewImg = document.getElementById("previewImg");
  const previewVideo = document.getElementById("previewVideo");

  // Cloudinary
  const CLOUD_NAME = window.CLOUD_NAME;
  const UPLOAD_PRESET = window.UPLOAD_PRESET;
  const listURL = "/.netlify/functions/listMedia";
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  // Modal control
  openModal.addEventListener("click", () => modal.classList.remove("hidden"));
  closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  window.addEventListener("click", e => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // =========================
  // 🔁 Cargar galería
  // =========================
  async function loadGallery() {
    try {
      const res = await fetch(listURL);
      const data = await res.json();
      grid.innerHTML = "";
      data.forEach(m => appendMedia(m));
    } catch (err) {
      console.error("Error al cargar galería", err);
    }
  }

  // =========================
  // 🖼️ Crear elemento visual
  // =========================
  function appendMedia(m) {
    const fig = document.createElement("figure");
    fig.className = "gitem";
    fig.dataset.id = m.public_id;
    fig.dataset.tags = (m.tags || []).join(",");
    fig.dataset.type = m.resource_type;

    const caption = m.context?.custom?.caption || "";
    const category = (m.tags && m.tags.join(", ")) || "otros";

    const inner = m.resource_type === "video"
      ? `<video src="${m.secure_url}" poster="${m.thumbnail_url || ''}" controls></video>`
      : `<img src="${m.secure_url}" alt="${caption}" loading="lazy">`;

    fig.innerHTML = `
      ${inner}
      <figcaption><strong>${category}</strong><br>${caption}</figcaption>
      <div class="photo-actions">
        <button class="btn-edit" data-id="${m.public_id}" title="Editar">✏️</button>
        <button class="btn-delete" data-id="${m.public_id}" title="Eliminar">🗑️</button>
      </div>
    `;

    // Al hacer clic: abrir en grande
    fig.querySelector("img, video").addEventListener("click", () => openLightbox(m));

    grid.prepend(fig);
  }

  // =========================
  // 🎚️ Preview de subida
  // =========================
  uplInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      previewImg.src = url;
      previewImg.classList.remove("hidden");
      previewVideo.classList.add("hidden");
    } else if (file.type.startsWith("video/")) {
      previewVideo.src = url;
      previewVideo.classList.remove("hidden");
      previewImg.classList.add("hidden");
    }
  });
  // =========================
  // 📂 Seleccionar archivo manualmente
  // =========================
  if (uplBtn && uplInput) {
    uplBtn.addEventListener("click", (e) => {
      e.preventDefault();
      uplInput.click(); // fuerza la apertura del selector de archivos
    });
  }

  // =========================
  // ☁️ Subir archivo a Cloudinary
  // =========================
  uplForm.addEventListener("submit", async e => {
    e.preventDefault();
    const files = Array.from(uplInput.files || []);
    if (!files.length) return alert("Selecciona un archivo primero");

    for (const file of files) {
      const cat = uplCat?.value || "otros";
      const desc = uplCap?.value.trim() || "";
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);
      form.append("context", `caption=${desc}`);
      form.append("tags", cat);

      uplBtn.disabled = true;
      const prev = uplBtn.textContent;
      uplBtn.textContent = "Subiendo...";

      try {
        const res = await fetch(endpoint, { method: "POST", body: form });
        const data = await res.json();
        appendMedia(data);
        showSuccessToast("💖 Recuerdo subido con éxito");
      } catch (err) {
        console.error(err);
        alert("⚠️ No se pudo subir el archivo");
      } finally {
        uplBtn.disabled = false;
        uplBtn.textContent = prev;
      }
    }

    uplInput.value = "";
    uplCap.value = "";
    previewImg.classList.add("hidden");
    previewVideo.classList.add("hidden");
    modal.classList.add("hidden");
  });

  // =========================
  // 🔍 Lightbox
  // =========================
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbVideo = document.getElementById("lbVideo");
  const lbCap = document.getElementById("lbCap");
  const lbClose = document.getElementById("lbClose");

  function openLightbox(m) {
    lightbox.classList.remove("hidden");
    const caption = m.context?.custom?.caption || "";
    if (m.resource_type === "video") {
      lbImg.classList.add("hidden");
      lbVideo.classList.remove("hidden");
      lbVideo.src = m.secure_url;
    } else {
      lbVideo.classList.add("hidden");
      lbImg.classList.remove("hidden");
      lbImg.src = m.secure_url;
    }
    lbCap.textContent = caption;
  }

  lbClose.addEventListener("click", () => lightbox.classList.add("hidden"));
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) lightbox.classList.add("hidden");
  });

  // =========================
  // ✏️ Editar y 🗑️ Eliminar
  // =========================
  const editModal = document.getElementById("editModal");
  const editDesc = document.getElementById("editDesc");
  const editTags = document.getElementById("editTags");
  const saveEditBtn = document.getElementById("saveEditBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  let currentEdit = null;

  // Abrir modal de edición
  document.addEventListener("click", e => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;
    const id = btn.dataset.id;
    const fig = document.querySelector(`.gitem[data-id="${id}"]`);
    if (!fig) return;

    currentEdit = { id };
    const cap = fig.querySelector("figcaption");
    editDesc.value = cap.innerText.split("\n")[1] || "";
    editTags.value = fig.dataset.tags || "";
    document.getElementById("editPreview").src = fig.querySelector("img")?.src || "";
    editModal.classList.remove("hidden");
  });

  cancelEditBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
    currentEdit = null;
  });

  saveEditBtn.addEventListener("click", async () => {
    if (!currentEdit) return;
    const caption = editDesc.value.trim();
    const tags = editTags.value.split(",").map(t => t.trim()).filter(Boolean);

    await fetch("/.netlify/functions/editMedia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentEdit.id, caption, tags }),
    });

    const fig = document.querySelector(`.gitem[data-id="${currentEdit.id}"]`);
    if (fig) {
      const cap = fig.querySelector("figcaption");
      cap.innerHTML = `<strong>${tags.join(", ")}</strong><br>${caption}`;
      fig.dataset.tags = tags.join(",");
    }

    showSuccessToast("💫 Recuerdo actualizado");
    editModal.classList.add("hidden");
    currentEdit = null;
  });

  deleteBtn.addEventListener("click", async () => {
    if (!currentEdit) return;
    if (!confirm("¿Seguro que deseas eliminar este recuerdo?")) return;

    await fetch("/.netlify/functions/deleteMedia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentEdit.id }),
    });

    const fig = document.querySelector(`.gitem[data-id="${currentEdit.id}"]`);
    if (fig) fig.remove();
    showSuccessToast("🗑️ Recuerdo eliminado");
    editModal.classList.add("hidden");
    currentEdit = null;
  });

  // =========================
  // 🔖 Filtros por categoría
  // =========================
  document.querySelectorAll("#filterChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#filterChips .chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const filter = chip.dataset.filter;
      document.querySelectorAll(".gitem").forEach(item => {
        const tags = item.dataset.tags.split(",");
        item.style.display = (filter === "*" || tags.includes(filter)) ? "" : "none";
      });
    });
  });

  // =========================
  // ✅ Toast de confirmación
  // =========================
  function showSuccessToast(message) {
    let toast = document.querySelector(".success-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "success-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.add("hide"), 2000);
    setTimeout(() => toast.classList.remove("show", "hide"), 2500);
  }

  // Iniciar
  loadGallery();
})();

