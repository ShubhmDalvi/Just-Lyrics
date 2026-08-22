import { getStorage } from "./storage";

/**
 * Conditionally logs messages based on the isLogsEnabled setting.
 */
export let log = (...args: any[]) => {
  getStorage({ isLogsEnabled: true }, items => {
    if (items.isLogsEnabled) {
      console.log(...args);
    }
  });
};

/**
 * Configures the logging function based on user settings.
 */
export function setUpLog() {
  getStorage({ isLogsEnabled: true }, items => {
    if (items.isLogsEnabled) {
      log = console.log.bind(window.console);
    } else {
      log = function () {};
    }
  });
}

/**
 * Compare base language codes, e.g. "en" matches "en-US"
 */
export function langCodesMatch(lang1: string, lang2: string): boolean {
  if (!lang1 || !lang2) return false;
  const base1 = lang1.split("-")[0];
  const base2 = lang2.split("-")[0];
  return base1 === base2;
}
