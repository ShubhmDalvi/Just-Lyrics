import { INITIALIZE_LOG } from "@constants";
import { purgeExpiredKeys, saveCacheInfo } from "@core/storage";
import { prewarmAuthenticationToken } from "@modules/lyrics/providers/unified";
import { initProviders } from "@modules/lyrics/providers/shared";
import { setupRequestSniffer } from "@modules/lyrics/requestSniffer/requestSniffer";
import { injectHeadTags, setupAdObserver } from "@modules/ui/dom";
import {
  disableInertWhenFullscreen,
  enableLyricsTab,
  initializeLyrics,
  lyricReloader,
} from "@modules/ui/observer";
import { log, setUpLog } from "@utils";

async function modify(): Promise<void> {
  setUpLog();
  await injectHeadTags();
  setupAdObserver();
  enableLyricsTab();
  await purgeExpiredKeys();
  await saveCacheInfo();
  lyricReloader();
  initializeLyrics();
  disableInertWhenFullscreen();
  initProviders();
  prewarmAuthenticationToken();
  log(
    INITIALIZE_LOG,
    "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
  );
}

function init(): void {
  document.addEventListener("DOMContentLoaded", modify);
}

init();

setupRequestSniffer();
