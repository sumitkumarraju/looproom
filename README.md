# Looproom

A colorful retro desktop music player. React, Vite, Tailwind, and Phosphor Icons; MIT-licensed application source. No server, analytics, paid UI components, or API secrets required. Optional Spotify playback uses Spotify's proprietary SDK and service.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173/. `npm run build` emits a standalone static site in `dist/`; `npm test` checks timestamp parsing and queue ranking. Deploy `dist/` on any static HTTPS host. Sites hosting metadata can be removed if self-hosting.

## Spotify setup

1. Sign in at https://developer.spotify.com/dashboard with your Premium account. Create an app and enable Web API and Web Playback SDK.
2. Add this exact Redirect URI in its settings:
   `https://looproom-two.vercel.app/`
   For local development also add `http://127.0.0.1:5173/`. Spotify accepts HTTP loopback IP addresses; use 127.0.0.1 rather than localhost. If deploying elsewhere, register that HTTPS origin with its trailing slash instead.
3. Add your Spotify account to the app's user allowlist if required. Current new development apps allow up to five users and require the owner to maintain Premium.
4. Open Looproom → Connect Spotify. Paste the public Client ID, never a client secret, and complete Spotify authorization.
5. Select a mood or search for a song, then click a result. Audio comes from Spotify through its official playback SDK. Some browsers require another tap on Play. Allow encrypted media if the browser requests it.

Authorization uses PKCE S256 with a cryptographically random verifier and checked state. The temporary OAuth handshake lives in sessionStorage and is removed after the callback. Access/refresh tokens live only in memory, with refresh before expiry; reload requires reconnecting. Client ID and local likes/skips are stored in localStorage. No secret is embedded or sent to a third-party application server.

The application does not create a developer app or authorize your account for you. Live Spotify playback must be tested after your Client ID and user authorization are available. Unsupported accounts, API denials, cancellation, rate limits, SDK failures, and autoplay blocking show actionable messages. Private hosted authentication may require returning to the same browser/tab for OAuth.

## Listening

- Demo mode contains six original, procedurally composed instrumentals. Tracks advance indefinitely; repeat-one repeats the current track.
- Autopilot ranks next tracks by mood (+4), local favorite (+3), prior completions (+0.3), skips (−1.2), and recent history (−5). Genre filters constrain the candidates. Surprise Me selects a random candidate.
- Spotify mode searches for mood-related music, then sends a ranked URI queue to Spotify with context-repeat. There is no dependency on restricted recommendations or audio-features endpoints. Favorites are local, not Spotify library saves. Queue changes take effect when a new queue starts; manual Next uses current ranking while Autopilot is on. Natural advancement uses the queue already sent to Spotify. Autopilot off starts candidates in search order.
- This is a transparent small-scale heuristic inspired by published research; it does not reproduce Spotify's proprietary algorithm, analyze Spotify audio, or train models on its content.
- Add your own MP3/WAV/M4A/compatible audio files. Local files remain in browser memory for the current session and are not uploaded. Re-add them after reload.
- Import a matching `.lrc` file using the plus button in the lyric window. Timestamps, multiple timestamps per line, and millisecond offsets are supported. Tap a line to seek. No copyrighted lyrics are bundled or scraped.
- In About, use Change album art for the current local track. Colors are sampled from the cover, with a safe fallback if CORS prevents image access. The cover itself remains unmodified.
- Space toggles playback; left/right arrows move between tracks when focus is outside controls. Native sliders support keyboard seeking/volume. Reduced-motion preferences disable lyric movement and visualizer motion.

Spotify explicitly prohibits synchronized lyrics in its platform guidance. Its player therefore uses a listening view. The animated demo text is an original visual poem, clearly labeled, not a sung lyric transcript. Full animated synced lyrics are available for local audio with user-provided LRC.

## Sources and constraints checked October 28, 2026

- Spotify recommendation exploration research: https://research.atspotify.com/publications/explore-exploit-explain-personalizing-explainable-recommendations-with-bandits
- Spotify contextual calibration research: https://research.atspotify.com/publications/calibrated-recommendations-with-contextual-bandits
- PKCE: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
- Playback SDK: https://developer.spotify.com/documentation/web-playback-sdk
- Development access: https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Spotify compliance and synchronized-lyrics restriction: https://developer.spotify.com/compliance-tips
- Browser autoplay: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

## Assets and licenses

Application code: MIT (LICENSE). Original audio, pixel SVG covers, and visual poem: CC0 1.0 dedication, https://creativecommons.org/publicdomain/zero/1.0/. Regenerate audio and covers using `python3 scripts/generate-assets.py` (Python standard library only).

React, Vite, Tailwind CSS, and Phosphor Icons use MIT licenses; installed dependency licenses remain in their packages. System font stacks are used without redistributing fonts. Spotify artwork, metadata, SDK, and audio remain governed by Spotify and their respective rightsholders; they are not covered by this project's MIT or CC0 licenses. Source available locally; no public GitHub repository has been created.

## Free library (no sign-in)

Music plays for every visitor with no account. The intro's "tap to enter" starts it (browsers need one tap before sound).

- **Mixes** (`src/mixes.js`): Daily Mix (three genres chosen by date), Party, Chill, Focus, Hip-Hop, Pop & Soul, After Hours, Trending Now and Open Archive. Moods pick a matching mix; search covers the whole catalog.
- **Sources:** [Audius](https://audius.co), a free artist-uploaded network whose public API allows full-track streaming without a key (`src/audius.js`), and the Internet Archive's Creative Commons netlabels (`src/openMusic.js`), which is also the fallback if Audius is unreachable.
- Mainstream label catalogs are not included: streaming them requires a licence. Spotify stays available as an optional sign-in for Premium users on the app's allowlist.

## Default Spotify app and open-music fallback

- The app ships with a default public Client ID (`DEFAULT_CLIENT_ID` in `src/spotify.js`, overridable with `VITE_SPOTIFY_CLIENT_ID`). "connect spotify" in the header goes straight to Spotify sign-in.
- Sign-in is remembered: the refresh token is stored in localStorage and the session is restored on reload. Disconnect clears it. Tradeoff: any script running on the page could read that token.
- If Spotify cannot be used (no Premium, revoked access, SDK blocked, sign-in failure), Looproom switches to open-licensed music from the Internet Archive netlabels collection (Creative Commons releases, `src/openMusic.js`). Without Spotify, moods and the search box also fetch from there. Each open track links to its license and archive.org page.

## Look and motion

The design follows a retro handheld: the player is a plastic device with an LCD screen (Silkscreen pixel font, bundled via `@fontsource/silkscreen`, OFL), confirm/cancel keys and a play knob, and it tilts toward the pointer.

- Background: a port of Aceternity UI's background-gradient-animation, coloured from the current album cover. Album colours are registered CSS properties, so they cross-fade between tracks. Grain, scanlines and a vignette give it a retro finish. The Motion toggle pauses it.
- Cursor: a drawn music note (beamed notes over buttons) that leaves a fading trail of notes and the musical alphabet (C–G, A, B). Fine pointers only; touch devices keep the native behaviour.
- Performance: only transform/opacity animate; no full-screen blur or backdrop-blur over the moving background; parts of the page that don't show playback time skip the clock's re-renders. Slower devices (≤4 cores/≤4 GB, or under ~40 fps measured after load) switch to a lite mode that drops looping animations, blend modes, grain and lyric blur.
- Lyrics: Apple Music style. The active line pops in word by word, other lines blur with distance, and lines glide into place with a staggered spring.
- Headings use the same blur-in word reveal. With reduced motion enabled, all animation is turned off.
