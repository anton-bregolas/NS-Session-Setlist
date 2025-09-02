////////////////////////////////////////////////////////////////////////
// Novi Sad Session Chord Viewer Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2024-2025
////////////////////////////////////////////////////////////////////////

// Import function to get last Tunebook URL (use with embedded ABC Tools)

import { getLastTunebookUrl } from "./scripts-abc-tools.js";

// Import function for checking whether localStorage is available and writeable

import { storageAvailable } from "./scripts-3p/storage-available/storage-available.js";

// Import lz-string compression algorithm (for dynamic chord generation)

import { LZString } from "./scripts-3p/lz-string/lz-string.min.js";

// Import custom functions handling warning messages, user notifications and focus on exit

import { displayWarningEffect, displayNotification } from "./scripts-nss-app.js";

// Define required app elements

// Elements used to launch the viewer, first currently displayed gets focus on exit
const launchEls = document.querySelectorAll('[data-load="chord-viewer"]');
// Fallback button receiving focus after viewer is closed
const altFocusBtn = document.querySelector('#fullScreenButton');
// Select element containing a list of Tune / Set options
const tuneSelector = document.querySelector('#tuneSelector');

// Define Chord Viewer Dialog elements

const chordViewerDialog = document.querySelector('[data-chord-viewer="dialog"]');
const chordViewerTitle = document.querySelector('[data-chord-viewer="title"]');
const chordViewerChords = document.querySelector('[data-chord-viewer="chords-container"]');
const chordViewerSlider = document.querySelector('[data-chord-viewer="slider"]');

// Define initial Chord Viewer Slider settings

const vInitVal = 120 // Global initial value for vertical slider (%)
const lineWInit = 40 // Global initial value for chords line width (em)
const maxWInit = 80 // Global initial value for chords line max width (%)

// Define ranges for chords line width and max line width

const lineWMin = 20; // Minimum line width of chords (em)
const lineWMax = 50; // Maximum line width of chords (em)
const maxWLows = 50; // Lowest max-width value for chords (%)
const maxWTops = 90; // Highest max-width value for chords (%)

// Set global variables

let isSliderInitialized = false; // Keep track of the slider initialization status

///////////////////////////////////
// CHORD VIEWER LAUNCH FUNCTIONS
//////////////////////////////////

// Open Chord Viewer:
// Extract Chords from ABC or URL if dynamic chord mode is on
// Load Chordbook chords into the Chord Viewer Dialog
// Show dialog, initiate Chord Viewer Slider settings

export function openChordViewer(setChords, tuneChords) {
  
  const isDynamicChordsMode = isLocalStorageOk()? +localStorage.chordViewerAllowDynamicChords : false;

  const launchButton = launchEls

  if (!setChords && !tuneChords && !isDynamicChordsMode) {

    displayNotification("Chordbook missing or empty: Use Dynamic Mode", "error");
    displayWarningEffect(launchButton, altFocusBtn);
    return;
  }

  let currentAbcTitle;

  // Dynamic Mode: Attempt to extract ABC & chords

  if (isDynamicChordsMode) {

    let abcContent = '';

    // Try looking for accessible ABC input to get current ABC

    const abcInput = document.querySelector('#abc');

    if (abcInput && abcInput.value) {

      abcContent = abcInput.value;

    // Otherwise get ABC from current Tune Selector value

    } else {

      const abcUrl = tuneSelector.value || getLastTunebookUrl();

      const abcInLzw = abcUrl.match(/(?<=lzw=)(?:[^&]*)/)? abcUrl.match(/(?<=lzw=)(?:[^&]*)/)[0] : null;

      if (!abcUrl || !abcInLzw) {
  
        displayNotification("Select an item in Tune Selector", "warning");
        displayWarningEffect(launchButton, altFocusBtn);
        return;
      }
  
      abcContent = LZString.decompressFromEncodedURIComponent(abcInLzw);
    }

    const extractedChordsArr = extractChordsFromAbc(abcContent);

    if (!extractedChordsArr || extractedChordsArr.length < 1) {

      displayNotification("No chords to view in this ABC", "warning");
      displayWarningEffect(launchButton, altFocusBtn);
      return;
    }

    const isAbcSet = extractedChordsArr[0].setTitle? true : false;

    setChords = isAbcSet? extractedChordsArr : [];
    tuneChords = isAbcSet? [] : extractedChordsArr;

    currentAbcTitle = abcContent.match(/(?<=^T:).*/m)? abcContent.match(/(?<=^T:).*/m)[0].trim() : null;
  }

  // Chordbook Mode: Use pre-generated chords data passed to openChordViewer
  // Continue with extracted data if Dynamic Mode is on

  if (!currentAbcTitle) {

    // Get ABC title from selected item in Tune Selector

    const selectedTuneTitle = tuneSelector.options[tuneSelector.selectedIndex].text;

    // Failing that, extract ABC title from last Tunebook URL

    let extractedTuneTitle;

    if (!selectedTuneTitle || selectedTuneTitle.toLowerCase().includes("select")) {

      const lastUrl = getLastTunebookUrl();
      const abcInLzw = lastUrl.match(/(?<=lzw=)(?:[^&]*)/)? lastUrl.match(/(?<=lzw=)(?:[^&]*)/)[0] : null;

      if (!lastUrl || !abcInLzw) {

        displayNotification("Select an item in Tune Selector", "warning");
        displayWarningEffect(launchButton, altFocusBtn);
        return;
      }

      const abcContent = LZString.decompressFromEncodedURIComponent(abcInLzw);

      extractedTuneTitle = abcContent.match(/(?<=^T:).*/m)? abcContent.match(/(?<=^T:).*/m)[0].trim() : null;
    }

    currentAbcTitle = extractedTuneTitle || selectedTuneTitle;
  }

  const setMatch = setChords.find(set => set.setTitle === currentAbcTitle);
  const tuneMatch = tuneChords.find(tune => tune.title === currentAbcTitle);

  if (!setMatch && !tuneMatch) {

    const userWarning = 
      currentAbcTitle? "No Chordbook entry for this ABC" : "Select an item in Tune Selector";
      
    displayNotification(userWarning, "warning");
    displayWarningEffect(launchButton, altFocusBtn);
    return;
  }
  
  if (setMatch) {

    chordViewerTitle.textContent = setMatch.setTitle;
    loadChordsToDialog(setMatch.tuneChords, "chords-set");

  } else if (tuneMatch) {

    chordViewerTitle.textContent = tuneMatch.title;
    loadChordsToDialog([tuneMatch], "chords-tune");
  }

  chordViewerDialog.showModal();
  initDialogSlider();
}

///////////////////////////////////
// CHORD VIEWER INIT FUNCTIONS
//////////////////////////////////

// Initialize Chord Viewer Dialog

export function initChordViewer() {

  if (!chordViewerDialog) return;

  chordViewerDialog.addEventListener('click', handleChordViewerClick);

  if (isLocalStorageOk()) {

    if (+localStorage.chordViewerUseBoldFonts) {

      chordViewerChords.style.fontWeight = "bold";
    }

    if (localStorage.chordViewerPrefersColorTheme === "light" ||
       (!localStorage.chordViewerPrefersColorTheme && window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches)) {

        const lightThemeBtn = 
          document.querySelector('[data-cvw-action="toggle-theme"][data-theme="light"]');

        toggleColorTheme("light", lightThemeBtn);
    }
  }

  const userAgentStr = navigator.userAgent.toLowerCase();

  const isSafariBrowser =
    userAgentStr.indexOf('safari') > -1 && userAgentStr.indexOf('chrome') === -1;

  if (isSafariBrowser) chordViewerDialog.dataset.browser = "safari";
}

// Handle clicks on interactable Chord Viewer elements

function handleChordViewerClick(event) {

  const actionTrigger = event.target.closest('[data-cvw-action]');

  if (!actionTrigger) return;

  const chordViewerGui = chordViewerDialog.querySelectorAll('[data-cvw-action]');

  const elAction = actionTrigger.dataset.cvwAction;

  if (elAction === 'reset-slider') {

    chordViewerDialog.style.cssText = ''

    if (isLocalStorageOk()) {

      localStorage.removeItem('chordViewerSliderFontSizeValue');
      localStorage.removeItem('chordViewerSliderLineWidthValue');
      localStorage.removeItem('chordViewerSliderMaxWidthValue');
    }

    initDialogSlider();
  
    return;
  }

  if (elAction === 'toggle-gui') {
    
    const titleContainer =
      document.querySelector('[data-chord-viewer="title-container"]');

    if (titleContainer.hasAttribute("hidden")) {

      ariaShowMe(titleContainer);
      actionTrigger.style.removeProperty("opacity");

    } else {

      ariaHideMe(titleContainer);
      actionTrigger.style.opacity = 0.3;
    }

    chordViewerGui.forEach(guiElem => {

      if (guiElem === actionTrigger || guiElem.classList.contains("btn-x")) return;

      if (guiElem.hasAttribute("hidden")) {

        ariaShowMe(guiElem);

      } else {

        ariaHideMe(guiElem);
      }
    });

    return;
  }

  if (elAction === 'toggle-theme') {

    const themeId = actionTrigger.dataset.theme;

    toggleColorTheme(themeId, actionTrigger);

    return;
  }

  if (elAction === 'toggle-bold-font') {

    if (isLocalStorageOk() && +localStorage.chordViewerUseBoldFonts) {

      chordViewerChords.style.removeProperty('font-weight');
      localStorage.chordViewerUseBoldFonts = 0;
      return;
    }

    chordViewerChords.style.fontWeight = "bold";
    localStorage.chordViewerUseBoldFonts = 1;
    return;
  }

  if (elAction === 'close-chord-viewer') {

    chordViewerDialog.close();

    const focusElem =
      getFirstCurrentlyDisplayedElem(launchEls) ?? altFocusBtn;

    focusElem.focus();

    return;
  }
}

// Initialize Chord Viewer slider using values from localStorage or default values

function initDialogSlider() {

  if (isLocalStorageOk()) {

    if (!localStorage.chordViewerSliderFontSizeValue)
      localStorage.chordViewerSliderFontSizeValue = vInitVal;

    if (!localStorage.chordViewerSliderLineWidthValue)
      localStorage.chordViewerSliderLineWidthValue = lineWInit;

    if (!localStorage.chordViewerSliderMaxWidthValue)
      localStorage.chordViewerSliderMaxWidthValue = maxWInit;
  }

  // Set default slider values to be applied on load

  let valueV = vInitVal;
  let lineWidth = lineWInit;
  let maxWidth = maxWInit;

  // Restore slider values from localStorage (if available)

  if (isLocalStorageOk()) {

    if (localStorage.chordViewerSliderFontSizeValue)
      valueV = localStorage.chordViewerSliderFontSizeValue;

    if (localStorage.chordViewerSliderLineWidthValue)
      lineWidth = localStorage.chordViewerSliderLineWidthValue;

    if (localStorage.chordViewerSliderMaxWidthValue)
      maxWidth = localStorage.chordViewerSliderMaxWidthValue;
  }

  // Set initial style property values for chords

  chordViewerSlider.value = valueV;

  chordViewerDialog.style.setProperty("--chords-font-size", `${valueV}%`);
  chordViewerDialog.style.setProperty("--chords-line-height", `${valueV}%`);
  chordViewerDialog.style.setProperty("--chords-max-width", `${maxWidth}%`);
  chordViewerDialog.style.setProperty("--chords-line-width", `${lineWidth}em`); // em!

  // Listen to slider input events

  if (!isSliderInitialized) {

    chordViewerSlider.addEventListener('input', appChordSliderHandler);
    isSliderInitialized = true;
  }
}

///////////////////////////////////
// CHORD DISPLAY FUNCTIONS
//////////////////////////////////

// Create responsive grid layout with chords data inside Chords Dialog

function loadChordsToDialog(chordsMatch, chordsType) {

  chordViewerChords.textContent = '';

  chordsMatch.forEach(tune => {
      
  if (!tune.chords) return;
    
  const tuneBlock = document.createElement('div');
  tuneBlock.dataset.chords = "tuneitem";

  if (chordsType === "chords-set") {
  
    const titleDiv = document.createElement('div');
    const titleSpan = document.createElement('span');
    titleDiv.dataset.chords = "subtitle-container";
    titleSpan.dataset.chords = "subtitle";
    titleSpan.textContent = tune.title;
    titleDiv.appendChild(titleSpan);
    tuneBlock.appendChild(titleDiv);
  }
  
  const tunePartsArr = tune.chords.split('\n\n');

  tunePartsArr.forEach(tunePart => {

    if (!tunePart.trim()) return;

    const partNoText = tunePart.match(/PART[\s]*[\d]*:/)[0];

    const partNoDiv = document.createElement('div');
    const partNoSpan = document.createElement('span');
    partNoDiv.dataset.chords = "partno-container";
    partNoSpan.dataset.chords = "partno";
    partNoSpan.textContent = partNoText;
    partNoDiv.appendChild(partNoSpan);
    
    const tunePartBlock = document.createElement('div');
    tunePartBlock.dataset.chords = "body";
    tunePartBlock.appendChild(partNoDiv);
    
    const partLinesArr = tunePart.split('\n')
      .filter(line => line.trim() && !line.startsWith('PART'));
    
    partLinesArr.forEach(line => {

      const lineBlock = document.createElement('div');
      lineBlock.dataset.chords = "line";
      
      const barPattern = /\|[\d]?|\|\|/g;
      const lineBarsArr = line.split(barPattern)
        .filter(bar => bar.trim());

      const barSeparators = line.match(barPattern) || [];

      let barCount = 0;

      let isFinalBar = false;

      let isVolta = false;
      
      lineBarsArr.forEach((tuneLineBar, lineBarIndex) => {

      barCount++;

      const barBlock = document.createElement('div');
      barBlock.classList.add('grid-center');
      barBlock.dataset.chords =  isTuneTripleMeter(tune.meter)? "bar-triple" : "bar";
      
      const lineBarStartSpan = document.createElement('span');
      lineBarStartSpan.dataset.chords = "barline";
      
      const barSeparator = barSeparators[lineBarIndex] || '|';
      
      if (barSeparator.match(/\|[\d]+/)) {

        isVolta = true;

        lineBarStartSpan.textContent = '|';

        const voltaSpan = document.createElement('span');
        voltaSpan.dataset.chords = "volta";
        voltaSpan.textContent = barSeparator.substring(1);
        
        lineBarStartSpan.appendChild(voltaSpan);

      } else {
      
        lineBarStartSpan.textContent = barSeparator;
      }

      barBlock.appendChild(lineBarStartSpan);

      const tuneChords = tuneLineBar.split('\t')
        .filter(chord => chord.trim());
      
      tuneChords.forEach(tuneChord => {
        
        const chordSpan = document.createElement('span');
        chordSpan.dataset.chords = "chord";
        chordSpan.textContent = tuneChord.trim();
        barBlock.appendChild(chordSpan);
      });

      isFinalBar = partLinesArr.indexOf(line) === partLinesArr.length - 1 && 
             barCount === lineBarsArr.length;

      if (barCount === 4 && !isFinalBar) {

        const lineBarEndSpan = document.createElement('span');
        lineBarEndSpan.dataset.chords = "barline";
        lineBarEndSpan.textContent = '|';
        barBlock.appendChild(lineBarEndSpan);
      }

      if (isFinalBar && !isVolta) {

        const lineBarDoubleSpan = document.createElement('span');
        lineBarDoubleSpan.dataset.chords = "barline";
        lineBarDoubleSpan.textContent = '||';
        barBlock.appendChild(lineBarDoubleSpan);
      }
      
      lineBlock.appendChild(barBlock);
      });

      if (isFinalBar && isVolta) {

      const barFinBlock = document.createElement('div');
      barFinBlock.classList.add('grid-center');
      barFinBlock.dataset.chords =  isTuneTripleMeter(tune.meter)? "bar-triple" : "bar";

      const lineBarDoubleSpan = document.createElement('span');
      lineBarDoubleSpan.dataset.chords = "barline";
      lineBarDoubleSpan.textContent = '||';

      barFinBlock.appendChild(lineBarDoubleSpan);
      lineBlock.appendChild(barFinBlock);
      }
      
      tunePartBlock.appendChild(lineBlock);
    });
    
    tuneBlock.appendChild(tunePartBlock);
  });
  
  chordViewerChords.appendChild(tuneBlock);
  });
}

// Handle Chord Viewer Slider events

function appChordSliderHandler(event) {

  // Slider defaults for calculations

  const vMin = +chordViewerSlider.min;
  const vMax = +chordViewerSlider.max;

  // Handle slider value input event

  if (event.type === 'input') {

  let valueV = chordViewerSlider.value;

    if (this === chordViewerSlider) {

      const maxLineWAddend = 
        valueV > vInitVal? Math.round((valueV - vInitVal) * ((maxWTops - maxWInit) / (vMax - vInitVal))) : 
                           Math.round((valueV - vInitVal) * ((maxWInit - maxWLows) / (vInitVal - vMin)));

      const lineWAddend = 
        valueV > vInitVal? Math.round((valueV - vInitVal) * ((lineWMax - lineWInit) / (vMax - vInitVal))) :
                           Math.round((valueV - vInitVal) * ((lineWInit - lineWMin) / (vInitVal - vMin)));

      if (isLocalStorageOk()) {

        localStorage.chordViewerSliderFontSizeValue = valueV;
        localStorage.chordViewerSliderMaxWidthValue = maxWInit + maxLineWAddend;
        localStorage.chordViewerSliderLineWidthValue = lineWInit + lineWAddend;
      }

      // Set adjusted style property values for chords

      chordViewerDialog.style.setProperty("--chords-font-size", `${valueV}%`);
      chordViewerDialog.style.setProperty("--chords-line-height", `${valueV}%`);
      chordViewerDialog.style.setProperty("--chords-max-width", `${maxWInit + maxLineWAddend}%`);
      chordViewerDialog.style.setProperty("--chords-line-width", `${lineWInit + lineWAddend}em`); // em!
    }
  }
}

///////////////////////////////////
// CHORD EXTRACTION FUNCTIONS
//////////////////////////////////

// Make Chordbook JSON from string in ABC notation
// Validate JSON and return the Chords Array or []

function extractChordsFromAbc(abcContent) {

  if (!validateAbcChordsContent(abcContent)) return null;

  console.log(`Chord Viewer Module:\n\nExtracting chords from ABC...`);

  const chordBook = makeAbcChordBook(abcContent);

  const chordsArray = getValidChordsArray(chordBook);

  return chordsArray || [];
}

// Convert a list of ABC Sets or Tunes into a Chordbook JSON
// Extract chords from each ABC item via getChordsFromTune

export function makeAbcChordBook(abcContent) {

  let chordBookOutput = '';

  const splitAbcArr = 
          abcContent.split(/X.*/gm)
                    .filter(abc => abc != '')
                    .filter(abc => abc.match(/"[\S]?"/) != null)
                    .map(abc => abc.trim());

  const abcChordsArr = [];

  splitAbcArr.forEach(abc => {

    let abcChordsObj;
    let abcTitle = '';
    let abcMeter = '';
    let abcNoteLength = '';
    let abcBody = '';

    // Generate Sets Chordbook if ABC has several T: groups followed by text

    const matchTuneBlocks = abc.match(/^T:.*[\s]*(?:^[A-Z]:.*[\s]*)*(?=^[\S]+)/gm);

    const isTuneSet = matchTuneBlocks && matchTuneBlocks.length > 1;

    if (isTuneSet) {

      const abcPrimaryTitle = abc.match(/(?<=^T:).*/m)[0].trim();
      const abcTunesArr = 
        abc.replace(/^T:.*/, '')
           .trim()
           .split('T:')
           .filter(Boolean)
           .map(tune => `T:${tune}`);

      abcChordsObj = { "setTitle": abcPrimaryTitle, "tuneChords": [] };

      abcTunesArr.forEach(tune => {

        abcBody = normalizeAbc(tune);

        if (!abcBody.match(/".*"/)) {
          return;
        }

        abcTitle = tune.match(/^.*/)[0].split(' / ')[0].trim();
        abcMeter = tune.match(/^M:/m)? tune.match(/(?<=^M:).*/m)[0].trim() : abc.match(/(?<=^M:).*/m)[0].trim();
        abcNoteLength = tune.match(/^L:/m)? tune.match(/(?<=^L:).*/m)[0].trim() : abc.match(/(?<=^L:).*/m)[0].trim();

        const tuneChordObj = getChordsFromTune(abcBody, abcTitle, abcMeter, abcNoteLength);

        abcChordsObj.tuneChords.push(tuneChordObj);
      });
    
    // Generate Tunes Chordbook if ABC has two T: fields or less

    } else {

      abcTitle = abc.match(/(?<=^T:).*/m)[0].trim();
      abcMeter = abc.match(/(?<=^M:).*/m)[0].trim();
      abcNoteLength = abc.match(/(?<=^L:).*/m)[0].trim();
      abcBody = normalizeAbc(abc);

      abcChordsObj = getChordsFromTune(abcBody, abcTitle, abcMeter, abcNoteLength);
    }

    if (abcChordsObj) {

      abcChordsArr.push(abcChordsObj);
    }
  });

  if (abcChordsArr.length > 0) {
    
    chordBookOutput = JSON.stringify(abcChordsArr, null, 2);

    console.log(`Chord Viewer Module:\n\nChordbook generated!`);
  }
    
  return chordBookOutput;
}

// Extract chords from ABC Tune and return a single Chordbook object

function getChordsFromTune(abcBody, abcTitle, abcMeter, abcNoteLength) {

  const abcChordsObj = {};

  const abcPrimaryTitle = abcTitle.replace(/T:[\s]*/, '');

  abcChordsObj.title = abcPrimaryTitle;
  abcChordsObj.meter = abcMeter;

  const tuneMeter = abcMeter? abcMeter : "4/4";
  let minTuneBeats = 2;

  switch (tuneMeter) {
    case "2/2":
    case "2/4":
    case "4/4":
    case "6/8":
    case "12/8":
      minTuneBeats = 2;
      break;
    case "3/4":
    case "3/2":
    case "9/8":
      minTuneBeats = 3;
      break;
    default:
      break;
  }

  const abcPartsArr = abcBody.split('||');
  let partCounter = 0;
  let barCounter;
  let abcChords = '';
  let lastChord = '';

  abcPartsArr.forEach(abcPart => {

    if (!abcPart || !abcPart.trim()) return;

    partCounter++;
    barCounter = 0;

    const abcBarsArr = abcPart.split('|');

    let abcPartChords = '';

    abcBarsArr.forEach(abcBar => {

      // Discard strings like "\n", ":", "|", "A"
      if (abcBar.trim().length <= 1) return;

      let voltaNo = '';

      if (abcBar.match(/^[\d]/)) {

        voltaNo = +abcBar[0] > 1? `\n|${abcBar[0]}` : abcBar[0];
      }

      if (barCounter >= 4 && !voltaNo) {

        abcPartChords += `|\n`;

        barCounter = 0;
      }

      // Flag final bars of tune parts to account for potentially incomplete chord-beats
      const isFinalBar = abcBarsArr.indexOf(abcBar) === abcBarsArr.length - 1? true : false;

      const abcBarChordsArr = abcBar.match(/".*?"/g) ?? [];
      
      // Clean up chord contents, filtering out all invalid characters
      const abcBarChordsInput =
        abcBarChordsArr.map(c => c.replaceAll(/[^a-zA-Z0-9#♯♭♮×/()+]/g, '')).
        map(c => c.replaceAll(/(.+)\(/g, `$1\u2009(`)).
        filter(Boolean);
      
      const processedChordsArr = getCompleteAbcChordBar(abcBar, abcBarChordsInput, minTuneBeats, abcMeter, lastChord, isFinalBar, abcNoteLength);
      
      // Discard invalid bars (bars without notes, anacruses)
      if (!processedChordsArr) return;

      const currentChordsBar = processedChordsArr[0];

      lastChord = processedChordsArr[1];

      abcPartChords += `|${voltaNo}\t${currentChordsBar}`;

      barCounter++;
    });

    abcChords += abcPartChords? `\n\nPART ${partCounter}:\n${abcPartChords}||` : '';
  });

  abcChordsObj.chords = abcChords.trim();
  
  return abcChordsObj;
}

// Process an ABC bar and return an array with chords and lastChord, filling in missing chord-beats

function getCompleteAbcChordBar(abcBar, abcBarChordsInput, minTuneBeats, abcMeter, lastChord, isFinalBar, abcNoteLength) {

  // Handle cases of single chord per bar, ignore bars where the first chord-beat is missing
  if (abcBarChordsInput.length === 1 && abcBar.match(/^:*\d*[\s]*["]/)) {

    const singleBarChord = abcBarChordsInput[0];

    if (abcBarChordsInput[0].length > 3) {

      return [`${singleBarChord}${`\t/`.repeat(minTuneBeats - 1)}`, singleBarChord];
    }

    return [`${(singleBarChord + '\t').repeat(minTuneBeats)}`, singleBarChord];
  }

  // Handle cases of fully-stacked chords per bar (3 chords for triple-time tunes, 2 or 4 chords for duple-time tunes)
  if (abcBarChordsInput.length === minTuneBeats || abcBarChordsInput.length === minTuneBeats * 2) {

    if (isTuneTripleMeter(abcMeter)) {

      return [`${abcBarChordsInput.join('\t')}\t`, abcBarChordsInput[abcBarChordsInput.length - 1]];
    }

    if (abcBarChordsInput.length === minTuneBeats) {

      return [`${abcBarChordsInput[0]}\t${abcBarChordsInput[1]}\t`, abcBarChordsInput[1]];
    }
    
    return [`${abcBarChordsInput[0]}\xa0${abcBarChordsInput[1]}\t${abcBarChordsInput[2]}\xa0${abcBarChordsInput[3]}\t`, abcBarChordsInput[3]];
  }

  // Handle cases of zero or incomplete chord-beats per bar (2 out of 3 chords for triple-time tunes, missing first chord-beat for duple-time tunes)
  if (abcBarChordsInput.length < minTuneBeats) {

    return countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats, abcMeter, lastChord, isFinalBar, abcNoteLength);
  }

  // Handle cases of incomplete chord-beats per bar (3 out of 4 chords and/or missing first chord-beat for quadruple-time tunes)
  // Handle cases of oversaturated chord-beats (time signature change etc.)
  if (abcBarChordsInput.length > minTuneBeats) {

    return countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats * 2, abcMeter, lastChord, isFinalBar, abcNoteLength);
  }
}

// Recover missing chord-beats by counting notes against beats and inserting the sufficient number of chords
// Account for bars where chord input was skipped or the first chord-beat is missing, fill them in using lastChord

function countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats, abcMeter, lastChord, isFinalBar, abcNoteLength) {

  let completeChordBar = '';

  const splitMeterArr = abcMeter.split('/');
  // Count the number of eighth notes per bar
  const eightsPerBar = 8 / splitMeterArr[1] * splitMeterArr[0];
  // Count the number of eighth notes per beat of tune
  const eightsPerBeat =  eightsPerBar / minTuneBeats;
  // Filter the notes of the tune, removing chords, volta numbers, symbols and spaces
  const notesBetweenChords = abcBar.split(/"[^"]*"/)
                             .map(str => str.replaceAll(/[^a-gxzA-G0-9/]/g, ''))
                             .map(str => str.replaceAll(/^[^a-gxzA-G]/g, ''))
                             .filter(Boolean);

  // Only process bars with notes in them
  if (notesBetweenChords.length === 0) return null;

  // Initiate counters for number of beats and notes
  let beatCount = 0;
  let noteCount = 0;

  // Account for L: values other than 1/8
  const noteCoef = abcNoteLength === "1/8" || !abcNoteLength? 1 : 8 / abcNoteLength[0]/abcNoteLength[2];
  // Account for potentially incomplete bars with volta brackets
  const isVoltaBar = abcBar.match(/^[\d]/)? true : false;

  // Account for non-empty bars where first chord-beat is missing
  let isMissingFirstBeat = abcBar.match(/^:*\d*[\s]*["]/)? 0 : 1;
  // Pre-fill the missing first chord-beat with lastChord
  if (isMissingFirstBeat && abcBarChordsInput.length !== 0) {

    completeChordBar += `${lastChord}${minTuneBeats > 3? '\xa0' : `\t`}`;
    beatCount++;
  }
  // Account for bars where chords were skipped
  // Fill empty chords array with lastChord
  if (abcBarChordsInput.length === 0) {

    abcBarChordsInput.length = minTuneBeats;
    abcBarChordsInput.fill(lastChord);
  }

  // Iterate between groups of notes preceded by chords in source ABC
  // Separate notes, note multipliers (numbers not preceded by /) and note divisors (/, //... or /Num)
  // Calculate the total worth of eighth notes and count the beats for each group
  // Insert a chord of the same index as the group at the start of each beat

  notesBetweenChords.forEach(abcFragment => {

    const countNotes = abcFragment.match(/[a-gxzA-G]/g).length;
    const countExtraMultiplierSum = abcFragment.match(/[^/]\d+/)? abcFragment.match(/[^/]\d+/g)?.map(match => match.slice(1)).map(num => num - 1).reduce((a, b) => a + b) : 0;
    const extraDivisorArr = abcFragment.includes('/')? abcFragment.match(/[/]+\d*/g) : [];
    const countSimpleDivisorSum = extraDivisorArr.length > 0 && extraDivisorArr.some(str => /[/](?=[^\d]|$)/.test(str))? extraDivisorArr.filter(str => str.match(/[/](?=[^\d]|$)/)).reduce((a, b) => a + (1 - (1 / Math.pow(2, b.length))), 0) : 0;
    const countAllExtraDivisorSum = extraDivisorArr.length > 0 && extraDivisorArr.some(str => /\d/.test(str))? extraDivisorArr.map(str => str.replaceAll(/[^\d]/g, '')).reduce((a, b) => a + (1 - (1 / b)), 0) + countSimpleDivisorSum : countSimpleDivisorSum;
    const countEights = countNotes + (Number.isFinite(countExtraMultiplierSum)? countExtraMultiplierSum : 0) - (Number.isFinite(countAllExtraDivisorSum)? countAllExtraDivisorSum : 0);
    const relatedChord = abcBarChordsInput[notesBetweenChords.indexOf(abcFragment)];
    let previousChord = '';

    noteCount += noteCoef * countEights;
    
    let beatsInThisFragment = countEights / eightsPerBeat;

    // Handle chords placed with syncopation
    if (beatsInThisFragment % 1 !== 0) {

      beatsInThisFragment = beatsInThisFragment < 1? 1 : Math.floor(beatsInThisFragment);
    }

    // Add chords related to ABC fragment to completeChordBar string
    for (let n = 0; n < beatsInThisFragment; n++) {

      let currentChord = relatedChord? relatedChord : '';

      if ((previousChord && currentChord) && 
        currentChord === previousChord && 
        currentChord.length > 3) {

        currentChord = '/';
      }
      
      completeChordBar +=
        currentChord? 
        `${currentChord}` +
        `${isTuneTripleMeter(abcMeter) || beatCount % 2 !== 0 || beatsInThisFragment === minTuneBeats? '\t' : '\xa0'}` :
        '';
      previousChord = currentChord;
      beatCount++;
    }
  });

  // Only return chords for bars that are over 1/2 length of a bar
  // Always return chords for bars that are inside voltas
  if (noteCount <= eightsPerBar / 2 && !isVoltaBar && !isFinalBar) return null;

  return [completeChordBar, abcBarChordsInput[abcBarChordsInput.length - 1]];
}

///////////////////////////////////
// ABC CLEANUP FUNCTIONS
//////////////////////////////////

// Check if the tune is in triple meter based on its M: text

function isTuneTripleMeter(tuneMeter) {

  if (tuneMeter === "3/4" | tuneMeter === "3/2" | tuneMeter === "9/8") {
  
    return true;
  }
  
  return false;
}

// Pass ABC to cleanup functions to remove or normalize elements that may interfere into chord calculations

function normalizeAbc(abcContent) {

  let abcOutput = processPartEndingsForChordBook(abcContent);
  abcOutput = removeAbcHeadersAndCommands(abcOutput);
  abcOutput = removeAbcAccidentalsAndDecorations(abcOutput);
  abcOutput = convertAbcIntervalsToSingleNotes(abcOutput);
  abcOutput = normalizeAbcTriplets(abcOutput);
  abcOutput = normalizeAbcChordOrder(abcOutput);
  abcOutput = normalizeAbcFractions(abcOutput);

  return abcOutput;
}

// Replace several variants of ABC part separators and voltas with uniform style

function processPartEndingsForChordBook(abcContent) {

  let filteredAbc = 
    abcContent.replaceAll(/\|](?=\r?\n|$)/g, '||') // |AB cd|] > |AB cd||
              .replaceAll(/(?<!^\|*\[.*):\|(?=(?:\r?\n[^[]|$))/g, ':||') // |AB cd:| > |AB cd:||
              .replaceAll(/\[(?=\d)/g, '') // |[1 AB cd:| > |1 AB cd:| // [1 AB cd:| > 1 AB cd:|
              .replaceAll(/(?<=:\|\d[^|]*)\|(?=\r?\n|$)/g, '||') // |2 AB cd| > |2 AB cd||
              .replaceAll(/(?<=[^|])\|(?=\r?\nT|$)/g, '||') // |AB cd| + T: New Tune > |AB cd|| + T: New Tune
              .replaceAll(/:\|*:\r?\n/g, ':||\n|:') // |AB cd:: or |AB cd:|: > |AB cd:|| + |:
              .replaceAll(/:\|*:/g, ':||\n|:') // |AB cd::ef g2| > |AB cd:|| + |:ef g2|
              .replaceAll(/\|\|:/g, '|:') // ||:AB cd| > |:AB cd|

  return filteredAbc;
}

// Strip ABC of all header fields, commands and inline instructions (ornamentation, directions, lyrics etc.) 

function removeAbcHeadersAndCommands(abcContent) {

  let filteredAbc = 
    abcContent.replaceAll(/^(?:[A-Za-z+]:.*\r?\n)*/gm, '')
              .replaceAll(/^(?:%.*\r?\n)*/gm, '')
              .replaceAll(/\[\w:.*?\]/g, '')
              .replaceAll(/<.*?>/g, '')
              .replaceAll(/!.*?!/g, '')
              .replaceAll(/\+.*?\+/g, '')
              .replaceAll(/{.*?}/g, '');
  
  return filteredAbc;
}

// Strip ABC of all accidentals (flat, natural, sharp) and decorations (rolls, staccato etc.)

function removeAbcAccidentalsAndDecorations(abcContent) {

  let filteredAbc = 
    abcContent.replaceAll(/[_=^\.~]/g, '');

  return filteredAbc;
}

// Replace all ABC intervals / inline chords with a single highest note of the interval / chord

function convertAbcIntervalsToSingleNotes(abcContent) {

  let filteredAbc = abcContent.replaceAll(/\[([=_^.~]*[a-gA-G]+[,']*[0-9]*)*?\]/g, `$1`);

  return filteredAbc;
}

// Replace ABC triplets and quadruplets in (3ABC format with A/B/c and A/B/cd

function normalizeAbcTriplets(abcContent) {

  let filteredAbc = abcContent.replaceAll(/[]/g, '')
                              .replaceAll(/\([34](\w)\/(\w)\/(\w)\//g, `$1//$2//$3/`)
                              .replaceAll(/\([34](\w)(\w)(\w)/g, `$1/$2/$3`);

  return filteredAbc;
}

// Fix instances of ABC chords breaking up elements such as triplets

function normalizeAbcChordOrder(abcContent) {

  let filteredAbc = abcContent.replaceAll(/(\([34])(".*?")/g, `$2$1`);

  return filteredAbc;
}

// Replace fractional notation of notes with special characters

function normalizeAbcFractions(abcContent) {

  let filteredAbc = abcContent.replaceAll("3/2", ">")
                              .replaceAll("2/3", "<")
                              .replaceAll("1/2", "/")
                              .replaceAll("1/4", "//")
                              .replaceAll(/([a-gA-G]+)\/2/g, `$1/`)
                              .replaceAll(/([a-gA-G]+)\/4/g, `$1//`);

  return filteredAbc;
}

///////////////////////////////////
// VALIDATION FUNCTIONS
//////////////////////////////////

// Check if ABC contains at least one valid X: header
// Check if ABC contains at least one valid "chord"

function validateAbcChordsContent(abcContent) {

  const matchAbc = abcContent.match(/^X:/m);
  const matchAbcChord = abcContent.match(/"[a-zA-Z0-9#♯♭♮×/()+]+?"/m);

  return matchAbc && matchAbcChord;
}

// Parse Chordbook safely:
// Return valid Chords Array parsed from Chordbook
// Return false if the JSON passed is invalid
// Return false if parsing triggers an error

function getValidChordsArray(chordBookJson) {

  try {

    const chordsArrOutput = JSON.parse(chordBookJson);

    if (Object.keys(chordsArrOutput[0]).join(', ') === "setTitle, tuneChords" ||
        Object.keys(chordsArrOutput[0]).join(', ') === "title, meter, chords") {

      return chordsArrOutput;

    } else {

      return false;
    }

  } catch (error) {

    console.warn(error);

    return false;
  }
}

///////////////////////////////////
// UTILITY FUNCTIONS
//////////////////////////////////

// Check if localStorage is available and writable

function isLocalStorageOk() {

  return storageAvailable('localStorage');
}

// Hide an element via attribute hidden and set aria-hidden to true

function ariaHideMe(el) {

  if (el.hasAttribute("inert")) return;

  el.setAttribute("hidden", "");
  el.setAttribute("aria-hidden", "true");
}

// Remove attribute hidden from an element and set aria-hidden to false

function ariaShowMe(el) {

  if (el.hasAttribute("inert")) return;
    
  el.removeAttribute("hidden");
  el.removeAttribute("aria-hidden");
}

// Toggle between color themes (default options: light & dark)
// Store theme preference for this Viewer in localStorage
// Hide the element that triggered theme change

function toggleColorTheme(themeId, triggerBtn) {

  const chordViewerThemeBtns =

    chordViewerDialog.querySelectorAll('[data-cvw-action="toggle-theme"]');

  chordViewerDialog.className = themeId;

  chordViewerThemeBtns.forEach(themeBtn => {

    if (themeBtn.classList.contains(`btn-${themeId}`)) {

      if (isLocalStorageOk()) {

        localStorage.chordViewerPrefersColorTheme = themeId;
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

function getFirstCurrentlyDisplayedElem(nodeList) {

  let foundEl = null;

  for (let i = 0; i < nodeList.length; i++) {

    if(!!nodeList[i].offsetParent) {

      foundEl = nodeList[i];
      break;
    }
  }

  return foundEl;
}

///////////////////////////////////
// PLACEHOLDER FUNCTIONS
//////////////////////////////////

// Use these functions as placeholders in place of imports

// Show notification with the status of the latest action

// function displayNotification(msgText, msgType) {

//   if (msgType === "warning") {

//     console.warn(msgText);
//   }

//   if (msgType === "error") {

//     console.error(msgText);
//   }

//   if (!msgType || msgType === "success") {

//     console.log(msgText);
//   } 
// }

// Show a warning outline around the target button

// function displayWarningEffect(focusBtn, fallBackBtn) {

//   let targetBtn = 
//     focusBtn && !!focusBtn.offsetParent? focusBtn :
//     fallBackBtn? fallBackBtn : null;

//   if (!targetBtn) return;

//   targetBtn.style.outline = "0.17rem solid red";

//   setTimeout(() => {

//     targetBtn.style.removeProperty('outline');
//   }, 2500);
// }

// Get last URL containing LZ-encoded ABC that was loaded to ABC Tools
// Copy as export to module containing ABC Tools Export Website scripts
// Replace lastURL with custom logic if used independently

// export function getLastTunebookUrl() {

//   return lastURL;
// }