////////////////////////////////////////////////////////////////////////
// Novi Sad Session List Viewer Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2025
////////////////////////////////////////////////////////////////////////

// Import function for checking whether localStorage is available and writeable

import { storageAvailable } from "./scripts-3p/storage-available/storage-available.js";

// Import custom functions handling warning messages, user notifications and focus on exit

import { displayWarningEffect, displayNotification, getFirstCurrentlyDisplayedElem } from "./scripts-nss-app.js";

// Import function for loading selected tune items into ABC Tools iframe

import { loadTuneBookItem } from "./scripts-abc-tools.js"

// Define required app elements

// Elements used to launch the viewer, first currently displayed gets focus on exit
const launchEls = document.querySelectorAll('[data-load="list-viewer"]');
// Fallback button receiving focus after viewer is closed
const altFocusBtn = document.querySelector('#fullScreenButton');
// Select element containing a list of Tune / Set options
const tuneSelector = document.querySelector('#tuneSelector');
// Select element containing a list of filter options
const filterOptions = document.querySelector('#filterOptions');

// Define variants of placeholder option text
const placeHolderText = /select|pick a|filter by/;

// Define List Viewer Dialog elements

const listViewerDialog = document.querySelector('[data-list-viewer="dialog"]');
const listViewerTitle = document.querySelector('[data-list-viewer="title"]');
const listViewerTiles = document.querySelector('[data-list-viewer="tiles-container"]');
const listViewerSlider = document.querySelector('[data-list-viewer="slider"]');

// Define List Viewer Slider settings
const hInitVal = 70 // Global initial value for tiles height (rem*10)
const minHVal = 22; // Minimum tile hight value (rem*10)

// Set global variables

let lastFilterText = 'None'; // Keep track of the last filter text loaded to title
let isSetMakerModeOn = false; // Keep track of the Set Maker mode status
let selectedCounter = 0; // Keep track of the number of Set items selected
let titleStatusTimeoutId; // Keep track of the latest timeout set for clearing status

///////////////////////////////////
// LIST VIEWER LAUNCH FUNCTIONS
//////////////////////////////////

// Open List Viewer launch sequence

export function openListViewer(selectList) {

  const tunesArr = [];

  // Fill Tunes Array, filter out disabled options and placeholder options

  for (let i = 0; i < selectList.options.length; i++) {

    const selectItem = selectList.options[i];

    if (!selectItem.hasAttribute("disabled") && !selectItem.text.toLowerCase().match(placeHolderText)) {

      const itemObj = { title: selectItem.text, url: selectItem.value, index: i }

      tunesArr.push(itemObj);
    }
  }

  // Get current Filter value, pass "None" if none found

  let currentFilter;

  currentFilter = filterOptions?.options[filterOptions.selectedIndex].text;

  if (!currentFilter || currentFilter.toLowerCase().match(placeHolderText)) {

    currentFilter = "None";
  }

  // Create Tune Tiles grid, populate it with items from Tunes Array

  loadTuneTiles(tunesArr, currentFilter);
  lastFilterText = currentFilter;

  // Display List Viewer Dialog & initialize tiles height slider

  listViewerDialog.showModal();
  initDialogSlider();
}

///////////////////////////////////
// TILES DISPLAY FUNCTIONS
//////////////////////////////////

// Create responsive grid layout with tune tiles inside List Viewer Dialog

function loadTuneTiles(tunesArr, currentFilter) {

  listViewerTitle.textContent = '';
  listViewerTiles.textContent = '';

  let listViewerTitleText = `Filters: ${currentFilter}`
  listViewerTitle.textContent = listViewerTitleText;

  tunesArr.forEach(tune => {
      
  if (!tune.title || !tune.url || !tune.index) return;

    const setCounterSpan = document.createElement('span');
    const tuneItemBtn = document.createElement('button');

    setCounterSpan.dataset.listViewer = "set-counter";

    tuneItemBtn.dataset.listViewer = "tune-tile";
    tuneItemBtn.dataset.lvwAction = "load-item";
    tuneItemBtn.classList = "btn-lvw flex-center";

    tuneItemBtn.textContent = tune.title;
    tuneItemBtn.dataset.url = tune.url;
    tuneItemBtn.dataset.index = tune.index;

    tuneItemBtn.appendChild(setCounterSpan);
    listViewerTiles.appendChild(tuneItemBtn);
  });
}

// Handle List Viewer Slider events

function appTileHeightSliderHandler(event) {

  // Handle slider value input event

  if (event.type === 'input') {

    let valueH = listViewerSlider.value;

    if (valueH < minHVal)
      valueH = minHVal;

    if (this === listViewerSlider) {

      // Remember tune tile height value

      if (isLocalStorageOk()) {

        localStorage.listViewerTilesHeightValue = valueH;
      }

      // Set tune tile height value

      listViewerDialog.style.setProperty("--tiles-height", `${valueH / 10}rem`);
    }
  }
}

///////////////////////////////////
// SET MAKER FUNCTIONS
//////////////////////////////////

// Select or deselect a Set item from the list:
// Mark the item as selected with data-attribute
// Display the numbered Set item counter tag
// Renumber the existing Set item counters

function toggleSetMakerSelection(item) {

  const counter = item.querySelector('[data-list-viewer="set-counter"]');

  if (counter.hasAttribute("data-lvw-selected")) {

    item.style.removeProperty('outline');

    const counterVal = +counter.dataset.lvwSelected;
    recalcSetMakerCounters(counterVal);

    counter.removeAttribute("data-lvw-selected");
    selectedCounter--;
    return;
  }

  item.style.outline = "0.2rem solid var(--set-counter-color)";
  counter.setAttribute("data-lvw-selected", selectedCounter + 1);
  selectedCounter++;
}

// Recalculate values of Set item counters after an item is deselected

function recalcSetMakerCounters(fromCounterVal) {

  const setCountersSelected = 
    document.querySelectorAll('[data-lvw-selected]');

  if (setCountersSelected.length <= 1 ||
      setCountersSelected.length === fromCounterVal)
    return;

  console.warn("recalc from", fromCounterVal)

  setCountersSelected.forEach(counter => {

    const counterVal = +counter.dataset.lvwSelected;

    if (counterVal > fromCounterVal) {

      counter.dataset.lvwSelected = counterVal - 1;
    }
  });
}

// Show or hide Set Maker UI elements

function toggleSetMakerGui() {

  const startSetMakerBtn =
    document.querySelector('[data-lvw-action="start-set-maker"]');

  const returnListViewerBtn =
    document.querySelector('[data-lvw-action="return-list-viewer"]');

  if (isSetMakerModeOn) {

    ariaHideMe(startSetMakerBtn);
    startSetMakerBtn.setAttribute("inert", "");
    returnListViewerBtn.removeAttribute("inert");
    ariaShowMe(returnListViewerBtn);
    returnListViewerBtn.focus();
    return;
  }

  ariaHideMe(returnListViewerBtn);
  returnListViewerBtn.setAttribute("inert", "");
  startSetMakerBtn.removeAttribute("inert");
  ariaShowMe(startSetMakerBtn);
  startSetMakerBtn.focus();
}

// Show a temporary status message in the List Viewer Dialog title
// Restore the previously shown status title text after a timeout

function displaySetMakerTitleStatus(titleStatus, lastStatus) {

  listViewerTitle.textContent = titleStatus;

  if (titleStatusTimeoutId)
    clearTimeout(titleStatusTimeoutId);

  titleStatusTimeoutId = setTimeout(() => {
    listViewerTitle.textContent = lastStatus;
  }, 3000);
}

// Reset all Set Maker mode settings to initial values

function resetSetMakerMode() {

  isSetMakerModeOn = false;
  selectedCounter = 0;

  const setCountersSelected = 
    document.querySelectorAll('[data-lvw-selected]');

  setCountersSelected.forEach(counter => {

    counter.removeAttribute("data-lvw-selected");
    counter.parentElement.style.removeProperty("outline");
  });

  listViewerDialog.dataset.setMaker = "off";
}

///////////////////////////////////
// LIST VIEWER INIT FUNCTIONS
//////////////////////////////////

// Initialize List Viewer Dialog

export function initListViewer() {

  if (!listViewerDialog) return;

  listViewerDialog.addEventListener('click', handleListViewerClick);

  if (isLocalStorageOk()) {

    if (localStorage.listViewerPrefersColorTheme === "light" ||
        (!localStorage.listViewerPrefersColorTheme && window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches)) {

        const lightThemeBtn = 
          document.querySelector('[data-lvw-action="toggle-theme"][data-theme="light"]');

        toggleColorTheme("light", lightThemeBtn);
    }

    if (+localStorage.listViewerHideGui) {

      ariaHideMe(listViewerSlider);
    }
  }
}

// Handle clicks on interactable List Viewer elements

function handleListViewerClick(event) {

  const actionTrigger = event.target.closest('[data-lvw-action]');

  if (!actionTrigger) return;

  const elAction = actionTrigger.dataset.lvwAction;

  if (elAction === 'load-item' && isSetMakerModeOn) {

    toggleSetMakerSelection(actionTrigger);

    return;
  }

  if (elAction === 'load-item' && !isSetMakerModeOn) {

    tuneSelector.selectedIndex = actionTrigger.dataset.index;

    tuneSelector.dispatchEvent(new Event('change'));

    listViewerDialog.close();
    return;
  }

  if (elAction === 'toggle-gui') {

    if (listViewerSlider.hasAttribute("hidden")) {

      ariaShowMe(listViewerSlider);

      if (isLocalStorageOk())
        localStorage.listViewerHideGui = 0;

      return;
    }

    ariaHideMe(listViewerSlider);

    if (isLocalStorageOk())
      localStorage.listViewerHideGui = 1;

    return;
  }

  if (elAction === 'toggle-theme') {

    const themeId = actionTrigger.dataset.theme;

    toggleColorTheme(themeId, actionTrigger);

    return;
  }

  if (elAction === 'return-list-viewer') {

    listViewerTitle.textContent = `Filters: ${lastFilterText}`;
    resetSetMakerMode();
    toggleSetMakerGui();
    return;
  }

  if (elAction === 'start-set-maker') {

    listViewerDialog.dataset.setMaker = "on";

    const listViewerTileItems = 
      listViewerTiles.querySelectorAll('[data-list-viewer="tiles-container"] > button');

    if (listViewerTileItems.length < 2) {

      displaySetMakerTitleStatus("❌ You need 2+ items 👇", `Filters: ${lastFilterText}`);
      return;
    }

    isSetMakerModeOn = true;
    listViewerTitle.textContent = "🎶 Select 2+ items 👇";
    
    toggleSetMakerGui();

    return;
  }

  if (elAction === 'close-list-viewer') {

    resetSetMakerMode();
    toggleSetMakerGui();

    listViewerDialog.close();

    const focusElem =
      getFirstCurrentlyDisplayedElem(launchEls) ?? altFocusBtn;

    focusElem.focus();

    return;
  }
}

// Initialize List Viewer slider using values from localStorage or default values

function initDialogSlider() {

  if (isLocalStorageOk()) {

    if (!localStorage.listViewerTilesHeightValue)
      localStorage.listViewerTilesHeightValue = hInitVal;
  }

  // Set default slider values to be applied on load

  let valueH = hInitVal;

  // Restore tile height value from localStorage (if available)

  if (isLocalStorageOk()) {

    if (localStorage.listViewerTilesHeightValue)
      valueH = localStorage.listViewerTilesHeightValue;
  }

  if (valueH < minHVal)
    valueH = minHVal;

  // Set initial tiles height value

  listViewerSlider.value = valueH;

  listViewerDialog.style.setProperty("--tiles-height", `${valueH / 10}rem`);

  // Listen to slider input events

  listViewerSlider.addEventListener('input', appTileHeightSliderHandler);
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

  const listViewerThemeBtns =

    listViewerDialog.querySelectorAll('[data-lvw-action="toggle-theme"]');

  listViewerDialog.className = themeId;

  listViewerThemeBtns.forEach(themeBtn => {

    if (themeBtn.classList.contains(`btn-${themeId}`)) {

      if (isLocalStorageOk()) {

        localStorage.listViewerPrefersColorTheme = themeId;
      }

      themeBtn.removeAttribute("inert");
      ariaShowMe(themeBtn);
      themeBtn.focus();
    }
  });

  ariaHideMe(triggerBtn);
  triggerBtn.setAttribute("inert", "");
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

// Get the first element in a NodeList that is currently displayed

// function getFirstCurrentlyDisplayedElem(nodeList) {

//   let foundEl = null;

//   for (let i = 0; i < nodeList.length; i++) {

//     if(!!nodeList[i].offsetParent) {

//       foundEl = nodeList[i];
//       break;
//     }
//   }

//   return foundEl;
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
