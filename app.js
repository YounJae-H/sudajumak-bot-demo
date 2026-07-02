class Command extends HTMLElement {
  connectedCallback() {
    const text = this.getAttribute("text") || "";
    this.outerHTML = `
      <div class="command">
        <code>${escapeHtml(text)}</code>
        <button class="copy-button" type="button" data-copy="${escapeAttr(text)}">복사</button>
      </div>
    `;
  }
}

class ImageSlot extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "이미지";
    const text = this.getAttribute("text") || "";
    this.outerHTML = `
      <div class="image-slot">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(text)}</span>
      </div>
    `;
  }
}

customElements.define("x-command", Command);
customElements.define("x-image-slot", ImageSlot);

document.querySelectorAll("Command").forEach((node) => {
  const replacement = document.createElement("x-command");
  replacement.setAttribute("text", node.getAttribute("text") || "");
  node.replaceWith(replacement);
});

document.querySelectorAll("ImageSlot").forEach((node) => {
  const replacement = document.createElement("x-image-slot");
  replacement.setAttribute("label", node.getAttribute("label") || "");
  replacement.setAttribute("text", node.getAttribute("text") || "");
  node.replaceWith(replacement);
});

const toast = document.querySelector(".toast");
const topbar = document.querySelector(".topbar");
const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const compactTopbarQuery = window.matchMedia("(max-width: 900px)");
const TOPBAR_HIDE_AFTER_SCROLL_Y = 96;
const TOPBAR_TOGGLE_DISTANCE = 72;
let lastScrollY = Math.max(0, window.scrollY);
let topbarReferenceScrollY = Math.max(0, window.scrollY);
let keepTopbarExpandedUntil = 0;
let topbarScrollTimer = 0;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char];
  });
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 1500);
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;

  const value = button.getAttribute("data-copy");
  try {
    await navigator.clipboard.writeText(value);
    showToast("명령어를 복사했습니다.");
  } catch {
    showToast(value);
  }
});

function updateActiveNav() {
  const offset = window.scrollY + 140;
  let activeId = sections[0]?.id;
  sections.forEach((section) => {
    if (section.offsetTop <= offset) {
      activeId = section.id;
    }
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

function expandTopbarTemporarily(duration = 900) {
  if (!topbar) return;
  topbar.classList.remove("is-collapsed");
  lastScrollY = Math.max(0, window.scrollY);
  topbarReferenceScrollY = lastScrollY;
  keepTopbarExpandedUntil = Date.now() + duration;
}

function isCompactTopbarViewport() {
  return compactTopbarQuery.matches || Boolean(window.Telegram?.WebApp);
}

function setTopbarCollapsed(collapsed, scrollY) {
  topbar.classList.toggle("is-collapsed", collapsed);
  topbarReferenceScrollY = scrollY;
}

function updateTopbarVisibility() {
  if (!topbar) return;

  const currentScrollY = Math.max(0, window.scrollY);
  if (!isCompactTopbarViewport() || currentScrollY < TOPBAR_HIDE_AFTER_SCROLL_Y) {
    setTopbarCollapsed(false, currentScrollY);
    lastScrollY = currentScrollY;
    return;
  }

  if (Date.now() < keepTopbarExpandedUntil) {
    lastScrollY = currentScrollY;
    topbarReferenceScrollY = currentScrollY;
    return;
  }

  const isCollapsed = topbar.classList.contains("is-collapsed");
  if (currentScrollY > lastScrollY) {
    if (isCollapsed) {
      topbarReferenceScrollY = currentScrollY;
    } else if (currentScrollY - topbarReferenceScrollY >= TOPBAR_TOGGLE_DISTANCE) {
      setTopbarCollapsed(true, currentScrollY);
    }
  } else if (currentScrollY < lastScrollY) {
    if (!isCollapsed) {
      topbarReferenceScrollY = currentScrollY;
    } else if (topbarReferenceScrollY - currentScrollY >= TOPBAR_TOGGLE_DISTANCE) {
      setTopbarCollapsed(false, currentScrollY);
    }
  }
  lastScrollY = currentScrollY;
}

function handleScroll() {
  updateActiveNav();
  updateTopbarVisibility();
  window.clearTimeout(topbarScrollTimer);
  topbarScrollTimer = window.setTimeout(updateTopbarVisibility, 120);
}

window.addEventListener("scroll", handleScroll, { passive: true });
navLinks.forEach((link) => {
  link.addEventListener("click", () => expandTopbarTemporarily());
});
if (typeof compactTopbarQuery.addEventListener === "function") {
  compactTopbarQuery.addEventListener("change", updateTopbarVisibility);
}
updateActiveNav();
updateTopbarVisibility();

const spotlightTargets = Array.from(document.querySelectorAll(".hero, .guide-section"));
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

function updateSpotlight(event) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  target.style.setProperty("--spot-x", `${x}%`);
  target.style.setProperty("--spot-y", `${y}%`);
  target.classList.add("spotlight-on");
}

function clearSpotlight(event) {
  event.currentTarget.classList.remove("spotlight-on");
}

if (finePointerQuery.matches) {
  spotlightTargets.forEach((target) => {
    target.addEventListener("pointermove", updateSpotlight, { passive: true });
    target.addEventListener("pointerleave", clearSpotlight);
  });
}
