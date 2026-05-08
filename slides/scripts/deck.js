/* =====================================================================
   Deck navigation, overview mode, fullscreen, notes, and YouTube pause.
   No external dependencies.
   ===================================================================== */

(function () {
  const STORAGE_KEY = "deck.activeIndex";

  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const notesBtn = document.getElementById("notesBtn");
  const overviewBtn = document.getElementById("overviewBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const slideLabel = document.getElementById("slideLabel");
  const progressFill = document.getElementById("progressFill");
  const overviewGrid = document.getElementById("overviewGrid");
  let edgePrevBtn = null;
  let edgeNextBtn = null;
  const mobileEdgeMedia = window.matchMedia("(max-width: 760px)");
  const coarsePointerMedia = window.matchMedia("(pointer: coarse)");

  let current = restoreIndex();

  function restoreIndex() {
    const stored = Number(sessionStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored >= 0 && stored < slides.length) {
      return stored;
    }
    const fromMarkup = slides.findIndex((s) => s.classList.contains("is-active"));
    return Math.max(0, fromMarkup);
  }

  function saveIndex() {
    try { sessionStorage.setItem(STORAGE_KEY, String(current)); } catch (_) {}
  }

  function pauseAllVideos() {
    document.querySelectorAll(".slide iframe").forEach((iframe) => {
      const src = iframe.getAttribute("src") || "";
      if (/youtube(-nocookie)?\.com\/embed\//.test(src)) {
        try {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
            "*"
          );
        } catch (_) {}
      }
    });
  }

  function updateUI() {
    slides.forEach((slide, idx) => {
      const isActive = idx === current;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    const active = slides[current];
    const title = active && active.dataset.title ? active.dataset.title : "Slide";
    slideLabel.textContent = `Slide ${current + 1}/${slides.length} - ${title}`;
    progressFill.style.width = `${((current + 1) / slides.length) * 100}%`;

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
    syncMobileEdgeButtons();

    saveIndex();
  }

  function shouldShowMobileEdgeButtons() {
    return mobileEdgeMedia.matches || coarsePointerMedia.matches;
  }

  function syncMobileEdgeButtons() {
    if (!edgePrevBtn || !edgeNextBtn) return;
    const show = shouldShowMobileEdgeButtons();
    edgePrevBtn.hidden = !show;
    edgeNextBtn.hidden = !show;
    edgePrevBtn.disabled = current === 0;
    edgeNextBtn.disabled = current === slides.length - 1;
  }

  function initMobileEdgeButtons() {
    edgePrevBtn = document.createElement("button");
    edgePrevBtn.type = "button";
    edgePrevBtn.className = "edge-nav edge-nav-left";
    edgePrevBtn.setAttribute("aria-label", "Previous slide");
    edgePrevBtn.innerHTML = '<span aria-hidden="true">&larr;</span>';
    edgePrevBtn.addEventListener("click", goPrev);

    edgeNextBtn = document.createElement("button");
    edgeNextBtn.type = "button";
    edgeNextBtn.className = "edge-nav edge-nav-right";
    edgeNextBtn.setAttribute("aria-label", "Next slide");
    edgeNextBtn.innerHTML = '<span aria-hidden="true">&rarr;</span>';
    edgeNextBtn.addEventListener("click", goNext);

    document.body.append(edgePrevBtn, edgeNextBtn);

    const resync = () => syncMobileEdgeButtons();
    mobileEdgeMedia.addEventListener("change", resync);
    coarsePointerMedia.addEventListener("change", resync);
    window.addEventListener("resize", resync);
    syncMobileEdgeButtons();
  }

  function goTo(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    if (target === current) return;
    pauseAllVideos();
    current = target;
    updateUI();
    if (document.body.classList.contains("overview-mode")) {
      toggleOverview(false);
    }
  }

  function goNext() { goTo(current + 1); }
  function goPrev() { goTo(current - 1); }

  function toggleNotes(force) {
    const next = typeof force === "boolean" ? force : !deck.classList.contains("show-notes");
    deck.classList.toggle("show-notes", next);
    notesBtn.setAttribute("aria-pressed", String(next));
  }

  function ensureOverviewBuilt() {
    if (overviewGrid.dataset.built === "1") return;
    const fragment = document.createDocumentFragment();
    slides.forEach((slide, idx) => {
      const tile = document.createElement("button");
      tile.className = "overview-tile";
      tile.type = "button";
      tile.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      tile.dataset.index = String(idx);

      const num = document.createElement("span");
      num.className = "num";
      num.textContent = `Slide ${idx + 1}`;

      const title = document.createElement("span");
      title.className = "title";
      title.textContent = slide.dataset.title || `Slide ${idx + 1}`;

      const duration = document.createElement("span");
      duration.className = "duration";
      const dur = slide.dataset.duration;
      duration.textContent = dur ? `~${dur} min` : "";

      tile.append(num, title, duration);
      tile.addEventListener("click", () => goTo(idx));
      fragment.appendChild(tile);
    });
    overviewGrid.appendChild(fragment);
    overviewGrid.dataset.built = "1";
  }

  function toggleOverview(force) {
    const next = typeof force === "boolean" ? force : !document.body.classList.contains("overview-mode");
    if (next) ensureOverviewBuilt();
    document.body.classList.toggle("overview-mode", next);
    overviewGrid.setAttribute("aria-hidden", String(!next));
    overviewBtn.setAttribute("aria-pressed", String(next));
    if (next) pauseAllVideos();
  }

  function toggleFullscreen() {
    const doc = document;
    const root = doc.documentElement;
    const isFullscreen =
      doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
    if (isFullscreen) {
      (doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen).call(doc);
    } else {
      (root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen).call(root);
    }
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);
  notesBtn.addEventListener("click", () => toggleNotes());
  overviewBtn.addEventListener("click", () => toggleOverview());
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      return;
    }
    const key = event.key;

    if (document.body.classList.contains("overview-mode") && key === "Escape") {
      event.preventDefault();
      toggleOverview(false);
      return;
    }

    switch (key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
        event.preventDefault();
        goNext();
        return;
      case "ArrowLeft":
      case "PageUp":
        event.preventDefault();
        goPrev();
        return;
      case "Home":
        event.preventDefault();
        goTo(0);
        return;
      case "End":
        event.preventDefault();
        goTo(slides.length - 1);
        return;
    }

    const lower = key.toLowerCase();
    if (lower === "n") { event.preventDefault(); toggleNotes(); return; }
    if (lower === "o") { event.preventDefault(); toggleOverview(); return; }
    if (lower === "f") { event.preventDefault(); toggleFullscreen(); return; }
  });

  // Keep the slide padding aligned with the real controls bar height
  function syncControlsHeight() {
    const c = document.querySelector(".deck-controls");
    if (!c) return;
    const styles = window.getComputedStyle(c);
    const isHidden = styles.display === "none" || styles.visibility === "hidden";
    const h = isHidden ? 0 : Math.max(56, c.offsetHeight);
    document.documentElement.style.setProperty("--controls-h", h + "px");
  }
  window.addEventListener("resize", syncControlsHeight);
  syncControlsHeight();
  initMobileEdgeButtons();

  // Activity timer badges: data-timer="600" on a .timer-badge element
  document.querySelectorAll(".timer-badge[data-timer]").forEach((badge) => {
    const seconds = Number(badge.dataset.timer);
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    let remaining = seconds;
    const label = document.createElement("span");
    label.className = "timer-label";
    badge.appendChild(label);
    function render() {
      const m = Math.floor(remaining / 60).toString().padStart(2, "0");
      const s = (remaining % 60).toString().padStart(2, "0");
      label.textContent = `${m}:${s}`;
    }
    render();
  });

  updateUI();
})();
