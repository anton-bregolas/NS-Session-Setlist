////////////////////////////////////////////////////////////////////////
// Novi Sad Session List Viewer Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2025
////////////////////////////////////////////////////////////////////////

// Import function for checking whether localStorage is available and writeable

import { storageAvailable } from "./scripts-3p/storage-available/storage-available.js";

// Import custom functions handling warning messages, user notifications and focus on exit

import { getFirstCurrentlyDisplayedElem } from "./scripts-nss-app.js";

// Import custom functions handling Tune <> Set conversions for Set Maker

import { makeTunesFromSets, sortFilterAbc } from "./scripts-abc-encoder.js";

// Import lz-string compression algorithm (for decoding & encoding ABC items)

import { LZString } from "./scripts-3p/lz-string/lz-string.min.js";

// Import function for loading selected tune items into ABC Tools iframe

import { loadTuneBookItem } from "./scripts-abc-tools.js"

// Define required app elements

// Elements used to launch the viewer, first currently displayed gets focus on exit
const launchEls = document.querySelectorAll('[data-load="list-viewer"]');
// Select element containing a list of Tune / Set options
const tuneSelector = document.querySelector('#tuneSelector');
// Select element containing a list of filter options
const filterOptions = document.querySelector('#filterOptions');

// Define variants of placeholder option text
const placeHolderText = /select|pick a|filter by/;

// Define List Viewer Dialog elements

const listViewerDialog = document.querySelector('[data-list-viewer="dialog"]');
const listViewerTitle = document.querySelector('[data-list-viewer="title"]');
const listViewerTitleBox = document.querySelector('[data-list-viewer="title-container"]');
const listViewerSearchInput = document.querySelector('[data-list-viewer="search-input"]');
const listViewerTiles = document.querySelector('[data-list-viewer="tiles-container"]');
const listViewerSlider = document.querySelector('[data-list-viewer="slider"]');
const listViewerFooter = document.querySelector('[data-list-viewer="footer"]');

// Define List Viewer Slider settings

const hInitVal = 70 // Global initial value for tiles height (em*10)
const minHVal = 22; // Minimum tile hight value (em*10)

// Set global variables

let isSliderInitialized = false; // Keep track of the slider initialization status
let lastFilterText = 'None'; // Keep track of the last filter text loaded to title
let selectedCounter = 0; // Keep track of the number of tile items selected
let lastFocusedIndex = -1; // Keep track of the last focused tile item index
let lastSelectedIndex = -1; // Keep track of the last selected tile item index
let lastTabKeyPressed = ''; // Keep track of the last Tab / Shift + Tab keys pressed
let searchKeysPressed = ''; // Accumulate the characters entered for tune search
let typeAheadTimeoutId; // Re-record latest timeout for clearing type-ahead search
let titleStatusTimeoutId; // Keep track of the latest timeout set for clearing status
let tileLongPressTimeoutId; // Keep track of the latest timeout set for tile long press

// Prepare arrays for iterating through tile items & titles

const tileItemsArr = [];
const tileTitlesArr = [];

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
  listViewerDialog.querySelector('[data-list-viewer="body"]').scrollTo(0,0);
  initDialogSlider();
}

///////////////////////////////////
// LIST VIEWER INIT FUNCTIONS
//////////////////////////////////

// Initialize List Viewer Dialog

export function initListViewer() {

  if (!listViewerDialog) return;

  listViewerDialog.addEventListener('click', handleListViewerClick);
  listViewerDialog.addEventListener('keydown', handleListViewerKeyPress);

  listViewerTiles.addEventListener('focusin', handleTilesListBoxFocusIn);
  listViewerTiles.addEventListener('mousedown', handleTilesMouseEvents);
  listViewerTiles.addEventListener('contextmenu', handleTilesMouseEvents);
  listViewerTiles.addEventListener('keydown', handleTilesKeyboardNavigation);

  listViewerTiles.addEventListener('touchstart', handleTilesTouchEvents);
  listViewerTiles.addEventListener('touchend', handleTilesTouchEvents);
  listViewerTiles.addEventListener('touchmove', handleTilesTouchEvents);

  listViewerSearchInput.addEventListener('input', handleSearchFilterInput);

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

  if (!isSliderInitialized) {

    listViewerSlider.addEventListener('input', appTileHeightSliderHandler);
    isSliderInitialized = true;
  }
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
  tileItemsArr.length = 0;
  tileTitlesArr.length = 0;
  lastFocusedIndex = -1;

  listViewerTitle.textContent = listViewerTitleText;

  tunesArr.forEach(tune => {
      
    if (!tune.title || !tune.url || !tune.index) return;

    const tileTitleSpan = document.createElement('span');
    const setCounterSpan = document.createElement('span');
    const tileItem = document.createElement('li');

    const tileItemText =
      filterArr[1] && filterArr[1] === "type"?
      tune.title.replace(/^[A-Z ]*:[ ]*/, '') :
      tune.title.includes(':')? `${tune.title.split(':')[1].trim()} [${tune.title.split(':')[0]}]` :
      tune.title;

    tileTitleSpan.textContent = tileItemText;
    tileTitleSpan.dataset.listViewer = "tune-tile-title";
    setCounterSpan.dataset.listViewer = "set-counter";

    tileItem.dataset.listViewer = "tune-tile";
    tileItem.dataset.lvwAction = "load-item";
    tileItem.dataset.longPress = "on";
    tileItem.classList = "flex-center";
    tileItem.dataset.url = tune.url;
    tileItem.dataset.index = tune.index;

    tileItem.setAttribute("role", "option");
    tileItem.setAttribute("tabindex", "-1");
    tileItem.setAttribute("aria-selected", "false");

    tileItem.appendChild(tileTitleSpan);
    tileItem.appendChild(setCounterSpan);
    
    listViewerTiles.appendChild(tileItem);

    tileItemsArr.push(tileItem);
    tileTitlesArr.push(tileItemText);
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

function quitListViewer(noFocus) {

  if (!listViewerSearchInput.hasAttribute("hidden")) { hideSearchFilterInput(); }
  
  listViewerDialog.querySelector('[data-list-viewer="body"]').scrollTo(0,0);

  resetSetMakerMode();
  toggleSetMakerGui();

  listViewerDialog.close();

  if (noFocus) return;

  const focusElem =
    getFirstCurrentlyDisplayedElem(launchEls) ?? tuneSelector;

  focusElem.focus();
}

///////////////////////////////////
// SET MAKER FUNCTIONS
//////////////////////////////////

// Start the Set Maker mode
// Display warning if not enough items for a Set

function startSetMaker(selectItem) {

  if (tileItemsArr.length < 2) {

    displaySetMakerTitleStatus("❌ You need 2+ items 👇", `Filters: ${lastFilterText}`);
    return;
  }

  listViewerDialog.dataset.setMaker = "on";
  listViewerTitle.textContent = "🎶 Select 2+ items 👇";
  toggleSetMakerGui(selectItem);

  if (selectItem) {
   
    toggleSetMakerSelection(selectItem);
  }
}

// Select or deselect a Set item from the list:
// Mark the item as selected with data-attribute
// Display the numbered Set item counter tag
// Renumber the existing Set item counters

function toggleSetMakerSelection(item, forceSelectMode) {

  const forceSelect = forceSelectMode === "select";
  const forceDeselect = forceSelectMode === "deselect";

  if (!item || !item.hasAttribute("aria-selected")) return;

  const counter =
    item.querySelector('[data-list-viewer="set-counter"]');

  if (item.getAttribute("aria-selected") === "true" && !forceSelect) {

    item.setAttribute("aria-selected", "false");
    item.style.removeProperty('outline');

    const counterVal = +counter.dataset.lvwCounter;
    recalcSetMakerCounters(counterVal);

    counter.removeAttribute("data-lvw-counter");
    selectedCounter--;

    lastSelectedIndex = getLastSelectedIndex();

    if (!listViewerSearchInput.hasAttribute("hidden") && listViewerSearchInput.value) {

      const searchFilterVal =
        processTypeAheadStr(listViewerSearchInput.value.trim());

      const tileTextSpan =
        item.querySelector('[data-list-viewer="tune-tile-title"]');

      const tuneTitleStr =
        processTypeAheadStr(tileTextSpan.textContent);

      if (!tuneTitleStr.includes(searchFilterVal)) {

        ariaHideMe(item);
        item.setAttribute("inert", '');
      }
    }
    
    if (selectedCounter < 2 && listViewerFooter.hasAttribute("data-set-maker")) {
    
      listViewerFooter.removeAttribute("data-set-maker");
    }

    return;
  }

  if (forceDeselect) return;

  item.setAttribute("aria-selected", "true");
  item.style.outline = "0.2em solid var(--set-counter-color)";
  counter.setAttribute("data-lvw-counter", selectedCounter + 1);
  selectedCounter++;

  lastSelectedIndex = item.dataset.index;

  if (lastFocusedIndex === -1) lastFocusedIndex = item.dataset.index;

  // if (lastSelectedIndex === -1) lastSelectedIndex = item.dataset.index;

  if (selectedCounter === 2)
    listViewerFooter.setAttribute("data-set-maker", "ready");
}

// Select or deselect multiple Set items from the list of tiles

function toggleMultipleTiles(tiles, startIndex, endIndex, forceSelectMode) {

let start;
let end;

  if (endIndex > startIndex) {

  start = Math.max(0, startIndex);
  end = Math.min(endIndex, tiles.length - 1);

    for (let i = start; i <= end; i++) {

      toggleSetMakerSelection(tiles[i], forceSelectMode);
    }
    return;
  }

  if (startIndex > endIndex) {

  start = Math.min(endIndex, tiles.length - 1);
  end = Math.max(0, startIndex);

    for (let j = end; j >= start; j--) {

      toggleSetMakerSelection(tiles[j], forceSelectMode);
    }
    return;    
  }
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

// Calculate the value of the last selected tune tile index:
// Get an array of tiles with active set counters sorted by counter value
// Get the data-index attribute of a tile with the largest counter value

function getLastSelectedIndex() {

  const tilesWithSetCounters = 
    document.querySelectorAll('li:has([data-lvw-counter])');

  if (!tilesWithSetCounters.length) return -1;

  const sortedSelectedTiles =
  
    [...tilesWithSetCounters].sort((a, b) => {

      const counterValA =
        a.querySelector('[data-lvw-counter]').dataset.lvwCounter;

      const counterValB =
        b.querySelector('[data-lvw-counter]').dataset.lvwCounter;

      return counterValB - counterValA;
    });

  const lastSelectedTileIndex =
    sortedSelectedTiles[0].dataset.index;

  return lastSelectedTileIndex;
}

// Show or hide Set Maker UI elements

function toggleSetMakerGui(focusItem) {

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

    if (focusItem) {

      focusItem.focus();
      return;
    }

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
  lastFocusedIndex = -1;

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

  if (!listViewerSearchInput.hasAttribute("hidden")) {

    refreshSearchFilterTiles();
  }
}

// Create an encoded Set of tunes from tile items
// Extract ABC data from compressed LZW strings
// Split merged sets into tunes before processing
// Return a compressed ABC URL string

function createTuneSetUrl(selectedItems) {

  const abcArr = [];

  let baseUrl = ''; 
  let baseUrlParams = '';

  selectedItems.forEach((item, index) => {

    if (index === 0) {

      baseUrl = item.dataset.url.split('?lzw=')[0];
      baseUrlParams = `&format=${item.dataset.url.split('&format=')[1]}`;
    }

    const dataUrl = item.dataset.url;
    const dataUrlName = dataUrl.split('&name=')[1];
    const abcInLzw = dataUrl.match(/lzw=(?:[^&]*)/)[0];
    const tuneNoInSet = item.querySelector('[data-lvw-counter]').dataset.lvwCounter;

    let abc = LZString.decompressFromEncodedURIComponent(abcInLzw.split('lzw=')[1]);

    abc = abc.replace(/^X:.*\s/, '');

    if (dataUrlName && dataUrlName.includes('_Set')) {

      abc = makeTunesFromSets([abc]);
    }

    abcArr[tuneNoInSet - 1] = abc;
  });

  const abcString = abcArr.flat().join('\n');

  const sortedAbc = sortFilterAbc(`T: NEW SET\n${abcString}`)[0].join('\n');

  const abcUrlOutput =
    baseUrl +
    "?lzw=" +
    LZString.compressToEncodedURIComponent(sortedAbc) +
    baseUrlParams.replace(/&name=.*(?=&|$)/, '&name=NEW_SET');

  return abcUrlOutput;
}

///////////////////////////////////
// LIST VIEWER CLICK NAVIGATION
//////////////////////////////////

// Handle clicks on interactable List Viewer elements

function handleListViewerClick(event) {

  const actionTrigger = event.target.closest('[data-lvw-action]');

  if (!actionTrigger || event.shiftKey) return;

  const elAction = actionTrigger.dataset.lvwAction;

  if (elAction === 'load-item' && listViewerDialog.dataset.setMaker === "on") {

    toggleSetMakerSelection(actionTrigger);
    // lastSelectedIndex = actionTrigger.dataset.index;
    return;
  }

  if (elAction === 'load-item' && listViewerDialog.dataset.setMaker === "off") {

    tuneSelector.selectedIndex = actionTrigger.dataset.index;

    tuneSelector.dispatchEvent(new Event('change'));

    quitListViewer(true);
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

    startSetMaker();
    return;
  }

  if (elAction === 'create-set') {

    const selectedItems =
      listViewerTiles.querySelectorAll('[aria-selected="true"]');

    const setUrl = createTuneSetUrl(selectedItems);

    if (!setUrl) return;

    window.open(setUrl, '_blank');

    // quitListViewer();

    // setTimeout(() => {

    //   loadTuneBookItem(null, null, setUrl);  
    // }, 150);

    return;
  }

  if (elAction === 'search') {

    toggleSearchFilterInput();
  }

  if (elAction === 'close-list-viewer') {

    quitListViewer();
    return;
  }
}

// Handle special cases of mouse events on tile items

function handleTilesMouseEvents(event) {

  const actionTrigger =
    event.target.closest('[data-lvw-action="load-item"]');
    
  if (!actionTrigger) return;

  if (event.type === 'contextmenu' &&
      actionTrigger.dataset.longPress === "on") {

    event.preventDefault();

    if (listViewerDialog.dataset.setMaker === "off") {

      startSetMaker(actionTrigger);
      return;
    }

    if (listViewerDialog.dataset.setMaker === "on") {

      actionTrigger.click();
      return;
    }
  }

  // Handle mouse clicks with additional keys pressed

  if (event.shiftKey &&
      actionTrigger.dataset.longPress === "on" &&
      listViewerDialog.dataset.setMaker === "on") {

    event.preventDefault();

    if (listViewerSearchInput.hasAttribute("hidden")) {

      handleTilesShiftClick(tileItemsArr, actionTrigger);
      return;
    }

    const activeTilesArr =
      [...listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"]:not([hidden]):not([inert])')];
    
    handleTilesShiftClick(activeTilesArr, actionTrigger);
    return;
  }
}

// Handle tile clicks with shift pressed (select multiple tiles in Set Maker)

function handleTilesShiftClick(tilesArr, targetTile) {

  let lastIndex =
    tilesArr.indexOf(tilesArr.find(tile => tile.dataset.index === lastSelectedIndex));

  let endIndex = tilesArr.indexOf(targetTile);

  if ((endIndex === 0 && lastSelectedIndex === -1) ||
      lastIndex === endIndex ||
      endIndex === lastIndex + 1 ||
      endIndex === lastIndex - 1) {

    targetTile.click();
    return;
  }

  let startIndex = 
    lastIndex === -1? 0 :
    lastIndex > endIndex? lastIndex - 1 :
    lastIndex < endIndex? lastIndex + 1 :
    lastIndex;

  toggleMultipleTiles(tilesArr, startIndex, endIndex);
  targetTile.focus();
}

// Handle special cases of touch events on tile items

function handleTilesTouchEvents(event) {

  const actionTrigger =
    event.target.closest('[data-lvw-action="load-item"]');

  if (!actionTrigger) return;

  if (actionTrigger.dataset.longPress &&
      actionTrigger.dataset.longPress !== "off") {

    switch (event.type) {

      case 'touchstart':

        if (listViewerDialog.dataset.setMaker === "off")
          actionTrigger.dataset.longPress = "on";
          handleTilesLongPress(actionTrigger, "start");
        break;

      case 'touchend':

        if (actionTrigger.dataset.longPress === "pressed") {
          handleTilesLongPress(actionTrigger, "end");
        }
        else if (actionTrigger.dataset.longPress === "active") {
          handleTilesLongPress(actionTrigger, "clear");
        }
        break;

      case 'touchmove':
        
        if (actionTrigger.dataset.longPress === "active")
          handleTilesLongPress(actionTrigger, "clear");
        break;
    
      default:
        break;
    }

    return;
  }
}

// Handle long press events on tile items

function handleTilesLongPress(actionTrigger, eventType) {

  if (eventType === "start") {

    actionTrigger.dataset.longPress = "active";

    tileLongPressTimeoutId = setTimeout(() => {

      tileLongPressTimeoutId = null;
      startSetMaker(actionTrigger);
      actionTrigger.dataset.longPress = "pressed";
    }, 500);

    return;
  }

  if (eventType === "end") {

    actionTrigger.dataset.longPress = "on";
    return;
  }

  if (eventType === "clear") {

    clearTimeout(tileLongPressTimeoutId);
    actionTrigger.dataset.longPress = "on";
    return;
  }
}

// Handle List Viewer tune tiles listbox receiving focus
// Focus on the first tile item by default

function handleTilesListBoxFocusIn(e) {

  if (e.target === listViewerTiles) {

    if (lastFocusedIndex === -1) {

      const firstTileItem =
        listViewerTiles.querySelector('[data-list-viewer="tune-tile"]:not([inert])');

      if (!firstTileItem && lastTabKeyPressed === 'tab') {
        focusOnModeSwitchBtn();
        return;
      }

      if (!firstTileItem && lastTabKeyPressed === 'shiftTab') {
        focusOnBtnX();
        return;
      }
      
      firstTileItem.focus();
      return;
    }

    tileItemsArr.find(tile => tile.dataset.index === lastFocusedIndex).focus();
    return;
  }
  
  if (e.target.dataset.listViewer === "tune-tile") {

    lastFocusedIndex = e.target.dataset.index;
    return;
  }
}

///////////////////////////////////
// LIST VIEWER KEYBOARD NAVIGATION
//////////////////////////////////

// Handle key presses when List Viewer Dialog is open

function handleListViewerKeyPress(e) {

  const isSetMakerOn =
    listViewerDialog.dataset.setMaker === "on";

  // Remember last Tab / Shift + Tab keys pressed

  if (e.key === 'Tab') {

    lastTabKeyPressed = e.shiftKey? "shiftTab" : "tab";
  }

  // Handle Esc key pressed

  if (e.key === 'Escape') {

    e.preventDefault();
    quitListViewer();
    return;
  }

  // Handle "Ctrl + Shift + F" pressed (toggle search filter input)

  if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "F") {

    e.preventDefault();

    toggleSearchFilterInput();
    return;
  }

  // Handle type-ahead separately if key pressed within search input

  const currentFocus = document.activeElement;

  if (currentFocus && currentFocus.dataset.listViewer &&
      currentFocus.dataset.listViewer === "search-input") {

    if (e.key === 'Enter') {

      refreshSearchFilterTiles();
    }
    return;
  }

  // Handle "Ctrl + Shift + A" pressed (select all tiles)

  if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "A") {

    e.preventDefault();

    const isSearchFilterOff =
      listViewerSearchInput.hasAttribute("hidden");

    let tilesArr = isSearchFilterOff?
      tileItemsArr :
      [...listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"]:not([hidden]):not([inert])')];

    if (!isSetMakerOn) startSetMaker();
    if (tilesArr.length < 2) return;

    tilesArr[0].getAttribute("aria-selected") === "false"?
      selectAllTiles(tilesArr) :
      deselectAllTiles(tilesArr);

    return;
  }

  // Handle type-ahead if letters or numbers pressed outside of search input

  const normalizedKey = processTypeAheadStr(e.key);

  if (e.key.length === 1 && !e.ctrlKey && normalizedKey.match(/[A-Za-z0-9-&]/)) {

    searchKeysPressed += normalizedKey;

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

      focusOnBtnX();
      return;
    }

    // Tab to the next UI element

    if (!listViewerSlider.hasAttribute("hidden")) {

      listViewerSlider.focus();
      return;
    }
    
    if (listViewerSlider.hasAttribute("hidden")) {

      focusOnModeSwitchBtn();
      return;
    }
    return;
  }

  const isSetMakerOn = listViewerDialog.dataset.setMaker === "on";
  const isSearchFilterOn = !listViewerSearchInput.hasAttribute("hidden");

  let tilesArr = 
    isSearchFilterOn? 
      [...listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"]:not([hidden]):not([inert])')] :
      tileItemsArr;

  if (!tilesArr.length) return;

  const currentTile = document.activeElement;
  const currentDataIndex = currentTile.dataset.index;

  switch(e.key) {

    // Handle Home & End buttons (select one or multiple tiles)
    
    case 'Home':
      e.preventDefault();

      if (e.shiftKey && isSetMakerOn) {
        
        selectTilesToListStart(tilesArr, currentDataIndex);
      }

      tilesArr[0].focus();
      break;
      
    case 'End':
      e.preventDefault();

      if (e.shiftKey && isSetMakerOn) {

        selectTilesToListEnd(tilesArr, currentDataIndex);
      }

      tilesArr[tilesArr.length - 1].focus();
      break;

    // Handle Space & Enter (select a tile)

    case 'Spacebar':
    case 'Enter':
    case ' ':
      e.preventDefault();

      if (currentTile && e.shiftKey && !isSetMakerOn) {

        startSetMaker(currentTile);
        break;
      }

      if (currentTile) {

        currentTile.click();
      }

      break;

    // Handle arrow keys pressed (focus on tile)

    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowDown':
    case 'ArrowUp': {

      e.preventDefault();

      const selectDown = e.key === 'ArrowDown' || e.key === 'ArrowRight';
      const selectUp = e.key === 'ArrowUp' || e.key === 'ArrowLeft';

      const currentArrIndex = 
        tilesArr.indexOf(currentTile);

      // Handle Shift pressed: Select multiple tiles

      if (currentTile && e.shiftKey && isSetMakerOn) {

        e.preventDefault();

        if (lastSelectedIndex === -1)
          lastSelectedIndex = currentDataIndex;

        selectTilesWithShiftArrow(
          tilesArr,
          currentTile,
          currentArrIndex,
          selectUp,
          selectDown);
        break;
      }

      // Handle tile focus on arrow navigation

      focusOnNextTile(tilesArr, currentArrIndex, selectUp, selectDown);
      break;
    }

    default:
      break;
  }
}

// Select all tune tiles in a given list of elements in Set Maker mode

function selectAllTiles(tilesArr) {

  selectedCounter = 0;

  tilesArr.forEach(tile => {
      
    toggleSetMakerSelection(tile, "select");
  });

  tilesArr[tilesArr.length - 1].focus();
}

// Deselect all tune tiles in a given list of elements in Set Maker mode

function deselectAllTiles(tilesArr) {

  tilesArr.forEach(tile => {

    toggleSetMakerSelection(tile, "deselect");
  });

  lastSelectedIndex = -1;
  selectedCounter = 0;
  tilesArr[0].focus();
}

// Select all tune tiles from the current tile to the start of the list

function selectTilesToListStart(tilesArr, currentDataIndex) {

  const currentTileArrIndex =
    tilesArr.indexOf(tilesArr.find(tile => tile.dataset.index === currentDataIndex));

  if (currentTileArrIndex === 0) return;

  toggleMultipleTiles(tilesArr, tilesArr.length - 1, currentTileArrIndex + 1, "deselect");

  selectedCounter = 0;

  toggleMultipleTiles(tilesArr, currentTileArrIndex, 0, "select");
}

// Select all tune tiles from the current tile to the end of the list

function selectTilesToListEnd(tilesArr, currentDataIndex) {

  const currentTileArrIndex =
    tilesArr.indexOf(tilesArr.find(tile => tile.dataset.index === currentDataIndex));

  if (currentTileArrIndex === tilesArr.length - 1) return;

  toggleMultipleTiles(tilesArr, 0, currentTileArrIndex, "deselect");

  selectedCounter = 0;

  toggleMultipleTiles(tilesArr, currentTileArrIndex, tilesArr.length - 1, "select");
}

// Select one or multiple tiles in Set Maker mode with or without search filtering

function selectTilesWithShiftArrow(tilesArr, currentTile, currentIndex, selectUp, selectDown) {

  const nextIndex = selectDown?
    Math.min(currentIndex + 1, tilesArr.length - 1) :
    Math.max(currentIndex - 1, 0);

  if (nextIndex === currentIndex) return;
    
  if (nextIndex !== currentIndex - 1 &&
      nextIndex !== currentIndex + 1) {
  
    const lastSelectedArrIndex =
      tilesArr.indexOf(tilesArr.find(tile => tile.dataset.index === lastSelectedIndex));

    if (selectDown) {

      toggleMultipleTiles(tilesArr, lastSelectedArrIndex + 1, currentIndex);
    }

    if (selectUp) {

      toggleMultipleTiles(tilesArr, lastSelectedArrIndex - 1, currentIndex);
    }

    currentTile.focus();
    return;
  }

  if ((selectDown && currentIndex === tilesArr.length - 1) ||
      (selectUp && currentIndex === 0)) return;

  if (currentTile.getAttribute("aria-selected") ===
      tilesArr[nextIndex].getAttribute("aria-selected")) {

    currentTile.click();
  }

  const nextTile = tilesArr[nextIndex];

  nextTile.click();
  nextTile.focus();
}

// Focus on the next / previous tune tile in an unfiltered list
// Reuse tile items array for finding focus targets

function focusOnNextTile(tilesArr, currentIndex, selectUp, selectDown) {

  if (selectUp && currentIndex === 0) {

    tilesArr[tilesArr.length - 1].focus();
    return;
  }

  if (selectDown && currentIndex === tilesArr.length - 1) {

    tilesArr[0].focus();
    return;
  }

  if (selectDown && currentIndex < tilesArr.length ||
      selectUp && currentIndex > 0) {

    const nextIndex = selectDown?
      Math.min(currentIndex + 1, tilesArr.length - 1) :
      Math.max(currentIndex - 1, 0);

    tilesArr[nextIndex].focus();
    return;
  }
}

// Focus on Close List Viewer Dialog button

function focusOnBtnX() {

  const listViewerBtnX =
    document.querySelector('[data-lvw-action="close-list-viewer"]');

  listViewerBtnX.focus();
}

// Focus on Set Maker / List Viewer mode switch button

function focusOnModeSwitchBtn() {

  const returnListViewerBtn =
    document.querySelector('[data-lvw-action="return-list-viewer"]');

  const startSetMakerBtn =
    document.querySelector('[data-lvw-action="start-set-maker"]');

  returnListViewerBtn.hasAttribute("hidden")?
    startSetMakerBtn.focus() :
    returnListViewerBtn.focus();
}

// Search for an indexed title that starts with type-ahead string
// Start searching from after currently focused tile or from the top
// Focus on the tile with the title matching the search

function focusOnTypeAheadMatch() {
  
  if (!tileItemsArr.length || !tileTitlesArr.length) return;

  let searchStartIndex = Math.max(0, +lastFocusedIndex);

  let match = findMatchingTileObject(searchStartIndex + 1, tileItemsArr.length);

  if (!match && searchStartIndex > 0) {

    match = findMatchingTileObject(0, searchStartIndex);
  }

  if (match) {

    match.focus();
  }
}

// Find an indexed title matching the current type-ahead string
// Limit the search to a range if start & end indices provided

function findMatchingTileObject(startIndex, endIndex) {

  if (!startIndex || !endIndex) {

    const tileTitleIndex = 
      tileTitlesArr.indexOf(
        tileTitlesArr.find(
          title => title.toLowerCase().startsWith(searchKeysPressed)
        )
      );

    return tileItemsArr[tileTitleIndex];
  }

  for (let i = startIndex; i < endIndex; i++) {

    const itemTitle = tileTitlesArr[i];

    if (itemTitle.toLowerCase().startsWith(searchKeysPressed)) {

      return tileItemsArr[i];
    }
  }
  return null;
}

///////////////////////////////////
// TILES FILTERING FUNCTIONS
//////////////////////////////////

// Handle List Viewer Search Input

function handleSearchFilterInput() {

  const searchInputVal =
    listViewerSearchInput.value;

  if (!searchInputVal || !searchInputVal.trim()) return;

  const inputStr =
    processTypeAheadStr(searchInputVal.trim());

  if (typeAheadTimeoutId) {

    clearTimeout(typeAheadTimeoutId);
  }

  typeAheadTimeoutId = setTimeout(() => {

    filterTilesBySearchInput(inputStr);
    typeAheadTimeoutId = null;
  }, 250);

  return;
}

// Filter tune tiles by List Viewer Search Input results:
// Hide or show tune tiles with title matching search input
// Keep selected tiles on the list regardless of search input

function filterTilesBySearchInput(inputStr) {

  if (inputStr.length < 2) {
    clearSearchFilterTiles();
    return;
  }

  lastFocusedIndex = -1;

  const tuneTiles =
    listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"]');

  tuneTiles.forEach(tile => {

    if (tile.hasAttribute("aria-selected") &&
        tile.getAttribute("aria-selected") === "true") {
        return;
    }

    const tileTextSpan =
      tile.querySelector('[data-list-viewer="tune-tile-title"]');
    
    const tuneTitleStr =
      processTypeAheadStr(tileTextSpan.textContent);

    if (tuneTitleStr.includes(inputStr) &&
        tile.hasAttribute("hidden")) {

      tile.removeAttribute("inert");
      ariaShowMe(tile);
      return;
    }
    
    if (!tuneTitleStr.includes(inputStr) &&
        !tile.hasAttribute("hidden")) {

      ariaHideMe(tile);
      tile.setAttribute("inert", '');
      return;
    }
  });
}

// Process type-ahead string:
// Lowercase all characters
// Normalize apostrophies
// Normalize diactritics 

function processTypeAheadStr(str) {
  
  return str.toLowerCase().replace(/[\u2018\u2019\u0060\u00B4]/g, `'`).normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// Update filtered out / hidden tune tiles

function refreshSearchFilterTiles() {

  filterTilesBySearchInput(
    processTypeAheadStr(listViewerSearchInput.value.trim())
  );
}

// Clear all filtered out / hidden tune tiles

function clearSearchFilterTiles() {

  const tuneTiles =
    listViewerTiles.querySelectorAll('[data-list-viewer="tune-tile"][hidden]');

  tuneTiles.forEach(tile => {
    tile.removeAttribute("inert");
    ariaShowMe(tile)
  });
}

// Toggle between hidden and displayed Search Filter Input
// Focus on input if shown, focus on Search button if hidden

function toggleSearchFilterInput() {

  if (listViewerSearchInput.hasAttribute("hidden")) {

    showSearchFilterInput();
    listViewerSearchInput.focus();
    return;
  }

  clearSearchFilterTiles();
  hideSearchFilterInput();
  listViewerDialog.querySelector('[data-lvw-action="search"]').focus();
  return;
}

// Show Search Filter Input
// Hide List Viewer Title

function showSearchFilterInput() {

  ariaHideMe(listViewerTitleBox);
  ariaShowMe(listViewerSearchInput);
}

// Clear & Hide Search Filter Input

function hideSearchFilterInput() {
  
  listViewerSearchInput.value = '';
  ariaHideMe(listViewerSearchInput);
  ariaShowMe(listViewerTitleBox);
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