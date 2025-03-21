import { initAbcTools, initTunebookOptions, abcTunebookDefaults, resizeIframe, tuneSelector, loadTuneBookItem, restoreLastTunebookItem,
         populateTuneSelector, populateFilterOptions, sortFilterOptions, resetViewportWidth } from './scripts-abc-tools.js';
import { parseAbcFromFile, initEncoderSettings, abcEncoderDefaults } from './scripts-abc-encoder.js';
import { initChordViewer, openChordViewer } from './scripts-chord-viewer.js'

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Novi Sad Session Setlist Custom App Scripts
// https://github.com/anton-bregolas/
// (c) Anton Zille 2024-2025
//
// Session DB and/or Code Contributors:
// Anton Zille - Code, ABC, Chords
// Mars Agliullin - ABC
// Tania Sycheva - ABC
// Oleg Naumov - Chords
//
// App Version 0.8.2 / NS Session DB date: 2025-03-17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define Global Variables

let tuneBookSetting = 1; // Tunebook loads Setlist by default
let tuneBookInitialized = false; // Opening Tunebook will initialise ABC Tools and fetch Session DB data by default
let isManualTunebookModeOn = false; // Hide switch buttons and use manual selection of Tunebook Type on Launch Screen

// Define Session DB items

export const tuneSets = [];
export const tuneList = [];
export const setChords = [];
export const tuneChords = [];
export const tuneSetsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/sets.json"
export const tuneListLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/tunes.json"
export const setChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-chords/chords-sets.json";
export const tuneChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-chords/chords-tunes.json";

// Define Main Page elements

const allCustomBtn = document.querySelectorAll('.nss-btn');
const allSwitchBtn = document.querySelectorAll('.nss-switch-btn');
const allLaunchEls = document.querySelectorAll('.nss-launch-el');
const allThemeBtn = document.querySelectorAll('.nss-theme-btn');
const allCheckBoxes = document.querySelectorAll('.nss-checkbox-btn');
const allTuneBookEls = document.querySelectorAll('.nss-tunebook-el');
const allPlayAlongEls = document.querySelectorAll('.nss-playalong-el');
const tuneSelectorTitle = document.querySelector('#tuneSelectorTitle');
export const filterOptions = document.querySelector('#filterOptions');
const tuneBookTitle = document.querySelector('#nss-tunebook-title');
const appNavTitle = document.querySelector('#nss-appnav-title');
const appHeader = document.querySelector('#nss-app-header');

// Define App Menu elements

const appOptionsPopover = document.querySelector('#nss-popover-options');
const fullScreenViewTunesRadioBtn = document.querySelector('#nss-radio-view-tunes');
const fullScreenViewChordsRadioBtn = document.querySelector ('#nss-radio-view-chords');

////////////////////////////////
// APP LAUNCHERS
///////////////////////////////

// Load Setlist or Tunelist interface, initiate ABC Tools

async function launchTuneBook(dataType, triggerBtn) {

  tuneBookSetting = dataType === "setlist"? 1 : 2;

  if (await tuneDataFetch() > 0) {
    
    resetViewportWidth(860);
    hideLaunchers();
    initTunebookRadioBtns();
    updateTuneBookTitles(dataType);
    swapSwitchBtns(dataType);

    appHeader.setAttribute("style", "display: none");

    allTuneBookEls.forEach(tuneBookEl => {

      ariaShowMe(tuneBookEl);
    });

    if (!document.querySelector('#nss-tunebook-exit').hasAttribute("hidden")) {

      document.querySelector('#nss-tunebook-exit').focus();

    } else {

      document.querySelector(`#nss-tunebook-${dataType}-switch`).focus();
    }

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

  } else {

    showRedOutlineWarning(triggerBtn);
  }
}

// Load Play Along section interface

function launchPlayAlong(dataType) {

  hideLaunchers();
  updateTuneBookTitles(dataType);

  allPlayAlongEls.forEach(playalongEl => {

    ariaShowMe(playalongEl);
  });

  document.querySelector('#nss-playalong-exit').focus();
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

    document.querySelector(`#nss-tunebook-${dataType}-switch`).focus();

    return;
  }

  // Save last opened Tunebook section

  if (window.localStorage) {

    localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
  }

  // Switch to Launch Screen by default

  resetViewportWidth();
  hideAllSectionsEls();
  showLaunchers();
  appHeader.removeAttribute("style");
  document.querySelector('#nss-launch-setlist').focus();
}

// Hide Launch Screen elements

function hideLaunchers() {

  allLaunchEls.forEach(launchEl => {

    ariaHideMe(launchEl);
  });
}

// Show Launch Screen elements

function showLaunchers() {

  allLaunchEls.forEach(launchEl => {

    ariaShowMe(launchEl);
  });
}

// Show or hide switch buttons depending on target data type

function swapSwitchBtns(dataType) {

  if (isManualTunebookModeOn) return;

  allSwitchBtn.forEach(switchBtn => {

    if (switchBtn.dataset.load === "launcher") return;

    if (switchBtn.dataset.load !== dataType) {

      ariaShowMe(switchBtn);

    } else {
      
      ariaHideMe(switchBtn);
    }
  });
}

// Hide screen elements in all sections except for Launcher

function hideAllSectionsEls() {

  allTuneBookEls.forEach(tuneBookEl => {

    ariaHideMe(tuneBookEl);
  });

  allPlayAlongEls.forEach(playAlongEl => {

    ariaHideMe(playAlongEl);
  });
}

////////////////////////////////
// POPOVER LAUNCHERS
///////////////////////////////

// Launch a Popover Options menu depending on dataType

export function openSettingsMenu(dataType) {

  if (dataType === "app-options") {

    printLocalStorageSettings(abcTunebookDefaults);

    appOptionsPopover.showPopover();
  }

  if (dataType === "encoder-options") {

    printLocalStorageSettings(abcEncoderDefaults);

    appOptionsPopover.showPopover();
  }

  if (dataType === "fullscreen-popover") {
    
    openChordViewer(setChords, tuneChords);
  }
}

////////////////////////////////
// ANIMATIONS & WARNINGS
///////////////////////////////

// Show a red warning outline around an active element

export function showRedOutlineWarning(focusBtn) {

  focusBtn.setAttribute("style", "outline-color: red");

  setTimeout(() => {

    focusBtn.removeAttribute("style");
  }, 5000);
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
  
  if (+localStorage?.abcToolsAllowTuneAutoReload === 1) {

    loadTuneBookItem(currentTuneBook, 0);
  }
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
    tuneOption.removeAttribute("disabled");
  });
}

// Update text content on page depending on data type shown

function updateTuneBookTitles(dataType) {

  if (dataType === "launcher" || dataType === "playalong") {

    appNavTitle.dataset.title = dataType;
    return;
  }

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
// ARIA HIDERS & REVEALERS
////////////////////////////////

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

////////////////////////////////
// EVENT HANDLERS
////////////////////////////////

// Handle custom button click events

async function appButtonHandler() {

  if (this.hasAttribute('data-action')) {

    return;
  }

  const parentEl = this.parentElement;

  // Launch Buttons: Run section Launcher depending on data type

  if (this.classList.contains('nss-btn-launch')) {

    if (this.dataset.load === "setlist" || this.dataset.load === "tunelist") {

      launchTuneBook(this.dataset.load, this);
    }

    if (this.dataset.load === "playalong") {

      launchPlayAlong(this.dataset.load);
    }

    // Handle ABC Encoder buttons

    if (this.dataset.load.startsWith("abc")) {

      parseAbcFromFile(this.dataset.load, this);
    }
  }

  // Switch Buttons: Load and swap section content depending on data type

  if (this.classList.contains('nss-switch-btn')) {

    // Section switchers

    if (this.classList.contains('nss-launcher-link')) {

      window.location.href = 'index.html';

      return;
    }

    // Tunebook switchers

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

  // Control Buttons: Open additional menus and reset settings

  if (this.classList.contains('nss-control-btn')) {

    //
  }

  // Close Buttons: Hide parent element, show alternative navigation, resize ABC Tools

  if (this.classList.contains('footer-btn-x')) {

    const switchContainer = document.querySelector('.nss-switch-container');
    const allSwitchBtns = switchContainer.querySelectorAll('.nss-switch-btn');

    ariaHideMe(parentEl);

    isManualTunebookModeOn = true;

    allSwitchBtns.forEach(switchBtn => {

      if (switchBtn.dataset.load !== "launcher") {

        ariaHideMe(switchBtn);
        return;
      }

      ariaShowMe(switchBtn);
    });

    resizeIframe();

    document.querySelector('#nss-tunebook-exit').focus();
    parentEl.setAttribute("inert", "");

    return;
  }

  if (this.classList.contains('popover-btn-x')) {

    appOptionsPopover.hidePopover();
    return;
  }

  // Theme buttons: Change color theme of document depending on the section

  if (this.classList.contains('nss-theme-btn')) {

    const appSectionHeader = this.parentElement.classList;

    allThemeBtn.forEach(themeBtn => {

      if (themeBtn.parentElement.classList === appSectionHeader &&
          themeBtn.classList.contains(`nss-btn-${this.dataset.theme}`)) {

        ariaShowMe(themeBtn);
        themeBtn.focus();
      }
    });

    ariaHideMe(this);
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

          tuneOption.setAttribute("hidden", "");
          tuneOption.setAttribute("disabled", "");

        } else if (tuneOption.hasAttribute("disabled")) {

          tuneOption.removeAttribute("disabled");
          tuneOption.removeAttribute("hidden");
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

// Initialize previously not set local storage item

export function initLocalStorage(locStorName, locStorValue) {

  if (!localStorage?.getItem(locStorName)) {

    localStorage.setItem(locStorName, locStorValue);
  }
}

// Initialize settings stored in an object using key-value pairs

export function initSettingsFromObject(settingsObj) {

  const locStorKeys = Object.keys(settingsObj);

  locStorKeys.forEach(key => {

    initLocalStorage(key, settingsObj[key]);
  });
}

// Log the current values of settings using keys listed in an object
// Mark user-modified settings with a '*' indicator

export function printLocalStorageSettings(settingsObj) {

  const locStorKeys = Object.keys(settingsObj);

  let settingsReport = "Settings ('*' marks modified):\n\n";

  locStorKeys.forEach(key => {

    let modIndicator = localStorage[key] !== settingsObj[key]? '*' : '';

    settingsReport += `${key}: ${localStorage[key]}${modIndicator}\n`;
  });

  console.log(settingsReport);
}

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

// Initialize Tunebook Options radio buttons on page load

function initTunebookRadioBtns() {

  if(+localStorage?.abcToolsFullScreenBtnShowsChords === 1) {

    fullScreenViewChordsRadioBtn.checked = true;

  } else {

    fullScreenViewTunesRadioBtn.checked = true;
  }

  fullScreenViewChordsRadioBtn.addEventListener('click', () => {

    localStorage.abcToolsFullScreenBtnShowsChords = 1;
  });

  fullScreenViewTunesRadioBtn.addEventListener('click', () => {

    localStorage.abcToolsFullScreenBtnShowsChords = 0;
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
  initTunebookOptions();
  initEncoderSettings();
  initAppCheckboxes();
  initChordViewer();

  console.log(`NS Session App:\n\nLaunch Screen initialized`);
});