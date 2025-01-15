import { initAbcTools, populateTuneSelector, resizeIframe } from './scripts-abc-tools.js';
import { parseAbcFromFile } from './scripts-abc-encoder.js';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NS Session Setlist Custom App Scripts
//
// Session DB and/or Code Contributors:
// Anton Zille https://github.com/anton-bregolas/
//
// Version / NS Session DB date: 2025-01-12
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define Global Variables

let tuneBookSetting = 0;

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
const tuneDropDownTitle = document.querySelector('#tuneSelectorTitle');
const tuneBookTitle = document.querySelector('#title');

////////////////////////////////
// APP LAUNCHERS
///////////////////////////////

// Load Setlist or Tunelist interface, initiate ABC Tools

async function launchTuneBook(dataType) {

  tuneBookSetting = dataType === "setlist"? 0 : 1;

  if (await tuneDataFetch() > 0) {
    
    hideLaunchers();
    updateTuneBookTitles(dataType);
    resizeTuneBookHeader(dataType);
    swapSwitchBtns(dataType);

    allTuneBookEls.forEach(tuneBookEl => {

      tuneBookEl.removeAttribute("hidden");
    });

    initAbcTools();
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

// Switch between sections or repopulate ABC tools selector with target data type, swap elements

function switchTuneBookType(dataType) {

  updateTuneBookTitles(dataType);

  // Switch between Setlist and Tunelist interface

  if (dataType === "setlist" || dataType === "tunelist") {

    tuneBookSetting = dataType === "setlist"? 0 : 1;
    swapSwitchBtns(dataType);
    populateTuneSelector();
    initAbcTools();
    return;
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

// Update text content on page depending on data type shown

function updateTuneBookTitles(dataType) {

  tuneBookTitle.textContent =
  dataType === "setlist"? "Novi Sad Session Setlist" : 
  dataType === "tunelist"? "Novi Sad Session Tunelist" : "";

  if (dataType === "setlist" || dataType === "tunelist") {

    tuneDropDownTitle.textContent = 
    dataType === "tunelist"? "Select a TUNE from the List" :
    "Select a SET from the List";
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

  try {

    const tuneDataSize = await updateDataJsons();

    if (tuneDataSize[0] > 0) {

      console.log(`NS Session App:\n\nSession DB items (${tuneDataSize[0]} sets, ${tuneDataSize[1]} tunes) successfully fetched and pushed to data JSONs`);

      return tuneDataSize[0];
    }

  } catch (error) {

    console.warn(`NS Session App:\n\nLaunching app sequence failed. Details:\n\n${error.message}`);
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

  console.log("NS Session App:\n\nSession DB data cleared!")
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

////////////////////////////////
// EVENT LISTENERS
///////////////////////////////

// Add event listeners to custom app buttons

function initAppButtons() {

  allCustomBtn.forEach(btn => {

    btn.addEventListener('click', appButtonHandler);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  initAppButtons();
});