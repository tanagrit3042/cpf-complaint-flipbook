const PAGE_COUNT = 13;
const PAGE_VERSION = "20260926-1";
const PAGE_PATHS = Array.from(
  { length: PAGE_COUNT },
  (_, index) => `./new-pages/page-${String(index + 1).padStart(2, "0")}.jpg?v=${PAGE_VERSION}`,
);

const reader = document.querySelector("#reader");
const shell = document.querySelector("#slide-shell");
const slide = document.querySelector("#slide-image");
const previousButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const pageStatus = document.querySelector("#page-status");
const currentPage = document.querySelector("#current-page");
const pageGrid = document.querySelector("#page-grid");
const pageDialog = document.querySelector("#page-dialog");
const fullscreenButton = document.querySelector("#fullscreen-button");
const controls = document.querySelector("#controls");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function pageFromHash() {
  const match = window.location.hash.match(/^#page-(\d+)$/);
  if (!match) return 0;
  return Math.min(Math.max(Number(match[1]) - 1, 0), PAGE_COUNT - 1);
}

let pageIndex = pageFromHash();
let touchStartX = null;
let touchStartY = null;

function updatePage(index, animate = true) {
  const nextIndex = Math.min(Math.max(index, 0), PAGE_COUNT - 1);
  if (nextIndex === pageIndex && slide.complete && slide.naturalWidth) return;

  const direction = nextIndex > pageIndex ? "is-next" : "is-prev";
  const oldSource = slide.currentSrc || slide.src;
  pageIndex = nextIndex;
  slide.src = PAGE_PATHS[pageIndex];
  slide.alt = `หน้า ${pageIndex + 1} จาก ${PAGE_COUNT} ของเอกสารการจัดการข้อร้องเรียนอย่างง่าย`;
  currentPage.textContent = String(pageIndex + 1);
  previousButton.disabled = pageIndex === 0;
  nextButton.disabled = pageIndex === PAGE_COUNT - 1;
  controls.style.setProperty("--progress", String((pageIndex + 1) / PAGE_COUNT));
  history.replaceState(null, "", `#page-${pageIndex + 1}`);

  pageGrid.querySelectorAll(".page-choice").forEach((button, buttonIndex) => {
    if (buttonIndex === pageIndex) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  if (animate && !reducedMotion.matches && oldSource) {
    const sheet = document.createElement("img");
    sheet.className = `turning-sheet ${direction}`;
    sheet.src = oldSource;
    sheet.alt = "";
    sheet.addEventListener("animationend", () => sheet.remove(), { once: true });
    shell.querySelectorAll(".turning-sheet").forEach((oldSheet) => oldSheet.remove());
    shell.append(sheet);
  }
}

function buildPagePicker() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < PAGE_COUNT; index += 1) {
    const button = document.createElement("button");
    button.className = "page-choice";
    button.type = "button";
    button.setAttribute("aria-label", `ไปหน้า ${index + 1}`);
    const thumbnail = document.createElement("img");
    thumbnail.src = PAGE_PATHS[index];
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    const label = document.createElement("span");
    label.textContent = `หน้า ${index + 1}`;
    button.append(thumbnail, label);
    button.addEventListener("click", () => {
      updatePage(index);
      pageDialog.close();
    });
    fragment.append(button);
  }
  pageGrid.append(fragment);
}

previousButton.addEventListener("click", () => updatePage(pageIndex - 1));
nextButton.addEventListener("click", () => updatePage(pageIndex + 1));
pageStatus.addEventListener("click", () => {
  pageDialog.showModal();
  pageGrid.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
});
pageDialog.addEventListener("click", (event) => {
  if (event.target === pageDialog) pageDialog.close();
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await reader.requestFullscreen();
    }
  } catch {
    fullscreenButton.hidden = true;
  }
});
document.addEventListener("fullscreenchange", () => {
  fullscreenButton.setAttribute(
    "aria-label",
    document.fullscreenElement ? "ออกจากเต็มจอ" : "เปิดเต็มจอ",
  );
});
document.addEventListener("keydown", (event) => {
  if (pageDialog.open) return;
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    updatePage(pageIndex + 1);
  } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    updatePage(pageIndex - 1);
  }
});
shell.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });
shell.addEventListener("touchend", (event) => {
  if (touchStartX === null || touchStartY === null) return;
  const deltaX = event.changedTouches[0].screenX - touchStartX;
  const deltaY = event.changedTouches[0].screenY - touchStartY;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
    updatePage(pageIndex + (deltaX < 0 ? 1 : -1));
  }
  touchStartX = null;
  touchStartY = null;
}, { passive: true });
window.addEventListener("hashchange", () => updatePage(pageFromHash(), false));

buildPagePicker();
const initialPage = pageIndex;
pageIndex = -1;
updatePage(initialPage, false);
PAGE_PATHS.slice(0, 3).forEach((src) => { new Image().src = src; });
