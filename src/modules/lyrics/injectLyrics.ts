import {
  LOG_PREFIX,
  LYRICS_FOUND_LOG,
  LYRICS_TAB_NOT_DISABLED_LOG,
  NO_LYRICS_FOUND_LOG,
  NO_LYRICS_TEXT_SELECTOR,
  SYNC_DISABLED_LOG,
  TAB_HEADER_CLASS,
} from "@constants";
import { AppState } from "@core/appState";
import { applySegmentMapToLyrics, type LyricSourceResultWithMeta } from "@modules/lyrics/lyrics";
import { cleanup, createLyricsWrapper, flushLoader, renderLoader } from "@modules/ui/dom";
import { lyricsElementAdded, mainView } from "@modules/ui/mainLyricsView";
import { disableNativeLyricsFocus } from "@modules/ui/nativeLyricsFocus";
import { containsNonLatin } from "@braccato/core/text";
import { log } from "@utils";

export type { LineData } from "@braccato/core";

export type SyncType = "richsync" | "synced" | "none";

export interface LyricDecorations {
  [index: number]: {
    romanization?: string;
    timedRomanization?: any[];
    translation?: string;
  };
}

export interface LyricsData {
  syncType: SyncType;
  isMusicVideoSynced: boolean;
  tabSelector: HTMLElement;
  hasNonLatin: boolean;
}

/**
 * Processes lyrics data and prepares it for rendering.
 */
export function processLyrics(
  _doc: Document,
  data: LyricSourceResultWithMeta,
  keepLoaderVisible = false,
  _signal?: AbortSignal
): void {
  const lyrics = data.lyrics;
  if (!lyrics || lyrics.length === 0) {
    throw new Error(NO_LYRICS_FOUND_LOG);
  }

  log(LYRICS_FOUND_LOG);

  const ytMusicLyrics = document.querySelector(NO_LYRICS_TEXT_SELECTOR)?.parentElement;
  if (ytMusicLyrics) {
    ytMusicLyrics.classList.add("blyrics-hidden");
  }

  if (!mainView.clearOnScreenLyrics()) {
    log(LYRICS_TAB_NOT_DISABLED_LOG);
  }

  injectLyrics(data, keepLoaderVisible);
}

/**
 * Injects lyrics into the DOM with timing, click handlers, and animations.
 */
function injectLyrics(
  data: LyricSourceResultWithMeta,
  keepLoaderVisible = false,
): void {
  const lyrics = data.lyrics!;
  cleanup();
  disableNativeLyricsFocus();

  const lyricsWrapper = createLyricsWrapper();
  lyricsWrapper.removeAttribute("is-empty");

  const allZero = lyrics.every(item => item.startTimeMs === 0);
  const noLyrics = lyrics[0].words === "No lyrics found";

  if (keepLoaderVisible) {
    renderLoader(true);
  } else {
    flushLoader(allZero && !noLyrics);
  }

  mainView.setLyrics(lyrics, { mount: lyricsWrapper, loaderVisible: keepLoaderVisible, noLyrics });

  const syncType: SyncType = mainView.syncType;
  const lines = mainView.lines;

  const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1] as HTMLElement;

  const lyricsData: LyricsData = {
    syncType: syncType,
    isMusicVideoSynced: data.musicVideoSynced === true,
    tabSelector,
    hasNonLatin: lyrics.some(item => !!item.words && containsNonLatin(item.words)),
  };

  AppState.lyricData = lyricsData;

  if (data.segmentMap) {
    applySegmentMapToLyrics(lyricsData, lines, data.segmentMap);
  }

  AppState.areLyricsTicking = true;
  mainView.relayout();
  if (allZero) {
    log(SYNC_DISABLED_LOG);
  }

  AppState.areLyricsLoaded = true;
}
