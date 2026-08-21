import {
  AD_PLAYING_ATTR,
  FONT_LINK,
  LINE_CLASS,
  LOADER_TRANSITION_ENDED,
  LYRICS_AD_OVERLAY_ID,
  LYRICS_LOADER_ID,
  LYRICS_WRAPPER_CREATED_LOG,
  LYRICS_WRAPPER_ID,
  NO_LYRICS_TEXT_SELECTOR,
  NOTO_SANS_UNIVERSAL_LINK,
  PLAYER_BAR_SELECTOR,
  ROMANIZED_LYRICS_CLASS,
  TAB_RENDERER_SELECTOR,
  TRANSLATED_LYRICS_CLASS,
  WORD_HIGHLIGHT_CLASS,
} from "@constants";
import { AppState } from "@core/appState";
import { mainView } from "@modules/ui/mainLyricsView";
import { reflow, toMs } from "@braccato/core/util";
import { log } from "@utils";
import { scrollEventHandler } from "./observer";

let adStateObserver: MutationObserver | null = null;

/**
 * Creates or reuses the lyrics wrapper element and sets up scroll event handling.
 */
export function createLyricsWrapper(): HTMLElement {
  const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR) as HTMLElement;

  tabRenderer.removeEventListener("scroll", scrollEventHandler);
  tabRenderer.addEventListener("scroll", scrollEventHandler);

  const existingWrapper = document.getElementById(LYRICS_WRAPPER_ID);

  if (existingWrapper) {
    existingWrapper.replaceChildren();
    return existingWrapper;
  }

  const wrapper = document.createElement("div");
  wrapper.id = LYRICS_WRAPPER_ID;
  tabRenderer.appendChild(wrapper);

  wrapper.addEventListener("copy", (e: ClipboardEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();

    fragment.querySelectorAll(`.${WORD_HIGHLIGHT_CLASS}`).forEach(el => el.remove());

    const lineElements = fragment.querySelectorAll(`.${LINE_CLASS}`);

    if (lineElements.length === 0) {
      const text = fragment.textContent?.replace(/\s+/g, " ").trim();
      if (text && e.clipboardData) {
        e.preventDefault();
        e.clipboardData.setData("text/plain", text);
      }
      return;
    }

    const lines: string[] = [];

    for (const line of lineElements) {
      const mainLine = Array.from(line.children).find(child => child.classList.contains("blyrics-line-main"));
      const mainText = mainLine?.textContent?.replace(/\s+/g, " ").trim();

      const romanized = line.querySelector(`.${ROMANIZED_LYRICS_CLASS}`)?.textContent?.trim();
      const translated = line.querySelector(`.${TRANSLATED_LYRICS_CLASS}`)?.textContent?.trim();

      const lineParts = [mainText, romanized, translated].filter(Boolean);
      if (lineParts.length > 0) lines.push(lineParts.join("\n"));
    }

    if (lines.length > 0) {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", lines.join("\n"));
    }
  });

  log(LYRICS_WRAPPER_CREATED_LOG);
  return wrapper;
}

let loaderStateTimeout: number | undefined;

type LoaderState = "full-loader" | "small-loader" | "showing-message" | "exiting" | "exiting-message" | "hidden";

function setLoaderState(state: LoaderState, text?: string): void {
  const loader = document.getElementById(LYRICS_LOADER_ID);
  if (!loader) return;

  loader.setAttribute("state", state);
  if (text !== undefined) {
    loader.style.setProperty("--blyrics-loader-text", `"${text}"`);
  }
}

/**
 * Renders and displays the loading spinner for lyrics fetching.
 */
export function renderLoader(small = false): void {
  if (isAdPlaying()) {
    return;
  }
  if (!small) {
    cleanup();
  }

  try {
    const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR) as HTMLElement;
    let loaderWrapper = document.getElementById(LYRICS_LOADER_ID);
    if (!loaderWrapper) {
      loaderWrapper = document.createElement("div");
      loaderWrapper.id = LYRICS_LOADER_ID;
      tabRenderer.prepend(loaderWrapper);
    }

    clearTimeout(loaderStateTimeout);
    clearTimeout(AppState.loaderAnimationEndTimeout);

    if (loaderWrapper.getAttribute("state") === "hidden" || loaderWrapper.hidden) {
      loaderWrapper.setAttribute("state", "hidden");
      reflow(loaderWrapper);
    }

    loaderWrapper.hidden = false;

    if (small) {
      setLoaderState("small-loader", "Still searching...");
    } else {
      setLoaderState("full-loader", "Searching...");
    }
  } catch (err) {
    log(err);
  }
}

/**
 * Removes the loading spinner with animation and cleanup.
 */
export function flushLoader(showNoSyncAvailable = false): void {
  try {
    const loaderWrapper = document.getElementById(LYRICS_LOADER_ID);
    if (!loaderWrapper) return;

    clearTimeout(loaderStateTimeout);
    clearTimeout(AppState.loaderAnimationEndTimeout);

    const performExit = (fromMessage = false) => {
      setLoaderState(fromMessage ? "exiting-message" : "exiting");

      const duration = toMs(
        window.getComputedStyle(loaderWrapper).getPropertyValue("--blyrics-loader-transition-duration")
      );
      AppState.loaderAnimationEndTimeout = window.setTimeout(() => {
        setLoaderState("hidden");
        loaderWrapper.hidden = true;
        log(LOADER_TRANSITION_ENDED);
      }, duration * 2);
    };

    if (showNoSyncAvailable) {
      setLoaderState("showing-message", "No synced lyrics available");

      loaderStateTimeout = window.setTimeout(() => {
        performExit(true);
      }, 3000);
    } else {
      performExit(loaderWrapper.getAttribute("state") === "showing-message");
    }
  } catch (err) {
    log(err);
  }
}

/**
 * Checks if the loader is currently active or animating.
 */
export function isLoaderActive(): boolean {
  try {
    const loaderWrapper = document.getElementById(LYRICS_LOADER_ID);
    if (loaderWrapper) {
      const state = loaderWrapper.getAttribute("state");
      return state !== "hidden" && state !== null;
    }
  } catch (err) {
    log(err);
  }
  return false;
}

/**
 * Checks if an advertisement is currently playing.
 */
export function isAdPlaying(): boolean {
  const playerBar = document.querySelector(PLAYER_BAR_SELECTOR);
  return playerBar?.hasAttribute(AD_PLAYING_ATTR) ?? false;
}

/**
 * Sets up a MutationObserver to watch for advertisement state changes.
 */
export function setupAdObserver(): void {
  const playerBar = document.querySelector(PLAYER_BAR_SELECTOR);
  const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR) as HTMLElement;

  if (!playerBar || !tabRenderer) {
    setTimeout(setupAdObserver, 1000);
    return;
  }

  if (adStateObserver) {
    adStateObserver.disconnect();
  }

  let adOverlay = document.getElementById(LYRICS_AD_OVERLAY_ID);
  if (!adOverlay) {
    adOverlay = document.createElement("div");
    adOverlay.id = LYRICS_AD_OVERLAY_ID;
    tabRenderer.prepend(adOverlay);
  }

  if (isAdPlaying()) {
    showAdOverlay();
  }

  adStateObserver = new MutationObserver(() => {
    if (isAdPlaying()) {
      showAdOverlay();
    } else {
      hideAdOverlay();
    }
  });

  adStateObserver.observe(playerBar, { attributes: true, attributeFilter: [AD_PLAYING_ATTR] });
}

/**
 * Shows the advertisement overlay on the lyrics panel.
 */
export function showAdOverlay(): void {
  const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR) as HTMLElement;
  if (!tabRenderer) {
    return;
  }

  const loader = document.getElementById(LYRICS_LOADER_ID);
  if (loader) {
    loader.removeAttribute("active");
  }

  let adOverlay = document.getElementById(LYRICS_AD_OVERLAY_ID);
  if (!adOverlay) {
    adOverlay = document.createElement("div");
    adOverlay.id = LYRICS_AD_OVERLAY_ID;
    tabRenderer.prepend(adOverlay);
  }

  adOverlay.setAttribute("active", "");
}

/**
 * Hides the advertisement overlay from the lyrics panel.
 */
export function hideAdOverlay(): void {
  const adOverlay = document.getElementById(LYRICS_AD_OVERLAY_ID);
  if (adOverlay) {
    adOverlay.removeAttribute("active");
  }
}

/**
 * Clears all lyrics content from the wrapper element.
 */
function clearLyrics(): void {
  try {
    const lyricsWrapper = document.getElementById(LYRICS_WRAPPER_ID);
    if (lyricsWrapper) {
      lyricsWrapper.replaceChildren();
    }
  } catch (err) {
    log(err);
  }
}

export function resetThumbnailState(): void {}

/**
 * Injects required head tags including font links and CSS.
 */
export async function injectHeadTags(): Promise<void> {
  const fontLink = document.createElement("link");
  fontLink.href = FONT_LINK;
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);

  const notoFontLink = document.createElement("link");
  notoFontLink.href = NOTO_SANS_UNIVERSAL_LINK;
  notoFontLink.rel = "stylesheet";
  document.head.appendChild(notoFontLink);

  const cssFiles = ["css/blyrics/index.css"];

  for (const file of cssFiles) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL(file);
    link.id = `blyrics-style-${file.replace(/(\/index)?\.css$/, "")}`;
    document.head.appendChild(link);
  }
}

/**
 * Cleans up elements and resets state when switching songs.
 */
export function cleanup(): void {
  mainView.clear();

  AppState.lyricData = null;

  const ytMusicLyrics = (document.querySelector(NO_LYRICS_TEXT_SELECTOR) as HTMLElement)?.parentElement;
  if (ytMusicLyrics) {
    ytMusicLyrics.style.display = "";
  }

  clearLyrics();
}
