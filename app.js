const PAGE_COUNT = 13;
const PAGE_PATHS = Array.from(
  { length: PAGE_COUNT },
  (_, index) => `./pages/page-${String(index + 1).padStart(2, "0")}.jpg`,
);

const bookElement = document.querySelector("#book");
const loadingElement = document.querySelector("#loading");
const previousButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const pageStatus = document.querySelector("#page-status");
const currentPageElement = document.querySelector("#current-page");
const totalPagesElement = document.querySelector("#total-pages");
const pageDialog = document.querySelector("#page-dialog");
const pageGrid = document.querySelector("#page-grid");
const controlsElement = document.querySelector("#controls");
const readerElement = document.querySelector(".reader");
const fullscreenButton = document.querySelector("#fullscreen-button");

const hashPage = Number.parseInt(window.location.hash.replace("#page-", ""), 10);
const initialPage = Number.isFinite(hashPage)
  ? Math.min(Math.max(hashPage - 1, 0), PAGE_COUNT - 1)
  : 0;

const pageFlip = new St.PageFlip(bookElement, {
  width: 620,
  height: 877,
  size: "stretch",
  minWidth: 280,
  maxWidth: 620,
  minHeight: 396,
  maxHeight: 877,
  maxShadowOpacity: 0.45,
  showCover: true,
  mobileScrollSupport: true,
  usePortrait: true,
  autoSize: true,
  drawShadow: true,
  flippingTime: 850,
  swipeDistance: 24,
  startPage: initialPage,
});

function updateControls(pageIndex) {
  const pageNumber = pageIndex + 1;
  currentPageElement.textContent = String(pageNumber);
  totalPagesElement.textContent = String(PAGE_COUNT);
  previousButton.disabled = pageIndex <= 0;
  nextButton.disabled = pageIndex >= PAGE_COUNT - 1;
  controlsElement.style.setProperty("--progress", String(pageNumber / PAGE_COUNT));

  pageGrid.querySelectorAll(".page-choice").forEach((button, index) => {
    if (index === pageIndex) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  history.replaceState(null, "", `#page-${pageNumber}`);
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
      pageFlip.flip(index, "top");
      pageDialog.close();
    });
    fragment.append(button);
  }

  pageGrid.append(fragment);
}

pageFlip.on("init", (event) => {
  loadingElement.classList.add("is-hidden");
  updateControls(event.data.page);
});

pageFlip.on("flip", (event) => {
  updateControls(event.data);
});

previousButton.addEventListener("click", () => pageFlip.flipPrev("top"));
nextButton.addEventListener("click", () => pageFlip.flipNext("top"));

pageStatus.addEventListener("click", () => {
  if (typeof pageDialog.showModal === "function") {
    pageDialog.showModal();
    const activePage = pageGrid.querySelector('[aria-current="page"]');
    activePage?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await readerElement.requestFullscreen();
    }
  } catch {
    fullscreenButton.hidden = true;
  }
});

document.addEventListener("fullscreenchange", () => {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenButton.classList.toggle("is-active", isFullscreen);
  fullscreenButton.setAttribute("aria-label", isFullscreen ? "ออกจากเต็มจอ" : "เปิดเต็มจอ");
});

pageDialog.addEventListener("click", (event) => {
  if (event.target === pageDialog) {
    pageDialog.close();
  }
});

document.addEventListener("keydown", (event) => {
  if (pageDialog.open) return;

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    pageFlip.flipPrev("top");
  }

  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    pageFlip.flipNext("top");
  }
});

window.addEventListener("hashchange", () => {
  const requestedPage = Number.parseInt(window.location.hash.replace("#page-", ""), 10);
  if (Number.isFinite(requestedPage) && requestedPage >= 1 && requestedPage <= PAGE_COUNT) {
    pageFlip.turnToPage(requestedPage - 1);
  }
});

buildPagePicker();
pageFlip.loadFromImages(PAGE_PATHS);

window.setTimeout(() => loadingElement.classList.add("is-hidden"), 5000);
