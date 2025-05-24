////////////////////////////////////////////////////////////////////////
// Novi Sad Session List Viewer Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2025
////////////////////////////////////////////////////////////////////////

// Import function for checking whether localStorage is available and writeable

import { storageAvailable } from "./scripts-3p/storage-available/storage-available.js";

// Import functions handling warning messages (for user notifications)

import { displayWarningEffect, displayNotification } from "./scripts-nss-app.js";

// Import function for loading selected tune items into ABC Tools iframe

import { loadTuneBookItem } from "./scripts-abc-tools.js"

// Define required app elements

const launchButton = document.querySelector('[data-controls="list-viewer"]');
const tuneSelector = document.querySelector('#tuneSelector');
const filterOptions = document.querySelector('#filterOptions');

// Define variants of placeholder option text
const placeHolderText = /select|pick a|filter by/;

// Define List Viewer Dialog elements

const listViewerDialog = document.querySelector('[data-list-viewer="dialog"]');
const listViewerTitle = document.querySelector('[data-list-viewer="title"]');
const listViewerTiles = document.querySelector('[data-list-viewer="tiles-container"]');

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
  console.warn(tunesArr)

  // Get current Filter value, pass "None" if none found

  let currentFilter;

  currentFilter = filterOptions?.options[filterOptions.selectedIndex].text;

  if (!currentFilter || currentFilter.toLowerCase().match(placeHolderText)) {

    currentFilter = "None";
  }

  // Create Tune Tiles grid, populate it with items from Tunes Array

  loadTuneTiles(tunesArr, currentFilter);

  // Display List Viewer Dialog

  listViewerDialog.showModal();
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

    const tuneItemBtn = document.createElement('button');

    tuneItemBtn.dataset.listViewer = "tune-tile";
    tuneItemBtn.dataset.lvwAction = "load-item";
    tuneItemBtn.classList = "btn flex-center";

    tuneItemBtn.textContent = tune.title;
    tuneItemBtn.dataset.url = tune.url;
    tuneItemBtn.dataset.index = tune.index;

    listViewerTiles.appendChild(tuneItemBtn);
  });
}

///////////////////////////////////
// LIST VIEWER INIT FUNCTIONS
//////////////////////////////////

// Initialize List Viewer Dialog

export function initListViewer() {

  if (!listViewerDialog) return;

  listViewerDialog.addEventListener('click', handleListViewerClick);
}

// Handle clicks on interactable List Viewer elements

function handleListViewerClick(event) {

  const actionTrigger = event.target.closest('[data-lvw-action]');

  if (!actionTrigger) return;

  const listViewerGui = listViewerDialog.querySelectorAll('[data-controls]');
  const listViewerThemeBtns = listViewerDialog.querySelectorAll('[data-controls="theme-btn"]');

  const elAction = actionTrigger.dataset.lvwAction;

  if (elAction === 'load-item') {

    tuneSelector.selectedIndex = actionTrigger.dataset.index;

    tuneSelector.dispatchEvent(new Event('change'));

    listViewerDialog.close();
    return;
  }

  if (elAction === 'toggle-theme') {

    listViewerDialog.className = actionTrigger.dataset.theme;

    listViewerThemeBtns.forEach(themeBtn => {

      if (themeBtn.classList.contains(`btn-${actionTrigger.dataset.theme}`)) {

        themeBtn.removeAttribute("inert");
        ariaShowMe(themeBtn);
        themeBtn.focus();
      }
    });

    ariaHideMe(actionTrigger);
    actionTrigger.setAttribute("inert", "");
  }

  if (elAction === 'close-list-viewer') {

    listViewerDialog.close();
    return;
  }
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

// Show a warning outline around the target button

// function displayWarningEffect(focusBtn) {

//   focusBtn.setAttribute("style", "outline-color: red");

//   setTimeout(() => {

//     focusBtn.removeAttribute("style");
//   }, 2500);
// }
