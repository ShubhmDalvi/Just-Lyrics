import type { LyricSourceKey } from "@modules/lyrics/providers/shared";

export {
  FOOTER_CLASS,
  LINE_CLASS,
  LYRICS_CLASS,
  LYRICS_WRAPPER_ID,
  ROMANIZED_LYRICS_CLASS,
  TRANSLATED_LYRICS_CLASS,
  WORD_HIGHLIGHT_CLASS,
} from "@braccato/core/constants";

// DOM Class Names
export const TAB_HEADER_CLASS = "tab-header style-scope ytmusic-player-page" as const;
export const TAB_CONTENT_CLASS = "tab-content style-scope tp-yt-paper-tab" as const;

// DOM Selectors
export const TAB_RENDERER_SELECTOR = "#tab-renderer" as const;
export const NO_LYRICS_TEXT_SELECTOR =
  "#tab-renderer > ytmusic-message-renderer > yt-formatted-string.text.style-scope.ytmusic-message-renderer" as const;

// DOM IDs and Attributes
export const LYRICS_LOADER_ID = "blyrics-loader" as const;
export const LYRICS_DISABLED_ATTR = "blyrics-dfs" as const;
export const HIDDEN_CLASS = "blyrics-hidden" as const;

// Custom Events
export const SEEK_EVENT = "blyrics-seek-to" as const;

// Assets and Resources
export const FONT_LINK = "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap" as const;
export const NOTO_SANS_UNIVERSAL_LINK =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&family=Noto+Sans+Armenian:wght@100..900&family=Noto+Sans+Bengali:wght@100..900&family=Noto+Sans+Devanagari:wght@100..900&family=Noto+Sans+Georgian:wght@100..900&family=Noto+Sans+Gujarati:wght@100..900&family=Noto+Sans+HK:wght@100..900&family=Noto+Sans+Hebrew:wght@100..900&family=Noto+Sans+JP:wght@100..900&family=Noto+Sans+KR:wght@100..900&family=Noto+Sans+Kannada:wght@100..900&family=Noto+Sans+Khmer:wght@100..900&family=Noto+Sans+Lao+Looped:wght@100..900&family=Noto+Sans+Lao:wght@100..900&family=Noto+Sans+Malayalam:wght@100..900&family=Noto+Sans+Marchen&family=Noto+Sans+Meetei+Mayek:wght@100..900&family=Noto+Sans+Multani&family=Noto+Sans+NKo&family=Noto+Sans+Old+Permic&family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+Shavian&family=Noto+Sans+Sinhala:wght@100..900&family=Noto+Sans+Sunuwar&family=Noto+Sans+TC:wght@100..900&family=Noto+Sans+Takri&family=Noto+Sans+Tamil:wght@100..900&family=Noto+Sans+Telugu:wght@100..900&family=Noto+Sans+Thai+Looped:wght@100..900&family=Noto+Sans+Thai:wght@100..900&family=Noto+Sans+Vithkuqi:wght@400..700&family=Noto+Sans+Warang+Citi&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" as const;

// API URLs
export const HOMEPAGE_URL = "https://betterlyrics.org" as const;
export const HOMEPAGE_DOMAIN = "betterlyrics.org" as const;
export const HOMEPAGE_ICON_URL = "https://betterlyrics.org/icon-512.png" as const;

export const CUBEY_LYRICS_API_URL_TURNSTILE = "https://lyrics.api.dacubeking.com/" as const;
export const CUBEY_LYRICS_API_URL = "https://lyrics.api.dacubeking.com/" as const;

// Log Prefixes
export const LOG_PREFIX = "[BetterLyrics]" as const;

// Initialization and General Logs
export const INITIALIZE_LOG =
  "%c[BetterLyrics] Loaded Successfully." as const;
export const GENERAL_ERROR_LOG = "[BetterLyrics] Error:" as const;

// Lyrics Fetch and Processing Logs
export const FETCH_LYRICS_LOG = "[BetterLyrics] Fetching lyrics for:" as const;
export const LYRICS_FOUND_LOG = "[BetterLyrics] Lyrics found, injecting into the page" as const;
export const NO_LYRICS_FOUND_LOG = "[BetterLyrics] No lyrics found for the current song" as const;

// UI State Logs
export const LYRICS_TAB_HIDDEN_LOG =
  "[BetterLyrics] (Safe to ignore) Lyrics tab is hidden, skipping lyrics fetch" as const;
export const LYRICS_TAB_CLICKED_LOG = "[BetterLyrics] Lyrics tab clicked, fetching lyrics" as const;
export const LYRICS_WRAPPER_CREATED_LOG = "[BetterLyrics] Lyrics wrapper created" as const;
export const FOOTER_NOT_VISIBLE_LOG =
  "[BetterLyrics] (Safe to ignore) Footer is not visible, unable to inject source link" as const;
export const LYRICS_TAB_NOT_DISABLED_LOG =
  "[BetterLyrics] (Safe to ignore) Lyrics tab is not disabled, unable to enable it" as const;
export const SONG_SWITCHED_LOG = "[BetterLyrics] Song has been switched" as const;
export const LOADER_TRANSITION_ENDED = "[BetterLyrics] Loader Transition Ended" as const;

// Feature State Logs
export const AUTO_SWITCH_ENABLED_LOG = "[BetterLyrics] Auto switch enabled, switching to lyrics tab" as const;
export const SYNC_DISABLED_LOG =
  "[BetterLyrics] Syncing lyrics disabled due to all lyrics having a start time of 0" as const;

// Error and Storage Logs
export const SERVER_ERROR_LOG = "[BetterLyrics] Server Error:" as const;
export const STORAGE_TRANSIENT_SET_LOG = "[BetterLyrics] Set transient storage for key: " as const;
export const MUSIC_NOTES = "♪𝅘𝅥𝅮𝅘𝅥𝅯𝅘𝅥𝅰𝅘𝅥𝅱𝅘𝅥𝅲" as const;

export const LYRICS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const LYRICS_NEGATIVE_CACHE_TTL_MS = 30 * 60 * 1000;

export const OFFSET_STORAGE_PREFIX = "blyricsOffset_";

export const PLAYER_BAR_SELECTOR = "ytmusic-player-bar" as const;
export const AD_PLAYING_ATTR = "is-advertisement" as const;
export const LYRICS_AD_OVERLAY_ID = "blyrics-ad-overlay" as const;

export type SyncType = "syllable" | "word" | "line" | "unsynced";

interface ProviderConfig {
  key: LyricSourceKey;
  displayName: string;
  syncType: SyncType;
  priority: number;
}

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  { key: "bLyrics-richsynced", displayName: "Just Lyrics", syncType: "syllable", priority: 0 },
  { key: "binimum-richsynced", displayName: "BiniLyrics", syncType: "syllable", priority: 2 },
  { key: "portato-richsynced", displayName: "Just Lyrics Portato", syncType: "word", priority: 3 },
  { key: "musixmatch-richsync", displayName: "Musixmatch", syncType: "word", priority: 4 },
  { key: "bLyrics-synced", displayName: "Just Lyrics", syncType: "line", priority: 5 },
  { key: "yt-captions", displayName: "YouTube Captions", syncType: "line", priority: 7 },
  { key: "binimum-synced", displayName: "BiniLyrics", syncType: "line", priority: 8 },
  { key: "lrclib-synced", displayName: "LRCLib", syncType: "line", priority: 9 },
  { key: "legato-synced", displayName: "Just Lyrics Legato", syncType: "line", priority: 10 },
  { key: "musixmatch-synced", displayName: "Musixmatch", syncType: "line", priority: 11 },
  { key: "yt-lyrics", displayName: "YouTube", syncType: "unsynced", priority: 12 },
  { key: "lrclib-plain", displayName: "LRCLib", syncType: "unsynced", priority: 14 },
] as const;

export const LYRIC_SOURCE_KEYS = PROVIDER_CONFIGS.map(p => p.key);
