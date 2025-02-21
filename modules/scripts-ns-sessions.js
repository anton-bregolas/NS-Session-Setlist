import { initAbcTools, initToolsOptions, resizeIframe, tuneSelector, loadTuneBookItem, restoreLastTunebookItem,
         populateTuneSelector, populateFilterOptions, sortFilterOptions } from './scripts-abc-tools.js';
import { parseAbcFromFile, initEncoderSettings, abcEncoderDefaults } from './scripts-abc-encoder.js';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NS Session Setlist Custom App Scripts
//
// Session DB and/or Code Contributors:
// Anton Zille https://github.com/anton-bregolas/ - Code, ABC
// Mars Agliullin - ABC
// Tania Sycheva - ABC
//
// App Version 0.7.3 / NS Session DB date: 2025-02-19
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define Global Variables

let tuneBookSetting = 1; // Tunebook loads Setlist by default
let tuneBookInitialized = false; // Opening Tunebook will initialise ABC Tools and fetch Session DB data by default

// Define Session DB items

export const tuneSets = [];
export const tuneList = [];
export let setChords = [];
export let tuneChords = [];
export const tuneSetsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/sets.json"
export const tuneListLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/tunes.json"
export const setChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-chords/chords-sets.json";
export const tuneChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-chords/chords-tunes.json";

// Define Main Page elements

const allCustomBtn = document.querySelectorAll('.nss-btn');
const allSwitchBtn = document.querySelectorAll('.nss-switch-btn');
const allLaunchEls = document.querySelectorAll('.nss-launch-el');
const allCheckBoxes = document.querySelectorAll('.nss-checkbox-btn');
const allTuneBookEls = document.querySelectorAll('.nss-tunebook-el');
const allPlayAlongEls = document.querySelectorAll('.nss-playalong-el');
const tuneSelectorTitle = document.querySelector('#tuneSelectorTitle');
export const filterOptions = document.querySelector('#filterOptions');
const tuneBookTitle = document.querySelector('#title');

// Define App Menu elements

const appOptionsPopover = document.querySelector('#nss-popover-options');
const fullScreenPopover = document.querySelector('#nss-fullscreen-popover');
const fullScreenPopoverTitle = document.querySelector('.nss-fs-popover-title');
const fullScreenPopoverBody = document.querySelector('.nss-fs-popover-body');
//const fullScreenViewTunesRadioBtn = document.querySelector('#nss-radio-view-tunes');
//const fullScreenViewChordsRadioBtn = document.querySelector ('#nss-radio-view-chords');

////////////////////////////////
// APP LAUNCHERS
///////////////////////////////

// Load Setlist or Tunelist interface, initiate ABC Tools

async function launchTuneBook(dataType) {

  tuneBookSetting = dataType === "setlist"? 1 : 2;

  if (await tuneDataFetch() > 0) {
    
    hideLaunchers();
    updateTuneBookTitles(dataType);
    resizeTuneBookHeader(dataType);
    swapSwitchBtns(dataType);

    allTuneBookEls.forEach(tuneBookEl => {

      tuneBookEl.removeAttribute("hidden");
    });

    if (tuneBookInitialized === false) {

      initAbcTools();
      
      console.log(`NS Session App:\n\nABC Tools initialized`);

      tuneBookInitialized = true;

      if (window.localStorage) {

        localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
      }

      return;

    } else if (+localStorage?.tuneBookLastOpened_NSSSAPP !== tuneBookSetting) {

      refreshTuneBook();
    
    } else {

      console.log(`NS Session App:\n\nTunebook has been reopened`);
    }
  }
}

// Load Play Along section interface

function launchPlayAlong(dataType) {

  hideLaunchers();
  updateTuneBookTitles(dataType);
  resizeTuneBookHeader(dataType);

  allPlayAlongEls.forEach(playalongEl => {

    playalongEl.removeAttribute("hidden");
  });
}

////////////////////////////////
// SWITCHERS
///////////////////////////////

// Switch between sections or repopulate ABC tools with new data, swap elements

function switchTuneBookType(dataType) {

  updateTuneBookTitles(dataType);

  // Switch between Setlist and Tunelist interface

  if (dataType === "setlist" || dataType === "tunelist") {

    tuneBookSetting = dataType === "setlist"? 1 : 2;

    swapSwitchBtns(dataType);

    refreshTuneBook();

    return;
  }

  // Save last opened Tunebook section

  if (window.localStorage) {

    localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
  }

  // Switch to Launch Screen by default

  resizeTuneBookHeader(dataType);
  hideAllSectionsEls();
  showLaunchers();
}

// Hide Launch Screen elements

function hideLaunchers() {

  allLaunchEls.forEach(launchEl => {

    launchEl.setAttribute("hidden", "");
  });
}

// Show Launch Screen elements

function showLaunchers() {

  allLaunchEls.forEach(launchEl => {

    launchEl.removeAttribute("hidden");
  });
}

// Show or hide switch buttons depending on target data type

function swapSwitchBtns(dataType) {

  allSwitchBtn.forEach(switchBtn => {

    if (switchBtn.dataset.load !== dataType) {

      switchBtn.removeAttribute("hidden");

    } else {
      
      switchBtn.setAttribute("hidden", "");
    }
  });
}

// Hide screen elements in all sections except for Launcher

function hideAllSectionsEls() {

  allTuneBookEls.forEach(tuneBookEl => {

    tuneBookEl.setAttribute("hidden", "");
  });

  allPlayAlongEls.forEach(playAlongEl => {

    playAlongEl.setAttribute("hidden", "");
  });
}

////////////////////////////////
// POPOVER OPTIONS TRIGGERS
///////////////////////////////

// Launch a Popover Options menu depending on dataType

export function openSettingsMenu(dataType) {

  if (dataType === "app-options") {

    console.log(`NS Session App Options:

abcToolsSaveAndRestoreTunes: ${localStorage.abcToolsSaveAndRestoreTunes}
abcToolsAllowInstrumentChanges: ${localStorage.abcToolsSaveAndRestoreTunes}
abcToolsAllowTabStyleChanges: ${localStorage.abcToolsAllowTabStyleChanges}`);

    appOptionsPopover.showPopover();
  }

  if (dataType === "encoder-options") {

    console.log(`ABC Encoder Settings:

abcEncoderExportsTuneList: ${localStorage.abcEncoderExportsTuneList}
abcEncoderSortsTuneBook: ${localStorage.abcEncoderSortsTuneBook}
abcSortExportsChordsFromTunes: ${localStorage.abcSortExportsChordsFromTunes}
abcSortExportsTunesFromSets: ${localStorage.abcSortExportsTunesFromSets}
abcSortRemovesLineBreaksInAbc: ${localStorage.abcSortRemovesLineBreaksInAbc}
abcSortRemovesTextAfterLineBreaksInAbc: ${localStorage.abcSortRemovesTextAfterLineBreaksInAbc}`);

    for (const setting in abcEncoderDefaults) {

      if (localStorage[setting] !== abcEncoderDefaults[setting]) {

        console.log(`ABC Encoder:\n\n` + `${setting} has been modified\n\n[current: ${localStorage[setting]}, default: ${abcEncoderDefaults[setting]}]`);
      };
    };

    appOptionsPopover.showPopover();
  }

  if (dataType === "fullscreen-popover") {

    // setChords = [
    //   {
    //     "setTitle": "WALTZES: Munster Cloak Set",
    //     "tuneChords": [
    //       {
    //         "title": "Flatwater Fran (Gmaj)",
    //         "chords": "PART 1:\n|\tG\tG\tG\t|\tG\tG\tG\t|\tC\tC\tC\t|\tG\tG\tG\t|\n|\tG\tG\tG\t|\tAm\tAm\tAm\t|\tEm\tEm\tEm\t|\tC\tC\tC\t|\n|\tG\tG\tG\t|\tG\tG\tG\t|\tC\tC\tC\t|\tG\tG\tG\t|\n|\tAm\tAm\tAm\t|\tEm\tEm\tEm\t|\tC\tC\tD7\t|1\tG\tG\tG\t|\n|2\tG\tG\tG\t||\n\nPART 2:\n|\tC\tC\tC\t|\tG\tG\tG\t|\tC\tC\tC\t|\tG\tG\tG\t|\n|\tC\tC\tC\t|\tEm\tEm\tEm\t|\tAm\tAm\tAm\t|\tD\tD\tD\t|\n|\tC\tC\tC\t|\tG\tG\tG\t|\tD7\tD7\tD7\t|\tEm\tEm\tEm\t|\n|\tAm\tAm\tAm\t|\tEm\tEm\tEm\t|\tC\tC\tD7\t|1\tG\tG\tG\t|\n|2\tG\tG\tG\t||"
    //       },
    //       {
    //         "title": "Flatwater Fran (Amaj)",
    //         "chords": "PART 1:\n|\tA\tA\tA\t|\tA\tA\tA\t|\tD\tD\tD\t|\tA\tA\tA\t|\n|\tA\tA\tA\t|\tBm\tBm\tBm\t|\tF#m\tF#m\tF#m\t|\tD\tD\tD\t|\n|\tA\tA\tA\t|\tA\tA\tA\t|\tD\tD\tD\t|\tA\tA\tA\t|\n|\tBm\tBm\tBm\t|\tF#m\tF#m\tF#m\t|\tD\tD\tE7\t|1\tA\tA\tA\t|\n|2\tA\tA\tA\t||\n\nPART 2:\n|\tD\tD\tD\t|\tA\tA\tA\t|\tD\tD\tD\t|\tA\tA\tA\t|\n|\tD\tD\tD\t|\tF#m\tF#m\tF#m\t|\tBm\tBm\tBm\t|\tE\tE\tE\t|\n|\tD\tD\tD\t|\tA\tA\tA\t|\tE7\tE7\tE7\t|\tF#m\tF#m\tF#m\t|\n|\tBm\tBm\tBm\t|\tF#m\tF#m\tF#m\t|\tD\tD\tE7\t|1\tA\tA\tA\t|\n|2\tA\tA\tA\t||"
    //       }
    //     ]
    //   }
    // ]

    // tuneChords = [
    //   {
    //     "title": "WALTZ: Flatwater Fran (Amaj)",
    //     "chords": "PART 1:\n|\tA\tA\tA\t|\tA\tA\tA\t|\tD\tD\tD\t|\tA\tA\tA\t|\n|\tA\tA\tA\t|\tBm\tBm\tBm\t|\tF#m\tF#m\tF#m\t|\tD\tD\tD\t|\n|\tA\tA\tA\t|\tA\tA\tA\t|\tD\tD\tD\t|\tA\tA\tA\t|\n|\tBm\tBm\tBm\t|\tF#m\tF#m\tF#m\t|\tD\tD\tE7\t|1\tA\tA\tA\t|\n|2\tA\tA\tA\t||\n\nPART 2:\n|\tD\tD\tD\t|\tA\tA\tA\t|\tD\tD\tD\t|\tA\tA\tA\t|\n|\tD\tD\tD\t|\tF#m\tF#m\tF#m\t|\tBm\tBm\tBm\t|\tE\tE\tE\t|\n|\tD\tD\tD\t|\tA\tA\tA\t|\tE7\tE7\tE7\t|\tF#m\tF#m\tF#m\t|\n|\tBm\tBm\tBm\t|\tF#m\tF#m\tF#m\t|\tD\tE7\t|1\tA\tA\tA\t|\n|2\tA\tA\tA\t||"
    //   }
    // ]
  
    const currentAbcTitle = tuneSelector.options[tuneSelector.selectedIndex].text;

    const setMatch = setChords.find(set => set.setTitle === currentAbcTitle);
    const tuneMatch = tuneChords.find(tune => tune.title === currentAbcTitle);

    if (!setMatch && !tuneMatch) {

      return;
    }
    
    if (setMatch) {

      let setChordsOutput = '';

      setMatch.tuneChords.forEach(tune => {

        setChordsOutput += `${tune.title}\n\n`;
        setChordsOutput += `${tune.chords? tune.chords : '–'}\n\n`;
      });

      fullScreenPopoverTitle.textContent = setMatch.setTitle;
      fullScreenPopoverBody.textContent = setChordsOutput;

    } else if (tuneMatch) {

      fullScreenPopoverTitle.textContent = tuneMatch.title;
      fullScreenPopoverBody.textContent = tuneMatch.chords;
    }

    fullScreenPopover.showPopover();
  }
}

////////////////////////////////
// CHECKERS & UPDATERS
///////////////////////////////

// Return up-to-date tuneBookSetting value (for use in external modules)

export function checkTuneBookSetting() {

  return tuneBookSetting;
}

// Reset Tunebook dropdown menus without reinitializing ABC Tools

export function refreshTuneBook() {

  const currentTuneBook = checkTuneBookSetting() === 1? tuneSets : tuneList;

  resetTuneBookMenus();
  resetTuneBookFilters();

  populateTuneSelector(currentTuneBook);
  populateFilterOptions(sortFilterOptions(currentTuneBook));

  console.log(`NS Session App:\n\nTunebook has been refreshed`);

  if (+localStorage?.abcToolsSaveAndRestoreTunes === 1
      && ((currentTuneBook === tuneSets && localStorage?.lastTuneBookSet_NSSSAPP)
      || (currentTuneBook === tuneList && localStorage?.lastTuneBookTune_NSSSAPP))) {

    restoreLastTunebookItem();
    return;
  }
  
  loadTuneBookItem(currentTuneBook, 0);
}

// Clear the contents of custom Tunebook dropdown menus, reset to default options

export function resetTuneBookMenus() {

  if (window.localStorage) {

    localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
  }
  
  tuneSelector.options.length = 1;
  tuneSelector.options[0].selected = "selected";
  
  filterOptions.options.length = 2;
  filterOptions.options[0].selected = "selected";
  filterOptions.value = "-1";
}

// Clear the effects of all custom Tunebook filter options

function resetTuneBookFilters() {

  tuneSelector.querySelectorAll('option').forEach(tuneOption => {
          
    tuneOption.removeAttribute("hidden");
  });
}

// Update text content on page depending on data type shown

function updateTuneBookTitles(dataType) {

  tuneBookTitle.textContent =
  dataType === "setlist"? "Novi Sad Session Setlist" : 
  dataType === "tunelist"? "Novi Sad Session Tunelist" : "";

  if (dataType === "setlist" || dataType === "tunelist") {

    tuneSelectorTitle.textContent = 
    dataType === "tunelist"? "\u{1F3B5} Select a TUNE" :
    "\u{1F3BC} Select a SET";
  }

  tuneBookTitle.dataset.title = dataType;
}

// Change Tunebook header style depending on section shown

function resizeTuneBookHeader(dataType) {

  if (dataType === "setlist" || dataType === "tunelist") {

    tuneBookTitle.setAttribute("style", "font-size: 1.8rem; margin-top: 1rem;")
    
    return;
  }

  tuneBookTitle.removeAttribute("style");
}

////////////////////////////////
// FETCHERS & DATA HANDLERS
///////////////////////////////

// Fetch Session DB data

async function tuneDataFetch() {

  if (tuneBookInitialized === false) {

    try {

      const tuneDataSize = await updateDataJsons();

      if (tuneDataSize[0] > 0) {

        console.log(`NS Session App:\n\nSession DB items (${tuneDataSize[0]} sets, ${tuneDataSize[1]} tunes) successfully fetched and pushed to data JSONs`);

        return tuneDataSize[0];
      }

    } catch (error) {

      console.warn(`NS Session App:\n\nLaunching app sequence failed. Details:\n\n${error.message}`);
    }

  } else {

    return 1;
  }
}

// Make a Session DB fetch request then return JSON or text or handle errors

export async function fetchData(url, type) {

  try {

    const response = await fetch(url);

    let data;

    if (!response.ok) {

      throw new Error("Failed to fetch data from Tune DB", { cause: response });
    }

    if (type === "json") {

      // console.log("Fetching data from Session DB...");

      data = await response.json();

    } else if (type === "text") {

      data = await response.text();

    } else {

      throw new Error("Invalid data type passed to Fetch!");
    }

    return data;

  } catch (error) {

    throw new Error(`[${error}\n\nHTTP error code: ${error.cause?.status}]`);
  }
}

// Fetch all Session DB JSONs

export async function fetchDataJsons() {

  return Promise.all([
      fetchData(tuneSetsLink, "json"),
      fetchData(tuneListLink, "json"),
      fetchData(setChordsLink, "json"),
      fetchData(tuneChordsLink, "json")
    ]);
}

// Push new tune data to Custom JSONs after fetching Session DB

export async function updateDataJsons() {

  console.log("NS Session App:\n\nFetching data from Session DB...");

  const [setsData, tunesData, setChordsData, tuneChordsData] =
  await fetchDataJsons();

  updateData(tuneSets, setsData);
  updateData(tuneList, tunesData);
  updateData(setChords, setChordsData);
  updateData(tuneChords, tuneChordsData);

  // sessionSetsCounter.textContent = tuneSets.length;
  // sessionTunesCounter.textContent = tuneList.length;

  return [tuneSets.length, tuneList.length, setChords.length, tuneChords.length];
}

// Update Custom Tune Data JSON

export async function updateData(dataJson, newData) {

  dataJson.length = 0;

  dataJson.push(...newData);

  console.log(`NS Session App:\n\nSession DB updated`);
}

// Clear Session DB JSONs

export function clearData() {

  tuneSets.length = 0;
  tuneList.length = 0;
  setChords.length = 0;
  tuneChords.length = 0;

  console.log("NS Session App:\n\nSession DB data cleared!");
}

////////////////////////////////
// EVENT HANDLERS
////////////////////////////////

// Handle custom button click events

async function appButtonHandler() {

  const parentEl = this.parentElement;

  // Launch Buttons: Run section Launcher depending on data type

  if (this.classList.contains('nss-btn-launch')) {

    if (this.dataset.load === "setlist" || this.dataset.load === "tunelist") {

      launchTuneBook(this.dataset.load);
    }

    if (this.dataset.load === "playalong") {

      launchPlayAlong(this.dataset.load);
    }

    // Handle ABC Encoder buttons

    if (this.dataset.load.startsWith("abc")) {

      parseAbcFromFile(this.dataset.load);
    }
  }

  // Switch Buttons: Load and swap section content depending on data type

  if (this.classList.contains('nss-switch-btn')) {

    if (this.classList.contains('nss-launcher-link')) {

      window.location.href = 'index.html';

      return;
    }

    switchTuneBookType(this.dataset.load);
  }

  // Options Buttons: Load settings dialogue depending on data type

  if (this.classList.contains('nss-option-btn')) {

    if (appOptionsPopover.matches(':popover-open')) {

      appOptionsPopover.hidePopover();
      return;
    }

    openSettingsMenu(this.dataset.load);
  }

  // Close Buttons: Hide parent element and resize ABC Tools

  if (this.classList.contains('footer-btn-x')) {

    parentEl.setAttribute("hidden", "");
    resizeIframe();
    return;
  }

  if (this.classList.contains('popover-btn-x')) {

    appOptionsPopover.hidePopover();
    return;
  }

  if (this.classList.contains('fs-popover-btn-x')) {

    fullScreenPopover.hidePopover();
    return;
  }
}

// Handle custom dropdown menu events

async function appDropDownHandler() { 

  if (this === filterOptions) {

    const tuneOptions = tuneSelector.querySelectorAll('[data-tunetype]');
    const filterId = filterOptions.value;

    if (Math.abs(+filterId) >= 0) {

      if (filterId === "0") {

        resetTuneBookFilters();
        tuneSelector.options[0].selected = "selected";
    
        console.log("NS Session App:\n\nTunebook filters cleared");

        return;
      }

      filterOptions.options[0].selected = "selected";
  
      filterOptions.value = "-1";

      return;
    }

    if (filterId) {

      tuneOptions.forEach(tuneOption => {

        if (filterId !== tuneOption.dataset.tunetype && !tuneOption.dataset.leaders.split(', ').includes(filterId)) {

        //   tuneOption.setAttribute("hidden", "");

        // } else if (tuneOption.hasAttribute("hidden")) {

        //   tuneOption.removeAttribute("hidden");

          tuneOption.setAttribute("disabled", "");

        } else if (tuneOption.hasAttribute("disabled")) {

          tuneOption.removeAttribute("disabled");
          
        }
      });

      tuneSelector.options[0].selected = "selected";

      console.log(`NS Session App:\n\nTunebook filtered by "${filterId}"`);
    }
  }
}

////////////////////////////////
// EVENT LISTENERS & SETTINGS
///////////////////////////////

// Add event listeners to custom app buttons

function initAppButtons() {

  allCustomBtn.forEach(btn => {

    btn.addEventListener('click', appButtonHandler);
  });
}

// Add event listeners to custom dropdown menus

export function initCustomDropDownMenus() {

  filterOptions.addEventListener('change', appDropDownHandler);
}

// Initialize App & Encoder Settings checkboxes on page load

export function initAppCheckboxes() {

  allCheckBoxes.forEach(checkBox => {

    if (+localStorage[checkBox.dataset.option] === 1) {

      checkBox.checked = true;
    
    } else {

      checkBox.checked = false;
    } 

    checkBox.addEventListener('click', () => {

      if (+localStorage[checkBox.dataset.option] > 0) {

        localStorage[checkBox.dataset.option] = 0;
      
      } else {

        localStorage[checkBox.dataset.option] = 1;
      } 
    });
  });
}

// Initialize popover polyfill warning if the browser doesn't support Popover API

function initPopoverWarning() {

  const isPopoverPolyfilled = document.body?.showPopover && !/native code/i.test(document.body.showPopover.toString());

  if (isPopoverPolyfilled) {

    console.log(`NS Session App:\n\nThis browser does not support Popover API. Polyfill has been applied`);
  }
}

// Initialize event listeners and settings on Launch Screen load

document.addEventListener('DOMContentLoaded', () => {

  initPopoverWarning();
  initAppButtons();
  initToolsOptions();
  initEncoderSettings();
  initAppCheckboxes();

  console.log(`NS Session App:\n\nLaunch Screen initialized`);
});