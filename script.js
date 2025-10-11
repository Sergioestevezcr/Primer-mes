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
// 🖼️ GALERÍA CON MODAL + CLOUDINARY (completa)
// =========================
(function initGalleryCloudinary() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  // ---- Modal subir
  const openModal = document.getElementById("openModalBtn");
  const modal = document.getElementById("uploadModal");
  const closeModal = document.getElementById("closeModalBtn");

  const uplForm = document.getElementById("uplForm");
  const uplBtn = document.getElementById("uplBtn");
  const uplInput = document.getElementById("uplInput");
  const uplCap = document.getElementById("uplCaption");     // descripción
  const uplCat = document.getElementById("uplCategory");    // categorías (usa coma para varias)

  // ---- Preview
  const previewBox = document.getElementById("previewBox");
  const previewImg = document.getElementById("previewImg");
  const previewVideo = document.getElementById("previewVideo");

  // ---- Lightbox
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbVideo = document.getElementById("lbVideo");
  const lbCap = document.getElementById("lbCap");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  // ---- Modal edición
  const editModal = document.getElementById("editModal");
  const editPreview = document.getElementById("editPreview");
  const editDesc = document.getElementById("editDesc");
  const editTags = document.getElementById("editTags");
  const saveEditBtn = document.getElementById("saveEditBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  // ---- Config Cloudinary (inyectadas en HTML)
  const CLOUD_NAME = window.CLOUD_NAME;
  const UPLOAD_PRESET = window.UPLOAD_PRESET;
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const listURL = "/.netlify/functions/listMedia";
  const editURL = "/.netlify/functions/editMedia";
  const deleteURL = "/.netlify/functions/deleteMedia";

  // Estado
  const mediaById = new Map(); // public_id -> objeto media
  let lightboxOrder = []; // ids visibles, para prev/next
  let currentIdx = -1;    // índice en lightboxOrder

  // ---------- Helpers ----------
  const tagsFromInput = (str) =>
    (str || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

  function showSuccessToast(message = "Hecho 💞") {
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

  // ---------- Carga inicial ----------
  async function loadGallery() {
    try {
      const res = await fetch(listURL);
      const arr = await res.json();
      grid.innerHTML = "";
      mediaById.clear();
      arr.forEach(m => appendMedia(m));
      rebuildLightboxOrder(); // para navegación prev/next
    } catch (err) {
      console.error("Error al cargar galería", err);
    }
  }

  // reconstruir orden según elementos visibles
  function rebuildLightboxOrder() {
    lightboxOrder = Array.from(grid.querySelectorAll(".gitem"))
      .filter(el => el.style.display !== "none")
      .map(el => el.dataset.id);
  }

  // =========================
  // 🖼️ Crear la tarjeta visual con descripción + botones
  // =========================

  function appendMedia(m) {
    // Guardar en memoria local
    mediaById.set(m.public_id, m);

    const fig = document.createElement("figure");
    fig.className = "gitem";
    fig.dataset.id = m.public_id;
    fig.dataset.type = m.resource_type;
    fig.dataset.tags = (m.tags || []).join(",");

    const caption =
      m.context?.custom?.caption ||
      m.context?.caption ||
      "Sin descripción 💬";
    const categories = (m.tags && m.tags.length) ? m.tags.join(", ") : "otros";

    // Imagen o video
    const inner =
      m.resource_type === "video"
        ? `<video src="${m.secure_url}" poster="${m.thumbnail_url || ''}" playsinline controls></video>`
        : `<img src="${m.secure_url}" alt="${caption}" loading="lazy">`;

    // Estructura visual completa
    fig.innerHTML = `
    ${inner}
    <figcaption>
      <strong class="cat-label">📁 ${categories}</strong><br>
      <span class="desc-text">${caption}</span>
      <div class="media-actions">
        <button class="btn-mini btn-edit" data-id="${m.public_id}" title="Editar">✏️ Editar</button>
        <button class="btn-mini btn-delete" data-id="${m.public_id}" title="Eliminar">🗑️ Eliminar</button>
      </div>
    </figcaption>
  `;

    grid.prepend(fig);

    // Clicks en imagen o video → abrir lightbox
    const mediaEl = fig.querySelector("img, video");
    if (mediaEl) {
      mediaEl.addEventListener("click", (e) => {
        if (e.target.closest(".media-actions")) return; // evita conflicto con botones
        openLightboxById(m.public_id);
      });
    }
  }

  // =========================
  // 🔍 Lightbox (abrir / navegar / cerrar)
  // =========================
  function openLightboxById(id) {
    const m = mediaById.get(id);
    if (!m) return;

    lightbox.classList.remove("hidden");
    lbCap.textContent = m.context?.custom?.caption || "Sin descripción 💬";

    if (m.resource_type === "video") {
      lbImg.style.display = "none";
      lbVideo.style.display = "block";
      lbVideo.src = m.secure_url;
      lbVideo.load();
      lbVideo.play().catch(() => { });
    } else {
      lbVideo.pause();
      lbVideo.removeAttribute("src");
      lbVideo.style.display = "none";
      lbImg.style.display = "block";
      lbImg.src = m.secure_url;
    }

    currentIdx = lightboxOrder.indexOf(id);
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
    try { lbVideo.pause(); lbVideo.removeAttribute("src"); lbVideo.load(); } catch (_) { }
    currentIdx = -1;
  }

  function showDir(dir) {
    if (!lightboxOrder.length) return;
    currentIdx = (currentIdx + dir + lightboxOrder.length) % lightboxOrder.length;
    openLightboxById(lightboxOrder[currentIdx]);
  }

  // clicks en controles lightbox
  lbClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  lbPrev?.addEventListener("click", () => showDir(-1));
  lbNext?.addEventListener("click", () => showDir(+1));
  window.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showDir(-1);
    if (e.key === "ArrowRight") showDir(+1);
  }, { passive: true });

  // =========================
  // 🧑‍💻 Delegación de eventos en GRID
  // =========================
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".gitem");
    if (!card) return;

    // abrir lightbox (click en imagen/video)
    if (e.target.tagName === "IMG" || e.target.tagName === "VIDEO") {
      openLightboxById(card.dataset.id);
      return;
    }

    // editar
    const editBtn = e.target.closest(".btn-edit");
    if (editBtn) {
      e.stopPropagation();
      openEditModal(editBtn.dataset.id);
      return;
    }

    // eliminar
    const delBtn = e.target.closest(".btn-delete");
    if (delBtn) {
      e.stopPropagation();
      confirmDelete(delBtn.dataset.id);
      return;
    }
  });

  // =========================
  // ✏️ Modal de edición
  // =========================
  function openEditModal(id) {
    const m = mediaById.get(id);
    if (!m) return;
    editPreview.src = m.secure_url;
    editDesc.value = m.context?.custom?.caption || "";
    editTags.value = (m.tags || []).join(", ");
    editModal.classList.remove("hidden");

    // guardar
    saveEditBtn.onclick = async () => {
      const caption = editDesc.value.trim();
      const tags = tagsFromInput(editTags.value);

      try {
        const res = await fetch(editURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_id: m.public_id,
            resource_type: m.resource_type,
            caption,
            tags
          })
        });
        if (!res.ok) throw new Error("edit failed");

        // actualiza UI local
        m.context = m.context || {};
        m.context.custom = m.context.custom || {};
        m.context.custom.caption = caption;
        m.tags = tags;

        const fig = grid.querySelector(`.gitem[data-id="${m.public_id}"]`);
        if (fig) {
          fig.dataset.tags = tags.join(",");
          const fc = fig.querySelector("figcaption");
          if (fc) {
            fc.querySelector(".cat-label").textContent = `📁 ${tags.length ? tags.join(", ") : "otros"}`;
            fc.querySelector(".desc-text").textContent = caption || "Sin descripción 💬";
          }
        }
        rebuildLightboxOrder();
        showSuccessToast("🩷 Cambios guardados");
        editModal.classList.add("hidden");
      } catch (err) {
        console.error(err);
        alert("⚠️ No se pudo actualizar la información");
      }
    };

    // cancelar
    cancelEditBtn.onclick = () => editModal.classList.add("hidden");

    // eliminar (desde modal)
    deleteBtn.onclick = () => confirmDelete(id);
  }

  // cerrar modal edición al hacer click fuera
  editModal.addEventListener("click", (e) => { if (e.target === editModal) editModal.classList.add("hidden"); });

  // =========================
  // 🗑️ Eliminar
  // =========================
  async function confirmDelete(id) {
    const m = mediaById.get(id);
    if (!m) return;
    if (!confirm("¿Seguro que quieres eliminar este recuerdo? 🥺")) return;

    try {
      const res = await fetch(deleteURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: m.public_id,
          resource_type: m.resource_type
        })
      });
      if (!res.ok) throw new Error("delete failed");

      const fig = grid.querySelector(`.gitem[data-id="${m.public_id}"]`);
      if (fig) fig.remove();
      mediaById.delete(m.public_id);
      rebuildLightboxOrder();
      showSuccessToast("🗑️ Eliminado con éxito");
      editModal.classList.add("hidden");
    } catch (err) {
      console.error(err);
      alert("⚠️ No se pudo eliminar");
    }
  }

  // =========================
  // 🌸 Modal subir (abrir/cerrar)
  // =========================
  openModal?.addEventListener("click", () => modal.classList.remove("hidden"));
  closeModal?.addEventListener("click", () => modal.classList.add("hidden"));
  window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  // =========================
  // 🎚️ Preview de subida
  // =========================
  uplInput.addEventListener("change", e => {
    const file = e.target.files?.[0];
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

  // abrir selector de archivo
  uplBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    uplInput.click();
  });

  // =========================
  // ☁️ Subir a Cloudinary
  // =========================
  uplForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const files = Array.from(uplInput.files || []);
    if (!files.length) return alert("Selecciona un archivo primero");

    // categorías: permite varias separadas por coma (ej: "nosotros,citas")
    // si tu select es de una sola opción, escribe varias manualmente tipo "nosotros,citas"
    const catStr = (uplCat?.value || "otros");
    const tags = tagsFromInput(catStr);
    const desc = uplCap?.value.trim() || "";

    for (const file of files) {
      if (!(file.type.startsWith("image/") || file.type === "video/mp4")) {
        alert("Formato no permitido (solo imágenes o MP4)");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Máximo 10MB");
        continue;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);
      form.append("context", `caption=${desc}`);
      form.append("tags", tags.join(",")); // varias categorías

      uplBtn.disabled = true;
      const prev = uplBtn.textContent;
      uplBtn.textContent = "Subiendo...";

      try {
        const res = await fetch(endpoint, { method: "POST", body: form });
        if (!res.ok) throw new Error("upload failed");
        const data = await res.json();
        appendMedia(data);
        rebuildLightboxOrder();
        showSuccessToast("💖 Recuerdo subido con éxito");
      } catch (err) {
        console.error(err);
        alert("⚠️ No se pudo subir el archivo");
      } finally {
        uplBtn.disabled = false;
        uplBtn.textContent = prev;
      }
    }

    // limpiar modal
    uplInput.value = "";
    uplCap.value = "";
    previewImg.classList.add("hidden");
    previewVideo.classList.add("hidden");
    modal.classList.add("hidden");
  });

  // =========================
  // 🔖 Filtros por categoría
  // =========================
  const chips = document.getElementById("filterChips");
  chips?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    chips.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
    btn.classList.add("is-active");
    const filter = btn.dataset.filter;

    Array.from(grid.querySelectorAll(".gitem")).forEach(item => {
      const tags = (item.dataset.tags || "").split(",").map(s => s.trim());
      item.style.display = (filter === "*" || tags.includes(filter)) ? "" : "none";
    });

    rebuildLightboxOrder();
  });

  // 🚀 Go
  loadGallery();

  // 💞 Corazón flotante adaptado al mood actual
  function showHeartFloat() {
    const heart = document.createElement("div");
    heart.className = "heart-float";
    heart.textContent = "💖";

    // Detectar mood activo en el body
    const mood = document.body.className.match(/mood-(\w+)/);
    if (mood) heart.dataset.mood = mood[1];

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1300);
  }


  // ✨ Usar esta función después de subir, editar o eliminar
  function showSuccessToast(message = "Acción realizada 💫") {
    let toast = document.querySelector(".success-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "success-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    showHeartFloat(); // 👈 añade el corazón flotante
    setTimeout(() => toast.classList.add("hide"), 2000);
    setTimeout(() => toast.classList.remove("show", "hide"), 2600);
  }

})();
