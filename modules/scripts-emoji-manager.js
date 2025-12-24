////////////////////////////////////////////////////////////////////////
// Novi Sad Session Emoji Manager Module
// https://github.com/anton-bregolas/
// MIT License
// (c) Anton Zille 2025
////////////////////////////////////////////////////////////////////////

// Check if an emoji is correctly displayed on the current device
// Returns false if emoji is rendered as blank placeholder glyph
// Returns false if emoji is rendered as monochrome fallback font

export function isSupportedColoredEmoji(emoji, canvasCache) {

  const c = canvasCache || document.createElement("canvas");
  const em = 16;
  
  c.width = em;
  c.height = em;

  const ctx = c.getContext("2d", { willReadFrequently: true });

  ctx.textBaseline = 'top';
  ctx.font = `${em}px sans-serif`;

  ctx.clearRect(0, 0, em, em);
  ctx.fillText('\uFFFF', 0, 0);

  const blankGlyphSingle = c.toDataURL();

  ctx.clearRect(0, 0, em, em);
  ctx.fillText('\uFFFF\uFFFF', 0, 0);

  const blankGlyphDouble = c.toDataURL();

  ctx.clearRect(0, 0, em, em);
  ctx.fillText(emoji, 0, 0);

  const emojiDataUrl = c.toDataURL();

  if (emojiDataUrl === blankGlyphSingle||
      emojiDataUrl === blankGlyphDouble) {

    return false;
  }

  const imageData =
    ctx.getImageData(0, 0, em, em, { willReadFrequently: true }).data;

  // Color variance check
  const seenColors = new Set();
  
  for (let i = 0; i < imageData.length; i += 4) {

    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    if (a === 0) continue;

    seenColors.add(`${r},${g},${b}`);
  }

  return seenColors.size > 12;
}

// Get n valid emojis from pre-set unicode character ranges
// Shuffle the entire range to produce unique combinations
// Filter out emojis unsupported on the current device

export function getSupportedAnimalEmojis(n) {

  const emojiRanges = [

    [0x1F400, 0x1F41A],
    [0x1F41F, 0x1F43C],
    [0x1F43F, 0x1F43F],
    [0x1F54A, 0x1F54A],
    [0x1F980, 0x1F981],
    [0x1F983, 0x1F996],
    [0x1F998, 0x1F99E],
    [0x1F9A1, 0x1F9AD],
    [0x1FABC, 0x1FABC],
    [0x1FABF, 0x1FABF],
    [0x1FACE, 0x1FACF]
  ];

  const codePoints = [];

  for (const [start, end] of emojiRanges) {

    for (let p = start; p <= end; p++) {

      codePoints.push(p);
    }
  }

  // Shuffle (Fisher-Yates)

  for (let i = codePoints.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [codePoints[i], codePoints[j]] = [codePoints[j], codePoints[i]];
  }

  const canvasCache = document.createElement("canvas");

  const emojiOutputArr = [];

  let i = 0;

  while (emojiOutputArr.length < n && i < codePoints.length) {

    const emoji = String.fromCodePoint(codePoints[i]);

    if (isSupportedColoredEmoji(emoji, canvasCache)) {

      emojiOutputArr.push(emoji);
    }

    i++;
  }

  if (emojiOutputArr.length === 0) {

    for (let j = 0; j < n; j++) {

      emojiOutputArr.push(String.fromCodePoint(codePoints[j % codePoints.length]));
    }

  } else {

    let padIndex = 0;

    while (emojiOutputArr.length < n) {
      
      emojiOutputArr.push(emojiOutputArr[padIndex % emojiOutputArr.length]);
      padIndex++;
    }
  }

  return emojiOutputArr;
}