import {
  AUTO_SWITCH_ENABLED_LOG,
  GENERAL_ERROR_LOG,
  LOG_PREFIX,
  LYRICS_TAB_CLICKED_LOG,
  LYRICS_WRAPPER_ID,
  SONG_SWITCHED_LOG,
  TAB_CONTENT_CLASS,
  TAB_HEADER_CLASS,
  TAB_RENDERER_SELECTOR,
} from "@constants";
import { AppState, handleModifications, type PlayerDetails, reloadLyrics } from "@core/appState";
import { preFetchLyrics } from "@modules/lyrics/lyrics";
import { getArtworkMetadata, getSongMetadata } from "@modules/lyrics/requestSniffer/requestSniffer";
// Settings stubs - settings module removed
function onAutoSwitchEnabled(callback: () => void): void {
  chrome.storage.sync.get({ autoSwitchEnabled: true }, (settings) => {
    if (settings.autoSwitchEnabled) callback();
  });
}

function onFullScreenDisabled(enabledCb: () => void, disabledCb: () => void): void {
  chrome.storage.sync.get({ fullscreenDisabled: false }, (settings) => {
    if (settings.fullscreenDisabled) enabledCb();
    else disabledCb();
  });
}
import { currentTickOptions, mainView } from "@modules/ui/mainLyricsView";
import { log } from "@utils";
import {
  cleanup,
  renderLoader,
  resetThumbnailState,
} from "./dom";

// -- Observer Storage & Init Guards --------------------------
let fullscreenObserver: MutationObserver | null = null;
let lyricsTabObserver: MutationObserver | null = null;
let inertObserver: MutationObserver | null = null;

let hasInitializedLyricReloader = false;
let hasInitializedLyrics = false;
let metadataAbortController: AbortController | null = null;
const ANIMATION_ENGINE_INTERVAL_MS = 20;
let animationFrameRequest: number | null = null;
let lastAnimationEngineRun = -Infinity;
let latestPlayerPlaying = false;
let latestPlayerTime = 0;
let latestPlayerSnapshotTime = 0;
let latestPlayerDuration = 0;
let latestPlaybackRate = 1;

function runAnimationEngine(now: number, force = false): void {
  if (!force && (!latestPlayerPlaying || now - lastAnimationEngineRun < ANIMATION_ENGINE_INTERVAL_MS)) return;

  lastAnimationEngineRun = now;
  const wallTime = Date.now();
  const elapsedS = latestPlayerPlaying
    ? (Math.max(0, wallTime - latestPlayerSnapshotTime) * latestPlaybackRate) / 1000
    : 0;
  const currentTime = Math.min(latestPlayerTime + elapsedS, latestPlayerDuration || Infinity);
  if (AppState.suppressZeroTime < wallTime || currentTime !== 0) {
    if (
      AppState.areLyricsTicking &&
      mainView.tick(currentTime, currentTickOptions(wallTime, latestPlayerPlaying)) === "lyrics-missing"
    ) {
      AppState.areLyricsTicking = false;
    }
  }
}

function animationFrameLoop(now: number): void {
  runAnimationEngine(now);
  animationFrameRequest = requestAnimationFrame(animationFrameLoop);
}

function startAnimationFrameLoop(): void {
  if (animationFrameRequest !== null) return;
  animationFrameRequest = requestAnimationFrame(animationFrameLoop);
}

type FullscreenCallback = () => void;

const fullscreenEnterCallbacks: FullscreenCallback[] = [];
const fullscreenExitCallbacks: FullscreenCallback[] = [];

function ensureFullscreenObserver(): void {
  if (fullscreenObserver) return;

  const appLayout = document.querySelector("ytmusic-app-layout");
  if (!appLayout) {
    setTimeout(ensureFullscreenObserver, 1000);
    return;
  }

  let wasFullscreen = appLayout.hasAttribute("player-fullscreened");

  fullscreenObserver = new MutationObserver(() => {
    const isFullscreen = appLayout.hasAttribute("player-fullscreened");

    if (!wasFullscreen && isFullscreen) {
      fullscreenEnterCallbacks.forEach(cb => cb());
    } else if (wasFullscreen && !isFullscreen) {
      fullscreenExitCallbacks.forEach(cb => cb());
    }

    wasFullscreen = isFullscreen;
  });

  fullscreenObserver.observe(appLayout, { attributes: true, attributeFilter: ["player-fullscreened"] });
}

export function onFullscreenChange(onEnter: FullscreenCallback, onExit: FullscreenCallback): void {
  fullscreenEnterCallbacks.push(onEnter);
  fullscreenExitCallbacks.push(onExit);
  ensureFullscreenObserver();
}

/**
 * Enables the lyrics tab and prevents it from being disabled by YouTube Music.
 */
export function enableLyricsTab(): void {
  const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1] as HTMLElement;
  if (!tabSelector) {
    setTimeout(() => {
      enableLyricsTab();
    }, 1000);
    return;
  }

  if (lyricsTabObserver) {
    lyricsTabObserver.disconnect();
  }

  tabSelector.removeAttribute("disabled");
  tabSelector.setAttribute("aria-disabled", "false");

  lyricsTabObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === "disabled") {
        tabSelector.removeAttribute("disabled");
        tabSelector.setAttribute("aria-disabled", "false");
      }
    });
  });
  lyricsTabObserver.observe(tabSelector, { attributes: true });
}

/**
 * Disables the inert attribute on the side panel when entering fullscreen.
 */
export function disableInertWhenFullscreen(): void {
  const panelElem = document.getElementById("side-panel");
  if (!panelElem) {
    setTimeout(() => {
      disableInertWhenFullscreen();
    }, 1000);
    return;
  }

  if (inertObserver) {
    inertObserver.disconnect();
  }

  inertObserver = new MutationObserver(mutations => {
    onFullScreenDisabled(
      () => {},
      () =>
        mutations.forEach(mutation => {
          if (mutation.attributeName === "inert") {
            (mutation.target as HTMLElement).removeAttribute("inert");
            const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1] as HTMLElement;
            if (tabSelector && tabSelector.getAttribute("aria-selected") !== "true") {
              tabSelector.click();
              currentTab = 1;
              if (AppState.areLyricsLoaded) {
                AppState.areLyricsTicking = true;
              }
            }
          }
        })
    );
  });
  inertObserver.observe(panelElem, { attributes: true });
  panelElem.removeAttribute("inert");
}

let currentTab = 0;
let scrollPositions = [0, 0, 0];

/**
 * Sets up tab click handlers and manages scroll positions between tabs.
 */
export function lyricReloader(): void {
  if (hasInitializedLyricReloader) {
    return;
  }

  const tabs = document.getElementsByClassName(TAB_CONTENT_CLASS);

  const [tab1, tab2, tab3] = Array.from(tabs);

  if (tab1 !== undefined && tab2 !== undefined && tab3 !== undefined) {
    hasInitializedLyricReloader = true;

    for (let i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", () => {
        const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR) as HTMLElement;
        scrollPositions[currentTab] = tabRenderer.scrollTop;
        tabRenderer.scrollTop = scrollPositions[i];
        setTimeout(() => {
          tabRenderer.scrollTop = scrollPositions[i];
          AppState.areLyricsTicking = AppState.areLyricsLoaded && i === 1;
        }, 0);
        currentTab = i;

        if (i !== 1) {
          AppState.areLyricsTicking = false;
        }
      });
    }

    tab2.addEventListener("click", () => {
      if (!AppState.areLyricsLoaded) {
        log(LYRICS_TAB_CLICKED_LOG);
        cleanup();
        renderLoader();
        reloadLyrics();
      }
    });
  } else {
    setTimeout(() => lyricReloader(), 1000);
  }
}

/**
 * Initializes the main player time event listener.
 */
export function initializeLyrics(): void {
  if (hasInitializedLyrics) {
    return;
  }
  hasInitializedLyrics = true;

  document.addEventListener("visibilitychange", () => {
    mainView.noteVisibilityChange();
    if (document.visibilityState === "visible") {
      runAnimationEngine(performance.now(), true);
    }
  });

  startAnimationFrameLoop();

  // @ts-ignore
  document.addEventListener("blyrics-send-player-time", (event: CustomEvent<PlayerDetails>) => {
    const detail = event.detail;
    latestPlayerPlaying = detail.playing;
    latestPlayerTime = detail.currentTime;
    latestPlayerSnapshotTime = detail.browserTime;
    latestPlayerDuration = Number(detail.duration);
    latestPlaybackRate = detail.playbackRate ?? 1;

    const currentVideoId = detail.videoId;
    const currentVideoDetails = detail.song + " " + detail.artist;

    if (currentVideoId !== AppState.lastVideoId || currentVideoDetails !== AppState.lastVideoDetails) {
      AppState.areLyricsTicking = false;
      AppState.lastVideoId = currentVideoId;
      AppState.lastVideoDetails = currentVideoDetails;
      resetThumbnailState();
      if (!detail.song || !detail.artist) {
        log("Lyrics switched: Still waiting for metadata ", detail.videoId);
        return;
      }
      log(SONG_SWITCHED_LOG, detail.videoId);

      AppState.queueLyricInjection = true;
      AppState.hasPreloadedNextSong = false;

      metadataAbortController?.abort();
      const abortController = new AbortController();
      metadataAbortController = abortController;
    }

    if (AppState.areLyricsLoaded && !AppState.hasPreloadedNextSong) {
      AppState.hasPreloadedNextSong = true;
      log(LOG_PREFIX, "Trying to preload next song");
      getSongMetadata(AppState.lastVideoId).then(async data => {
        if (data && data.nextVideoId) {
          let next = await getSongMetadata(data.nextVideoId);
          if ((!next || next.isVideo) && data.counterpartVideoId) {
            next = await getSongMetadata(data.counterpartVideoId).then(counterpart =>
              counterpart?.nextVideoId ? getSongMetadata(counterpart.nextVideoId) : null
            );
          }

          if (next) {
            await preFetchLyrics(
              {
                song: next.title,
                artist: next.artist,
                duration: String(Math.round(next.durationMs / 1000)),
                videoId: next.id,
              },
              next.isVideo
            );
          }
        }
      });
    }

    if (AppState.lyricInjectionFailed) {
      const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1];
      if (tabSelector && tabSelector.getAttribute("aria-selected") !== "true") {
        return;
      }
    }

    if (AppState.queueLyricInjection || AppState.lyricInjectionFailed) {
      const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1] as HTMLElement;
      if (tabSelector) {
        AppState.queueLyricInjection = false;
        AppState.lyricInjectionFailed = false;
        if (tabSelector.getAttribute("aria-selected") !== "true") {
          onAutoSwitchEnabled(() => {
            tabSelector.click();
            log(AUTO_SWITCH_ENABLED_LOG);
          });
        }
        handleModifications(detail);
      }
    }

    if (document.visibilityState === "visible") {
      runAnimationEngine(performance.now(), true);
    }
  });
}

/**
 * Handles scroll events on the tab renderer.
 */
export function scrollEventHandler(): void {
  const tabSelector = AppState.lyricData?.tabSelector;
  if (!tabSelector || tabSelector.getAttribute("aria-selected") !== "true" || !AppState.areLyricsTicking) {
    return;
  }

  mainView.noteUserScroll();
}
