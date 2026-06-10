# Lunar Pixel Refresh — Design Spec (2026-06-10)

## Goal
Refresh jatinsikka.me everywhere EXCEPT the hero video (untouched). Extend the
pixel-art lunar-city identity of the hero through the rest of the site, plus a
content audit. Approach: restyle in place, plain HTML + Tailwind CDN, no build
system. Built as previews first, promoted after Jatin reviews locally.

## Design system ("Lunar Pixel", new `css/pixel.css`)
- Palette (from hero video / existing accents): deep night `#0A0E18`, lantern
  amber `#D97B4F`, terracotta `#E25C5C`, moon-grey `#B0A49D`, starlight `#E8E4DF`.
- Type: Space Grotesk stays for headings/body. Silkscreen (pixel font) ONLY for
  small labels — section eyebrows, card tags, nav logo, status chips.
- Light mode = "lunar daylight" warm paper; dark mode primary.

## Component language (all 4 pages)
- Pixel-corner cards (stepped corners), hard 4px offset shadows, no blur.
- Hover: 2px translate + shadow snap, no fades.
- CRT scanline overlay on cards ~2% opacity; disabled on mobile and
  `prefers-reduced-motion`.
- Pixel horizon divider (stepped skyline strip) between sections.
- Sparse twinkling pixel starfield section background. REPLACES the four
  competing motifs (circuit traces, coordinate axes, aurora mesh, blueprint grid).
- `about_me.txt` terminal transcript stays, reskinned with pixel chrome.

## Content audit
- /ventures rebuilt with exactly: Undoom.It (LIVE, undoomit.com),
  Sequent Robotics (RESEARCH, sequent-robotics.vercel.app — renamed from
  Humanoid Skills per Jatin 2026-06-10), Waiv (BUILDING, waivme.com,
  credited as sister's venture). quant-terminal and HakkHealth deliberately
  excluded (Jatin's call).

## Revision 2026-06-10 (Jatin feedback round 1)
- About transcript: airier layout — pixel company labels (Silkscreen) above
  DM Sans body text, no left border bars, bigger padding/gaps.
- Skyline divider replaced by minimal centered three-pixel glyph.
- Delete dead ventures + `ventures/lawai.html`.
- "Now" chip links to https://undoomit.com (not undoom-it.vercel.app).
- /projects and /research: content unchanged, restyle only.
- Archive unused hero-*.js experiments and preview-1..7.html to `docs/archive/`.

## Process
1. Build `preview-refresh/` (index + ventures + projects + research + pixel.css).
2. Self-verify with Playwright screenshots (dark + light, desktop + mobile).
3. Jatin reviews locally → promote to live files → commit + push.
