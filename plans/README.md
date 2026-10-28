# Motion review

Read-only audit of the completed Looproom implementation on October 28, 2026, using improve-animations and Emil's review criteria. No high-priority source changes identified. No implementation plans are pending.

| Before / observed implementation | After / recommendation | Why |
| --- | --- | --- |
| Lyrics follow audio timestamps through a 550 ms transform transition | Retain | Deliberate reading motion, not a latency-sensitive menu or button. Retargetable CSS transition. |
| Button feedback uses 120 ms transform transitions | Retain | Immediate tactile response without delaying actions. |
| Equalizer uses transform-only keyframes | Retain | Small playback-state indicator; runs only during playback. |
| Reduced-motion styles stop lyric movement and equalizer animation | Retain | Static equivalent preserves playback information. |
| Album palette changes on track change | Retain | Requested album adaptation, with a gentle change and reduced-motion fallback. |
| Modal uses native dialog without entrance animation | Retain | Immediate, focus-managed setup flow. |

No decorative motion was added to keyboard shortcuts. Lyric seeking naturally changes the timestamp and visible line. Press-state transforms may still appear on keyboard-activated buttons as native active feedback; no action is delayed by animation.

Verified in the in-app browser at narrow width: playback state, track switching, cover/color changes and favorites. Full desktop layout was checked in CSS, not a second viewport capture. Reduced-motion behavior was checked in source; physical-device gesture/performance testing was not performed. Spotify motion/state remains unverified with a real authenticated account.
