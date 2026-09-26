const PAGE_COUNT = 13;
const PAGE_VERSION = "20260926-4";
const PAGE_PATHS = Array.from(
  { length: PAGE_COUNT },
  (_, index) => `./new-pages/page-${String(index + 1).padStart(2, "0")}.jpg?v=${PAGE_VERSION}`,
);

const reader = document.querySelector("#reader");
const shell = document.querySelector("#slide-shell");
let book = document.querySelector("#new-book");
const loading = document.querySelector("#new-loading");
const previousButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const pageStatus = document.querySelector("#page-status");
const currentPage = document.querySelector("#current-page");
const pageGrid = document.querySelector("#page-grid");
const pageDialog = document.querySelector("#page-dialog");
const fullscreenButton = document.querySelector("#fullscreen-button");
const landscapeButton = document.querySelector("#landscape-button");
const landscapeHelp = document.querySelector("#landscape-help");
const controls = document.querySelector("#controls");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const landscapeMedia = window.matchMedia("(orientation: landscape)");
const isLineInAppBrowser = /\bLine\//i.test(navigator.userAgent) || /\bLIFF\b/i.test(navigator.userAgent);
let virtualLandscape = false;

function pageFromHash() {
  const match = window.location.hash.match(/^#page-(\d+)$/);
  if (!match) return 0;
  return Math.min(Math.max(Number(match[1]) - 1, 0), PAGE_COUNT - 1);
}

let pageIndex = pageFromHash();
let pageFlip = null;
let bookSize = { width: 0, height: 0 };
let resizeTimer = null;

function updateControls(index) {
  pageIndex = index;
  currentPage.textContent = String(index + 1);
  previousButton.disabled = index === 0;
  nextButton.disabled = index === PAGE_COUNT - 1;
  controls.style.setProperty("--progress", String((index + 1) / PAGE_COUNT));
  history.replaceState(null, "", `#page-${index + 1}`);

  pageGrid.querySelectorAll(".page-choice").forEach((button, buttonIndex) => {
    if (buttonIndex === index) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function createFlipbook(startPage) {
  const width = Math.round(shell.clientWidth);
  const height = Math.round(shell.clientHeight);
  if (!width || !height) return;

  if (pageFlip) {
    pageFlip.destroy();
    book = document.createElement("div");
    book.id = "new-book";
    book.setAttribute("role", "img");
    book.setAttribute("aria-label", "เอกสารการจัดการข้อร้องเรียนอย่างง่าย 13 หน้า");
    shell.prepend(book);
  }
  bookSize = { width, height };
  loading.classList.remove("is-hidden");
  pageFlip = new St.PageFlip(book, {
    width,
    height,
    size: "fixed",
    usePortrait: true,
    autoSize: false,
    showCover: false,
    drawShadow: true,
    maxShadowOpacity: 0.35,
    flippingTime: reducedMotion.matches ? 100 : 800,
    mobileScrollSupport: true,
    swipeDistance: 28,
    startPage,
  });

  pageFlip.on("init", (event) => {
    loading.classList.add("is-hidden");
    updateControls(event.data.page);
  });
  pageFlip.on("flip", (event) => updateControls(event.data));
  const pages = PAGE_PATHS.map((path, index) => {
    const page = document.createElement("div");
    page.className = "book-page book-page--wide";
    const image = document.createElement("img");
    image.src = path;
    image.alt = `เอกสารใหม่ หน้า ${index + 1}`;
    image.draggable = false;
    page.append(image);
    return page;
  });
  pageFlip.loadFromHTML(pages);
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
      pageFlip?.flip(index, "top");
      pageDialog.close();
    });
    fragment.append(button);
  }
  pageGrid.append(fragment);
}

previousButton.addEventListener("click", () => pageFlip?.flipPrev("top"));
nextButton.addEventListener("click", () => pageFlip?.flipNext("top"));
pageStatus.addEventListener("click", () => {
  pageDialog.showModal();
  pageGrid.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
});
pageDialog.addEventListener("click", (event) => {
  if (event.target === pageDialog) pageDialog.close();
});

function updateFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement);
  const isReadingLandscape = isFullscreen || virtualLandscape;
  fullscreenButton.setAttribute(
    "aria-label",
    isReadingLandscape ? "ออกจากการอ่านแนวนอน" : "เปิดเต็มจอ",
  );
  fullscreenButton.querySelector(".fullscreen-label").textContent = isReadingLandscape
    ? "ออกจากแนวนอน"
    : "เต็มจอ";
}

function setVirtualLandscape(enabled) {
  virtualLandscape = enabled;
  reader.classList.toggle("is-virtual-landscape", enabled);
  document.documentElement.classList.toggle("has-virtual-landscape", enabled);
  landscapeButton.hidden = enabled;
  landscapeHelp.hidden = true;
  updateFullscreenButton();
}

async function enterLandscapeFullscreen() {
  if (isLineInAppBrowser && !landscapeMedia.matches) {
    setVirtualLandscape(true);
    return;
  }

  let orientationLocked = false;
  try {
    if (!document.fullscreenElement && reader.requestFullscreen) {
      await reader.requestFullscreen();
    }
  } catch {
    // Fullscreen is unavailable on some mobile browsers.
  }
  if (screen.orientation?.lock) {
    try {
      await screen.orientation.lock("landscape");
      orientationLocked = true;
    } catch {
      // Orientation locking requires fullscreen and browser support.
    }
  }
  if (!orientationLocked && !landscapeMedia.matches) {
    setVirtualLandscape(true);
  } else {
    landscapeHelp.hidden = true;
  }
}

fullscreenButton.addEventListener("click", async () => {
  if (virtualLandscape) {
    setVirtualLandscape(false);
    landscapeButton.hidden = false;
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // The browser controls how native fullscreen is closed.
      }
    }
    return;
  }
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await reader.requestFullscreen();
    }
  } catch {
    // Fullscreen is unavailable on some mobile browsers.
  }
});
landscapeButton.addEventListener("click", () => {
  landscapeButton.hidden = true;
  void enterLandscapeFullscreen();
});
document.addEventListener("fullscreenchange", () => {
  updateFullscreenButton();
});
landscapeMedia.addEventListener("change", (event) => {
  if (event.matches) {
    if (virtualLandscape) setVirtualLandscape(false);
    landscapeHelp.hidden = true;
  }
});
document.addEventListener("keydown", (event) => {
  if (pageDialog.open || !pageFlip) return;
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    pageFlip.flipNext("top");
  } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    pageFlip.flipPrev("top");
  }
});
window.addEventListener("hashchange", () => {
  const requestedPage = pageFromHash();
  if (pageFlip && requestedPage !== pageIndex) pageFlip.turnToPage(requestedPage);
});

const resizeObserver = new ResizeObserver(() => {
  const width = Math.round(shell.clientWidth);
  const height = Math.round(shell.clientHeight);
  if (width === bookSize.width && height === bookSize.height) return;
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => createFlipbook(pageIndex), 120);
});

buildPagePicker();
createFlipbook(pageIndex);
resizeObserver.observe(shell);
window.setTimeout(() => loading.classList.add("is-hidden"), 5000);
