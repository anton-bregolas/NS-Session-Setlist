////////////////////////////////////////////////////////////////////////
// Novi Sad Session Chord Viewer Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2024-2025
////////////////////////////////////////////////////////////////////////

// Import lz-string compression algorithm (for dynamic chord generation)

import { LZString } from "./scripts-3p/lz-string/lz-string.min.js";

// Import functions handling warning messages (for user notifications)

// import { displayWarningEffect, displayWarningMessage } from "./scripts-ns-sessions";

// Define required app elements

const launchButton = document.querySelector('#fullScreenButton');
const tuneSelector = document.querySelector('#tuneSelector');

// Define Chord Viewer Popover elements

const chordViewerPopover = document.querySelector('[data-popover="chord-viewer"]');
const chordViewerTitle = document.querySelector('[data-popover="title"]');
const chordViewerChords = document.querySelector('[data-chords="container"]');
const chordViewerSlider = document.querySelector('[data-controls="slider"]');
const chordViewerThemeBtns = document.querySelectorAll('[data-controls="theme-btn"]');

// Define initial Chord Popover slider settings

const vInitVal = 120 // Global initial value for vertical slider
const lineWInit = 40 // Global initial value for chords line width
const maxWInit = 80 // Global initial value for chords line max width

// Define ranges for chords line width and max line width

const lineWMin = 20; // Minimum line width of chords, rem
const lineWMax = 50; // Maximum line width of chords, rem
const maxWLows = 50; // Lowest max-width value for chords, rem
const maxWTops = 90; // Highest max-width value for chords, rem

///////////////////////////////////
// CHORD VIEWER LAUNCH FUNCTIONS
//////////////////////////////////

// Open Chord Viewer:
// Extract Chords from ABC if dynamic chord generation is on
// Load Chordbook chords into the Chord Viewer Popover
// Show Chord Viewer Popover using Popover API
// Initiate Chord Viewer Slider settings

export function openChordViewer(setChords, tuneChords) {
  
  const isDynamicChordsMode = localStorage?.chordViewerAllowDynamicChords;

  if (!setChords && !tuneChords && !isDynamicChordsMode) return;

  if (isDynamicChordsMode) {

    const abcUrl = tuneSelector.value;
    const abcInLzw = abcUrl.match(/(?<=lzw=)(?:[^&]*)/)[0];

    if (!abcUrl || !abcInLzw) {

      //displayWarningEffect(launchButton);
      return;
    }

    const abcContent = LZString.decompressFromEncodedURIComponent(abcInLzw);
    const extractedChordsArr = extractChordsFromAbc(abcContent);

    if (extractedChordsArr === null) {

      //displayWarningEffect(launchButton);
      return;
    }

    if (extractedChordsArr.length < 1) {

      //displayWarningEffect(launchButton);
      return;
    }

    // console.log(`Chord Viewer Module:\n\nChords successfully extracted from ABC`);

    const isAbcSet = extractedChordsArr[0].setTitle? true : false;

    setChords = isAbcSet? extractedChordsArr : [];
    tuneChords = isAbcSet? [] : extractedChordsArr;
  }

  const currentAbcTitle = tuneSelector.options[tuneSelector.selectedIndex].text;

  const setMatch = setChords.find(set => set.setTitle === currentAbcTitle);
  const tuneMatch = tuneChords.find(tune => tune.title === currentAbcTitle);

  if (!setMatch && !tuneMatch) {

    //displayWarningEffect(launchButton);
    return;
  }
  
  if (setMatch) {

    chordViewerTitle.textContent = setMatch.setTitle;
    loadChordsToPopover(setMatch.tuneChords, "chords-set");

  } else if (tuneMatch) {

    chordViewerTitle.textContent = tuneMatch.title;
    loadChordsToPopover([tuneMatch], "chords-tune");
  }

  chordViewerPopover.showPopover();
  initPopoverSlider();
}

///////////////////////////////////
// CHORD VIEWER INIT FUNCTIONS
//////////////////////////////////

// Initialize Chord Viewer Popover

export function initChordViewer() {

  if (!chordViewerPopover) return;

  chordViewerPopover.addEventListener('click', handleChordViewerClick);
}

// Handle clicks on interactable Chord Viewer elements

function handleChordViewerClick(event) {

  const actionTrigger = event.target.closest('[data-action]');

  if (!actionTrigger) return;

  const elAction = actionTrigger.dataset.action;

  if (elAction === 'reset-slider') {

    chordViewerPopover.style.cssText = ''

    localStorage.removeItem('chordViewerSliderFontSizeValue');
    localStorage.removeItem('chordViewerSliderLineWidthValue');
    localStorage.removeItem('chordViewerSliderMaxWidthValue');

    initPopoverSlider();
  
    return;
  }

  if (elAction === 'toggle-slider') {

    if (chordViewerSlider.hasAttribute("hidden")) {

      ariaShowMe(chordViewerSlider);

    } else {

      ariaHideMe(chordViewerSlider);
    }
  }

  if (elAction === 'toggle-theme') {

    chordViewerPopover.className = actionTrigger.dataset.theme;

    chordViewerThemeBtns.forEach(themeBtn => {

      if (themeBtn.classList.contains(`btn-${actionTrigger.dataset.theme}`)) {

        ariaShowMe(themeBtn);
        themeBtn.focus();
      }
    });

    ariaHideMe(actionTrigger);
  }

  if (elAction === 'close-chord-viewer') {

    chordViewerPopover.hidePopover();
    return;
  }
}

// Initialize Chord Viewer slider using values from localStorage or default values

function initPopoverSlider() {

  if (!localStorage.chordViewerSliderFontSizeValue) {

    localStorage.chordViewerSliderFontSizeValue = vInitVal;
  }

  if (!localStorage.chordViewerSliderLineWidthValue) {

    localStorage.chordViewerSliderLineWidthValue = lineWInit;
  }

  if (!localStorage.chordViewerSliderMaxWidthValue) {

    localStorage.chordViewerSliderMaxWidthValue = maxWInit;
  }

  const valueV = localStorage.chordViewerSliderFontSizeValue;
  const lineWidth = localStorage.chordViewerSliderLineWidthValue;
  const maxWidth = localStorage.chordViewerSliderMaxWidthValue;

  chordViewerSlider.value = valueV;

  chordViewerPopover.style.setProperty("--chords-font-size", `${valueV}%`);
  chordViewerPopover.style.setProperty("--chords-line-height", `${valueV}%`);
  chordViewerPopover.style.setProperty("--chords-max-width", `${maxWidth}%`);
  chordViewerPopover.style.setProperty("--chords-line-width", `${lineWidth}rem`); // rem!

  chordViewerSlider.addEventListener('input', appChordSliderHandler);
  chordViewerSlider.addEventListener('change', appChordSliderHandler);
}

///////////////////////////////////
// CHORD DISPLAY FUNCTIONS
//////////////////////////////////

// Create responsive grid layout with chords data inside Chords Popover

function loadChordsToPopover(chordsMatch, chordsType) {

  chordViewerChords.textContent = '';

  chordsMatch.forEach(tune => {
      
  if (!tune.chords) return;
    
  const tuneBlock = document.createElement('div');
  tuneBlock.dataset.chords = "tuneitem";

  if (chordsType === "chords-set") {
  
    const titleBlock = document.createElement('div');
    titleBlock.dataset.chords = "subtitle";
    titleBlock.textContent = tune.title;
    tuneBlock.appendChild(titleBlock);
  }
  
  const tunePartsArr = tune.chords.split('\n\n');

  tunePartsArr.forEach(tunePart => {

    if (!tunePart.trim()) return;

    const partNoText = tunePart.match(/PART[\s]*[\d]*:/)[0];

    const partNoBlock = document.createElement('div');
    partNoBlock.dataset.chords = "partno";
    partNoBlock.textContent = partNoText;
    
    const tunePartBlock = document.createElement('div');
    tunePartBlock.dataset.chords = "body";
    tunePartBlock.appendChild(partNoBlock);
    
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

// Handle Chord Popover Slider events

function appChordSliderHandler(event) {

  // Slider defaults for calculations

  const vMin = +chordViewerSlider.min;
  const vMax = +chordViewerSlider.max;

  if (event.type === 'input') {

  let valueV = chordViewerSlider.value;

    if (this === chordViewerSlider) {

      const maxLineWAddend = 
        valueV > vInitVal? Math.round((valueV - vInitVal) * ((maxWTops - maxWInit) / (vMax - vInitVal))) : 
                           Math.round((valueV - vInitVal) * ((maxWInit - maxWLows) / (vInitVal - vMin)));

      const lineWAddend = 
        valueV > vInitVal? Math.round((valueV - vInitVal) * ((lineWMax - lineWInit) / (vMax - vInitVal))) :
                           Math.round((valueV - vInitVal) * ((lineWInit - lineWMin) / (vInitVal - vMin)));

      localStorage.chordViewerSliderFontSizeValue = valueV;
      localStorage.chordViewerSliderMaxWidthValue = maxWInit + maxLineWAddend;
      localStorage.chordViewerSliderLineWidthValue = lineWInit + lineWAddend;

      chordViewerPopover.style.setProperty("--chords-font-size", `${valueV}%`);
      chordViewerPopover.style.setProperty("--chords-line-height", `${valueV}%`);
      chordViewerPopover.style.setProperty("--chords-max-width", `${maxWInit + maxLineWAddend}%`);
      chordViewerPopover.style.setProperty("--chords-line-width", `${lineWInit + lineWAddend}rem`);
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
    let abcBody = '';

    // Generate Sets Chordbook if ABC has more than two T: fields (including Set Title)

    if (abc.match(/^T:/gm).length > 2) {

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

        const tuneChordObj = getChordsFromTune(abcBody, abcTitle, abcMeter);

        abcChordsObj.tuneChords.push(tuneChordObj);
      });
    
    // Generate Tunes Chordbook if ABC has two T: fields or less

    } else {

      abcTitle = abc.match(/(?<=^T:).*/m)[0].trim();
      abcMeter = abc.match(/(?<=^M:).*/m)[0].trim();
      abcBody = normalizeAbc(abc);

      abcChordsObj = getChordsFromTune(abcBody, abcTitle, abcMeter);
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

function getChordsFromTune(abcBody, abcTitle, abcMeter) {

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

  abcPartsArr.forEach(abcPart => {

    partCounter++;
    barCounter = 0;

    const abcBarsArr = abcPart.split('|');

    let abcPartChords = '';

    abcBarsArr.forEach(abcBar => {

      if (!abcBar.match(/".+"/)) {

        return;
      }

      let voltaNo = '';

      if (abcBar.match(/^[\d]/)) {

        voltaNo = +abcBar[0] > 1? `\n|${abcBar[0]}` : abcBar[0];
      }

      if (barCounter >= 4 && !voltaNo) {

        abcPartChords += `|\n`;

        barCounter = 0;
      }
      const abcBarChordsArr = abcBar.match(/".*?"/g);
      
      abcPartChords += `|${voltaNo}\t${getCompleteAbcChordBar(abcBar, abcBarChordsArr, minTuneBeats, abcMeter)}`;

      barCounter++;
    });

    abcChords += abcPartChords? `\n\nPART ${partCounter}:\n${abcPartChords}||` : '';
  });

  abcChordsObj.chords = abcChords.trim();
  
  return abcChordsObj;
}

// Process an ABC bar of chords, completing missing chord-beats if necessary

function getCompleteAbcChordBar(abcBar, abcBarChordsArr, minTuneBeats, abcMeter) {

  let abcBarChordsInput = abcBarChordsArr.map(c => c.replaceAll(/[^a-zA-Z0-9#♯♭♮×/()+]/g, '')).filter(Boolean);

  if (abcBarChordsArr && abcBarChordsInput.length > 0) {

    // Handle cases of single chord per bar, ignore bars where the first chord-beat is missing
    if (abcBarChordsInput.length === 1 && abcBar.match(/^:*\d*[\s]*["]/)) {

      if (abcBarChordsInput[0].match(/\(.*\)/)) {

        return `${abcBarChordsInput[0].replaceAll(/\(.*?\)/g, '')}\t${(abcBarChordsInput[0].match(/\(.*\)/)[0] + '\t').repeat(minTuneBeats - 1)}`;
      }

      return `${abcBarChordsInput[0]}\t${(abcBarChordsInput[0] + '\t').repeat(minTuneBeats - 1)}`;
    }

    // Handle cases of fully-stacked chords per bar (3 chords for triple-time tunes, 2 or 4 chords for duple-time tunes)
    if (abcBarChordsInput.length === minTuneBeats || abcBarChordsInput.length === minTuneBeats * 2) {

      if (isTuneTripleMeter(abcMeter)) {

        return `${abcBarChordsInput.join('\t')}\t`;
      }

      if (abcBarChordsInput.length === minTuneBeats) {

        return `${abcBarChordsInput[0]}\t${abcBarChordsInput[1]}\t`;
      }
      
      return `${abcBarChordsInput[0]}\xa0${abcBarChordsInput[1]}\t${abcBarChordsInput[2]}\xa0${abcBarChordsInput[3]}\t`;
    }

    // Handle cases of incomplete chord-beats per bar (2 out of 3 chords for triple-time tunes, missing first chord-beat for duple-time tunes)
    if (abcBarChordsInput.length < minTuneBeats) {

      return countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats, abcMeter);
    }

    // Handle cases of incomplete chord-beats per bar (3 out of 4 chords and/or missing first chord-beat for duple-/quadruple-time tunes)
    if (minTuneBeats < abcBarChordsInput.length < minTuneBeats * 2) {

      return countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats * 2, abcMeter);
    }

  } else {

    return '–\t';
  }
}

// Recover missing chord-beats by counting notes against beats and inserting the sufficient number of chords

function countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats, abcMeter) {

  let completeChordBar = '';

  const splitMeterArr = abcMeter.split('/');
  // Count the number of eighth notes per beat of tune
  const eightsPerBeat =  8 / splitMeterArr[1] * splitMeterArr[0] / minTuneBeats;
  // Filter the notes of the tune from chords, ABC notation symbols and spaces
  const notesBetweenChords = abcBar.split(/"[^"]*"/).map(fr => fr.replaceAll(/[^a-gxzA-G0-9/]/g, '')).filter(fr => fr.match(/^[a-gxzA-G]/));

  let beatCount = 0;

  let isMissingFirstBeat = abcBar.match(/^:*\d*[\s]*["]/)? 0 : 1;

  // Add indicator of missing first beat if no opening chord found
  if (isMissingFirstBeat) {

    completeChordBar += `–${minTuneBeats > 3? '\xa0' : `\t`}`;
    beatCount++;
  }

  // Iterate between groups of notes preceded by chords in source ABC
  // Separate notes, note multipliers (numbers not preceded by /) and note divisors (/, //... or /Num)
  // Calculate the total worth of eighth notes and count the beats for each group
  // Insert a chord of the same index as the group at the start of each beat
  if (notesBetweenChords.length > 0) {

    notesBetweenChords.forEach(abcFragment => {

      const countNotes = abcFragment.match(/[a-gxzA-G]/g).length;
      const countExtraMultiplierSum = abcFragment.match(/[^/]\d+/)? abcFragment.match(/[^/]\d+/g)?.map(match => match.slice(1)).map(num => num - 1).reduce((a, b) => a + b) : 0;
      const extraDivisorArr = abcFragment.includes('/')? abcFragment.match(/[/]+\d*/g) : [];
      const countSimpleDivisorSum = extraDivisorArr.length > 0 && extraDivisorArr.some(str => /[/](?=[^\d]|$)/.test(str))? extraDivisorArr.filter(str => str.match(/[/](?=[^\d]|$)/)).reduce((a, b) => a + (1 - (1 / Math.pow(2, b.length))), 0) : 0;
      const countAllExtraDivisorSum = extraDivisorArr.length > 0 && extraDivisorArr.some(str => /\d/.test(str))? extraDivisorArr.map(str => str.replaceAll(/[^\d]/g, '')).reduce((a, b) => a + (1 - (1 / b)), 0) + countSimpleDivisorSum : countSimpleDivisorSum;
      const countEights = countNotes + countExtraMultiplierSum - countAllExtraDivisorSum;
      const relatedChord = abcBarChordsInput[notesBetweenChords.indexOf(abcFragment)];
      
      let beatsInThisFragment = countEights / eightsPerBeat;

      // Handle chords placed with syncopation
      if (beatsInThisFragment % 1 !== 0) {

        beatsInThisFragment = beatsInThisFragment < 1? 1 : Math.floor(beatsInThisFragment);
      }

      // Add chords related to ABC fragment to completeChordBar string
      for (let n = 0; n < beatsInThisFragment; n++) {
        
        completeChordBar += relatedChord? `${relatedChord}${isTuneTripleMeter(abcMeter) || beatCount % 2 !== 0? '\t' : '\xa0'}` : '';
        beatCount++;
      }
    });
    
    return completeChordBar;

  // If no notes found between chords (empty bar, no beats to count), return the chords plus '*' indicator

  } else {

    if (isTuneTripleMeter(abcMeter)) {

      return `${abcBarChordsInput.join('\t')}*\t`;
    }
    
    return `${abcBarChordsInput[0]}\xa0${abcBarChordsInput[1]}\t${abcBarChordsInput[2]}\xa0*\t`;
  }
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

  let abcOutput = removeAbcHeadersAndCommands(abcContent);
  abcOutput = convertAbcIntervalsToSingleNotes(abcOutput);
  abcOutput = normalizeAbcTriplets(abcOutput);
  abcOutput = normalizeAbcChordOrder(abcOutput);

  return abcOutput;
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

// Replace all ABC intervals / inline chords with a single highest note of the interval / chord

function convertAbcIntervalsToSingleNotes(abcContent) {

  let filteredAbc = abcContent.replaceAll(/\[([=_^.~]*[a-gA-G]+[,']*[0-9]*)*?\]/g, `$1`);

  return filteredAbc;
}

// Replace ABC triplets and quadruplets in (3ABC format with A/B/c and A/B/cd

function normalizeAbcTriplets(abcContent) {

  let filteredAbc = abcContent.replaceAll(/\([34](\w)(\w)(\w)/g, `$1/$2/$3`);

  return filteredAbc;
}

// Fix instances of ABC chords breaking up elements such as triplets

function normalizeAbcChordOrder(abcContent) {

  let filteredAbc = abcContent.replaceAll(/(\([34])(".*?")/g, `$2$1`);

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

// Hide an element via attribute hidden and set aria-hidden to true

function ariaHideMe(el) {

  el.setAttribute("hidden", "");
  el.setAttribute("aria-hidden", "true");
}

// Remove attribute hidden from an element and set aria-hidden to false

function ariaShowMe(el) {

  if (!el.hasAttribute("inert")) {
    
      el.removeAttribute("hidden");
      el.removeAttribute("aria-hidden");
  }
}