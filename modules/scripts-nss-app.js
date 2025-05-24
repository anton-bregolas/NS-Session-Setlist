import { storageAvailable } from './scripts-3p/storage-available/storage-available.js';
import { initAbcTools, initTunebookOptions, abcTunebookDefaults, tuneSelector, displayOptions,
         restoreLastTunebookItem, populateTuneSelector, populateFilterOptions, sortFilterOptions, 
         resetViewportWidth, getViewportWidth, getViewportHeight, getLastTunebookUrl, tuneFrame, 
         handleFullScreenButton, loadFromQueryString } from './scripts-abc-tools.js';
import { parseAbcFromFile, parseSessionSurveyData, initEncoderSettings, abcEncoderDefaults } from './scripts-abc-encoder.js';
import { initChordViewer, openChordViewer } from './scripts-chord-viewer.js'
import { initListViewer, openListViewer } from './scripts-list-viewer.js';
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
// NS Session DB date: 2025-05-17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const APP_VERSION = "0.9.9";
const DB_VERSION = "2025-05-17";

// Define Global Variables

let tuneBookSetting = "setlist"; // Tunebook loads Setlist by default
let isTuneBookInitialized = false; // If false, opening Tunebook will initialise ABC Tools and fetch Session DB data
let isCompactTunebookModeOn = false; // If true, Tunebook footer and Tunelist / Setlist switch buttons are hidden
let lastAppSectionOpened = "launcher"; // Keep track of the last app section name / latest hash handled by routing
let lastTuneBookMode; // Keep track of the last Tunebook mode setting for this session
let lastTuneBookOpened; // Keep track of the latest Tunebook opened (fallback global variable)
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
const advancedOptions = document.querySelector('.nss-advanced-options-container');
const fullScreenViewTunesRadioBtn = document.querySelector('#nss-radio-view-tunes');
const fullScreenViewChordsRadioBtn = document.querySelector ('#nss-radio-view-chords');
const notificationPopup = document.querySelector('[data-popover="notification-popup"]');
const notificationMessage = document.querySelector('[data-popover="notification-message"]');
const tuneBookActionsPopup = document.querySelector('[data-popover="tunebook-actions-popup"]');

////////////////////////////////
// APP LAUNCHERS
///////////////////////////////

// Load Tunebook with Setlist or Tunelist interface, initiate ABC Tools

async function launchTuneBook(targetSection, currentSection, itemQuery) {

  // Fetch latest Session DB if Tunebook has not been initialized

  if (!isTuneBookInitialized) {

    const isSessionDBLoaded = await tuneDataFetch();

    if (!isSessionDBLoaded) {

      // Display an error and hightlight section button if fetch attempt fails

      displayNotification("Error trying to load Tunebook", "error");
    
      const triggerBtn = document.querySelector(`#nss-launch-${targetSection}`);

      displayWarningEffect(triggerBtn);

      return;
    }
  }

  // Launch Tunebook

  tuneBookSetting = targetSection;

  initTunebookMode();

  if (getViewportWidth() < 880 && !checkIfMobileMode()) {

    resetViewportWidth(880);
  }

  if (currentSection === "playalong") hidePlayAlongEls();
  if (currentSection === "launcher" || currentSection === "playalong") hideLaunchers();

  updateAppSectionTitle(targetSection);
  swapSwitchBtns(targetSection);

  appHeader.style.display = "none";

  showTuneBookEls();

  if (!document.querySelector('#nss-tunebook-exit').hasAttribute("hidden")) {

    document.querySelector('#nss-tunebook-exit').focus();

  } else {

    document.querySelector(`#nss-tunebook-${targetSection}-switch`).focus();
  }

  handleSelectorLabels("init");

  // Initialize ABC Tools when Tunebook first opened

  if (isTuneBookInitialized === false) {

    initAbcTools(itemQuery);

    initTunebookRadioBtns();
    
    console.log(`NS Session App:\n\nABC Tools initialized`);

    isTuneBookInitialized = true;

    lastTuneBookOpened = tuneBookSetting;

    if (localStorageOk()) {

      localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;

      if (!localStorage.tuneBookInitialized_NSSSAPP) {

        displayNotification("First time loading Tunebook: Please wait for ABC Tools to load", "success");
        localStorage.tuneBookInitialized_NSSSAPP = 1;
      }
    }

    return;
  }

  // Refresh Tunebook if section has been changed or query passed

  if (itemQuery ||
     (localStorageOk() && localStorage.tuneBookLastOpened_NSSSAPP !== tuneBookSetting) ||
     (!localStorageOk() && lastTuneBookOpened !== tuneBookSetting)) {

    refreshTuneBook(false, itemQuery);

    lastTuneBookOpened = targetSection;

    if (localStorageOk()) {

      localStorage.tuneBookLastOpened_NSSSAPP = targetSection;
    }

    return;
  }

  // Refresh Tunebook if desktop mode was switched on while persistent mobile mode is on

  if (lastTuneBookMode === "desktop" && 
      (localStorageOk() && +localStorage.tuneBookAlwaysUseMobileMode === 1)) {

    lastTuneBookMode = "mobile";

    refreshTuneBook();
  }
  
  // Simply log Tunebook opened event if section has not changed

  console.log(`NS Session App:\n\nTunebook has been reopened`);
}

// Load Play Along section interface

function launchPlayAlong() {

  showPlayAlongEls();

  document.querySelector('#nss-playalong-exit').focus();
}

////////////////////////////////
// SWITCHERS
///////////////////////////////

// Switch between sections or repopulate ABC tools with new data, swap elements

function switchAppSection(targetSection, currentSection, itemQuery) {

  // Switch from Tunebook >>>

  if (checkIfTunebookOpen()) {

    // Handle same-section query requests

    if (itemQuery && currentSection === targetSection) {

      if (itemQuery.startsWith("filter")) {

        loadFromQueryString(itemQuery);
        return;
      }

      refreshTuneBook(false, itemQuery);
      return;
    }

    updateAppSectionTitle(targetSection);

    // Setlist <> Tunelist toggle

    if (targetSection === "setlist" || targetSection === "tunelist") {

      tuneBookSetting = targetSection;

      swapSwitchBtns(targetSection);

      refreshTuneBook(false, itemQuery);

      lastTuneBookOpened = targetSection;

      if (localStorageOk()) {

        localStorage.tuneBookLastOpened_NSSSAPP = targetSection;
      }

      document.querySelector(`#nss-tunebook-${targetSection}-switch`).focus();

      return;
    }

    // Exit Tunebook

    // Save last opened Tunebook section before exiting

    if (localStorageOk()) {

      localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
    }

    lastTuneBookOpened = tuneBookSetting;

    // Hide Tunebook menus, reset styles

    if (tuneBookActionsPopup.matches(':popover-open')) {

      tuneBookActionsPopup.hidePopover();
    }

    lastTuneBookMode = document.body.dataset.mode;

    hideTuneBookEls();
    appHeader.removeAttribute("style");
    resetViewportWidth();
    initAppMode();
    appWindowResizeHandler();
    
    // Tunebook > Playalong switch

    if (targetSection === "playalong") {

      launchPlayAlong();
      return; 
    }

    // Tunebook > Launch Screen switch

    showLaunchers();

    document.querySelector(`#nss-launch-${lastTuneBookOpened}`).focus();

    return;
  }
  
  // Switch from main app interface >>>

  // Launch Tunebook, open Setlist or Tunelist section

  if (targetSection === "setlist" || targetSection === "tunelist") {

    if (currentSection === "playalong") {

      hidePlayAlongEls();
      showLaunchers();
    }

    launchTuneBook(targetSection, currentSection, itemQuery);
    return;
  }

  updateAppSectionTitle(targetSection);

  // Open Playalong from Launch Screen

  if (targetSection === "playalong") {

    hideLaunchers();
    launchPlayAlong();
    return;
  }

  // Switch to Launch Screen by default

  showLaunchers();

  if (currentSection === "playalong") {

    hidePlayAlongEls();
    document.querySelector("#nss-launch-playalong").focus();
  }

  return;
}

// Load previous or next Tunebook item depending on data-load type

export function switchTuneBookItem(loadDir) {

  const currentTuneBook = checkTuneBookSetting() === "setlist"? tuneSets : tuneList;

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

// Show or hide switch buttons depending on target data type

function swapSwitchBtns(targetSection) {

  if (isCompactTunebookModeOn) return;

  allSwitchBtn.forEach(switchBtn => {

    if (switchBtn.dataset.load === "launcher") return;

    if (switchBtn.dataset.load !== targetSection) {

      ariaShowMe(switchBtn);

    } else {
      
      ariaHideMe(switchBtn);
    }
  });
}

// Switch Tunebook between the default Desktop and Mobile Mode optimized for smaller screens

function switchTunebookMode(targetMode) {

  if (targetMode === "mobile-switch") {

    document.body.dataset.mode = "mobile";
    
    displayNotification("Mobile mode enabled", "success");
    // displayNotification("Mobile mode enabled: Double tap on tune to play, long press to rewind", "success");

    resetViewportWidth();

    appWindowResizeHandler();
  }

  if (targetMode === "desktop-switch") {

    document.body.dataset.mode = "desktop";

    displayNotification("Desktop mode enabled", "success");
    // displayNotification("Desktop mode enabled: Navigate between items in header, use ABC Tools buttons for playback", "success");

    if (getViewportWidth() < 880) resetViewportWidth(880);

    appWindowResizeHandler();
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

  if (dataType === "list-viewer") {

    openListViewer(document.querySelector('#tuneSelector'));
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

  if (msgType === "status") {
    
    notificationTimeoutId = setTimeout(() => {

      notificationPopup.hidePopover();
    }, 2500);

    return;
  }

  if (msgType === "success") {
    
    notificationTimeoutId = setTimeout(() => {

      notificationPopup.hidePopover();
    }, 4500);

    return;
  }
}

// Show a warning outline around the target button

export function displayWarningEffect(focusBtn) {

  if (!focusBtn) return;

  if (focusBtn !== document.activeElement) focusBtn.focus();

  focusBtn.style.outline = "0.17rem solid red";
  focusBtn.style.filter = "drop-shadow(1px 1px 8px red)";

  setTimeout(() => {

    focusBtn.style.removeProperty('outline');
    focusBtn.style.removeProperty('filter');
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

  if (abcContainer && !abcContainer.hasAttribute("hidden")) {

    isTuneBookOpen = true;
  }

  return isTuneBookOpen;
}

// Return true if app is currently in mobile mode

export function checkIfMobileMode() {

  return document.body.dataset.mode === "mobile";
}

// Reset Tunebook dropdown menus without reinitializing ABC Tools

export function refreshTuneBook(isSoftRefresh, itemQuery) {

  const currentTuneBook = checkTuneBookSetting() === "setlist"? tuneSets : tuneList;

  // Repopulate Tunebook selectors and reset all menus and active filters

  if (!isSoftRefresh) {

    resetTuneBookMenus();
    resetTuneBookFilters();

    populateTuneSelector(currentTuneBook);
    populateFilterOptions(sortFilterOptions(currentTuneBook));

    console.log(`NS Session App:\n\nTunebook has been refreshed`);
  }

  // Load a Tunebook item using query params

  if (itemQuery) {

    setTimeout(() => {
      
      loadFromQueryString(itemQuery);

    }, 150);

    return;
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

export function resetTuneBookFilters() {

  // Clear existing filter query, refreshing the page

  if (window.location.hash.includes("?filter=")) {

    const currentSection = checkTuneBookSetting();
    window.location.hash = `#${currentSection}`;

    return;
  }

  // Reset filters without refreshing the page

  const tuneGroups = tuneSelector.querySelectorAll(':scope > optgroup');
  const tuneOptions = tuneSelector.querySelectorAll('optgroup > *');

  [tuneGroups, tuneOptions].forEach(tuneSelectorItem => {

    tuneSelectorItem.forEach(item => {
          
      item.removeAttribute("hidden");
      item.removeAttribute("disabled");
    });
  });
}

// Update text content on page depending on section being revealed

function updateAppSectionTitle(targetSection) {

  if (targetSection === "launcher" || targetSection === "playalong") {

    appNavTitle.dataset.title = targetSection;
    return;
  }

  if (targetSection === "setlist" || targetSection === "tunelist") {

    tuneSelectorTitle.textContent = 
    targetSection === "tunelist"? "\u{1F3B5} Select a TUNE" :
    "\u{1F3BC} Select a SET";
  
    tuneBookTitle.dataset.type = targetSection === "setlist"? "Set" : "Tune";
    tuneBookTitle.setAttribute("aria-title", `Novi Sad Session ${tuneBookTitle.dataset.type}list`);
    return;
  }
}

////////////////////////////////
// FETCHERS & DATA HANDLERS
///////////////////////////////

// Fetch Session DB data

async function tuneDataFetch() {

  try {

    const tuneDataSize = await updateDataJsons();

    if (!tuneDataSize[0]) {

      return null;
    }

    console.log(`NS Session App:\n\nSession DB items (${tuneDataSize[0]} sets, ${tuneDataSize[1]} tunes) successfully fetched and pushed to data JSONs`);
    
    if (localStorageOk() && +localStorage.tuneBookShowStatusReport === 1) {

      displayNotification(`App version: v.${APP_VERSION}; Session DB: ${DB_VERSION} (${tuneDataSize[0]} sets, ${tuneDataSize[1]} tunes)`, "report");
    }
    
    return tuneDataSize[0];

  } catch (error) {

    console.warn(`NS Session App:\n\nLaunching app sequence failed. Details:\n\n${error.message}`);

    window.location.hash = "#launcher";

    return null;
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

    if (error.message.startsWith("NetworkError") ||
        error.message.includes("Failed to fetch") || error.cause?.status) {

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

// Hide Playalong elements

function hidePlayAlongEls() {

  allPlayAlongEls.forEach(playAlongEl => {

    ariaHideMe(playAlongEl);
  });
}

// Show Playalong elements

function showPlayAlongEls() {

  allPlayAlongEls.forEach(playAlongEl => {

    ariaShowMe(playAlongEl);
  });
}

// Hide Tunebook elements

function hideTuneBookEls() {

  allTuneBookEls.forEach(tuneBookEl => {

    ariaHideMe(tuneBookEl);
  });
}

// Show Tunebook elements

function showTuneBookEls() {

  allTuneBookEls.forEach(tuneBookEl => {

    ariaShowMe(tuneBookEl);
  });
}

////////////////////////////////
// EVENT HANDLERS
////////////////////////////////

// Handle custom button click events

async function appButtonHandler(btn) {

  if (btn.hasAttribute('data-cvw-action') || btn.hasAttribute('data-lvw-action')) {

    return;
  }

  // Full Screen Buttons: View sections in fullscreen mode

  if (btn.dataset.load && btn.dataset.load === "fullscreen-view") {

    handleFullScreenButton(btn.dataset.load);
    return;
  }

  // Mode Togglers: Switch between Desktop and Mobile Tunebook mode

  if (btn.dataset.controls && btn.dataset.controls === "mode" && btn.dataset.type) {

    switchTunebookMode(btn.dataset.type);
    return;
  }

  // Launch Buttons: Run section Launcher depending on data type

  if (btn.classList.contains('nss-btn-launch')) {

    if (btn.dataset.load === "setlist" || 
        btn.dataset.load === "tunelist" || 
        btn.dataset.load === "playalong") {

      window.location.hash = `#${btn.dataset.load}`;
      return;
    }

    // Handle ABC Encoder buttons

    if (btn.dataset.load.startsWith("abc")) {
      
      parseAbcFromFile(btn.dataset.load, btn);
      return;
    }
  }

  // Switch Buttons: Load and swap section content depending on data type

  if (btn.classList.contains('nss-switch-btn')) {

    // Page switchers

    if (btn.classList.contains('nss-launcher-link')) {

      window.location.href = 'index.html';

      return;
    }

    // Tune switchers

    if (btn.classList.contains('nss-arrow-btn')) {

      switchTuneBookItem(btn.dataset.load);
      
      return;
    }

    // Zoom in and zoom out

    if (btn.classList.contains('nss-zoom-btn')) {

      zoomTuneBookItem(btn.dataset.load);
      
      return;
    }

    // GUI switchers

    if (btn.dataset.load.startsWith("toggle-gui")) {

      toggleFullScreenGui(btn.dataset.load);

      return;
    }

    // Full Screen switchers

    if (btn.dataset.load === "exit-fullscreen") {

      exitFullScreenMode();
      
      return;
    }

    // Tunebook switchers >>>
    // Hash change triggers switchAppSection

    window.location.hash = `#${btn.dataset.load}`;
    return;
  }

  // Options Buttons: Load settings or dialogue menus

  if (btn.classList.contains('nss-option-btn')) {

    // Prompt file selection menu for Session Survey Data

    if (btn.dataset.load === "session-survey") {

      parseSessionSurveyData(btn);
      return;
    }

    // Copy share link to current Tunebook item to clipboard

    if (btn.dataset.load === "share-link") {

      copyTextToClipboard(getShareLink());
      return;
    }

    // Close options menu if button pressed again

    if (btn.dataset.load === "app-options" || btn.dataset.load === "encoder-options") {

      if (appOptionsPopover.matches(':popover-open')) {

        appOptionsPopover.hidePopover();
        return;
      }
    }

    // Open the associated menu by default

    openSettingsMenu(btn.dataset.load);
  }

  if (btn.classList.contains('nss-btn-advanced-options')) {

    btn.style.display = "none";

    ariaShowMe(advancedOptions);
    return;
  }

  // Control Buttons: Open additional menus and modify settings

  if (btn.classList.contains('nss-control-btn')) {


  }

  // Close Buttons: Hide parent element, show alternative navigation

  if (btn.dataset.controls === "tunebook-compact-mode") {

    const tuneBookFooter = document.querySelector('#nss-tunebook-footer');
    const switchContainer = document.querySelector('.nss-switch-container');
    const allSwitchBtns = switchContainer.querySelectorAll('.nss-switch-btn');

    ariaHideMe(tuneBookFooter);

    isCompactTunebookModeOn = true;

    allSwitchBtns.forEach(switchBtn => {

      if (switchBtn.dataset.load !== "launcher") {

        ariaHideMe(switchBtn);
        return;
      }

      ariaShowMe(switchBtn);
    });

    document.querySelector('#nss-tunebook-exit').focus();
    tuneBookFooter.setAttribute("inert", "");

    displayNotification("Compact mode enabled: Top left button to exit, refresh app to reset", "success");

    return;
  }

  if (btn.classList.contains('popover-btn-x')) {

    appOptionsPopover.hidePopover();
    return;
  }

  if (btn.classList.contains('popup-btn-x')) {

    btn.parentElement.parentElement.hidePopover();
    return;
  }

  // Theme buttons: Change color theme of document depending on the section

  if (btn.classList.contains('nss-theme-btn')) {

    const appSectionHeader = btn.parentElement.classList;

    allThemeBtn.forEach(themeBtn => {

      if (themeBtn.parentElement.classList === appSectionHeader &&
          themeBtn.classList.contains(`nss-btn-${btn.dataset.theme}`)) {

        themeBtn.removeAttribute("inert");
        ariaShowMe(themeBtn);
        themeBtn.focus();
      }
    });

    ariaHideMe(btn);
    btn.setAttribute("inert", "");
    return;
  }
}

// Handle custom checkbox events

async function appCheckBoxHandler(checkBox) {

  if (+localStorage[checkBox.dataset.option] > 0) {

    localStorage[checkBox.dataset.option] = 0;

  } else {

    localStorage[checkBox.dataset.option] = 1;
  } 

  if (checkBox.id === 'tunebook-use-mobile-mode') {

    if (checkBox.checked) {

      displayNotification("Persistent mobile mode enabled", "success");
      
    } else {

      displayNotification("Persistent mobile mode disabled", "success");
    }
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

  displayNotification(`Tunebook filtered by "${filterId}"`, "status");

  tuneSelector.focus();
}

// Handle automatic renaming of Tunebook selector labels in Mobile Mode

export function handleSelectorLabels(actionType, parentSelector, selectedIndex) {

  if (document.body.dataset.mode === "desktop" && actionType !== "init") return;

  const filterHeader = filterOptions.options[0];
  const tunesHeader = tuneSelector.options[0];
  const tabsHeader = displayOptions.options[0];

  const tuneBookSelectors = ['filterOptions', 'tuneSelector', 'displayOptions'];
  const tuneBookSelectorHeaders = [filterHeader, tunesHeader, tabsHeader];

  const newSelectorLabels = ['✨', '🎼', '🎹'];

  if (actionType === "init") {

    if (getViewportWidth() > 768 || document.body.dataset.mode === "desktop") {
      
      removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders);
      return;
    }

    if (document.body.dataset.mode === "mobile") {
      
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

    if (selectedIndex !== 0 || document.body.dataset.mode === "desktop" || getViewportWidth() > 768) return;

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

  if (document.body.dataset.mode === "mobile" &&
      (viewPortW < 880 || viewPortH <= 768)) {

    document.documentElement.style.fontSize = adjustHtmlFontSize(viewPortW, viewPortH);
  
  // Otherwise clear the previously set font-size value

  } else if (document.documentElement.style.fontSize) {

    document.documentElement.style.removeProperty('font-size');
  }

  // Dynamically switch between desktop and mobile mode in main app menu
  // If Tunebook menu is currently hidden, do nothing else

  if (!checkIfTunebookOpen()) { 
    
    initAppMode();
    return; 
  }

  // Handle Tunebook adjustments >>>

  // Change Tunebook selector labels

  handleSelectorLabels("resize");

  // If app is in mobile mode, do not adjust viewport

  if (checkIfMobileMode()) return;

  // If app is in desktop mode, see if viewport needs to be adjusted

  const viewPortMeta = document.querySelector("meta[name=viewport]");
  const isFixedViewport = viewPortMeta.getAttribute("content") !== "width=device-width, initial-scale=1.0";

  // If Tunebook is displayed in desktop mode on a wide screen, do nothing
  // This includes resized desktop browser windows

  if (window.outerWidth > 880 && !isFixedViewport) return;

  // If Tunebook is displayed in desktop mode on a narrow screen, switch to fixed viewport

  if (window.outerWidth < 880 && getViewportWidth() < 880 && !isFixedViewport) {

    resetViewportWidth(880);
    return;
  }

  // If Tunebook is displayed in fixed viewport mode on a wide screen, reset viewport
  // This applies to resize events fired when a device with wide and narrow screen is turned

  if (window.outerWidth > 880 && isFixedViewport) {

    resetViewportWidth();
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

    document.querySelector('#fullScreenButton').focus();

    return;
  }
}

// Handle all app click events

function appWindowClickHandler(event) {

  const interactableEl = 'button, select, input[type="checkbox"], input[type="radio"]';

  const triggerEl = event.target.closest(interactableEl);

  if (!triggerEl) return;

  const elTag = triggerEl.tagName.toLowerCase();

  // Handle all button clicks

  if (elTag === 'button') {

    appButtonHandler(triggerEl);
  }

  // Handle checkbox clicks

  if (elTag === 'input' & triggerEl.type === "checkbox") {

    appCheckBoxHandler(triggerEl);
  }
}

////////////////////////////////
// ROUTERS & HASH MANIPULATORS
///////////////////////////////

// Handle app's hash routing
// Switch app section after hashchange event is fired
// Switch app section after page is loaded with matching hash name

function appRouter() {

  const path = window.location.pathname;

  // Handle pages outside of main app module

  if (path !== "/" &&
      path !== "/index.html" && 
      path !== "/NS-Session-Setlist/" && 
      path !== "/NS-Session-Setlist/index.html") return;

  const urlHash = window.location.hash;

  // Handle no hash in URL

  if (!urlHash) {

    window.location.hash = "#launcher";

    lastAppSectionOpened = "launcher";
    
    return;
  }

  const inputHashQuery = urlHash.slice(1);

  const appSections = ["launcher", "setlist", "tunelist", "playalong"];

  // Handle hashes with section name and no query

  if (appSections.includes(inputHashQuery)) {

    switchAppSection(inputHashQuery, lastAppSectionOpened);
    
    lastAppSectionOpened = inputHashQuery;

    return;

  // Handle hashes with invalid section name and no query

  } else if (!inputHashQuery.includes("?")) {

    console.warn(`NS Session App:\n\nInvalid section hash in user query`);

    let currentSection = checkIfTunebookOpen()? tuneBookSetting : "launcher";

    window.location.hash = `#${currentSection}`;
    
    return;
  }

  // Handle hashes with query

  if (inputHashQuery.includes("?")) {

    let parentSection = 
      inputHashQuery.startsWith("setlist?")? "setlist" :
      inputHashQuery.startsWith("tunelist?")? "tunelist" : undefined;

    // Handle hashes with invalid section name

    if (!parentSection) {

      console.warn(`NS Session App:\n\nInvalid section hash in user query\n\nQuery params are supported in setlist and tunelist`);
      displayNotification("Invalid query provided, check input URL", "warning");
      return;
    }

    // Handle hashes with valid section name

    const itemQuery = inputHashQuery.split('?')[1];

    switchAppSection(parentSection, lastAppSectionOpened, itemQuery);

    lastAppSectionOpened = parentSection;
  }

  return;
}

// Handle routing on initial app load

function appRouterOnLoad() {

  const path = window.location.pathname;

  // Handle pages outside of main app module

  if (path !== "/" &&
      path !== "/index.html" && 
      path !== "/NS-Session-Setlist/" && 
      path !== "/NS-Session-Setlist/index.html") return;

  let initialHash = window.location.hash;

  // Redirect to Launch Screen if app has never been initialized
  // Redirect to Launch Screen if opening sections by direct link on load is not allowed

  if (initialHash && localStorageOk() && 
    (!localStorage.tuneBookInitialized_NSSSAPP ||
    +localStorage.tuneBookAllowLoadFromHashLink === 0)) {

    console.log(`NS Session App:\n\nHash routing is being blocked\n
    Hash links loading on startup allowed? [${!!+localStorage.tuneBookAllowLoadFromHashLink}]\n
    Tunebook previously initialized? [${!!+localStorage.tuneBookInitialized_NSSSAPP}]`);

    window.location.hash = "#launcher";

    lastAppSectionOpened = "launcher";

    initAppRouter();
    return;
  }
  
  initAppRouter();

  window.location.hash = '';
  window.location.hash = initialHash || "#launcher";
}

// Initialize app's hash routing

function initAppRouter() {

  window.addEventListener('hashchange', appRouter);
}

// Create a string of query parameters depending on query type
// Return null if any required parameter is missing

function createQueryString(optionText, optionType) {

  let queryString = '';

  if (optionType === "tunebook-item") {

    const optionType = optionText.toLowerCase().split(':')[0];
    const optionName = optionText.toLowerCase().split(':')[1];

    if (!optionType || !optionName) return;

    const itemTypeQuery = sanitizeQueryParam(optionType);
    const itemNameQuery = sanitizeQueryParam(optionName);

    queryString = `?type=${itemTypeQuery}&name=${itemNameQuery}`;
  }

  if (optionType === "tunebook-filter") {

    const filterName = optionText.toLowerCase();

    if (!filterName) return;

    const filterNameQuery = sanitizeQueryParam(filterName);

    queryString = `?filter=${filterNameQuery}`;
  }

  return queryString;
}

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

function detectCyrillicRusChars(rawString) {

  const hasCyrillicRusChars = new RegExp(`[\u0401\u0451\u0410-\u044f]`, "g");

  if (rawString.match(hasCyrillicRusChars)) return true;

  return false;
}

// Transliterate Cyrillic characters using custom character map
// Preprocess string to account for certain vowel combinations

function convertCyrillicToTranslit(rawString) {

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

// Create a share link for Tunebook item or filter

function getShareLink(optionType) {

  let shareLink = '';

  // Return share link to ABC Tools if relevant setting is on

  if (localStorageOk() && +localStorage.tuneBookShareLinksToAbcTools === 1) {

    return tuneSelector.value || getLastTunebookUrl();
  }

  // Define variants of placeholder option text

  const placeHolderText = /select|pick a|filter by/;

  // Get selected Tunebook item name by default, get filter name if specified

  let optionText = 
    optionType === "tunebook-filter"? filterOptions.selectedOptions[0].text.slice(2) : 
      tuneSelector.selectedOptions[0].text;

  let isValidTitle = optionText && !optionText.toLowerCase().match(placeHolderText);

  // Try several fallback options if item title is invalid

  if (!isValidTitle) {

    const filterText = filterOptions.selectedOptions[0].text;

    if (!optionType && filterText && !filterText.toLowerCase().match(placeHolderText)) {

      // Continue with filter title if no Tunebook item selected

      optionText = filterText.slice(2);
      optionType = "tunebook-filter";

    } else if (optionType !== "tunebook-filter") {

      // Return share link to ABC Tools if no filter and item selected

      return tuneSelector.value || getLastTunebookUrl();

    } else {

      // Signal empty input if no fallback applies

      return null;
    }
  };

  // Return Tunebook item link with hash query

  const baseUrl = window.location.href.split('?')[0];

  const queryString = createQueryString(optionText, optionType || "tunebook-item");

  if (!baseUrl || !queryString) return null;

  shareLink = `${baseUrl}${queryString}`;

  return shareLink;
}

// Copy input text to clipboard using Clipboard API

async function copyTextToClipboard(inputText) {

  if (!navigator.clipboard && inputText) {

    displayNotification(inputText, "report");
    console.log(`NS Session App:\n\nThis browser does not support Clipboard API. Displaying text in status bar...`);
    return;
  }

  if (!inputText) {

    displayNotification("Select an item to share", "warning");
    console.log(`NS Session App:\n\nNo text copied to clipboard, input string missing or empty`);
    return;
  }

  try {

    navigator.clipboard.writeText(inputText);

    displayNotification("Copied to clipboard", "status");
    console.log(`NS Session App:\n\nText copied to clipboard:\n\n${inputText}`);

  } catch(error) {

    displayNotification("Could not copy to clipboard", "warning");
    console.warn(`NS Session App:\n\nError trying to copy text to clipboard`);
  }
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

// Initialize app mode based on viewport width

function initAppMode() {

  if (getViewportWidth() < 880 || getViewportHeight() <= 768) {

    document.body.dataset.mode = "mobile";

  } else {

    document.body.dataset.mode = "desktop";
  }
}

// Initialize Tunebook mode based on 

function initTunebookMode() {

  const viewPortW = getViewportWidth();
  const viewPortH = getViewportHeight();

  if ((lastTuneBookMode !== "desktop" && 
      (lastTuneBookMode === "mobile" || viewPortW < 880 || viewPortH <= 768)) || 
      (localStorageOk() && +localStorage.tuneBookAlwaysUseMobileMode === 1)) {

    document.body.dataset.mode = "mobile";

    document.documentElement.style.fontSize = adjustHtmlFontSize(viewPortW, viewPortH);    

  } else {
    
    document.body.dataset.mode = "desktop";

    document.documentElement.style.removeProperty('font-size');
  }
}

// Listen to Full Screen mode events in browsers supporting Fullscreen API

function initFullScreenEvents() {

  if (!document.body.requestFullscreen && 
      !document.body.webkitRequestFullscreen && 
      !document.body.mozRequestFullScreen &&
      !document.body.msRequestFullscreen) {

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

  initFullScreenEvents();
}

// Initialize event listeners and settings on Launch Screen load

document.addEventListener('DOMContentLoaded', () => {

  initPopoverWarning();
  initWindowEvents();
  initAppSettings();
  initChordViewer();
  initListViewer();
  appRouterOnLoad();

  console.log(`NS Session App:\n\nLaunch Screen initialized`);
});