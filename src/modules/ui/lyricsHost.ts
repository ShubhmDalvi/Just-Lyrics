import { LOG_PREFIX, TAB_HEADER_CLASS } from "@constants";
import { seekPlayer } from "@modules/lyrics/lyrics";
import { hideAdOverlay, isAdPlaying, isLoaderActive, showAdOverlay } from "@modules/ui/dom";
import { getResumeScrollElement } from "@modules/ui/resumeScrollButton";
import type { LyricsRendererHost } from "@braccato/core";
import { log } from "@utils";

const PLAYER_PAGE_ID = "player-page";
const PLAYER_UI_STATE_ATTRIBUTE = "player-ui-state";

/**
 * The side panel's answers to what a lyrics view cannot work out on its own.
 */
export const ytmHost: LyricsRendererHost = {
  isViewVisible(): boolean {
    const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1];
    if (!tabSelector || tabSelector.getAttribute("aria-selected") !== "true") {
      return false;
    }

    const playerState = document.getElementById(PLAYER_PAGE_ID)?.getAttribute(PLAYER_UI_STATE_ATTRIBUTE);
    return (
      !playerState ||
      playerState === "PLAYER_PAGE_OPEN" ||
      playerState === "FULLSCREEN" ||
      playerState === "MINIPLAYER_IN_PLAYER_PAGE"
    );
  },
  isLoaderActive,
  syncAdState(): boolean {
    if (!isAdPlaying()) {
      hideAdOverlay();
      return false;
    }
    showAdOverlay();
    return true;
  },
  setResumeAffordanceVisible(visible: boolean): void {
    const resumeButton = getResumeScrollElement();
    if (visible) {
      resumeButton.removeAttribute("autoscroll-hidden");
    } else {
      resumeButton.setAttribute("autoscroll-hidden", "true");
    }
  },
  getScrollElement(): HTMLElement | null {
    return document.querySelector<HTMLElement>("#tab-renderer");
  },
  seek: seekPlayer,
  log(...args: unknown[]): void {
    log(LOG_PREFIX, ...args);
  },
};
