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
const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

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

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

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
