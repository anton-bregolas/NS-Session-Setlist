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
const listViewerFooter = document.querySelector('[data-list-viewer="footer"]');
const listViewerSetBtn = document.querySelector('[data-lvw-action="create-set"]');

// Define List Viewer Slider settings

const hInitVal = 70 // Global initial value for tiles height (em*10)
const minHVal = 22; // Minimum tile hight value (em*10)

// Set global variables

let lastFilterText = 'None'; // Keep track of the last filter text loaded to title
let selectedCounter = 0; // Keep track of the number of tile items selected
let lastFocusedIndex = -1; // Keep track of the last focused tile item index
let lastSelectedIndex = -1; // Keep track of the last selected tile item index
let searchKeysPressed = '' // Accumulate the characters entered for tune search
let typeAheadTimeoutId; // Re-record latest timeout for clearing type-ahead search
let titleStatusTimeoutId; // Keep track of the latest timeout set for clearing status

const indexedTilesArr = [];

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

  const filterArr = [];

  const currentFilter = filterOptions?.options[filterOptions.selectedIndex];
  let currentFilterText = currentFilter? currentFilter.text : '';
  let currentFilterType = currentFilter? currentFilter.parentElement?.label : '';

  if (!currentFilterText || currentFilterText.toLowerCase().match(placeHolderText)) {

    currentFilterText = "None";
  }

  if (currentFilterType) {

    currentFilterType =
      currentFilterType.toLowerCase().includes("tune type")? "type" : 
      currentFilterType.toLowerCase().includes("set leader")? "leader" : 
      "other";
  }

  filterArr[0] = currentFilterText;
  filterArr[1] = currentFilterType;

  // Create Tune Tiles grid, populate it with items from Tunes Array

  loadTuneTiles(tunesArr, filterArr);
  lastFilterText = currentFilterText;

  // Display List Viewer Dialog & initialize tiles height slider

  listViewerDialog.showModal();
  initDialogSlider();
}

///////////////////////////////////
// TILES DISPLAY FUNCTIONS
//////////////////////////////////

// Create responsive grid layout with tune tiles inside List Viewer Dialog

function loadTuneTiles(tunesArr, filterArr) {

  let listViewerTitleText = `Filters: ${filterArr[0]}`;

  // if (listViewerTitle.textContent === listViewerTitleText) {

  //   return;
  // }

  listViewerTitle.textContent = '';
  listViewerTiles.textContent = '';
  indexedTilesArr.length = 0;
  lastFocusedIndex = -1;

  listViewerTitle.textContent = listViewerTitleText;

  tunesArr.forEach(tune => {
      
    if (!tune.title || !tune.url || !tune.index) return;

    const tileTitleSpan = document.createElement('span');
    const setCounterSpan = document.createElement('span');
    const tuneItem = document.createElement('li');

    let tuneItemText =
      filterArr[1] && filterArr[1] === "type"?
      tune.title.replace(/^[A-Z ]*:[ ]*/, '') :
      tune.title.includes(':')? `${tune.title.split(':')[1].trim()} [${tune.title.split(':')[0]}]` :
      tune.title;

    tileTitleSpan.textContent = tuneItemText;
    tileTitleSpan.dataset.listViewer = "tune-tile-title";
    setCounterSpan.dataset.listViewer = "set-counter";

    tuneItem.dataset.listViewer = "tune-tile";
    tuneItem.dataset.lvwAction = "load-item";
    tuneItem.classList = "flex-center";
    tuneItem.dataset.url = tune.url;
    tuneItem.dataset.index = tune.index;

    tuneItem.setAttribute("role", "option");
    tuneItem.setAttribute("tabindex", "-1");
    tuneItem.setAttribute("aria-selected", "false");

    tuneItem.appendChild(tileTitleSpan);
    tuneItem.appendChild(setCounterSpan);
    
    listViewerTiles.appendChild(tuneItem);

    indexedTilesArr.push(
      {
        tuneItem,
        title: tuneItemText
      }
    );
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

      listViewerDialog.style.setProperty("--tiles-height", `${valueH / 10}em`);
    }
  }
}

// Handle List Viewer exit

function quitListViewer() {

  listViewerDialog.querySelector('[data-list-viewer="body"]').scrollTo(0,0);

  resetSetMakerMode();
  toggleSetMakerGui();

  listViewerDialog.close();

  const focusElem =
    getFirstCurrentlyDisplayedElem(launchEls) ?? altFocusBtn;

  focusElem.focus();
}

///////////////////////////////////
// SET MAKER FUNCTIONS
//////////////////////////////////

// Select or deselect a Set item from the list:
// Mark the item as selected with data-attribute
// Display the numbered Set item counter tag
// Renumber the existing Set item counters

function toggleSetMakerSelection(item) {

  if (!item.hasAttribute("aria-selected")) return;

  const counter =
    item.querySelector('[data-list-viewer="set-counter"]');

  if (item.getAttribute("aria-selected") === "true") {

    item.setAttribute("aria-selected", "false");
    item.style.removeProperty('outline');

    const counterVal = +counter.dataset.lvwCounter;
    recalcSetMakerCounters(counterVal);

    counter.removeAttribute("data-lvw-counter");
    selectedCounter--;

    if (selectedCounter < 2 && listViewerFooter.hasAttribute("data-set-maker"))
      listViewerFooter.removeAttribute("data-set-maker");

    return;
  }

  item.setAttribute("aria-selected", "true");
  item.style.outline = "0.2em solid var(--set-counter-color)";
  counter.setAttribute("data-lvw-counter", selectedCounter + 1);
  selectedCounter++;

  if (selectedCounter === 2)
    listViewerFooter.setAttribute("data-set-maker", "ready");
}

// Recalculate values of Set item counters after an item is deselected

function recalcSetMakerCounters(fromCounterVal) {

  const setCounters = 
    document.querySelectorAll('[data-lvw-counter]');

  if (setCounters.length <= 1 ||
      setCounters.length === fromCounterVal)
    return;

  setCounters.forEach(counter => {

    const counterVal = +counter.dataset.lvwCounter;

    if (counterVal > fromCounterVal) {

      counter.dataset.lvwCounter = counterVal - 1;
    }
  });
}

// Show or hide Set Maker UI elements

function toggleSetMakerGui() {

  const startSetMakerBtn =
    document.querySelector('[data-lvw-action="start-set-maker"]');

  const returnListViewerBtn =
    document.querySelector('[data-lvw-action="return-list-viewer"]');

  if (listViewerDialog.dataset.setMaker === "on") {

    ariaHideMe(startSetMakerBtn);
    startSetMakerBtn.setAttribute("inert", "");
    returnListViewerBtn.removeAttribute("inert");
    ariaShowMe(returnListViewerBtn);

    listViewerTiles.setAttribute("aria-multiselectable", "true");
    listViewerTiles.focus();
    return;
  }

  ariaHideMe(returnListViewerBtn);
  returnListViewerBtn.setAttribute("inert", "");
  startSetMakerBtn.removeAttribute("inert");
  ariaShowMe(startSetMakerBtn);

  listViewerTiles.removeAttribute("aria-multiselectable");
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

  selectedCounter = 0;
  lastSelectedIndex = -1;

  const selectedTiles =
    listViewerTiles.querySelectorAll('[aria-selected="true"]');

  selectedTiles.forEach(tile => {

    const counter =
      tile.querySelector('[data-list-viewer="set-counter"]');

    tile.style.removeProperty("outline");
    counter.removeAttribute("data-lvw-counter");
    tile.setAttribute("aria-selected", "false");
  });
  
  listViewerTiles.removeAttribute("aria-multiselectable");
  listViewerFooter.removeAttribute("data-set-maker");
  listViewerDialog.dataset.setMaker = "off";
}

///////////////////////////////////
// LIST VIEWER INIT FUNCTIONS
//////////////////////////////////

// Initialize List Viewer Dialog

export function initListViewer() {

  if (!listViewerDialog) return;

  listViewerDialog.addEventListener('click', handleListViewerClick);
  listViewerDialog.addEventListener('keydown', handleListViewerKeyPress);
  listViewerTiles.addEventListener('focus', handleTilesListBoxFocus);
  listViewerTiles.addEventListener('keydown', handleTilesKeyboardNavigation);

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

  if (elAction === 'load-item' && listViewerDialog.dataset.setMaker === "on") {

    toggleSetMakerSelection(actionTrigger);

    return;
  }

  if (elAction === 'load-item' && listViewerDialog.dataset.setMaker === "off") {

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

    const listViewerTileItems =
      [...listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"]')];

    if (listViewerTileItems.length < 2) {

      displaySetMakerTitleStatus("❌ You need 2+ items 👇", `Filters: ${lastFilterText}`);
      return;
    }

    listViewerDialog.dataset.setMaker = "on";
    listViewerTitle.textContent = "🎶 Select 2+ items 👇";
    toggleSetMakerGui();

    return;
  }

  if (elAction === 'create-set') {

    //
  }

  if (elAction === 'close-list-viewer') {

    quitListViewer();
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

  listViewerDialog.style.setProperty("--tiles-height", `${valueH / 10}em`);

  // Listen to slider input events

  listViewerSlider.addEventListener('input', appTileHeightSliderHandler);
}

// Handle List Viewer tune tiles listbox receiving focus
// Focus on the first tile item by default

function handleTilesListBoxFocus(e) {

  if (e.target === listViewerTiles) {

    if (lastFocusedIndex === -1) {

      const firstTileItem =
        listViewerTiles.querySelector('[data-list-viewer="tune-tile"]');
      
      firstTileItem?.focus();

      return;
    }

    const allTileItems =
    [...listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"]')];

    allTileItems[lastFocusedIndex].focus();
  }
}

///////////////////////////////////
// LIST VIEWER KEYBOARD NAVIGATION
//////////////////////////////////

// Handle key presses when List Viewer Dialog is open

function handleListViewerKeyPress(e) {

  // Handle Esc key pressed

  if (e.key === 'Escape') {

    e.preventDefault();
    quitListViewer();
  }

  // Handle type-ahead if letters or numbers pressed

  if (e.key.length === 1 && e.key.match(/[A-Za-z0-9]/)) {

    searchKeysPressed += e.key.toLowerCase();

    if (typeAheadTimeoutId) {

      clearTimeout(typeAheadTimeoutId);
    }

    typeAheadTimeoutId = setTimeout(() => {

      searchKeysPressed = '';
      typeAheadTimeoutId = null;
    }, 500);

    focusOnTypeAheadMatch(searchKeysPressed);
  }
}

// Handle keyboard navigation in the List Viewer tune tiles listbox

function handleTilesKeyboardNavigation(e) {

  // Handle Tab key pressed

  if (e.key === 'Tab') {

    e.preventDefault();

    // Tab to the previous UI element
    
    if (e.shiftKey) {

      const listViewerBtnX =
        document.querySelector('[data-lvw-action="close-list-viewer"]');

      listViewerBtnX.focus();
      return;
    }

    // Tab to the next UI element

    if (!listViewerSlider.hasAttribute("hidden")) {

      listViewerSlider.focus();

    } else {

      const sliderGuiBtn =
        document.querySelector('[data-lvw-action="toggle-gui"]');

      sliderGuiBtn.focus();
    }
    return;
  }

  const tiles =
    [...listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"]')];

  if (!tiles.length) return;

  const currentTile = document.activeElement;
  const currentIndex = tiles.indexOf(currentTile);
  
  // Handle "Ctrl + A" pressed (select all)

  if (e.ctrlKey && e.key.toUpperCase() === "A") {

    e.preventDefault();

    if (listViewerDialog.dataset.setMaker === "on") {

      tiles.forEach(tile => {

        if (tile.hasAttribute("aria-selected") && tile.getAttribute("aria-selected") === "false") {
          
          toggleSetMakerSelection(tile);
        }
      });
    }
    return;
  }

  // Handle arrow keys pressed (focus on tile)

  switch(e.key) {

    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowDown':
    case 'ArrowUp': {

      e.preventDefault();
      
      const nextIndex = e.key === 'ArrowDown' || e.key === 'ArrowRight'?
        Math.min(currentIndex + 1, tiles.length - 1) :
        Math.max(currentIndex - 1, 0);

      // Handle Shift pressed 

      if (e.shiftKey && listViewerDialog.dataset.setMaker === "on") {

        if (lastSelectedIndex === -1) lastSelectedIndex = currentIndex;
        
        const start = Math.min(lastSelectedIndex, nextIndex);
        const end = Math.max(lastSelectedIndex, nextIndex);
        
        tiles.forEach((tile, i) => {

          if (i >= start && i <= end && tile.getAttribute("aria-selected") === "false") {

            toggleSetMakerSelection(tile);
          }
        });
      }
      
      tiles[nextIndex].focus();
      lastFocusedIndex = nextIndex;
      break;
    }
    
    case 'Home':
      e.preventDefault();
      tiles[0].focus();
      lastFocusedIndex = 0;
      break;
      
    case 'End':
      e.preventDefault();
      tiles[tiles.length - 1].focus();
      lastFocusedIndex = tiles.length - 1;
      break;

    case 'Spacebar':
    case 'Enter':
    case ' ':
      e.preventDefault();

      if (currentTile) {

        currentTile.click();
        lastSelectedIndex = currentIndex;
      }

      break;

    default:

      break;
  }
}

// Search for an indexed title that starts with type-ahead string
// Start searching from after currently focused tile or from the top
// Focus on the tile with the title matching the search

function focusOnTypeAheadMatch() {
  
  if (!indexedTilesArr.length) return;

  let searchStartIndex = Math.max(0, lastFocusedIndex);

  let match = findMatchingTileObject(searchStartIndex + 1, indexedTilesArr.length);

  if (!match && searchStartIndex > 0) {

    match = findMatchingTileObject(0, searchStartIndex);
  }

  if (match) {
    match.tuneItem.focus();
    lastFocusedIndex = indexedTilesArr.indexOf(match);
  }
}

// Find an indexed title matching the current type-ahead string
// Limit the search to a range if start & end indices provided

function findMatchingTileObject(startIndex, endIndex) {

  if (startIndex && endIndex) {

    return indexedTilesArr.find(tileObj => 
      tileObj.title.toLowerCase().startsWith(searchKeysPressed));
  }

  for (let i = startIndex; i < endIndex; i++) {

    const item = indexedTilesArr[i];

    if (item.title.toLowerCase().startsWith(searchKeysPressed)) {

      return item;
    }
  }
  return null;
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
