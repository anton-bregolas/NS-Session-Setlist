import { initAbcTools, resizeIframe, tuneSelector, tuneFrame, loadTuneBookItem, restoreLastTunebookItem,
         populateTuneSelector, populateFilterOptions, sortFilterOptions, checkPersistenceState } from './scripts-abc-tools.js';
import { parseAbcFromFile } from './scripts-abc-encoder.js';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NS Session Setlist Custom App Scripts
//
// Session DB and/or Code Contributors:
// Anton Zille https://github.com/anton-bregolas/ - Code, ABC
// Mars Agliullin - ABC
// Tania Sycheva - ABC
//
// Version / NS Session DB date: 2025-01-28
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define Global Variables

let tuneBookSetting = 1;
let tuneBookInitialized = false;

// Define Session DB items

export const tuneSets = [];
export const tuneList = [];
export const tuneSetsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/tunesets.json"
export const tuneListLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/tunes.json"

// Define Main Page elements

const allCustomBtn = document.querySelectorAll('.nss-btn');
const allSwitchBtn = document.querySelectorAll('.nss-switch-btn');
const allLaunchEls = document.querySelectorAll('.nss-launch-el');
const allTuneBookEls = document.querySelectorAll('.nss-tunebook-el');
const allPlayAlongEls = document.querySelectorAll('.nss-playalong-el');
const tuneSelectorTitle = document.querySelector('#tuneSelectorTitle');
export const filterOptions = document.querySelector('#filterOptions');
const tuneBookTitle = document.querySelector('#title');

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

  if (checkPersistenceState() === true
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

// Refresh tab & MIDI selector options, set dropdown menu to default option

export function refreshTabsDisplayOptions() {

    displayOptions.options[0].selected = "selected";
    displayOptions.value = "-1";
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

    throw new Error(`[NS Session App]\n\n` + error + `\n\nHTTP error code: ` + error.cause?.status);
  }
}

// Fetch all Session DB JSONs

export async function fetchDataJsons() {

  try {

    return Promise.all([
      fetchData(tuneSetsLink, "json"),
      fetchData(tuneListLink, "json")
    ]);

  } catch (error) {

    throw (error);
  }
}

// Push new tune data to Custom JSONs after fetching Session DB

export async function updateDataJsons() {

  try {

    console.log("NS Session App:\n\nFetching data from Session DB...");

    const [setsData, tunesData] =
    await fetchDataJsons();

    updateData(tuneSets, setsData);
    updateData(tuneList, tunesData);

    // sessionSetsCounter.textContent = tuneSets.length;
    // sessionTunesCounter.textContent = tuneList.length;

    return [tuneSets.length, tuneList.length];

  } catch (error) {

    throw (error);
  }
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

    switchTuneBookType(this.dataset.load);
  }
  
  // Close Buttons: Hide parent element and resize ABC Tools

  if (this.classList.contains('nss-btn-x')) {

    parentEl.setAttribute("hidden", "");
    resizeIframe();
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

        } else if (tuneOption.hasAttribute("hidden")) {

          tuneOption.removeAttribute("hidden");
        }
      });

      tuneSelector.options[0].selected = "selected";

      console.log(`NS Session App:\n\nTunebook filtered by "${filterId}"`);
    }
  }
}

////////////////////////////////
// EVENT LISTENERS
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

// Initialize event listeners on Launch Screen load

document.addEventListener('DOMContentLoaded', () => {

  initAppButtons();

  console.log(`NS Session App:\n\nLaunch Screen initialized`);
});