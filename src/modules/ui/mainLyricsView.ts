import { ytmHost } from "@modules/ui/lyricsHost";
import { createLyricsRenderer, type LyricsRenderer, type TickOptions } from "@braccato/core";

export const mainView: Omit<LyricsRenderer, "destroy"> = createLyricsRenderer({ document, window, host: ytmHost });

export function currentTickOptions(
  eventCreationTime: number,
  isPlaying: boolean,
  smoothScroll = true,
  playbackRate = 1
): TickOptions {
  return {
    eventCreationTime,
    isPlaying,
    smoothScroll,
    globalLyricOffset: 0,
    lyricOffset: 0,
    richsyncOffsetTrim: 0,
    lineOffsetTrim: 0,
    passiveScrollEnabled: false,
    playbackRate,
  };
}
