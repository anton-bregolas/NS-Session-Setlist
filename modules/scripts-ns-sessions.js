import { storageAvailable } from './scripts-3p/storage-available/storage-available.js';
import { initAbcTools, initTunebookOptions, abcTunebookDefaults, tuneSelector, displayOptions,
         restoreLastTunebookItem, populateTuneSelector, populateFilterOptions, sortFilterOptions, 
         resetViewportWidth, getViewportWidth, getViewportHeight, tuneFrame } from './scripts-abc-tools.js';
import { parseAbcFromFile, parseSessionSurveyData, initEncoderSettings, abcEncoderDefaults } from './scripts-abc-encoder.js';
import { initChordViewer, openChordViewer } from './scripts-chord-viewer.js'
import { adjustHtmlFontSize } from './scripts-preload-nssapp.js';

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
// NS Session DB date: 2025-05-05
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const APP_VERSION = "0.9.8";

// Define Global Variables

let tuneBookSetting = 1; // Tunebook loads Setlist by default
let isTuneBookInitialized = false; // If false, opening Tunebook will initialise ABC Tools and fetch Session DB data
let isManualTunebookModeOn = false; // If true, Tunebook footer and Tunelist / Setlist switch buttons are hidden
let lastTuneBookOpened = 1; // Keep track of the latest Tunebook opened (fallback global variable)
let notificationTimeoutId; // Keep track of the latest timeout set for clearing notifications

// Define Session DB items

export const tuneSets = [];
export const tuneList = [];
export const setChords = [];
export const tuneChords = [];
export const tuneSetsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/sets.json"
export const tuneListLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-encoded/tunes.json"
export const setChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-chords/chords-sets.json";
export const tuneChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/main/abc-chords/chords-tunes.json";

// Define common app elements

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

const abcContainer = document.querySelector('.nss-abctools-embed');

// Define App Menu elements

const appOptionsPopover = document.querySelector('#nss-popover-options');
const fullScreenViewTunesRadioBtn = document.querySelector('#nss-radio-view-tunes');
const fullScreenViewChordsRadioBtn = document.querySelector ('#nss-radio-view-chords');
const notificationPopup = document.querySelector('[data-popover="notification-popup"]');
const notificationMessage = document.querySelector('[data-popover="notification-message"]');

////////////////////////////////
// APP LAUNCHERS
///////////////////////////////

// Load Setlist or Tunelist interface, initiate ABC Tools

async function launchTuneBook(dataType, triggerBtn) {

  tuneBookSetting = dataType === "setlist"? 1 : 2;

  if (await tuneDataFetch() > 0) {

    if (getViewportWidth() < 870 && !checkIfMobileMode()) {

      resetViewportWidth(870);
    }

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

    handleSelectorLabels("init");

    if (isTuneBookInitialized === false) {

      initAbcTools();
      
      console.log(`NS Session App:\n\nABC Tools initialized`);

      isTuneBookInitialized = true;

      lastTuneBookOpened = tuneBookSetting;

      if (localStorageOk()) {

        localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;

        if (!localStorage.tuneBookInitialized_NSSSAPP) {

          displayNotification("First time loading Tunebook: Please wait for ABC Tools to load", "status");
          localStorage.tuneBookInitialized_NSSSAPP = 1;
        }
      }

      return;

    } else if ((localStorageOk() && +localStorage.tuneBookLastOpened_NSSSAPP !== tuneBookSetting) ||
              (!localStorageOk() && lastTuneBookOpened !== tuneBookSetting)) {

      refreshTuneBook();
    
    } else {

      console.log(`NS Session App:\n\nTunebook has been reopened`);
    }

  } else {

    displayNotification("Error trying to load Tunebook", "error");
    displayWarningEffect(triggerBtn);
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

  // Tunebook Type Switcher: Switch between Setlist and Tunelist interface

  if (dataType === "setlist" || dataType === "tunelist") {

    tuneBookSetting = dataType === "setlist"? 1 : 2;

    swapSwitchBtns(dataType);

    refreshTuneBook();

    document.querySelector(`#nss-tunebook-${dataType}-switch`).focus();

    return;
  }

  // Save last opened Tunebook section

  if (localStorageOk()) {

    localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
  }

  lastTuneBookOpened = tuneBookSetting;

  // Launch Button: Switch to Launch Screen by default

  resetViewportWidth();
  hideAllSectionsEls();
  showLaunchers();
  appHeader.removeAttribute("style");

  const lastTuneBookBtn = lastTuneBookOpened === 1? "#nss-launch-setlist" : "#nss-launch-tunelist";

  document.querySelector(lastTuneBookBtn).focus();
}

// Load previous or next Tunebook item depending on data-load type

function switchTuneBookItem(loadDir) {

  const currentTuneBook = checkTuneBookSetting() === 1? tuneSets : tuneList;

  const currentTuneIndex = tuneSelector.selectedIndex;

  const stepVal = loadDir === "prev"? -1 : 1;

  let targetTuneIndex = currentTuneIndex + stepVal;

  // Loop to list's end or to the first Tunebook item if switch reaches boundary

  if (targetTuneIndex < 1) {

    targetTuneIndex = currentTuneBook.length;

  } else if (targetTuneIndex > currentTuneBook.length) {

    targetTuneIndex = 1;
  }

  // Check if target Tunebook item is disabled by filters, look for the closest active item

  if (tuneSelector.options[targetTuneIndex]?.disabled) {

    let switchAttempts = 0;

    while (tuneSelector.options[targetTuneIndex].disabled && switchAttempts < currentTuneBook.length) {

      targetTuneIndex += stepVal;
    
      if (targetTuneIndex < 1) {

        targetTuneIndex = currentTuneBook.length;
    
      } else if (targetTuneIndex > currentTuneBook.length) {
    
        targetTuneIndex = 1;
      }

      switchAttempts++;
    }

    // Return if the loaded Tunebook item is the only filtered item

    if (switchAttempts === currentTuneBook.length) return;
  }

  // Load new Tunebook item (reload if single filtered item remains)

  tuneSelector.selectedIndex = targetTuneIndex;
  tuneSelector.dispatchEvent(new Event('change'));
}

// Zoom in or zoom out of Tunebook item depending on data-load type

function zoomTuneBookItem(zoomDir) {

  const zoomValue = zoomDir === "zoom-in"? 10 : -10;

  // Desktop Mode

  if (!checkIfMobileMode()) {

    const currentPageZoom = abcContainer.style.zoom || "100%";

    let newPageZoom = +currentPageZoom.slice(0, -1) + zoomValue;

    if (newPageZoom > 100 || newPageZoom < 50) return;

    abcContainer.style.zoom = `${newPageZoom}%`;

    if (localStorageOk()) localStorage.tuneBookFullScreenZoom = `${newPageZoom}%`;
    
    return;
  }

  // Mobile Mode

  const currentAbcFrameWidth = tuneFrame.style.width || "100%";

  let newAbcFrameWidth = +currentAbcFrameWidth.slice(0, -1) + zoomValue;

  if (newAbcFrameWidth > 100 || newAbcFrameWidth < 30) return;

  tuneFrame.style.width = `${newAbcFrameWidth}%`;

  if (localStorageOk()) localStorage.tuneBookFullScreenWidth = `${newAbcFrameWidth}%`;

  return;
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

// Switch Tunebook between the default Desktop and Mobile Mode optimized for smaller screens

function switchTunebookMode(targetMode) {

  const docBody = document.querySelector('body');

  if (targetMode === "mobile-switch") {

    docBody.dataset.mode = "mobile";
    
    displayNotification("Mobile mode enabled: Double tap on tune to play, long press to rewind", "success");

    resetViewportWidth();
  }

  if (targetMode === "desktop-switch") {

    docBody.dataset.mode = "desktop";
    
    displayNotification("Desktop mode enabled: Navigate between items in header, use ABC Tools buttons for playback", "success");

    if (getViewportWidth() < 870) resetViewportWidth(870);
  }

  refreshTuneBook(true);
  handleSelectorLabels("init");
}

// Hide or show GUI elements depending on toggle element type

function toggleFullScreenGui(toggleEl) {

  let guiElsToToggle;

  if (toggleEl === "toggle-gui-fullscreen") {

    guiElsToToggle = abcContainer.querySelectorAll('nss-iframe-gui-container');

    if (abcContainer.style.getPropertyValue("--fullscreen-gui-display") === "none") {

      abcContainer.style.setProperty("--fullscreen-gui-display", "flex");

      if (localStorageOk()) localStorage.tuneBookFullScreenGuiDisplay = "flex";

      return;
    } 

    abcContainer.style.setProperty("--fullscreen-gui-display", "none");

    if (localStorageOk()) localStorage.tuneBookFullScreenGuiDisplay = "none";
    
    return;
  }

  if (!guiElsToToggle) return;

  guiElsToToggle.forEach(guiEl => {

    if (guiEl.dataset.load === toggleEl || guiEl.dataset.load === "exit-fullscreen") return;

    if (guiEl.hasAttribute("hidden")) {

      ariaShowMe(guiEl);
      return;
    }

    ariaHideMe(guiEl);
  });
}

// Exit Full Screen mode

async function exitFullScreenMode() {

  const exitFullScreen = 
    document.exitFullscreen || 
    document.webkitExitFullscreen || 
    document.mozCancelFullScreen || 
    document.msExitFullscreen;

  try {

    await exitFullScreen.call(document);

    document.querySelector('#fullScreenButton').focus();

  } catch {

    console.warn(`NS Session App:\n\nTrying to exit fullscreen while not in Full Screen mode`);
  }

  return;
}

////////////////////////////////
// POPOVER & DIALOG LAUNCHERS
///////////////////////////////

// Launch a Popover Options menu depending on dataType

export function openSettingsMenu(dataType) {

  if (dataType === "fullscreen-view") {
    
    openChordViewer(setChords, tuneChords);
    return;
  }

  if (!localStorageOk()) {

    displayNotification("Enable Local Storage or change browser mode to use custom settings", "warning");
    return;
  }

  if (dataType === "app-options") {

    printLocalStorageSettings(abcTunebookDefaults);

    appOptionsPopover.showPopover();
  }

  if (dataType === "encoder-options") {

    printLocalStorageSettings(abcEncoderDefaults);

    appOptionsPopover.showPopover();
  }
}

////////////////////////////////
// ANIMATIONS & WARNINGS
///////////////////////////////

// Display Notification Popup Popover with a message to the user
// Adjust popover's behavior and style depending on message type

export function displayNotification(msgText, msgType) {

  notificationMessage.textContent = msgText;
  notificationPopup.className = msgType ?? "status";

  if (!notificationPopup.matches(':popover-open')) {

    notificationPopup.showPopover();
  }

  if (notificationTimeoutId) {
    
    clearTimeout(notificationTimeoutId);
  }

  if (msgType === "success" || msgType === "status") {
    
    notificationTimeoutId = setTimeout(() => {

      notificationPopup.hidePopover();
    }, 5000);
  }
}

// Show a warning outline around the target button

export function displayWarningEffect(focusBtn) {

  focusBtn.setAttribute("style", "outline-color: red");

  setTimeout(() => {

    focusBtn.removeAttribute("style");
  }, 2500);
}

////////////////////////////////
// CHECKERS & UPDATERS
///////////////////////////////

// Return up-to-date tuneBookSetting value (for use in external modules)

export function checkTuneBookSetting() {

  return tuneBookSetting;
}

// Return true if Tunebook menu elements are currently displayed

export function checkIfTunebookOpen() {

  let isTuneBookOpen = false;

  // const abcContainer = document.querySelector('.nss-abctools-embed');

  if (abcContainer && !abcContainer.hasAttribute("hidden")) {

    isTuneBookOpen = true;
  }

  return isTuneBookOpen;
}

// Return true if app is currently in mobile mode

export function checkIfMobileMode() {

  return document.querySelector('body').dataset.mode === "mobile";
}

// Reset Tunebook dropdown menus without reinitializing ABC Tools

export function refreshTuneBook(isSoftRefresh) {

  const currentTuneBook = checkTuneBookSetting() === 1? tuneSets : tuneList;

  // Repopulate Tunebook selectors and reset all menus and active filters

  if (!isSoftRefresh) {

    resetTuneBookMenus();
    resetTuneBookFilters();

    populateTuneSelector(currentTuneBook);
    populateFilterOptions(sortFilterOptions(currentTuneBook));

    console.log(`NS Session App:\n\nTunebook has been refreshed`);
  }

  // Simply load the first Tunebook item if localStorage is unavailable

  if (!localStorageOk()) {

    tuneSelector.selectedIndex = 1;
    tuneSelector.dispatchEvent(new Event('change'));
    return;
  }

  // Load the last saved Tunebook item by Tunebook type

  if (+localStorage.abcToolsSaveAndRestoreTunes === 1
      && ((currentTuneBook === tuneSets && localStorage.lastTuneBookSet_NSSSAPP)
      || (currentTuneBook === tuneList && localStorage.lastTuneBookTune_NSSSAPP))) {

    restoreLastTunebookItem();
    return;
  }
  
  if (+localStorage.abcToolsAllowTuneAutoReload === 1) {

    tuneSelector.selectedIndex = 1;
    tuneSelector.dispatchEvent(new Event('change'));
  }
}

// Clear the contents of custom Tunebook dropdown menus, reset to default options

export function resetTuneBookMenus() {

  if (localStorageOk()) {

    localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
  }

  lastTuneBookOpened = tuneBookSetting;

  while (tuneSelector.children.length > 1) {

    tuneSelector.removeChild(tuneSelector.lastChild);
  }

  while (filterOptions.children.length > 2) {
    
    filterOptions.removeChild(filterOptions.lastChild);
  }
  
  tuneSelector.selectedIndex = 0;
  filterOptions.selectedIndex = 0;
  filterOptions.value = "-1";

  tuneSelector.dispatchEvent(new Event('change'));
  filterOptions.dispatchEvent(new Event('change'));
}

// Clear the effects of all custom Tunebook filter options

function resetTuneBookFilters() {

  const tuneGroups = tuneSelector.querySelectorAll(':scope > optgroup');
  const tuneOptions = tuneSelector.querySelectorAll('optgroup > *');

  [tuneGroups, tuneOptions].forEach(tuneSelectorItem => {

    tuneSelectorItem.forEach(item => {
          
      item.removeAttribute("hidden");
      item.removeAttribute("disabled");
    });
  });
}

// Update text content on page depending on data type shown

function updateTuneBookTitles(dataType) {

  if (dataType === "launcher" || dataType === "playalong") {

    appNavTitle.dataset.title = dataType;
    return;
  }

  if (dataType === "setlist" || dataType === "tunelist") {

    tuneSelectorTitle.textContent = 
    dataType === "tunelist"? "\u{1F3B5} Select a TUNE" :
    "\u{1F3BC} Select a SET";
  }

  tuneBookTitle.dataset.type = dataType === "setlist"? "Set" : "Tune";
  tuneBookTitle.setAttribute("aria-title", `Novi Sad Session ${tuneBookTitle.dataset.type}list`);
}

////////////////////////////////
// FETCHERS & DATA HANDLERS
///////////////////////////////

// Fetch Session DB data

async function tuneDataFetch() {

  if (isTuneBookInitialized === false) {

    try {

      const tuneDataSize = await updateDataJsons();

      if (tuneDataSize[0] > 0) {

        console.log(`NS Session App:\n\nSession DB items (${tuneDataSize[0]} sets, ${tuneDataSize[1]} tunes) successfully fetched and pushed to data JSONs`);
        
        if (localStorageOk() && +localStorage.tuneBookShowStatusReport === 1) {

          displayNotification(`Session DB v.${APP_VERSION} (${tuneDataSize[0]} sets, ${tuneDataSize[1]} tunes)`, "report");
        }
        
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

      data = await response.json();

    } else if (type === "text") {

      data = await response.text();

    } else {

      throw new Error("Invalid data type passed to Fetch!");
    }

    return data;

  } catch (error) {

    if (error.message.startsWith("NetworkError") || error.cause?.status) {

      displayNotification("Network error trying to fetch data", "error");
    
    } else {

      displayNotification("Error trying to fetch data", "error");
    }

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

////////////////////////////////
// EVENT HANDLERS
////////////////////////////////

// Handle custom button click events

async function appButtonHandler() {

  if (this.hasAttribute('data-action')) {

    return;
  }

  const parentEl = this.parentElement;

  // Mode Togglers: Switch between Desktop and Mobile Tunebook mode

  if (this.dataset.controls && this.dataset.controls === "mode" && this.dataset.type) {

    switchTunebookMode(this.dataset.type);
    return;
  }

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

    // Tune switchers

    if (this.classList.contains('nss-arrow-btn')) {

      switchTuneBookItem(this.dataset.load);
      
      return;
    }

    // Zoom in and zoom out

    if (this.classList.contains('nss-zoom-btn')) {

      zoomTuneBookItem(this.dataset.load);
      
      return;
    }

    // GUI switchers

    if (this.dataset.load.startsWith("toggle-gui")) {

      toggleFullScreenGui(this.dataset.load);

      return;
    }

    // Full Screen switchers

    if (this.dataset.load === "exit-fullscreen") {

      exitFullScreenMode();
      
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

  // Control Buttons: Open additional menus and modify settings

  if (this.classList.contains('nss-control-btn')) {

    if (this.dataset.load === "session-survey") {

      parseSessionSurveyData(this);
    }
  }

  // Close Buttons: Hide parent element, show alternative navigation

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

    document.querySelector('#nss-tunebook-exit').focus();
    parentEl.setAttribute("inert", "");

    displayNotification("Compact mode enabled: Top left button to exit, refresh app to reset", "success");

    return;
  }

  if (this.classList.contains('popover-btn-x')) {

    appOptionsPopover.hidePopover();
    return;
  }

  if (this.classList.contains('popup-btn-x')) {

    notificationPopup.hidePopover();
    return;
  }

  // Theme buttons: Change color theme of document depending on the section

  if (this.classList.contains('nss-theme-btn')) {

    const appSectionHeader = this.parentElement.classList;

    allThemeBtn.forEach(themeBtn => {

      if (themeBtn.parentElement.classList === appSectionHeader &&
          themeBtn.classList.contains(`nss-btn-${this.dataset.theme}`)) {

        themeBtn.removeAttribute("inert");
        ariaShowMe(themeBtn);
        themeBtn.focus();
      }
    });

    ariaHideMe(this);
    this.setAttribute("inert", "");
  }
}

// Handle custom dropdown menu events

async function appDropDownHandler(event) {

  if (event.type === 'change') {
    
    if (this === filterOptions) {

      handleSelectorLabels("select", filterOptions, filterOptions.selectedIndex);

      filterTuneBook();
    }
  }

  if (getViewportWidth() > 768) return;

  if (event.type === 'mousedown' || event.type === 'keydown' || event.type === 'touchstart') {

    // console.log(event.type);

    handleSelectorLabels("clearone", this);
  }

  if (event.type === 'blur' || event.type === 'keyup' || event.type === 'touchend') {

    // console.log(event.type);

    handleSelectorLabels("setone", this);
  }
}

// Filter Tune Selector by selected Tune Type or Set Leader

function filterTuneBook() {

  const filterId = filterOptions.value;

  if (filterId === "-1") return;

  const tuneGroups = tuneSelector.querySelectorAll(':scope > optgroup');
  const tuneOptions = tuneSelector.querySelectorAll('optgroup > *');
  const activeFilter = filterOptions.querySelector('option:checked')
  const activeFilterGroup = activeFilter.closest('optgroup');

  if (filterId === "0") {

    resetTuneBookFilters();

    tuneSelector.selectedIndex = 0;

    filterOptions.value = "-1";

    tuneSelector.dispatchEvent(new Event('change'));
    
    filterOptions.dispatchEvent(new Event('change'));

    console.log("NS Session App:\n\nTunebook filters cleared");

    displayNotification("Tunebook filters cleared", "status");

    tuneSelector.focus();

    return;
  }

  if (filterId && activeFilterGroup.label.includes("Tune Type")) {

    [tuneGroups, tuneOptions].forEach(tuneSelectorItemCat => {

      tuneSelectorItemCat.forEach(item => {

        if (filterId !== item.dataset.tunetype) {

          item.setAttribute("hidden", "");
          item.setAttribute("disabled", "");

        } else if (item.hasAttribute("disabled")) {

          item.removeAttribute("disabled");
          item.removeAttribute("hidden");
        }
      });
    });
  }

  if (filterId && activeFilterGroup.label.includes("Set Leader")) {

    tuneOptions.forEach(tuneOption => {

      if (!tuneOption.dataset.leaders.split(', ').includes(filterId)) {

        tuneOption.setAttribute("hidden", "");
        tuneOption.setAttribute("disabled", "");

      } else if (tuneOption.hasAttribute("disabled")) {

        tuneOption.removeAttribute("disabled");
        tuneOption.removeAttribute("hidden");
      }
    });

    tuneGroups.forEach(tuneGroup => {

      tuneGroup.setAttribute("hidden", "");
      tuneGroup.setAttribute("disabled", "");

      tuneGroup.querySelectorAll('option').forEach(option => {

        if (!option.hasAttribute("disabled")) {

          tuneGroup.removeAttribute("disabled");
          tuneGroup.removeAttribute("hidden");

          return;
        }
      });
    });
  }

  tuneSelector.selectedIndex = 0;

  tuneSelector.dispatchEvent(new Event('change'));

  console.log(`NS Session App:\n\nTunebook filtered by "${filterId}"`);

  displayNotification(`Tunebook filtered by "${filterId}"`, "status")

  tuneSelector.focus();
}

// Handle automatic renaming of Tunebook selector labels in Mobile Mode

export function handleSelectorLabels(actionType, parentSelector, selectedIndex) {

  const body = document.querySelector('body');

  if (body.dataset.mode === "desktop" && actionType !== "init") return;

  const filterHeader = filterOptions.options[0];
  const tunesHeader = tuneSelector.options[0];
  const tabsHeader = displayOptions.options[0];

  const tuneBookSelectors = ['filterOptions', 'tuneSelector', 'displayOptions'];
  const tuneBookSelectorHeaders = [filterHeader, tunesHeader, tabsHeader];

  const newSelectorLabels = ['✨', '🎼', '🎹'];

  if (actionType === "init") {

    if (getViewportWidth() > 768 || body.dataset.mode === "desktop") {
      
      removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders);
      return;
    }

    if (body.dataset.mode === "mobile") {
      
      setMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders, newSelectorLabels);
      return;
    }
  }

  if (actionType === "resize") {

    if (getViewportWidth() > 768 &&
      (filterHeader.hasAttribute('label') || 
      tunesHeader.hasAttribute('label') || 
      tabsHeader.hasAttribute('label'))) {

      removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders);
      return;
    }

    if (getViewportWidth() <= 768) {

      if (filterHeader.hasAttribute('label') && 
        tunesHeader.hasAttribute('label') && 
        tabsHeader.hasAttribute('label')) {

        return;
      }

      setMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders, newSelectorLabels);
      return;
    }

    return;
  }

  const selectorIndex = tuneBookSelectors.indexOf(parentSelector.id);
  const selectedOption = parentSelector.selectedOptions[0].label;
  const selectorLabelTxt = parentSelector.options[0].textContent;
  const selectorLabelPic = newSelectorLabels[selectorIndex];

  if (actionType === "select") {

    if (parentSelector.style.fontSize) {

      if (selectedIndex !== 0 || getViewportWidth() > 768) {

        parentSelector.style.removeProperty('font-size');
        return
      }

      return;
    }

    if (selectedIndex !== 0 || body.dataset.mode === "desktop" || getViewportWidth() > 768) return;

    parentSelector.style.fontSize = "2.4rem";

    // Fall through >>>>
  }

  if (actionType === "select" || actionType === "setone") {

    if (selectedOption === selectorLabelTxt) {

      setMobileSelectorStyles([parentSelector.id], [parentSelector.options[0]], [selectorLabelPic]);
    }     

    return;
  }

  if (actionType === "clearone") {

    const selectorHeader = tuneBookSelectorHeaders[selectorIndex];

    removeMobileSelectorStyles([parentSelector.id], [selectorHeader]);

    return;
  }
}

// Set selector attributes associated with the mobile mode

function setMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders, newSelectorLabels) {

  tuneBookSelectorHeaders.forEach(header => {

    const newLabel = newSelectorLabels[tuneBookSelectorHeaders.indexOf(header)];

    header.setAttribute('label', newLabel);
  });

  tuneBookSelectors.forEach(selectorId => {

    const selectorEl = document.getElementById(selectorId);

    if (selectorEl.selectedIndex === 0) {

      selectorEl.style.fontSize = "2.4rem";
    }
  });
}

// Clear all selector styles and labels previously set via attributes for mobile mode

function removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders) {

  tuneBookSelectors.forEach(selectorId => {

    const selectorEl = document.getElementById(selectorId);
    
    if (selectorEl.style.fontSize) {
      
      selectorEl.style.removeProperty('font-size');
    }
  });

  tuneBookSelectorHeaders.forEach(header => {
  
    if (header.hasAttribute('label')) {
  
      header.removeAttribute('label');
    }
  });
}

// Handle app menu adjustments on window resize
// Set HTML font size depending on current viewport
// Adjust viewport and selectors if Tunebook is open

export function appWindowResizeHandler() {

  // Handle global font size adjustments >>>

  const viewPortW = getViewportWidth();
  const viewPortH = getViewportHeight();

  // Adjust font-size value based on viewport size for small and medium-sized screens

  if (viewPortW < 1080 || viewPortH <= 768) {

    document.documentElement.style.fontSize = adjustHtmlFontSize(viewPortW, viewPortH);
  
  // Otherwise clear the previously set font-size value

  } else if (document.documentElement.style.fontSize) {

    document.documentElement.style.removeProperty('font-size');
  }

  // Dynamically switch between desktop and mobile mode until Tunebook is first opened

  if (!isTuneBookInitialized) initTunebookMode();

  // Handle Tunebook adjustments >>>

  // If Tunebook menu is currently hidden, do nothing

  if (!checkIfTunebookOpen()) return;

  // Change Tunebook selector labels

  handleSelectorLabels("resize");

  // If app is in mobile mode, do not adjust viewport

  if (checkIfMobileMode()) return;

  // If Tunebook is displayed in desktop mode on a narrow screen, switch to fixed viewport

  const viewPortMeta = document.querySelector("meta[name=viewport]");
  const isFixedViewport = viewPortMeta.getAttribute("content") !== "width=device-width, initial-scale=1.0";

  if (getViewportWidth() < 870 && !isFixedViewport) {

    resetViewportWidth(870);
    return;
  } 
}

// Handle enter and exit Full Screen events

export function handleFullScreenChange() {

  // Do nothing if Tunebook is not open

  if (!checkIfTunebookOpen()) return;

  const iframeControls = abcContainer.querySelectorAll('[data-controls]');

  // Execute right after entering fullscreen

  if (document.fullscreenElement) {

    iframeControls.forEach(controlEl => {

      ariaShowMe(controlEl);
    });

    if (localStorageOk() && localStorage.tuneBookFullScreenGuiDisplay) {
      
      abcContainer.style.setProperty("--fullscreen-gui-display", localStorage.tuneBookFullScreenGuiDisplay);
    }

    // Desktop Mode

    if (!checkIfMobileMode()) {
     
      if (localStorageOk() && localStorage.tuneBookFullScreenZoom) {

        abcContainer.style.zoom = localStorage.tuneBookFullScreenZoom;
      }

      return;
    }

    // Mobile Mode

    abcContainer.style.width = "100vw";
    abcContainer.style.height = "100vh";
    abcContainer.style.backgroundColor = "white";
    tuneFrame.style.border = "unset";
      
    if (localStorageOk() && localStorage.tuneBookFullScreenWidth) {

      tuneFrame.style.width = localStorage.tuneBookFullScreenWidth;
    }

    return;

  // Execute right after exiting fullscreen

  } else {

    abcContainer.removeAttribute("style");
    tuneFrame.removeAttribute("style");

    iframeControls.forEach(controlEl => {

      if (controlEl.dataset.controls === "iframe-nav") {

        if (controlEl.hasAttribute("hidden")) {

          ariaShowMe(controlEl);
        } 

        return;
      }

      ariaHideMe(controlEl);
    });

    return;
  }
}

// Handle all app click events

function appWindowClickHandler(event) {

  const interactableEl = 'button, select, input[type="checkbox"], input[type="radio"]';
  const triggerEl = event.target.closest(interactableEl);

  if (!triggerEl) return;

}

////////////////////////////////
// EVENT LISTENERS & SETTINGS
///////////////////////////////

// Initialize custom settings in app menus (requires localStorage)

function initAppSettings() {

  if (!localStorageOk()) {
  
    console.warn(`NS Session App:\n\nThis browser does not support Local Storage. Custom settings will not be saved`);
    displayNotification("This browser does not support Local Storage: Settings won't be saved", "warning");
    return;
  }

  initTunebookOptions();
  initEncoderSettings();
  initAppCheckboxes();
}

// Check if localStorage is available and writable

export function localStorageOk() {

  return storageAvailable('localStorage');
}

// Initialize previously not set local storage item

export function initLocalStorage(locStorName, locStorValue) {

  if (!localStorageOk()) return;

  if (!localStorage.getItem(locStorName)) {

    localStorage.setItem(locStorName, locStorValue);
  }
}

// Initialize settings stored in an object using key-value pairs

export function initSettingsFromObject(settingsObj) {
  
  if (!localStorageOk()) return;

  const locStorKeys = Object.keys(settingsObj);

  locStorKeys.forEach(key => {

    initLocalStorage(key, settingsObj[key]);
  });
}

// Log the current values of settings using keys listed in an object
// Mark user-modified settings with a '*' indicator

export function printLocalStorageSettings(settingsObj) {

  if (!localStorageOk()) return;

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

  [filterOptions, tuneSelector, displayOptions].forEach(selector => {

    ['mousedown', 'keydown', 'touchstart', 'touchend', 'keyup', 'blur'].forEach(eventType => {

      selector.addEventListener(eventType, appDropDownHandler);
    });
  });
}

// Initialize App & Encoder Settings checkboxes on page load

export function initAppCheckboxes() {

  if (!localStorageOk()) return;

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

    if (checkBox.id === 'tunebook-use-mobile-mode') {

      checkBox.addEventListener('click', () => {

        const docBody = document.querySelector('body');

        if (checkBox.checked) {

          docBody.dataset.mode = "mobile";

          displayNotification("Persistent mobile mode enabled", "success");
          
        } else {
      
          docBody.dataset.mode = "desktop";

          displayNotification("Persistent mobile mode disabled", "success");
        }
      });
    }
  });
}

// Initialize Tunebook Options radio buttons on page load

function initTunebookRadioBtns() {

  if (!localStorageOk()) return;

  if(+localStorage.abcToolsFullScreenBtnShowsChords === 1) {

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

// Initialize Tunebook Mobile Mode settings

function initTunebookMode() {

  if (getViewportWidth() < 870 || 
     (localStorageOk() && +localStorage.tuneBookAlwaysUseMobileMode === 1)) {

    document.querySelector('body').dataset.mode = "mobile";

  } else {

    document.querySelector('body').dataset.mode = "desktop";
  }
}

// Listen to Full Screen mode events in browsers supporting Fullscreen API

function initFullScreenEvents() {

  const docBody = document.querySelector('body');

  if (!docBody.requestFullscreen && 
      !docBody.webkitRequestFullscreen && 
      !docBody.mozRequestFullScreen &&
      !docBody.msRequestFullscreen) {

    return;
  }

  document.addEventListener('fullscreenchange', handleFullScreenChange);
}

// Initialize popover polyfill warning if the browser doesn't support Popover API

function initPopoverWarning() {

  const isPopoverPolyfilled = document.body?.showPopover && !/native code/i.test(document.body.showPopover.toString());

  if (isPopoverPolyfilled) {

    console.log(`NS Session App:\n\nThis browser does not support Popover API. Polyfill has been applied`);
  }
}

// Add global event listeners to the app's window object
// Delegate each type of event to specialized handler functions

function initWindowEvents() {

  window.addEventListener('click', appWindowClickHandler);

  window.addEventListener('resize', appWindowResizeHandler);

  window.addEventListener('beforeunload', () => { resetViewportWidth() });
}

// Initialize event listeners and settings on Launch Screen load

document.addEventListener('DOMContentLoaded', () => {

  initPopoverWarning();
  initWindowEvents();
  initFullScreenEvents();
  initAppSettings();
  initAppButtons();
  initTunebookMode();
  initChordViewer();

  console.log(`NS Session App:\n\nLaunch Screen initialized`);
});