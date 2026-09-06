import type { PetType } from '../types';

export type PetAction = 'walk' | 'jump' | 'sit' | 'sleep' | 'play' | 'happy';

const createSprite = (body: string, accent: string, face: string) => `
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(15,23,42,0.15)" />
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <rect x="18" y="30" width="60" height="50" rx="25" fill="${body}" />
    <ellipse cx="48" cy="72" rx="24" ry="10" fill="rgba(15,23,42,0.08)" />
    ${accent}
    ${face}
  </g>
</svg>
`;

const baseFaces = {
  smile: `<circle cx="34" cy="52" r="4" fill="#111827"/><circle cx="62" cy="52" r="4" fill="#111827"/><path d="M35 64 C43 70, 53 70, 61 64" stroke="#111827" stroke-width="3" stroke-linecap="round"/>`,
  happy: `<circle cx="34" cy="50" r="3" fill="#111827"/><circle cx="62" cy="50" r="3" fill="#111827"/><path d="M34 62 C42 72, 54 72, 62 62" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="58" r="3" fill="#fecaca"/><circle cx="66" cy="58" r="3" fill="#fecaca"/>`,
  sleep: `<path d="M30 52 C36 48, 40 48, 46 52" stroke="#111827" stroke-width="3" stroke-linecap="round"/><path d="M50 52 C56 48, 60 48, 66 52" stroke="#111827" stroke-width="3" stroke-linecap="round"/><path d="M38 62 Q48 70 58 62" stroke="#111827" stroke-width="3" stroke-linecap="round"/>`,
  playful: `<circle cx="34" cy="50" r="3" fill="#111827"/><circle cx="62" cy="50" r="3" fill="#111827"/><path d="M38 60 C44 66, 52 66, 58 60" stroke="#111827" stroke-width="3" stroke-linecap="round"/><circle cx="29" cy="55" r="3" fill="#fecaca"/><circle cx="67" cy="55" r="3" fill="#fecaca"/>`,
};

const earShapes = {
  cat: `<path d="M32 28 L26 8 L40 24Z" fill="#fbbf24"/><path d="M64 28 L70 8 L56 24Z" fill="#fbbf24"/>`,
  dog: `<ellipse cx="22" cy="40" rx="10" ry="18" fill="#fcd9bd"/><ellipse cx="74" cy="40" rx="10" ry="18" fill="#fcd9bd"/>`,
  otter: `<path d="M25 28 C10 20, 10 60, 30 46" fill="#a78bfa"/><path d="M71 28 C86 20, 86 60, 66 46" fill="#a78bfa"/>`,
  alpaca: `<path d="M28 24 Q26 8 38 14" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/><path d="M68 24 Q70 8 58 14" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/>`,
  capybara: `<path d="M24 32 Q18 12 34 18" stroke="#d4a375" stroke-width="10" stroke-linecap="round"/><path d="M72 32 Q78 12 62 18" stroke="#d4a375" stroke-width="10" stroke-linecap="round"/>`,
  rabbit: `<ellipse cx="28" cy="16" rx="6" ry="16" fill="#fbcfe8"/><ellipse cx="68" cy="16" rx="6" ry="16" fill="#fbcfe8"/>`,
};

const createPetFrames = (body: string, accentKey: keyof typeof earShapes) => ({
  walk: [
    createSprite(body, earShapes[accentKey], baseFaces.smile),
    createSprite(body, earShapes[accentKey], baseFaces.playful),
  ],
  jump: [
    createSprite(body, earShapes[accentKey], baseFaces.happy),
    createSprite(body, earShapes[accentKey], baseFaces.happy),
  ],
  sit: [createSprite(body, earShapes[accentKey], baseFaces.smile)],
  sleep: [createSprite(body, earShapes[accentKey], baseFaces.sleep)],
  play: [
    createSprite(body, earShapes[accentKey], baseFaces.playful),
    createSprite(body, earShapes[accentKey], baseFaces.happy),
  ],
  happy: [
    createSprite(body, earShapes[accentKey], baseFaces.happy),
    createSprite(body, earShapes[accentKey], baseFaces.playful),
  ],
});

export const PET_SPRITES: Record<PetType, Record<PetAction, string[]>> = {
  cat: createPetFrames('#ffe4ec', 'cat'),
  dog: createPetFrames('#fde2d1', 'dog'),
  otter: createPetFrames('#c4b5fd', 'otter'),
  alpaca: createPetFrames('#fef3c7', 'alpaca'),
  capybara: createPetFrames('#e0b48a', 'capybara'),
  rabbit: createPetFrames('#fff1f2', 'rabbit'),
};
