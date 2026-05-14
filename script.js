/**
 * Gushwork assignment — vanilla JS only (no frameworks).
 * Sticky product strip: after first fold on scroll down; hides on scroll up.
 * Navbar and strip both use top:0; strip has higher z-index so it sits above the nav when visible.
 * Hero gallery: thumbnails + prev/next; hover zoom preview only for fine pointers at desktop widths (≥990px).
 */
const scrollHeader = document.getElementById("scrollHeader");
const FOLD_THRESHOLD = () => window.innerHeight;
const SCROLL_DELTA_THRESHOLD = 6;
let lastScrollY = window.scrollY;

function syncScrollHeaderOffset() {
  if (!scrollHeader) return;
  const visible = scrollHeader.classList.contains("is-visible");
  const h = visible ? Math.round(scrollHeader.offsetHeight) : 0;
  document.documentElement.style.setProperty("--scroll-header-offset", `${h}px`);
}

let scrollHeaderOffsetRaf = 0;

function scheduleScrollHeaderOffsetSync() {
  if (!scrollHeader) return;
  if (scrollHeaderOffsetRaf) cancelAnimationFrame(scrollHeaderOffsetRaf);
  scrollHeaderOffsetRaf = requestAnimationFrame(() => {
    scrollHeaderOffsetRaf = 0;
    syncScrollHeaderOffset();
  });
}

function updateScrollHeader() {
  if (!scrollHeader) return;

  const y = window.scrollY;
  const delta = y - lastScrollY;
  lastScrollY = y;

  const fold = FOLD_THRESHOLD();
  let show = scrollHeader.classList.contains("is-visible");

  if (y < fold) {
    show = false;
  } else if (delta > SCROLL_DELTA_THRESHOLD) {
    show = true;
  } else if (delta < -SCROLL_DELTA_THRESHOLD) {
    show = false;
  }

  scrollHeader.classList.toggle("is-visible", show);
  // Avoid aria-hidden on a container with focusable children (Lighthouse). Prefer inert when supported.
  const quoteBtn = scrollHeader.querySelector(".js-open-quote-callback-modal");
  if ("inert" in scrollHeader) {
    scrollHeader.inert = !show;
    scrollHeader.removeAttribute("aria-hidden");
    if (quoteBtn) quoteBtn.removeAttribute("tabindex");
  } else {
    scrollHeader.setAttribute("aria-hidden", String(!show));
    if (quoteBtn) {
      if (show) quoteBtn.removeAttribute("tabindex");
      else quoteBtn.setAttribute("tabindex", "-1");
    }
  }
  syncScrollHeaderOffset();
  scheduleScrollHeaderOffsetSync();
}

window.addEventListener("scroll", updateScrollHeader, { passive: true });
window.addEventListener("resize", updateScrollHeader);
updateScrollHeader();

if (scrollHeader && typeof ResizeObserver !== "undefined") {
  const ro = new ResizeObserver(() => scheduleScrollHeaderOffsetSync());
  ro.observe(scrollHeader);
}

const activeImage = document.getElementById("activeImage");
const zoomPreview = document.getElementById("zoomPreview");
const zoomLens = document.getElementById("zoomLens");
const thumbs = [...document.querySelectorAll(".thumb")];
const thumbTrack = document.getElementById("thumbTrack");
const thumbPrev = document.getElementById("thumbPrev");
const thumbNext = document.getElementById("thumbNext");
let activeThumbIndex = thumbs.findIndex((thumb) => thumb.classList.contains("is-active"));
if (activeThumbIndex < 0) activeThumbIndex = 0;
const lensHalfSize = 62;
const HERO_ZOOM_HOVER_MQ = "(hover: hover) and (pointer: fine) and (min-width: 990px)";

function hoverZoomAllowed() {
  return typeof window.matchMedia === "function" && window.matchMedia(HERO_ZOOM_HOVER_MQ).matches;
}

function clearHeroZoom() {
  if (!activeImage || !zoomPreview) return;
  activeImage.classList.remove("is-zooming");
  zoomPreview.classList.remove("is-visible");
}

function setActiveThumb(targetThumb) {
  thumbs.forEach((thumb) => thumb.classList.remove("is-active"));
  targetThumb.classList.add("is-active");
  activeThumbIndex = thumbs.indexOf(targetThumb);
  const img = targetThumb.querySelector("img");
  if (!img) return;
  activeImage.style.backgroundImage = `url("${img.src}")`;
  if (zoomPreview && hoverZoomAllowed()) {
    zoomPreview.style.backgroundImage = `url("${img.src}")`;
  }
  targetThumb.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
}

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => setActiveThumb(thumb));
});

if (thumbTrack && zoomPreview && hoverZoomAllowed()) {
  const firstThumbImage = thumbs[activeThumbIndex]?.querySelector("img");
  if (firstThumbImage) {
    zoomPreview.style.backgroundImage = `url("${firstThumbImage.src}")`;
  }
}

if (activeImage && zoomPreview && zoomLens && typeof window.matchMedia === "function") {
  activeImage.addEventListener("mouseenter", () => {
    if (!hoverZoomAllowed()) return;
    activeImage.classList.add("is-zooming");
    zoomPreview.classList.add("is-visible");
  });

  activeImage.addEventListener("mouseleave", () => {
    clearHeroZoom();
  });

  activeImage.addEventListener("mousemove", (event) => {
    if (!hoverZoomAllowed()) return;
    const rect = activeImage.getBoundingClientRect();
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;
    const x = Math.max(lensHalfSize, Math.min(rawX, rect.width - lensHalfSize));
    const y = Math.max(lensHalfSize, Math.min(rawY, rect.height - lensHalfSize));
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    zoomLens.style.left = `${x}px`;
    zoomLens.style.top = `${y}px`;
    zoomPreview.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
  });

  const zoomHoverMq = window.matchMedia(HERO_ZOOM_HOVER_MQ);
  zoomHoverMq.addEventListener("change", () => {
    if (!zoomHoverMq.matches) clearHeroZoom();
    else {
      const img = thumbs[activeThumbIndex]?.querySelector("img");
      if (img) zoomPreview.style.backgroundImage = `url("${img.src}")`;
    }
  });
}

if (thumbPrev && thumbNext && thumbs.length > 0) {
  thumbPrev.addEventListener("click", () => {
    activeThumbIndex = (activeThumbIndex - 1 + thumbs.length) % thumbs.length;
    setActiveThumb(thumbs[activeThumbIndex]);
  });

  thumbNext.addEventListener("click", () => {
    activeThumbIndex = (activeThumbIndex + 1) % thumbs.length;
    setActiveThumb(thumbs[activeThumbIndex]);
  });
}

function setupCarousel(trackId, prevId, nextId) {
  const track = document.getElementById(trackId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  if (!track || !prev || !next) return;

  function scrollStep() {
    const card = track.querySelector(".app-industry-card, .app-card");
    if (!card) return 340;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }

  function maxScrollLeft() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  prev.addEventListener("click", () => {
    if (track.scrollLeft <= 1) {
      track.scrollTo({ left: maxScrollLeft(), behavior: "smooth" });
      return;
    }

    track.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    if (track.scrollLeft >= maxScrollLeft() - 1) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    track.scrollBy({ left: scrollStep(), behavior: "smooth" });
  });
}

setupCarousel("appTrack", "appPrev", "appNext");

const PROCESS_ICON = "https://ap-south-1.graphassets.com/clz6ji1z50p3g07ppegum4fc2/cmp3va6vh17pd07oalblm0u5z";
const PROCESS_IMG_A = "https://ap-south-1.graphassets.com/clz6ji1z50p3g07ppegum4fc2/cmp46tqrh06nx07mqxdccsl6p";
const PROCESS_IMG_B = "https://ap-south-1.graphassets.com/clz6ji1z50p3g07ppegum4fc2/cmp46tqrh06nx07mqxdccsl6p";

const MANUFACTURING_STEPS = [
  {
    title: "High-Grade Raw Material Selection",
    desc: "Virgin PE100 resin is sourced and validated for density, melt flow, and long-term hydrostatic strength before it ever enters the extrusion line.",
    bullets: ["PE100 grade material", "Optimal molecular weight distribution"],
    image: PROCESS_IMG_A,
    imageAlt: "Industrial material handling on site",
  },
  {
    title: "Precision Extrusion",
    desc: "The melt is homogenized and pushed through a die designed for your diameter and SDR, maintaining stable pressure and output for uniform wall thickness.",
    bullets: ["Temperature-controlled barrel zones", "Screen packs for melt purity"],
    image: PROCESS_IMG_B,
    imageAlt: "HDPE pipe product",
  },
  {
    title: "Controlled Cooling",
    desc: "Graduated cooling stabilizes crystallinity and relieves internal stresses so the pipe retains toughness and dimensional stability in service.",
    bullets: ["Water bath calibration sequence", "Stress-relief before sizing"],
    image: PROCESS_IMG_B,
    imageAlt: "HDPE pipe product",
  },
  {
    title: "Vacuum Sizing and Calibration",
    desc: "Vacuum sizing tanks hold precise outer diameter while internal pressure supports the melt, keeping roundness and wall thickness uniform along the length.",
    bullets: ["Vacuum-assisted OD control", "Wall thickness monitored continuously"],
    image: PROCESS_IMG_B,
    imageAlt: "HDPE pipe product",
  },
  {
    title: "Rigorous Quality Control",
    desc: "Dimensional checks, visual inspection, and pressure testing confirm every batch meets specification before pipes move to marking and finishing.",
    bullets: ["Hydrostatic and dimension checks", "Traceable batch documentation"],
    image: PROCESS_IMG_B,
    imageAlt: "HDPE pipe product",
  },
  {
    title: "Marking and Traceability",
    desc: "Permanent markings record size, standard, production date, and manufacturer so installers and auditors can verify compliance in the field.",
    bullets: ["Standards-compliant coding", "Readable under site lighting"],
    image: PROCESS_IMG_B,
    imageAlt: "HDPE pipe product",
  },
  {
    title: "Accurate Cutting",
    desc: "Cut-to-length systems deliver square ends and consistent lengths for efficient jointing, reducing waste and rework on the job site.",
    bullets: ["Length tolerance held tight", "Burr-free finish for fusion"],
    image: PROCESS_IMG_B,
    imageAlt: "HDPE pipe product",
  },
  {
    title: "Protective Packaging",
    desc: "Finished pipes are bundled, protected, and labeled for safe handling and storage so they arrive ready for trench, bore, or above-ground installation.",
    bullets: ["Bundle integrity for transport", "Weather-resistant wrapping where needed"],
    image: PROCESS_IMG_B,
    imageAlt: "HDPE pipe product",
  },
];

function setupManufacturingProcessTabs() {
  const panel = document.getElementById("processPanel");
  const titleEl = panel?.querySelector(".process-detail-title");
  const descEl = panel?.querySelector(".process-detail-desc");
  const listEl = panel?.querySelector(".process-detail-list");
  const imgEl = document.getElementById("processPanelImage");
  const tabs = [...document.querySelectorAll(".process-step-btn")];
  const prev = document.getElementById("processPrev");
  const next = document.getElementById("processNext");
  const imagePrev = document.getElementById("processImagePrev");
  const imageNext = document.getElementById("processImageNext");
  if (!panel || !titleEl || !descEl || !listEl || !imgEl || tabs.length === 0) return;
  const tabLabels = tabs.map((tab) => tab.textContent.trim());
  let activeProcessIndex = 0;

  function renderStep(index) {
    const step = MANUFACTURING_STEPS[index];
    if (!step) return;
    activeProcessIndex = index;
    titleEl.textContent = step.title;
    descEl.textContent = step.desc;
    imgEl.src = step.image;
    imgEl.alt = step.imageAlt;
    listEl.innerHTML = step.bullets
      .map(
        (b) =>
          `<li><img src="${PROCESS_ICON}" width="20" height="20" alt="" aria-hidden="true" /><span>${escapeHtml(b)}</span></li>`
      )
      .join("");
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.dataset.mobileLabel = `Step ${i + 1}/${tabs.length}: ${tabLabels[i]}`;
    });
    panel.setAttribute("aria-labelledby", tabs[index].id);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => renderStep(index));
  });

  prev?.addEventListener("click", () => {
    renderStep((activeProcessIndex - 1 + tabs.length) % tabs.length);
  });

  next?.addEventListener("click", () => {
    renderStep((activeProcessIndex + 1) % tabs.length);
  });

  imagePrev?.addEventListener("click", () => {
    renderStep((activeProcessIndex - 1 + tabs.length) % tabs.length);
  });

  imageNext?.addEventListener("click", () => {
    renderStep((activeProcessIndex + 1) % tabs.length);
  });

  renderStep(0);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

setupManufacturingProcessTabs();

// Catalogue request form
async function handleCatalogueRequest(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector(".faq-email-input");
  const btn = form.querySelector(".button-51");
  if (!input || !btn) return;
  if (!input.checkValidity()) {
    input.reportValidity();
    return;
  }
  const email = input.value.trim();
  const original = btn.innerHTML;
  btn.innerHTML = '<p class="text-52"><span class="text-white">Sending...</span></p>';
  btn.disabled = true;
  try {
    await submitHubSpotForm({
      firstname: "FAQ / catalogue email signup",
      email,
      company: "—",
      mobilephone: "",
    });
    btn.innerHTML = '<p class="text-52"><span class="text-white">Submitted!</span></p>';
    input.value = "";
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 3000);
  } catch (err) {
    alert(err.message || "Could not submit. Please try again.");
    btn.innerHTML = original;
    btn.disabled = false;
  }
}

// Accordion behavior: keep a single FAQ expanded.
const FAQ_ICON_ACTIVE  = "https://ap-south-1.graphassets.com/clz6ji1z50p3g07ppegum4fc2/cmp40wxm600kz08o4t27veqkr";
const FAQ_ICON_DEFAULT = "https://ap-south-1.graphassets.com/clz6ji1z50p3g07ppegum4fc2/cmp40wxwu00l608o4gtbpaz0x";

function setFaqIcon(item, open) {
  const img = item.querySelector(".faq-icon");
  if (img) img.src = open ? FAQ_ICON_ACTIVE : FAQ_ICON_DEFAULT;
}

const faqItems = [...document.querySelectorAll(".faq-list .faq-item")];
faqItems.forEach((item) => {
  const header = item.querySelector(".faq-header");
  if (!header) return;
  header.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    faqItems.forEach((other) => {
      other.classList.remove("is-open");
      const h = other.querySelector(".faq-header");
      if (h) h.setAttribute("aria-expanded", "false");
      setFaqIcon(other, false);
    });
    if (!isOpen) {
      item.classList.add("is-open");
      header.setAttribute("aria-expanded", "true");
      setFaqIcon(item, true);
    }
  });
});

const ctaQuoteForm = document.getElementById("ctaQuoteForm");
if (ctaQuoteForm) {
  ctaQuoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!ctaQuoteForm.reportValidity()) return;
    const btn = ctaQuoteForm.querySelector(".cta-transform-submit");
    if (!btn) return;
    const prev = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;
    const fd = new FormData(ctaQuoteForm);
    const phoneRaw = (fd.get("phone") || "").toString().trim();
    const cc = (fd.get("countryCode") || "+91").toString().trim();
    const mobilephone = phoneRaw ? `${cc}${phoneRaw}`.replace(/\s+/g, "") : "";
    try {
      await submitHubSpotForm({
        firstname: (fd.get("fullName") || "").toString().trim() || "Website CTA",
        email: (fd.get("email") || "").toString().trim(),
        company: (fd.get("company") || "").toString().trim() || "—",
        mobilephone,
      });
      btn.textContent = "Request sent";
      ctaQuoteForm.reset();
      setTimeout(() => {
        btn.textContent = prev;
        btn.disabled = false;
      }, 2500);
    } catch (err) {
      alert(err.message || "Could not submit. Please try again or email us directly.");
      btn.textContent = prev;
      btn.disabled = false;
    }
  });
}

/** HubSpot form (Marketing → Forms). Field names verified against this form’s API. */
const HUBSPOT_PORTAL_ID = "245234841";
const HUBSPOT_FORM_GUID = "f367a2c2-c797-452a-891b-eb286bce6d07";

function getHubSpotUtk() {
  const m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : undefined;
}

async function submitHubSpotForm({ firstname, email, company, mobilephone }) {
  const fields = [
    { objectTypeId: "0-1", name: "firstname", value: String(firstname ?? "") },
    { objectTypeId: "0-1", name: "email", value: String(email ?? "") },
    { objectTypeId: "0-1", name: "company", value: String(company ?? "") },
    { objectTypeId: "0-1", name: "mobilephone", value: String(mobilephone ?? "") },
  ];
  const payload = {
    submittedAt: new Date().toISOString(),
    fields,
    context: {
      pageUri: window.location.href,
      pageName: document.title || "Page",
    },
  };
  const hutk = getHubSpotUtk();
  if (hutk) payload.context.hutk = hutk;

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "cors",
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const errMsg =
      data.message ||
      (Array.isArray(data.errors) && data.errors[0]?.message) ||
      `Request failed (${res.status})`;
    throw new Error(errMsg);
  }
  return data;
}

const datasheetModal = document.getElementById("datasheetModal");
const quoteCallbackModal = document.getElementById("quoteCallbackModal");

function syncModalBodyScrollLock() {
  const anyOpen =
    (datasheetModal && !datasheetModal.hasAttribute("hidden")) ||
    (quoteCallbackModal && !quoteCallbackModal.hasAttribute("hidden"));
  document.body.style.overflow = anyOpen ? "hidden" : "";
}

const openDatasheetModal = document.getElementById("openDatasheetModal");
const closeDatasheetModal = document.getElementById("closeDatasheetModal");
const datasheetModalForm = document.getElementById("datasheetModalForm");
const datasheetEmailInput = document.getElementById("datasheetEmail");
const datasheetSubmitBtn = datasheetModalForm?.querySelector(".datasheet-modal__submit");
let datasheetModalLastFocus = null;

function updateDatasheetSubmitState() {
  if (!datasheetSubmitBtn || !datasheetEmailInput) return;
  const valid = datasheetEmailInput.checkValidity();
  datasheetSubmitBtn.disabled = !valid;
  datasheetSubmitBtn.setAttribute("aria-disabled", String(!valid));
}

function openDatasheetModalFn() {
  if (!datasheetModal) return;
  datasheetModalLastFocus = document.activeElement;
  datasheetModal.removeAttribute("hidden");
  datasheetModal.setAttribute("aria-hidden", "false");
  syncModalBodyScrollLock();
  document.getElementById("datasheetEmail")?.focus();
  requestAnimationFrame(() => updateDatasheetSubmitState());
}

function closeDatasheetModalFn() {
  if (!datasheetModal) return;
  datasheetModal.setAttribute("hidden", "");
  datasheetModal.setAttribute("aria-hidden", "true");
  syncModalBodyScrollLock();
  if (datasheetModalLastFocus && typeof datasheetModalLastFocus.focus === "function") {
    datasheetModalLastFocus.focus();
  }
}

openDatasheetModal?.addEventListener("click", openDatasheetModalFn);
closeDatasheetModal?.addEventListener("click", closeDatasheetModalFn);

const openQuoteCallbackModalTriggers = document.querySelectorAll(".js-open-quote-callback-modal");
const closeQuoteCallbackModal = document.getElementById("closeQuoteCallbackModal");
const quoteCallbackModalForm = document.getElementById("quoteCallbackModalForm");
const quoteCallbackSubmitBtn = quoteCallbackModalForm?.querySelector(".datasheet-modal__submit");
let quoteCallbackModalLastFocus = null;

function updateQuoteCallbackSubmitState() {
  if (!quoteCallbackSubmitBtn || !quoteCallbackModalForm) return;
  const valid = quoteCallbackModalForm.checkValidity();
  quoteCallbackSubmitBtn.disabled = !valid;
  quoteCallbackSubmitBtn.setAttribute("aria-disabled", String(!valid));
}

function openQuoteCallbackModalFn() {
  if (!quoteCallbackModal) return;
  quoteCallbackModalLastFocus = document.activeElement;
  quoteCallbackModal.removeAttribute("hidden");
  quoteCallbackModal.setAttribute("aria-hidden", "false");
  syncModalBodyScrollLock();
  document.getElementById("quoteCallbackFullName")?.focus();
  requestAnimationFrame(() => updateQuoteCallbackSubmitState());
}

function closeQuoteCallbackModalFn() {
  if (!quoteCallbackModal) return;
  quoteCallbackModal.setAttribute("hidden", "");
  quoteCallbackModal.setAttribute("aria-hidden", "true");
  syncModalBodyScrollLock();
  if (quoteCallbackModalLastFocus && typeof quoteCallbackModalLastFocus.focus === "function") {
    quoteCallbackModalLastFocus.focus();
  }
}

openQuoteCallbackModalTriggers.forEach((btn) => {
  btn.addEventListener("click", openQuoteCallbackModalFn);
});
closeQuoteCallbackModal?.addEventListener("click", closeQuoteCallbackModalFn);

document.querySelectorAll(".site-modal [data-modal-dismiss]").forEach((backdrop) => {
  backdrop.addEventListener("click", () => {
    const root = backdrop.closest(".site-modal");
    if (root === datasheetModal) closeDatasheetModalFn();
    else if (root === quoteCallbackModal) closeQuoteCallbackModalFn();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (quoteCallbackModal && !quoteCallbackModal.hasAttribute("hidden")) {
    closeQuoteCallbackModalFn();
    return;
  }
  if (datasheetModal && !datasheetModal.hasAttribute("hidden")) {
    closeDatasheetModalFn();
  }
});

datasheetEmailInput?.addEventListener("input", updateDatasheetSubmitState);
datasheetEmailInput?.addEventListener("change", updateDatasheetSubmitState);

quoteCallbackModalForm?.addEventListener("input", updateQuoteCallbackSubmitState);
quoteCallbackModalForm?.addEventListener("change", updateQuoteCallbackSubmitState);

if (datasheetModalForm) {
  datasheetModalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!datasheetModalForm.reportValidity()) return;
    const btn = datasheetModalForm.querySelector(".datasheet-modal__submit");
    if (!btn) return;
    const span = btn.querySelector("span");
    const prev = span ? span.textContent : "";
    const fd = new FormData(datasheetModalForm);
    const email = (fd.get("email") || "").toString().trim();
    const contactRaw = (fd.get("contact") || "").toString().trim();
    const cc = (fd.get("countryCode") || "+91").toString().trim();
    const contact = contactRaw ? `${cc}${contactRaw}`.replace(/\s+/g, "") : "";
    btn.disabled = true;
    if (span) span.textContent = "Sending...";
    try {
      await submitHubSpotForm({
        firstname: "Technical datasheet / catalogue download",
        email,
        company: "—",
        mobilephone: contact,
      });
      if (span) span.textContent = "Submitted!";
      btn.classList.add("datasheet-modal__submit--sent");
      setTimeout(() => {
        if (span) span.textContent = prev || "Download Brochure";
        btn.classList.remove("datasheet-modal__submit--sent");
        datasheetModalForm.reset();
        updateDatasheetSubmitState();
        closeDatasheetModalFn();
      }, 2000);
    } catch (err) {
      alert(err.message || "Could not submit. Please try again.");
      if (span) span.textContent = prev || "Download Brochure";
      btn.disabled = false;
      updateDatasheetSubmitState();
    }
  });
}

if (quoteCallbackModalForm) {
  quoteCallbackModalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!quoteCallbackModalForm.reportValidity()) return;
    const btn = quoteCallbackModalForm.querySelector(".datasheet-modal__submit");
    if (!btn) return;
    const span = btn.querySelector("span");
    const prev = span ? span.textContent : "";
    const fd = new FormData(quoteCallbackModalForm);
    const phoneRaw = (fd.get("phone") || "").toString().trim();
    const ccQuote = (fd.get("countryCode") || "+91").toString().trim();
    const mobilephone = phoneRaw ? `${ccQuote}${phoneRaw}`.replace(/\s+/g, "") : "";
    btn.disabled = true;
    if (span) span.textContent = "Sending...";
    try {
      await submitHubSpotForm({
        firstname: (fd.get("fullName") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim(),
        company: (fd.get("company") || "").toString().trim(),
        mobilephone,
      });
      if (span) span.textContent = "Submitted!";
      btn.classList.add("datasheet-modal__submit--sent");
      setTimeout(() => {
        if (span) span.textContent = prev || "Submit Form";
        btn.classList.remove("datasheet-modal__submit--sent");
        quoteCallbackModalForm.reset();
        updateQuoteCallbackSubmitState();
        closeQuoteCallbackModalFn();
      }, 2000);
    } catch (err) {
      alert(err.message || "Could not submit. Please try again.");
      if (span) span.textContent = prev || "Submit Form";
      btn.disabled = false;
      updateQuoteCallbackSubmitState();
    }
  });
}

function setupResourceFileDownloads() {
  document.querySelectorAll("a.resources-download").forEach((link) => {
    const raw = link.getAttribute("href");
    if (!raw || raw === "#" || raw.startsWith("#")) return;

    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const url = link.href;
      const filename =
        link.getAttribute("data-download-filename")?.trim() ||
        decodeURIComponent(url.split("/").pop()?.split("?")[0] || "document.pdf");

      try {
        const res = await fetch(url, { mode: "cors", credentials: "omit" });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      } catch {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  });
}

setupResourceFileDownloads();