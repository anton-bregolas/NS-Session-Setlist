///////////////////////////////////////////////////////////////////////
// Common Tunebook.app ABC Utility Functions
// https://github.com/anton-bregolas/
// MIT License
// (c) Anton Zille 2025
///////////////////////////////////////////////////////////////////////

////////////////////////////////////////////
// ABC UTILS: COMPRESS & DECOMPRESS ABC
///////////////////////////////////////////

// Compress ABC text using browser-native deflate algorithm
// Make the encoded text URL-safe using base64 helpers

export async function deflateCompress(abcRaw) {
  const data = new TextEncoder().encode(abcRaw);
  const stream = new Blob([data]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('deflate'));
  const compressedBuffer = await new Response(compressedStream).arrayBuffer();
  return arrayBufferToBase64Url(compressedBuffer);
}

// Decompress URL-safe ABC text encoded by deflate algorithm

export async function deflateDecompress(abcEncoded) {
  const compressedBuffer = base64UrlToArrayBuffer(abcEncoded);
  const stream = new Blob([compressedBuffer]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate'));
  const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
  return new TextDecoder().decode(decompressedBuffer);
}

////////////////////////////////////////////
// ABC UTILS: HELPER BASE64 FUNCTIONS
///////////////////////////////////////////

// Convert ArrayBuffer to URL-safe Base64

function arrayBufferToBase64Url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')   // Replace + with -
    .replace(/\//g, '_')   // Replace / with _
    .replace(/=+$/, '');   // Remove padding
}

// Convert URL-safe Base64 to ArrayBuffer

function base64UrlToArrayBuffer(base64url) {
  let base64 = base64url
    .replace(/-/g, '+')    // Restore +
    .replace(/_/g, '/');   // Restore /
  
  // Add back padding if needed
  const padLen = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLen);
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

////////////////////////////////////////////
// ABC UTILS: SANITIZERS & LANG PROCESSORS
///////////////////////////////////////////

// Filter a string returning valid query parameter text

export function sanitizeQueryParam(rawString) {
  
  if (detectCyrillicRusChars(rawString)) {

    rawString = convertCyrillicToTranslit(rawString);
  }

  const sanitizedString = 

    rawString.trim()
             .toLowerCase()
             .normalize('NFKD')
             .replace(/\p{Diacritic}/gu, '')
             .replaceAll('&', 'and')
             .replaceAll(/[/\\]/g, '-')
             .replaceAll(/\s/g, '_')
             .replaceAll(/[^a-z0-9_]/g, '');

  return sanitizedString;
}

// Check if string contains characters from a specific subset of Cyrillic unicode 

export function detectCyrillicRusChars(rawString) {

  const hasCyrillicRusChars = new RegExp(`[\u0401\u0451\u0410-\u044f]`, "g");

  if (rawString.match(hasCyrillicRusChars)) return true;

  return false;
}

// Transliterate Cyrillic characters using custom character map
// Preprocess string to account for certain vowel combinations

export function convertCyrillicToTranslit(rawString) {

  // Limit to lowercase characters
  rawString = rawString.toLowerCase();

  let outputString;

  const comboMap = 

    {
      '\u0430\u0435': 'aye', '\u0435\u0435': 'eye', '\u0438\u0435': 'iye',
      '\u0436\u0451': 'zho', '\u0436\u044e': 'zhu', 
      '\u043e\u0435': 'oye', '\u0443\u0435': 'uye', 
      '\u0448\u0451': 'sho', '\u0448\u044e': 'shu', 
      '\u044a\u0435': 'ye', '\u044b\u0438': 'yyi', '\u044b\u0439': 'yi',
      '\u044c\u0435': 'ye', '\u044c\u0438': 'yi', '\u044c\u043e': 'yo',
      '\u044d\u0435': 'eye', '\u044e\u0435': 'yuye', '\u044f\u0435': 'yaye'
    }

  const translitMap = 

    {
      '\u0430': 'a', '\u0431': 'b', '\u0432': 'v', '\u0433': 'g', '\u0434': 'd',
      '\u0435': 'e', '\u0451': 'yo', '\u0436': 'zh', '\u0437': 'z', '\u0438': 'i',
      '\u0439': 'y', '\u043a': 'k','\u043b': 'l', '\u043c': 'm', '\u043d': 'n',
      '\u043e': 'o', '\u043f': 'p', '\u0440': 'r', '\u0441': 's', '\u0442': 't',
      '\u0443': 'u', '\u0444': 'f', '\u0445': 'kh', '\u0446': 'ts', '\u0447': 'ch',
      '\u0448': 'sh', '\u0449': 'shch', '\u044a': '', '\u044b': 'y', '\u044c': '',
      '\u044d': 'e', '\u044e': 'yu', '\u044f': 'ya'
    }

  const startsWithYe = new RegExp(`^\u0435|([^\u0401\u0451\u0410-\u044fa-z])\u0435`, "g");

  if (rawString.match(startsWithYe)) {

    rawString = rawString.replaceAll(startsWithYe, `$1ye`);
  }
  
  for (let [key, value] of Object.entries(comboMap)) {

    if (rawString.includes(key)) {

      rawString = rawString.replaceAll(key, value);
    }
  }

  outputString = rawString.split('')
    .map((char) => translitMap[char] ?? char)
    .join('');

  return outputString;
}

// Convert a string of unknown formatting to camelCase

export function toCamelCase(str) {

  const camelCasedStr = 
    str.
      replace(/([a-z])([A-Z])/g, '$1 $2'). // split aB etc. (handle camelCase input)
      split(/[-_\s]+/). // split a-b, a--b, a___b etc. (handle other naming formats)
      map((w, i) => i === 0? w.toLowerCase() :
          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).
      join('')

  return camelCasedStr;
}

// Convert a string of unknown formatting to dash-separated lowercase

export function toDashedLowerCase(str) {

    const dashedStr = 
    str.
      replace(/([a-z])([A-Z])/g, '$1 $2'). // split aB etc. (handle camelCase input)
      split(/[-_\s]+/). // split a-b, a--b, a___b etc. (handle other naming formats)
      map(w => w.toLowerCase()).
      join('-')

  return dashedStr;
}

////////////////////////////////////////////
// ABC UTILS: HIDE & SHOW ELEM FUNCTIONS
///////////////////////////////////////////

// Hide an element via attribute hidden and set aria-hidden to true

export function ariaHideMe(el) {

  if (el.hasAttribute("inert")) return;

  el.setAttribute("hidden", "");
  el.setAttribute("aria-hidden", "true");
}

// Remove attribute hidden from an element and set aria-hidden to false

export function ariaShowMe(el) {

  if (el.hasAttribute("inert")) return;
    
  el.removeAttribute("hidden");
  el.removeAttribute("aria-hidden");
}

// Toggle between color themes (default options: light & dark)
// Store theme preference for this Viewer in localStorage
// Hide the element that triggered theme change

export function toggleColorTheme(themeId, triggerBtn, viewerDialogId) {

  const viewerModuleDialog = document.getElementById(viewerDialogId);

  const viewerModuleLocalStorageItemId =
    toCamelCase(viewerDialogId) + 'PrefersColorTheme';

  let viewerModuleThemeBtnData = '';

  for (const key in triggerBtn.dataset) {
    if (triggerBtn.dataset[key] === "toggle-theme") {
      viewerModuleThemeBtnData = key;
      break;
    }
  }

  const viewerModuleThemeBtnDataId =
    `[data-` +
    `${toDashedLowerCase(viewerModuleThemeBtnData) ||
    `${viewerDialogId.charAt(0).toLowerCase()}vw-action`}` +
    `="toggle-theme"]`;

  const viewerModuleThemeBtns =
    viewerModuleDialog.querySelectorAll(viewerModuleThemeBtnDataId);

  viewerModuleDialog.className = themeId;

  viewerModuleThemeBtns.forEach(themeBtn => {

    if (themeBtn.classList.contains(`btn-${themeId}`)) {

      if (isLocalStorageOk()) {

        localStorage.setItem(viewerModuleLocalStorageItemId, themeId);
      }

      themeBtn.removeAttribute("inert");
      ariaShowMe(themeBtn);
      themeBtn.focus();
    }
  });

  ariaHideMe(triggerBtn);
  triggerBtn.setAttribute("inert", "");
}

// Get the first element in a NodeList that is currently displayed

export function getFirstCurrentlyDisplayedElem(nodeList) {

  let foundEl = null;

  for (let i = 0; i < nodeList.length; i++) {

    if(nodeList[i].offsetParent) {

      foundEl = nodeList[i];
      break;
    }
  }

  return foundEl;
}

////////////////////////////////////////////
// ABC UTILS: ERROR CATCHERS
///////////////////////////////////////////

// Check if localStorage is available and writable

export function isLocalStorageOk() {

  return storageAvailable('localStorage');
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// storage-available by Stijn de Witt
// GitHub Repo: https://github.com/Download/storage-available
// MIT License
// Copyright (c) 2016 Stijn de Witt <StijnDeWitt@hotmail.com>
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}