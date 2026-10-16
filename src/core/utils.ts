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

const languageWithScriptCache = new Map<string, string>();

function resolveLanguageWithScript(tag: string): string {
  const normalized = tag.replace(/_/g, "-");
  try {
    const { language, script } = new Intl.Locale(normalized).maximize();
    return script ? `${language}-${script}` : language;
  } catch {
    return normalized.split("-")[0].toLowerCase();
  }
}

function languageWithScript(tag: string): string {
  let resolved = languageWithScriptCache.get(tag);
  if (resolved === undefined) {
    resolved = resolveLanguageWithScript(tag);
    languageWithScriptCache.set(tag, resolved);
  }
  return resolved;
}

/**
 * Find the candidate whose language+script best matches the target,
 * e.g. "zh-TW" matches "zh-Hant" over "zh-Hans". Falls back to exact
 * (case-insensitive) match first. Returns undefined when nothing matches.
 */
export function findBestLanguageMatch(target: string, candidates: string[]): string | undefined {
  if (!target) return undefined;
  const exact = candidates.find(candidate => candidate.toLowerCase() === target.toLowerCase());
  if (exact) return exact;
  const targetScript = languageWithScript(target);
  return candidates.find(candidate => candidate && languageWithScript(candidate) === targetScript);
}
