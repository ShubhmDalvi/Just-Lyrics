# Just Lyrics

This project is built on top of [Better Lyrics](https://github.com/better-lyrics/better-lyrics), an open-source Chrome extension that adds time-synced lyrics to YouTube Music. 

We took everything that makes Better Lyrics great -- the rock-solid lyrics engine, the buttery-smooth karaoke renderer, and the whole multi-provider system that hunts down lyrics from a dozen sources -- and threw away everything that wasn't that. No settings panel, no theme shop, no floating windows, no layout hacking. Just you, the lyrics tab, and words that light up as the song plays.

All the real magic comes from the original Better Lyrics project and its `@braccato/core` renderer. We mostly just pointed at the good parts and said "keep that, lose the rest."

## What this version does

- Synced lyrics with word-by-word karaoke highlighting
- Auto-scroll to the current line as the song plays
- Click any lyric line to seek to that point in the song
- Automatically tries multiple lyrics providers if one fails
- Hides lyrics during ads
- Caches lyrics to avoid repeated fetches
- Makes zero changes to YouTube Music's layout or appearance

## Installation

### Chrome / Edge / Brave

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/chrome` folder from this project
5. The extension is active on YouTube Music

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `dist/firefox/manifest.json`

## Building from source

Requires Node.js 18+.

```
npm install
npm run build
```

Output goes to `dist/chrome/`, `dist/edge/`, and `dist/firefox/`.

To rebuild after changes:

```
npm run build
```

Then refresh the extension in your browser's extension page.

## How it works

The extension runs three content scripts on `music.youtube.com`:

1. **`earlyInject.js`** (MAIN world, document_start) -- Intercepts YouTube Music's internal API responses (`/youtubei/v1/browse` and `/youtubei/v1/next`) to capture song metadata, video counterpart mappings, and segment timing data.

2. **`script.js`** (MAIN world, document_end) -- Polls the YouTube Music player element every second and dispatches custom events with the current playback state (videoId, song, artist, time, duration, playing).

3. **`index.ts`** (ISOLATED world, document_start) -- The main extension logic. Listens for player state events, detects song changes, fetches lyrics from multiple providers (via `@braccato/core` and a unified streaming API), and renders them using the `@braccato/core` lyrics renderer.

The `@braccato/core` renderer handles the actual lyrics DOM: line elements, word groups, the karaoke sweep animation (CSS gradient mask on `::after` pseudo-elements), smooth auto-scroll, and the active line highlight with glow effect. This renderer is authored and maintained as part of the Better Lyrics project.

### Lyrics providers (priority order)

| # | Provider | Sync level |
|---|----------|------------|
| 1 | Just Lyrics | Syllable |
| 2 | BiniLyrics | Syllable |
| 3 | Just Lyrics Portato | Word |
| 4 | Musixmatch | Word |
| 5 | Just Lyrics | Line |
| 6 | YouTube Captions | Line |
| 7 | BiniLyrics | Line |
| 8 | LRCLib | Line |
| 9 | Just Lyrics Legato | Line |
| 10 | Musixmatch | Line |
| 11 | YouTube | Unsynced |
| 12 | LRCLib | Unsynced |

The extension tries each provider in order and uses the first one that returns results. Lyrics are validated against YouTube's own lyrics text using string similarity to reject mismatches.

### External connections

- `lyrics.api.dacubeking.com` -- Lyrics API (auth via Cloudflare Turnstile + JWT, then lyrics fetch via SSE)
- `api.fontshare.com` / `fonts.googleapis.com` -- Font stylesheets (Satoshi, Noto Sans)
- `music.youtube.com` -- Intercepted API calls and caption fetches

No analytics, no tracking, no fingerprinting. The only data sent externally is song metadata (title, artist, album, videoId) to the lyrics API for lookup.

## Credits

This project is based on [Better Lyrics](https://github.com/better-lyrics/better-lyrics) by [boidushya](https://github.com/boidushya). The lyrics rendering engine (`@braccato/core`), the multi-provider lyrics fetching system, and the YouTube Music integration are all original work from that project. Just Lyrics would not exist without it.

## License

This project is licensed under the [GNU GPLv3 License](LICENSE), same as the original Better Lyrics project.
