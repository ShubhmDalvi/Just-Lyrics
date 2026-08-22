import { GENERAL_ERROR_LOG } from "@constants";
import type { LyricsData } from "@modules/lyrics/injectLyrics";
import { createLyrics } from "@modules/lyrics/lyrics";
import type { LyricSourceKey } from "@modules/lyrics/providers/shared";
import { log } from "@utils";

export interface PlayerDetails {
  currentTime: number;
  videoId: string;
  song: string;
  artist: string;
  duration: string;
  audioTrackData: any;
  browserTime: number;
  isPlaying: boolean;
  playing: boolean;
  playbackRate?: number;
  contentRect: {
    width: number;
    height: number;
  };
}

interface AppStateType {
  suppressZeroTime: number;
  areLyricsTicking: boolean;
  lyricData: LyricsData | null;
  areLyricsLoaded: boolean;
  lyricInjectionFailed: boolean;
  lastVideoId: string | null;
  lastVideoDetails: any | null;
  queueLyricInjection: boolean;
  loaderAnimationEndTimeout: number | undefined;
  lastLoadedVideoId: string | null;
  lyricAbortController: AbortController | null;
  hasPreloadedNextSong: boolean;
  manualProviderKey: LyricSourceKey | null;
  availableProviderKeys: LyricSourceKey[];
}

export const AppState: AppStateType = {
  suppressZeroTime: 0,
  areLyricsTicking: false,
  lyricData: null,
  areLyricsLoaded: false,
  lyricInjectionFailed: false,
  lastVideoId: null,
  lastVideoDetails: null,
  queueLyricInjection: false,
  loaderAnimationEndTimeout: undefined,
  lastLoadedVideoId: null,
  lyricAbortController: null,
  hasPreloadedNextSong: false,
  manualProviderKey: null,
  availableProviderKeys: [],
};

export function reloadLyrics(): void {
  AppState.lyricAbortController?.abort("Reloading lyrics");
  AppState.lastVideoId = null;
}

export function handleModifications(detail: PlayerDetails): void {
  if (detail.videoId !== AppState.lastLoadedVideoId) {
    AppState.manualProviderKey = null;
    AppState.availableProviderKeys = [];
  }

  AppState.lyricAbortController?.abort("New song is being loaded");
  AppState.lyricAbortController = new AbortController();
  createLyrics(detail, AppState.lyricAbortController.signal).catch(err => {
    log(GENERAL_ERROR_LOG, err);
    AppState.areLyricsLoaded = false;
    AppState.lyricInjectionFailed = true;
  });
}
