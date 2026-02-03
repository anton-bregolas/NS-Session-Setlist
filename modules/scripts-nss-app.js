import { addSupportMenuContent, ariaHideMe, ariaShowMe, isLocalStorageOk,
         getFirstCurrentlyDisplayedElem, sanitizeQueryParam } from './scripts-abc-utils.js';
import { initAbcTools, initTunebookOptions, abcTunebookDefaults, tuneSelector, displayOptions,
         restoreLastTunebookItem, populateTuneSelector, populateFilterOptions, sortFilterOptions, 
         resetViewportWidth, getViewportWidth, getViewportHeight, getLastTunebookUrl, tuneFrame, 
         handleFullScreenButton, loadFromQueryString, getAbcLinkToPreferredEditor } from './scripts-abc-tools.js';
import { abcEncoderDefaults, downloadAbcEncoderFile, initEncoderSettings, parseAbcFromFile, parseEncoderImportFile, 
         readFileContent, resetEncoderSettings } from './scripts-abc-encoder.js';
import { adjustHtmlFontSize, isMobileBrowser } from './scripts-preload-nssapp.js';
import { initChordViewer, openChordViewer } from './scripts-chord-viewer.js'
import { initListViewer, openListViewer } from './scripts-list-viewer.js';
import appVersionJson from '../version.json' with { type: "json" };
///////////////////////////////////////////////////////////////////////
// Novi Sad Session Setlist App Scripts
// https://github.com/anton-bregolas/
// MIT License
// (c) Anton Zille 2024-2025
//
// Session DB and/or Code Contributors:
// Anton Zille - Code, ABC, Chords
// Mars Agliullin - ABC
// Tania Sycheva - ABC
// Oleg Naumov - Chords
//
///////////////////////////////////////////////////////////////////////

// Define Global Variables

let tuneBookSetting = "setlist"; // Tunebook loads Setlist by default
let isTuneBookInitialized = false; // If false, opening Tunebook will initialize ABC Tools and fetch Session DB data
let isCompactTunebookModeOn = false; // If true, Tunebook footer and Tunelist / Setlist switch buttons are hidden
let lastAppSectionOpened = "launcher"; // Keep track of the last app section name / latest hash handled by routing
let lastPressedNavBtn; // Keep track of the last Tunebook navigation button pressed
let lastTuneBookMode; // Keep track of the last Tunebook mode setting for this session
let lastTuneBookOpened; // Keep track of the latest Tunebook opened (fallback global variable)
let longPressTimeoutId; // Keep track of the latest timeout set for long press events
let notificationTimeoutId; // Keep track of the latest timeout set for clearing notifications
let statusNotifyTimeout = 1250; // Set default banner hide timeout for status notifications
let successNotifyTimeout = 4500; // Set default banner hide timeout for success notifications

// Define Session DB items

let sessionDbVersion = '';
export const tuneSets = [];
export const tuneList = [];
export const setChords = [];
export const tuneChords = [];
export const dbVersionLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/test/version-db.json";
export const tuneSetsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/test/abc-encoded/sets.json"
export const tuneListLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/test/abc-encoded/tunes.json"
export const setChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/test/abc-chords/chords-sets.json";
export const tuneChordsLink = "https://raw.githubusercontent.com/anton-bregolas/NS-Session-Setlist/refs/heads/test/abc-chords/chords-tunes.json";

// Open Broadcast Channel for DB Updates

const updateMsgChannel = new BroadcastChannel("update-msg");

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
const abcContainer = document.querySelector('.nss-abc-embed');

// Define App Menu elements

const helpGuidePopover = document.getElementById('help-guide');
const appOptionsPopover = document.querySelector('#nss-popover-options');
const appSupportPopover = document.querySelector('#nss-support-popover');
const fullScreenViewTunesRadioBtn = document.querySelector('#nss-radio-view-tunes');
const fullScreenViewChordsRadioBtn = document.querySelector ('#nss-radio-view-chords');
const advancedOptions = document.querySelectorAll('.nss-advanced-options-container');
const notificationPopup = document.querySelector('[data-popover="notification-popup"]');
const notificationMessage = document.querySelector('[data-popover="notification-message"]');
const tuneBookActionsPopup = document.querySelector('[data-popover="tunebook-actions-popup"]');
const tuneBookActionsHeaderBtn = document.querySelector('#nss-tunebook-actions-header');
const appVersionUpdateBtn = document.querySelector('.nss-app-version-btn');

// Dialog Menus

const chordViewerDialog = document.getElementById('chord-viewer');
const listViewerDialog = document.getElementById('list-viewer');
const quickHelpDialog = document.getElementById('quick-help');

// Contact Developer (@ in base64)

const appSupportContact = 'YW50b24uYnJlZ29sYXNAcHJvdG9uLm1l';

////////////////////////////////////////////
// APP SCRIPTS: LAUNCHERS
///////////////////////////////////////////

// Load Tunebook with Setlist or Tunelist interface, initiate ABC Tools

async function launchTuneBook(targetSection, currentSection, itemQuery) {

  // Fetch latest Session DB if Tunebook has not been initialized

  if (!isTuneBookInitialized) {

    const isSessionDBLoaded = await tuneDataFetch();

    if (!isSessionDBLoaded) {

      // Display an error and hightlight section button if fetch attempt fails

      const triggerBtnId = `#nss-launch-${targetSection}`;
      
      const triggerBtn = document.querySelector(triggerBtnId);
      
      displayNotification("Tunebook data could not be loaded", "error", triggerBtnId);

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

  document.body.dataset.tunebook = "open";

  showTuneBookEls();

  if (isCompactTunebookModeOn) setTuneBookCompactMode();

  if (!tuneBookActionsHeaderBtn.hasAttribute("hidden")) {

    lastPressedNavBtn = tuneBookActionsHeaderBtn;

  } else {

    lastPressedNavBtn = document.querySelector(`#nss-tunebook-${targetSection}-switch`);
  }

  lastPressedNavBtn.focus();

  handleSelectorLabels("init");

  // Initialize ABC Tools when Tunebook first opened

  if (isTuneBookInitialized === false) {

    await initAbcTools(itemQuery);

    initTunebookRadioBtns();

    initTunebookFavBtns();
    
    console.log(`NS Session App:\n\nABC Tools initialized`);

    isTuneBookInitialized = true;

    lastTuneBookOpened = tuneBookSetting;

    if (isLocalStorageOk()) {

      localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;

      if (!localStorage.tuneBookInitialized_NSSSAPP) {

        displayNotification("First time loading Tunebook: Please wait for ABC Tools to load", "success");

        openQuickHelpDialog();

        localStorage.tuneBookInitialized_NSSSAPP = 1;
      }
    }

    return;
  }

  // Refresh Tunebook if section has been changed or query passed

  if (itemQuery ||
     (isLocalStorageOk() && localStorage.tuneBookLastOpened_NSSSAPP !== tuneBookSetting) ||
     (!isLocalStorageOk() && lastTuneBookOpened !== tuneBookSetting)) {

    refreshTuneBook(false, itemQuery);

    lastTuneBookOpened = targetSection;

    if (isLocalStorageOk()) {

      localStorage.tuneBookLastOpened_NSSSAPP = targetSection;
    }

    return;
  }

  // Refresh Tunebook if persistent mode setting is different from current mode

  if (isLocalStorageOk() &&
      (lastTuneBookMode === "desktop" && +localStorage.tuneBookAlwaysUseMobileMode === 1) ||
      (lastTuneBookMode === "mobile" && +localStorage.tuneBookAlwaysUseDesktopMode === 1)) {

    lastTuneBookMode =
      lastTuneBookMode === "mobile"? "desktop" : "mobile";

    refreshTuneBook();
  }

  // Reload last saved Tunebook item if data-reload flag exists

  if (document.body.dataset.reload) {

    console.log(`NS Session App:\n\nTunebook has been reloaded`);

    restoreLastTunebookItem();

    document.body.removeAttribute("data-reload");

    return;
  }
  
  // Simply log Tunebook opened event if section has not changed

  console.log(`NS Session App:\n\nTunebook has been reopened`);
}

// Load Play Along section interface

function launchPlayAlong() {

  showPlayAlongEls();

  document.querySelector('#nss-playalong-exit').focus();
}

////////////////////////////////////////////
// APP SCRIPTS: SWITCHERS
///////////////////////////////////////////

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

      if (isLocalStorageOk()) {

        localStorage.tuneBookLastOpened_NSSSAPP = targetSection;
      }

      lastPressedNavBtn = document.querySelector(`#nss-tunebook-${targetSection}-switch`);

      lastPressedNavBtn.focus();

      return;
    }

    // Exit Tunebook

    // Hide Tunebook menus

    hideTuneBookActionsMenu(true);

    // Save last opened Tunebook section before exiting

    if (isLocalStorageOk()) {

      localStorage.tuneBookLastOpened_NSSSAPP = tuneBookSetting;
    }

    lastTuneBookOpened = tuneBookSetting;

    // Hide Tunebook elements, reset styles

    lastTuneBookMode = document.body.dataset.mode;

    hideTuneBookEls();
    document.body.removeAttribute("data-tunebook");
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

  const isSafari = checkIfSafariLikeBrowser();

  const currentTuneBook =
    isSafari? [...tuneSelector.querySelectorAll('option')].slice(1) :
      checkTuneBookSetting() === "setlist"? tuneSets : tuneList;

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

  const isMobileMode = checkIfMobileMode();

  const zoomStep = zoomDir === "zoom-in"? 10 : -10;

  const maxZoomValue = isMobileMode? 105 : 120;

  const minZoomValue = isMobileMode? 35 : 40;

  const startZoomPercent = isMobileMode? "95%" : "100%";

  // Mobile Mode: Rescale iframe width

  if (isMobileMode) {

    const currentAbcFrameWidth = tuneFrame.style.width || startZoomPercent;

    const currentZoomValue = +currentAbcFrameWidth.slice(0, -1);

    let newZoomValue = currentZoomValue + zoomStep;

    if (newZoomValue > maxZoomValue || newZoomValue < minZoomValue) return;

    tuneFrame.style.width = `${newZoomValue}%`;

    if (isLocalStorageOk()) localStorage.tuneBookFullScreenWidth = `${newZoomValue}%`;

    return;
  }

  // Desktop Mode: Zoom iframe in/out

  const currentPageZoom = tuneFrame.style.zoom || startZoomPercent;

  const currentZoomValue = +currentPageZoom.slice(0, -1);

  let newZoomValue = currentZoomValue + zoomStep;

  if (newZoomValue > maxZoomValue || newZoomValue < minZoomValue) return;

  tuneFrame.style.zoom = `${newZoomValue}%`;

  if (isLocalStorageOk()) localStorage.tuneBookFullScreenZoom = `${newZoomValue}%`;
  
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

  let tuneBookActionsBtnId = 
    isCompactTunebookModeOn? '#nss-tunebook-actions-header' :
    targetMode === "mobile-switch"? '#nss-tunebook-actions-footer-mobile' :
    '#nss-tunebook-actions-footer-desktop';

  lastPressedNavBtn = document.querySelector(tuneBookActionsBtnId);

  if (targetMode === "mobile-switch") {

    document.body.dataset.mode = "mobile";
    
    displayNotification("Mobile mode enabled: Double tap to play", "success", tuneBookActionsBtnId);

    resetViewportWidth();

    appWindowResizeHandler();
  }

  if (targetMode === "desktop-switch") {

    document.body.dataset.mode = "desktop";

    displayNotification("Desktop mode enabled", "success", tuneBookActionsBtnId);

    if (getViewportWidth() < 880) resetViewportWidth(880);

    appWindowResizeHandler();
  }

  refreshTuneBook(true);

  handleSelectorLabels("init");

  lastPressedNavBtn.focus();
}

// Switch Tunebook to Compact Mode, hiding footer section

function setTuneBookCompactMode() {

  const tuneBookFooter = document.querySelector('#nss-tunebook-footer');
  const switchContainer = document.querySelector('.nss-switch-container');
  const allSwitchBtns = switchContainer.querySelectorAll('button');
  const tuneBookActionsBtn = 
    switchContainer.querySelector('[data-load="tunebook-actions-menu"]');
    
  ariaHideMe(tuneBookFooter);
    
  isCompactTunebookModeOn = true;

  document.body.dataset.layout = "compact";
    
  allSwitchBtns.forEach(switchBtn => {

    if (switchBtn.dataset.load !== "tunebook-actions-menu") {
      
      ariaHideMe(switchBtn);
      return;
    }

    ariaShowMe(switchBtn);
  });
  
  tuneBookActionsBtn.focus();
  tuneBookFooter.setAttribute("inert", "");

  setTimeout(() => {
    
    tuneBookActionsPopup.dataset.popsUpFrom = "header";
  }, 250);

  goatCountEvent(`#switch-compact-mode`, "app-ui");

  displayNotification("Compact mode enabled: Refresh app to reset", "success");
}

// Hide or show GUI elements depending on toggle element type

function toggleFullScreenGui(toggleEl) {

  let guiElsToToggle;

  if (toggleEl === "toggle-gui-fullscreen") {

    guiElsToToggle = abcContainer.querySelectorAll('.nss-iframe-gui-container');

    if (abcContainer.style.getPropertyValue("--fullscreen-gui-display") === "none") {

      abcContainer.style.setProperty("--fullscreen-gui-display", "flex");

      if (isLocalStorageOk()) localStorage.tuneBookFullScreenGuiDisplay = "flex";

      return;
    } 

    abcContainer.style.setProperty("--fullscreen-gui-display", "none");

    if (isLocalStorageOk()) localStorage.tuneBookFullScreenGuiDisplay = "none";
    
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

    toggleAbcFocusLabel("hide");

  } catch {

    console.warn(`NS Session App:\n\nTrying to exit fullscreen while not in Full Screen mode`);
  }

  return;
}

// Switch Tunebook Fav Button to a target button

function switchTuneBookFavBtn(btn, containerData) {

  const btnAction = btn.dataset.tbkAction;

  const favBtnContainer =
    document.querySelector(`[data-tbk-container="${containerData}"]`);

  const favContainerLeft =
    document.querySelector('[data-tbk-container="pick-fav-left"]');

  const favContainerRight =
    document.querySelector('[data-tbk-container="pick-fav-right"]');

  // Handle picking radio fav buttons (always come in pairs)

  if (btnAction.startsWith("select-fullscreen")) {

    if (btnAction === "select-fullscreen-tunes" &&
        !fullScreenViewTunesRadioBtn.parentElement.hasAttribute("hidden")) return;

    if (btnAction === "select-fullscreen-chords" &&
        !fullScreenViewChordsRadioBtn.parentElement.hasAttribute("hidden")) return;

    favContainerLeft.textContent = '';
    favContainerRight.textContent = '';

    ariaHideMe(favContainerLeft);
    ariaHideMe(favContainerRight);

    ariaShowMe(fullScreenViewTunesRadioBtn.parentElement);
    ariaShowMe(fullScreenViewChordsRadioBtn.parentElement);

    return;
  }

  // Handle picking other fav buttons

  const favBtn = btn.cloneNode(true);

  favBtn.removeAttribute("data-tbk-action");
  favBtn.classList.remove("flex-align-center");
  favBtn.classList.add("flex-wrapper");

  favBtn.dataset.longPress = "on";
  favBtn.dataset.activated = "false";
  favBtn.dataset.favBtn = containerData.replace("pick-fav-", '');

  const favBtnFiller = favBtn.querySelector('.nss-icon-filler');

  if (favBtnFiller) {

    favBtnFiller.classList.add("nss-mini-icon");

  } else {

    const favBtnSvg = favBtn.querySelector('svg');

    if (favBtnSvg) favBtnSvg.classList.add("nss-mini-icon");
  }

  // Handle switching from radio to other fav buttons
  // Switch leftover radio button pair to an alternative fav button

  if (favBtnContainer.children.length === 0) {

    ariaShowMe(favBtnContainer);

    if (containerData === "pick-fav-left") {

      ariaHideMe(fullScreenViewTunesRadioBtn.parentElement);

      if (!fullScreenViewChordsRadioBtn.parentElement.hasAttribute("hidden")) {

        initTunebookAltFavBtnRight();
      }
    }

    if (containerData === "pick-fav-right") {

      ariaHideMe(fullScreenViewChordsRadioBtn.parentElement);

      if (!fullScreenViewTunesRadioBtn.parentElement.hasAttribute("hidden")) {

        initTunebookAltFavBtnLeft();
      }
    }
  }

  favBtnContainer.textContent = '';

  favBtnContainer.appendChild(favBtn);
}

// Show or hide ABC embed focus label

function toggleAbcFocusLabel(actionType) {

  const abcFocusLabel =
    document.querySelector('.nss-abc-focus-label');

  if (actionType === "show" &&
      abcFocusLabel.hasAttribute("hidden")) {

    ariaShowMe(abcFocusLabel);
    return;
  }

  if (actionType === "hide" &&
      !abcFocusLabel.hasAttribute("hidden")) {

    ariaHideMe(abcFocusLabel);
    return;
  }
}

////////////////////////////////////////////
// APP SCRIPTS: POPOVERS & DIALOGS
///////////////////////////////////////////

// Launch a Popover Options menu depending on dataType

export async function openSettingsMenu(dataType, dataOptions) {

  hideTuneBookActionsMenu();

  goatCountEvent(
    `#${dataOptions? "fav-picker-menu" : dataType}`,
    dataType.startsWith("encoder")? "encoder-ui" : "app-ui"
  );

  // Open Chord Viewer

  if (dataType === "chord-viewer") {
    
    await openChordViewer(setChords, tuneChords);
    return;
  }

  // Open List Viewer

  if (dataType === "list-viewer") {

    openListViewer(document.querySelector('#tuneSelector'));
    return;
  }

  // Open Tunebook Actions Menu / Fav Picker Menu

  if (dataType === "tunebook-actions-menu") {

    tuneBookActionsPopup.dataset.tbkActionsMode =
      dataOptions? `pick-fav-${dataOptions}` : "open";

    tuneBookActionsPopup.showPopover();

    if (tuneBookActionsPopup.dataset.tbkActionsMode !== "open") return;

    if (isLocalStorageOk() && +localStorage.tuneBookHelpMenuViewed === 1) {

      tuneBookActionsPopup.querySelector('[data-load="launcher"]').focus();
      return;
    }

    tuneBookActionsPopup.querySelector('[data-load="help"]').focus();
    return;
  }

  // Open Support & Follow Menu

  if (dataType === "support-options") {

    const containerId = 
      "nss-support-popover-text";

    const supportMenuContainer =
      document.getElementById(containerId);

    if (!supportMenuContainer) return;

    if (appOptionsPopover && appOptionsPopover.matches(':popover-open')) {

      appOptionsPopover.hidePopover();
    }

    if (!supportMenuContainer.dataset.static) {

      addSupportMenuContent(containerId);
      supportMenuContainer.dataset.static = "true";
    }

    appSupportPopover.showPopover();

    return;
  }

  if (!isLocalStorageOk()) {

    displayNotification("Enable Local Storage or change browser mode to use custom settings", "warning");
    return;
  }

  // Open App Options

  if (dataType === "app-options") {

    if (appSupportPopover && 
        appSupportPopover.matches(':popover-open')) {

      appSupportPopover.hidePopover();
    }

    printLocalStorageSettings(abcTunebookDefaults, true);

    appOptionsPopover.showPopover();
  }

  // Open Encoder Options

  if (dataType === "encoder-options") {

    printLocalStorageSettings(abcEncoderDefaults, true);

    appOptionsPopover.showPopover();
  }
}

// Show Help Guide Popover

function showHelpGuidePopover() {

  if (tuneBookActionsHeaderBtn.hasAttribute("hidden")) {

    helpGuidePopover.dataset.popsUpFrom = "footer";

  } else {

    helpGuidePopover.dataset.popsUpFrom = "header";
  }

  if (checkIfIosBrowser()) {

    disableTuneBookSelectors();
  }

  const helpGuideTitleBox =
    helpGuidePopover.querySelector('[data-title]');

  const helpGuideTextBox =
    helpGuidePopover.querySelector('[data-help-guide="text"]');

  helpGuideTitleBox.dataset.title = "default";
  helpGuideTitleBox.textContent = '';
  helpGuideTextBox.textContent = '';

  goatCountEvent("#help-guide", "app-ui");

  helpGuidePopover.showPopover();
}

// Open Quick Help Dialog overlay

function openQuickHelpDialog() {

  if (tuneBookActionsHeaderBtn.hasAttribute("hidden")) {

    quickHelpDialog.dataset.popsUpFrom = "footer";

  } else {

    quickHelpDialog.dataset.popsUpFrom = "header";
  }

  if (tuneBookTitle.dataset.type === "Tune") {

    quickHelpDialog.dataset.tbkLoaded = "tunes";
  
  } else {

    quickHelpDialog.dataset.tbkLoaded = "sets";
  }

  const helpTextDiv =
    quickHelpDialog.querySelector('.nss-qhelp-description');
    
  helpTextDiv.textContent =
    "Select an element label to view description";

  goatCountEvent("#quick-help", "app-ui");

  quickHelpDialog.showModal();
}

// Show description for Help Dialog item

function showQuickHelpDescription(event) {

  const helpItem = event.target.closest('.nss-btn-qhelp');

  if (!helpItem) return;

  const helpTextDiv = quickHelpDialog.querySelector('.nss-qhelp-description');

  helpTextDiv.textContent = helpItem.title;

  helpItem.focus();
}

////////////////////////////////////////////
// APP SCRIPTS: FOCUS SHIFTERS
///////////////////////////////////////////

// Shift focus to the first non-hidden Tunebook Actions button

function focusOnTuneBookActions() {

    const tuneBookActionsBtns =
      document.querySelectorAll(
        '[data-load="tunebook-actions-menu"]:not([hidden])'
      );

    const focusElem =
      getFirstCurrentlyDisplayedElem(tuneBookActionsBtns);

    if (focusElem) focusElem.focus();
}

// Shift focus to the embedded ABC content
// Temporarily highlight the ABC frame

function focusOnAbcFrame() {

  tuneFrame.contentWindow.focus();

  let abcFrame = tuneFrame;

  if (!abcFrame) return;

  abcFrame.classList.add("focused");

  setTimeout(() => {

    abcFrame.classList.remove("focused");
  }, 1500);
}

// Shift focus to app's Tunebook GUI
// Refocus on previously pressed navigation button (if available)
// Focus on Tune Selector (if no previous button stored)

function focusOnTuneBookGui() {

  if (lastPressedNavBtn) {

    lastPressedNavBtn.focus();

    lastPressedNavBtn = null;
    
    return;
  }

  tuneSelector.focus();
}

// Shift focus to the specific element of a currently open popover
// Optional: Set a timeout for the focus

function focusOnActivePopoverElem(popoverEl, focusElAttr, timeOutVal = 0) {

  if (!popoverEl.matches(':popover-open') && !popoverEl.open) return;

  const focusEl = popoverEl.querySelector(focusElAttr);

  if (focusEl) {

    setTimeout(() => {
      
      focusEl.focus();

    }, timeOutVal);
  }
}

////////////////////////////////////////////
// APP SCRIPTS: ANIMATED POPUPS
///////////////////////////////////////////

// Display Notification Popup Popover with a message to the user
// Adjust popover's behavior and style depending on message type

export function displayNotification(msgText, msgType, nextFocusEl) {

  notificationMessage.textContent = msgText;
  notificationPopup.className = msgType ?? "status";
  notificationPopup.dataset.nextFocus = nextFocusEl || '';

  hideTuneBookActionsMenu(true);

  if (!notificationPopup.matches(':popover-open')) {

    notificationPopup.showPopover();
  }

  if (notificationTimeoutId) {
    
    clearTimeout(notificationTimeoutId);
  }

  if (msgType === "status") {
    
    notificationTimeoutId = setTimeout(() => {

      notificationPopup.hidePopover();
    }, statusNotifyTimeout);

    return;
  }

  if (msgType === "success") {
    
    notificationTimeoutId = setTimeout(() => {

      notificationPopup.hidePopover();
    }, successNotifyTimeout);

    return;
  }
}

// Show a warning outline around the target button

export function displayWarningEffect(focusBtn, fallBackBtn) {

  let targetBtn = 
    getFirstCurrentlyDisplayedElem([focusBtn, fallBackBtn]);

  if (!targetBtn) return;

  targetBtn.style.outline = "0.17rem solid red";
  targetBtn.style.filter = "drop-shadow(1px 1px 8px red)";

  setTimeout(() => {

    targetBtn.style.removeProperty('outline');
    targetBtn.style.removeProperty('filter');
  }, 2500);
}

// Hide Tunebook Actions menu popover
// Optionally disable transition animation

function hideTuneBookActionsMenu(disableAnimation) {

  if (tuneBookActionsPopup && tuneBookActionsPopup.matches(':popover-open')) {

    tuneBookActionsPopup.hidePopover();

    if (!disableAnimation) return;

    tuneBookActionsPopup.style.setProperty("transition", "none");

    setTimeout(() => {
      
      tuneBookActionsPopup.style.removeProperty("transition");
    }, 500);
  }
}

////////////////////////////////////////////
// APP SCRIPTS: CHECKERS & UPDATERS
///////////////////////////////////////////

// Return up-to-date tuneBookSetting value (for use in external modules)

export function checkTuneBookSetting() {

  return tuneBookSetting;
}

// Return true if Tunebook menu elements are currently displayed

export function checkIfTunebookOpen() {

  let isTuneBookOpen = false;

  if (document.body.dataset.tunebook) {

    isTuneBookOpen = true;
  }

  return isTuneBookOpen;
}

// Return true if Help Guide Popover is currently open

function checkIfHelpMenuOpen() {

  let isHelpMenuOpen = false;

  if (helpGuidePopover && helpGuidePopover.matches(':popover-open')) {

    isHelpMenuOpen = true;
  }

  return isHelpMenuOpen;
}

// Return true if app is currently in mobile mode

export function checkIfMobileMode() {

  return document.body.dataset.mode === "mobile";
}

// Return true if the app is viewed from Safari-like browser

function checkIfSafariLikeBrowser() {

  const dataBrowser =
    document.body.dataset.browser;

  const isSafariLike =
    dataBrowser.indexOf('safari') > -1 || dataBrowser.indexOf('-ios') > -1;

  return isSafariLike;
}

// Return true if the app appears to be opened in iOS

function checkIfIosBrowser() {

  const dataBrowser =
    document.body.dataset.browser;

  const isIosBrowser =
    dataBrowser.indexOf('-ios') > -1;

  return isIosBrowser;
}

// Attempt to check what browser and platform the app is being viewed from
// Return string in the format: browsertype-android|ios|desktop

function getBrowserId() {

  const userAgentStr =
    navigator.userAgent.toLowerCase();

  const isChromeLike =
    userAgentStr.indexOf('chrome') > -1;

  const isSafari =
    userAgentStr.indexOf('safari') > -1 &&
    !isChromeLike;

  let userBrowserMarker = 
    userAgentStr.indexOf('firefox') > -1? "firefox" :
    userAgentStr.indexOf('gecko/') > -1? "gecko" :
    userAgentStr.indexOf('webview') > -1? "webview" :
    userAgentStr.indexOf('wv') > -1? "webview" :
    isSafari? "safari" :
    isChromeLike? "chromium" :
    userAgentStr.indexOf('version/') > -1? "webview" :
    "other";

  // Mobile / Android

  const isAndroid =
    userAgentStr.indexOf('android') > -1;

  if (isAndroid) {

    return `${userBrowserMarker}-android`;
  }

  // Mobile / iOS

  const isIOS =
    /ip(ad|hone|od)/.test(userAgentStr) ||
    (/macintosh/.test(userAgentStr) &&
     navigator.maxTouchPoints &&
     navigator.maxTouchPoints > 2);

  if (isSafari && isIOS) {

    userBrowserMarker =
      userAgentStr.indexOf('fxios') > -1? "firefox" :
      userAgentStr.indexOf('crios') > -1? "chrome" :
      userAgentStr.indexOf('opios') > -1? "opera" :
      userAgentStr.indexOf('brave') > -1? "brave" :
      userAgentStr.indexOf('edge') > -1? "edge" :
      userAgentStr.indexOf('yabrowser') > -1? "yandex" :
      userAgentStr.indexOf('duckduckgo') > -1? "webview" :
      userAgentStr.indexOf('webview') > -1? "webview" :
      "safari";

    return `${userBrowserMarker}-ios`;
  }

  if (isIOS) {

    return `webview-ios`;
  }

  // Desktop / Firefox & Gecko-based

  if (userBrowserMarker === "firefox" ||
      userBrowserMarker === "gecko") {

    return userBrowserMarker === "gecko"? "gecko-desktop" : "firefox-desktop";
  }

  // Desktop / Safari

  if (isSafari) {

    return "safari-desktop"
  }

  // Desktop / Chromium-based (likely)

  if (isChromeLike) {

    return "chromium-desktop"
  }

  return "other";
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
      
    loadFromQueryString(itemQuery);
    return;
  }

  // Simply load the first Tunebook item if localStorage is unavailable

  if (!isLocalStorageOk()) {

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

  const isSafari = checkIfSafariLikeBrowser();

  // Safari only: Repopulate Tune Selector

  if (isSafari) {

    repopulateTuneSelector();
    return;
  }

  const tuneGroups = tuneSelector.querySelectorAll(':scope > optgroup');
  const tuneOptions = tuneSelector.querySelectorAll('optgroup > *');

  [tuneGroups, tuneOptions].forEach(tuneSelectorItem => {

    tuneSelectorItem.forEach(item => {
          
      item.removeAttribute("hidden");
      item.removeAttribute("disabled");
    });
  });
}

// Repopulate Tune Selector with options from current Tunebook
// Optional: Filter out options with specific filter ID and Type

function repopulateTuneSelector(filterId, filterType) {

  while (tuneSelector.children.length > 1) {
    tuneSelector.removeChild(tuneSelector.lastChild);
  }

  const currentTuneBook =
    checkTuneBookSetting() === "setlist"? tuneSets : tuneList;

  if (filterId && filterType) {

    let updatedTuneBook = [];

    if (filterType === "tuneType") {

      updatedTuneBook =
        currentTuneBook.filter(item => item.type === filterId);
    }

    if (filterType === "setLeader") {

      updatedTuneBook =
        currentTuneBook.filter(item => item.leaders.indexOf(filterId) > -1);
    }

    populateTuneSelector(updatedTuneBook);
    return;
  }

  populateTuneSelector(currentTuneBook);
}

// Disable all Tunebook selector elements

function disableTuneBookSelectors() {

  const tuneBookSelectors =
    document.querySelectorAll('.nss-tunebook-selector');
  
  tuneBookSelectors.forEach(selector => {

    selector.setAttribute("disabled", "");
  });
}

// Remove disabled attribute from all Tunebook selectors

function reEnableTuneBookSelectors() {

  const tuneBookSelectors =
    document.querySelectorAll('.nss-tunebook-selector');
  
  tuneBookSelectors.forEach(selector => {

    selector.removeAttribute("disabled");
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

// Update app version data in App Options menu

async function updateAppVersionData(versionJson, newVersionJson) {

  const { appVersion, appDate } = versionJson;

  const appVersionText = `App version ${appVersion}`;

  let appVersionTitle;

  if (newVersionJson) {

    appVersionTitle =
      appVersionText + ` | Click to update to version ${newVersionJson.appVersion}`;

    appVersionUpdateBtn.textContent = `Press to update app`;

    appVersionUpdateBtn.dataset.load = "app-update";

  } else {

    const dbCache = await caches.open("session-db-cache");

    const dbVersionCached = await dbCache.match('/version-db.json');

    if (dbVersionCached) {

      const dbVersionJson = await dbVersionCached.json();

      sessionDbVersion = dbVersionJson.dbVersion || '';
    }

    appVersionTitle = appVersionText + `. Click to copy detailed report`;

    appVersionUpdateBtn.textContent = appVersionText;

    appVersionUpdateBtn.dataset.load = "copy-text";

    appVersionUpdateBtn.dataset.copyText = 
      `App version: ${appVersion}` +
      `\nLast updated on: ${appDate}` +
      `\nSession DB version: ${sessionDbVersion? sessionDbVersion : '[Open Tunebook]'}`;
  }

  appVersionUpdateBtn.setAttribute("title", appVersionTitle);

  appVersionUpdateBtn.setAttribute("aria-title", appVersionTitle);
}

////////////////////////////////////////////
// APP SCRIPTS: FETCHERS & DATA HANDLERS
///////////////////////////////////////////

// Initialize Session DB data on first load

async function initSessionDb() {

  if (!('caches' in window)) {

    console.warn("NS Session App:\n\nCache API is not supported in this browser");
    return;
  }

  if (!navigator.onLine ||
      window.origin.toString()
      .replace(/http[s]*:\/\//, '')
      .match(/(?:localhost|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|::1)(?:$|:\d{1,5})/)
    ) {

    return;
  }

  try {

    const isSessionDbCached = await caches.has("session-db-cache");

    if (isSessionDbCached) {

      return;
    }

    const isSessionDBLoaded = await tuneDataFetch();

    if (isSessionDBLoaded) {

      console.log("NS Session App:\n\nSession DB initialized");
    }

  } catch (error) {

    console.warn("NS Session App:\n\nFailed to load Session DB data on startup");

    goatCountEvent("!error-init-session-db", "nss-app__initSessionDb");
  }
}

// Fetch Session DB data
// Update DB version info

async function tuneDataFetch() {

  try {

    const tuneData = await updateDataJsons();

    if (!tuneData[0]) {

      return null;
    }

    console.log(
      `NS Session App:\n\nSession DB ` +
      `${sessionDbVersion? `${sessionDbVersion} ` : ''}` +
      `(${tuneData[0]} sets, ${tuneData[1]} tunes) ` + 
      `successfully fetched and pushed to data JSONs`
    );

    // Show Tunebook report if enabled
    
    if (isLocalStorageOk() && +localStorage.tuneBookShowStatusReport === 1) {

      const { appVersion } = appVersionJson;

      setTimeout(() => {
        displayNotification(
          `App version: v${appVersion}; ` +
          `Session DB: ${sessionDbVersion} (${tuneData[0]} sets, ${tuneData[1]} tunes)`,
          "report"
        );
      }, 100);
    }
    
    return tuneData[0];

  } catch (error) {

    console.warn(`NS Session App:\n\nLaunching app sequence failed. Details:\n\n${error.message}`);

    window.location.hash = "#launcher";

    goatCountEvent("!error-fetch-session-db", "nss-app__tuneDataFetch");

    return null;
  }
}

// Make a Session DB fetch request then return JSON or text or handle errors

export async function fetchData(url, type) {

  try {

    const response = await fetch(url);

    let data;

    if (!response.ok) {

      throw new Error("Failed to fetch data from Session DB", { cause: response });
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

    throw new Error(`[${error}\n\nHTTP error code: ${error.cause?.status}]`);
  }
}

// Fetch all Session DB JSONs

export async function fetchDataJsons() {

  return Promise.all([
      fetchData(tuneSetsLink, "json"),
      fetchData(tuneListLink, "json"),
      fetchData(setChordsLink, "json"),
      fetchData(tuneChordsLink, "json"),
      fetchData(dbVersionLink, "json")
    ]);
}

// Push new tune data to Custom JSONs after fetching Session DB

export async function updateDataJsons() {

  console.log("NS Session App:\n\nFetching data from Session DB...");

  const [setsData, tunesData, setChordsData, tuneChordsData, dbVersionData] =
    await fetchDataJsons();

  updateData(tuneSets, setsData);
  updateData(tuneList, tunesData);
  updateData(setChords, setChordsData);
  updateData(tuneChords, tuneChordsData);

  const { dbVersion } = dbVersionData;
  sessionDbVersion = dbVersion;

  return [tuneSets.length, tuneList.length, setChords.length, tuneChords.length];
}

// Update Custom Tune Data JSON

export async function updateData(dataJson, newData) {

  if (!newData || !newData.length) return;

  dataJson.length = 0;

  dataJson.push(...newData);

  const dataType =
    dataJson === tuneSets? "Sets" :
    dataJson === tuneList? "Tunes" :
    dataJson === setChords? "Set Chords" : "Tune Chords";

  // console.log(`NS Session App:\n\nSession DB updated`);
  console.log(`NS Session App:\n\n${dataType} data loaded`);
}

// Clear Session DB JSONs

export function clearData() {

  tuneSets.length = 0;
  tuneList.length = 0;
  setChords.length = 0;
  tuneChords.length = 0;

  console.log("NS Session App:\n\nSession DB data cleared!");
}

// Read and validate a file uploaded via App Options menu
// Parse App Options from .json file, pass to restoreAppOptionsFromFile
  
function parseAppOptionsImportFile(triggerBtn) {

  try {

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = async function() {

      const fileExt =
        this.files[0].name.split('.').pop().toLowerCase();

      if (fileExt !== 'json' && fileExt !== 'tsv') {

        console.warn("NS Session App:\n\n Settings import file rejected, unsupported file type");

        displayNotification("Unsupported file type: Import .json file to restore App Options", "warning");
        displayWarningEffect(triggerBtn);

        return;
      }

      const rawImportFileData = this.files[0];

      try {

        const importFileContents = await readFileContent(rawImportFileData);

        console.log("NS Session App:\n\nApp Options import file contents read");

        const isAppOptionsSettingsFile =
          importFileContents.match(/^\[\s*{\s*"abcToolsUseLiteEditor":/);

        if (fileExt === 'json' && !isAppOptionsSettingsFile) {

          console.warn("NS Session App:\n\nInvalid App Options file!");

          displayNotification("Not a valid App Options file", "warning");
          
          displayWarningEffect(triggerBtn);

          return;
        }

        // Process App Options JSON, restore user settings

        if (isAppOptionsSettingsFile) {

          restoreAppOptionsFromFile(importFileContents);
          return;
        }

      } catch (error) {

        console.error("NS Session App:\n\nError reading imported data file:\n\n", error);

        displayNotification("Error reading imported data file", "error");
        
        displayWarningEffect(triggerBtn);

        goatCountEvent("!error-app-import-read", "nss-app__parseAppOptionsImportFile");
      }
    };
    
    fileInput.click();

  } catch (error) {

    console.error("NS Session App:\n\nParsing sequence failed!\n\n", error);
    
    displayNotification("Error parsing imported data file", "error");
    
    displayWarningEffect(triggerBtn);
    
    goatCountEvent("!error-app-import-parse", "nss-app__parseAppOptionsImportFile");
  }
}

// Process Settings JSON and restore user settings

function restoreAppOptionsFromFile(importFileData) {

  if (!isLocalStorageOk()) return;

  try {

    const optionsJson = JSON.parse(importFileData);
    const optionsObj = optionsJson[0];

    for (const key in optionsObj) {

      localStorage[key] = optionsObj[key];
    }

  } catch (error) {

    console.error("NS Session App:\n\nParsing options file data failed\n\n", error);
    
    displayNotification("Error parsing imported options file", "error");
    
    goatCountEvent("!error-app-options-restore", "nss-app__restoreAppOptionsFromFile");
  }

  initAppCheckBoxes(true);

  goatCountEvent("#import-app-options", "app-ui");

  console.log("NS Session App:\n\nEncoder options restored");
  
  displayNotification("App options have been restored", "success");
}

// Fetch the latest app version data from the repository
// Update the app version button with the version data

async function fetchAppVersionData() {

  const { appVersion } = appVersionJson;

  // Skip the check if offline or localhost
  if (!navigator.onLine ||
      window.origin.toString()
      .replace(/http[s]*:\/\//, '')
      .match(/(?:localhost|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|::1)(?:$|:\d{1,5})/)
    ) {

    await updateAppVersionData(appVersionJson);
    return;
  }

  console.log(`NS Session App:\n\nChecking for updates...`);

  appVersionUpdateBtn.textContent =
    'Checking for updates...';

  const appBaseUrl =
    window.location.origin +
    window.location.pathname.replace(/\/[^\/]*$/, '/');
    
  const appVersionRemoteUrl =
    `${appBaseUrl}version.json`;

  // Create an AbortController
  // Prevent hanged version checks
  const controller = new AbortController();
  const timeoutMs = 3000;

  // Set up the timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {

    const remoteResponse =
      await fetch(`${appVersionRemoteUrl}?t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store'
        });

    clearTimeout(timeoutId);

    if (!remoteResponse.ok) {
      throw new Error(`Failed to fetch app version JSON: ${remoteResponse.status}`);
    }

    const remoteVersionJson =
      await remoteResponse.json();

    // Check if version changed
    // Update version button accordingly

    if (remoteVersionJson &&
        remoteVersionJson.appVersion &&
        (remoteVersionJson.appVersion !== appVersion)) {

      await updateAppVersionData(appVersionJson, remoteVersionJson);

      console.log(
        `NS Session App:\n\nApp update available\n\n` + 
        `(v${appVersion} -> v${remoteVersionJson.appVersion})`
      );

      if (!appOptionsPopover.matches(':popover-open') && !checkIfTunebookOpen()) {

        displayNotification("Update available: Refresh app or go to Options (⚙️) to get latest version", "success");
      }

    } else {

      await updateAppVersionData(appVersionJson);

      console.log(
        `NS Session App:\n\nApp v${appVersion} is up to date`
      );
    }

  } catch (err) {

    // Show error warning in the console
    // Update version button with current app version

    clearTimeout(timeoutId);

    await updateAppVersionData(appVersionJson);

    goatCountEvent(
      "!error-fetch-version-data",
      "nss-app__fetchAppVersionData"
    );
    
    console.warn(
      'NS Session App:\n\nCould not fetch app version\n\n',
      err.name === 'AbortError'?
        `App version check timed out after ${timeoutMs / 1000}s` :
        err
    );
  }
}

////////////////////////////////////////////
// APP SCRIPTS: ARIA HIDERS & REVEALERS
///////////////////////////////////////////

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

////////////////////////////////////////////
// APP SCRIPTS: EVENT HANDLERS
///////////////////////////////////////////

// Handle custom button click events

async function appButtonHandler(btn) {

  if (btn.hasAttribute('data-cvw-action') || btn.hasAttribute('data-lvw-action')) {

    return; // Handle viewer module buttons separately //
  }

  // Read data-load attribute value

  const dataLoad = btn.dataset.load;

  // Tunebook actions menu: Fav picker mode

  if (btn.dataset.tbkAction &&
      btn.dataset.tbkAction !== "close-tunebook-actions" &&
      tuneBookActionsPopup.dataset.tbkActionsMode.startsWith("pick-fav")) {

    const targetContainer = tuneBookActionsPopup.dataset.tbkActionsMode;
    const containerTitle = targetContainer[9].toUpperCase() + targetContainer.slice(10);

    switchTuneBookFavBtn(btn, targetContainer);

    if (isLocalStorageOk()) {

      localStorage.setItem(`tuneBookFavBtn${containerTitle}`, btn.dataset.tbkAction);
    }

    goatCountEvent("#fav-button-picked", "app-ui");

    tuneBookActionsPopup.hidePopover();

    const tuneBookFooter = document.querySelector('#nss-tunebook-footer');

    document.body.dataset.mode === "desktop"?
    tuneBookFooter.querySelector('[data-controls="mode"]').focus() :
    tuneBookFooter.querySelector('[data-controls="tunebook-actions-mobile"]').focus();

    return;
  }

  // Focus Control Buttons: Focus on target element

  if (btn.dataset.focus && btn.dataset.focus === "abc-frame") {

    toggleAbcFocusLabel("hide");
    focusOnAbcFrame();
    return;
  }

  // Full Screen Buttons: View sections in fullscreen mode

  if (btn.dataset.controls && btn.dataset.controls === "fullscreen-view") {

    handleFullScreenButton(btn.dataset.altView);
    return;
  }

  // Mode Togglers: Switch between Desktop and Mobile Tunebook mode

  if (btn.dataset.controls && btn.dataset.controls === "mode" && btn.dataset.type) {

    switchTunebookMode(btn.dataset.type);
    goatCountEvent(`#${dataLoad? dataLoad : 'switch-undefined-mode'}`, "app-ui");
    return;
  }

  // Launch Buttons: Run section Launcher depending on data type

  if (btn.classList.contains('nss-btn-launch')) {

    if (!dataLoad) return;

    if (dataLoad === "setlist" || 
        dataLoad === "tunelist" || 
        dataLoad === "playalong") {

      window.location.hash = `#${dataLoad}`;
      goatCountEvent(`#${dataLoad}`, "app-ui");
      return;
    }

    // Handle ABC Encoder buttons

    if (dataLoad.startsWith("abc")) {
      
      parseAbcFromFile(dataLoad, btn);
      goatCountEvent(`#${dataLoad}`, "encoder-ui");
      return;
    }

    return; // Launch Buttons End Here //
  }

  // Switch Buttons: Load and swap section content depending on data type

  if (btn.classList.contains('nss-switch-btn')) {

    // Page switchers

    if (btn.classList.contains('nss-launcher-link')) {

      window.location.href = 'index.html';

      return;
    }

    if (!dataLoad) return;

    // Help overlay switcher

    if (dataLoad === "help") {

      hideTuneBookActionsMenu();

      showHelpGuidePopover();

      return;
    }

    // Tune switchers

    if (btn.classList.contains('nss-arrow-btn')) {

      switchTuneBookItem(dataLoad);

      lastPressedNavBtn = btn;

      return;
    }

    // Zoom in and zoom out

    if (btn.classList.contains('nss-zoom-btn')) {

      zoomTuneBookItem(dataLoad);
      
      return;
    }

    // GUI switchers

    if (dataLoad.startsWith("toggle-gui")) {

      toggleFullScreenGui(dataLoad);

      return;
    }

    // Full Screen switchers

    if (dataLoad === "exit-fullscreen") {

      exitFullScreenMode();
      
      return;
    }

    // Tunebook switchers >>>
    // Hash change triggers switchAppSection

    window.location.hash = `#${dataLoad}`;

    return; // Switch Buttons End Here //
  }

  // Option Buttons: Load settings or dialogue menus

  if (btn.classList.contains('nss-option-btn')) {

    if (!dataLoad) return;

    // Update the App

    if (dataLoad === "app-update") {

      console.log('NS Session App:\n\nUpdating the app...');

      window.location.reload(true);
      
      return;
    }

    // Refresh the App

    if (dataLoad === "app-refresh") {

      window.location.reload();
      return;
    }

    // Copy text to clipboard

    if (dataLoad === "copy-text") {

      if (btn.dataset.copyText) {

        if (btn.classList.contains('nss-app-version-btn')) {

          copyTextToClipboard(btn.dataset.copyText, true);
          displayNotification("Version data copied to clipboard", "success");
          return;
        }

        copyTextToClipboard(btn.dataset.copyText);
        return;
      }

      copyTextToClipboard(btn.textContent);
      return;
    }

    // Send email to developer

    if (dataLoad === "send-email") {

      const devMail = atob(appSupportContact);
      const msgBody = encodeURIComponent(`\n\n(Sent via NS Session Setlist support menu)`);
      copyTextToClipboard(devMail);
      window.location.href = `mailto:${devMail}?&body=${msgBody}`;
      return;
    }

    // Reset App Options to defaults

    if (dataLoad === "app-defaults") {

      resetAppOptions();
      goatCountEvent("#reset-app-options", "app-ui");
      return;
    }

    // Reset Encoder Settings to defaults

    if (dataLoad === "encoder-defaults") {

      resetEncoderSettings();
      goatCountEvent("#reset-encoder-settings", "encoder-ui");
      return;
    }

    // Export Encoder Settings and save them as a .json file

    if (dataLoad === "app-options-json") {

      downloadAbcEncoderFile(
        exportLocalStorageSettings(abcTunebookDefaults),
        "ns-app-options.json",
        "export-settings");

      goatCountEvent("#export-app-options", "app-ui");
    }

    // Export Encoder Settings and save them as a .json file

    if (dataLoad === "encoder-json") {

      downloadAbcEncoderFile(
        exportLocalStorageSettings(abcEncoderDefaults),
        "abc-encoder-settings.json",
        "export-settings");

      goatCountEvent("#export-encoder-settings", "encoder-ui");
    }

    // Prompt file selection menu for App Options Import

    if (dataLoad === "app-options-import") {

      parseAppOptionsImportFile(btn);
      return;
    }

    // Prompt file selection menu for Encoder Settings Import

    if (dataLoad === "encoder-import") {

      parseEncoderImportFile(btn);
      return;
    }

    // Trigger Tunebook compact mode
   
    if (dataLoad === "tunebook-compact-mode") {

      setTuneBookCompactMode();
      return;
    }

    // Copy share link to current Tunebook item to clipboard

    if (dataLoad === "share-link") {

      copyTextToClipboard(getShareLink());
      goatCountEvent(`#share-link-copy`, "app-ui");
      return;
    }

    // Open Help Guide from Quick Help Dialog

    if (dataLoad === "help-from-qhelp") {

      quickHelpDialog.close();
      showHelpGuidePopover();
      return;
    }

    // Close options menu if menu button pressed again

    if (dataLoad === "app-options" || dataLoad === "encoder-options") {

      if (appOptionsPopover.matches(':popover-open')) {

        appOptionsPopover.hidePopover();
        return;
      }
    }

    // Close Tunebook actions menu if menu button pressed again

    if (dataLoad === "tunebook-actions-menu") {

      if (tuneBookActionsPopup.matches(':popover-open')) {

        tuneBookActionsPopup.hidePopover();
        return;
      }
    }

    // Open the associated menu by default

    await openSettingsMenu(dataLoad);

    return; // Option Buttons End Here //
  }

  // Advanced Options Buttons: Reveal options or launch a standalone tool
  
  if (btn.classList.contains('nss-btn-advanced-options')) {

    // Show all advanced options and inputs available

    if (btn.id === 'nss-show-advanced-options') {

      btn.style.display = "none";

      advancedOptions.forEach(optGroup => {

        ariaShowMe(optGroup);
      });

      return;
    }

    if (!dataLoad) return;

    // Launch ABC Encoder
    
    if (dataLoad === "abc-encoder") {

      window.location.href = "abc-encoder.html";

      return;
    }

    return; // Advanced Options Buttons End Here //
  }

  // Popover X Buttons: Hide parent element, shift focus to another button

  if (btn.classList.contains('nss-btn-x') || btn.classList.contains('popup-btn-x')) {
  
    if (btn.id === 'nss-popover-options-close') {

      appOptionsPopover.hidePopover();

      document.querySelector('[data-controls="options-menu"]').focus();

      return;
    }

    if (btn.id === 'nss-support-popover-close') {

      appSupportPopover.hidePopover();

      document.querySelector('[data-controls="support-menu"]').focus();

      return;
    }

    if (btn.id === 'nss-qhelp-dialog-close') {

      quickHelpDialog.close();

      focusOnTuneBookActions();

      return;
    }

    if (btn.classList.contains('popup-btn-x') &&
        btn.classList.contains('tunebook-action')) {

      tuneBookActionsPopup.hidePopover();

      focusOnTuneBookActions();

      return;
    }

    if (btn.classList.contains('popup-btn-x')) {

      const parentPopup = btn.parentElement.parentElement;
      const nextFocusEl = parentPopup.dataset.nextFocus;

      parentPopup.hidePopover();

      if (nextFocusEl) {

        document.querySelector(nextFocusEl).focus();
      }

      return;
    }

    return; // Popover X Buttons End Here //
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
    
    return; // Theme Buttons End Here //
  }

  return; // Button Handler Ends Here //
}

// Handle custom checkbox events

async function appCheckBoxHandler(checkBox) {

  const optionName = checkBox.dataset.option;

  if (+localStorage[optionName] > 0) {

    localStorage[optionName] = 0;

    if (checkBox.dataset.disables) 
      reEnableCheckBoxes(checkBox.dataset.disables)

    if (checkBox.dataset.enables)
      reEnableCheckBoxes(checkBox.dataset.enables)
    
    if (checkBox.dataset.linkedOptions)
      disableCheckBoxes(checkBox.dataset.linkedOptions);

    if (checkBox.dataset.linkedInput && document.getElementById(checkBox.dataset.linkedInput))
      document.getElementById(checkBox.dataset.linkedInput).setAttribute("disabled", "");

  } else {

    localStorage[optionName] = 1;

    if (checkBox.dataset.disables) 
      disableCheckBoxes(checkBox.dataset.disables)

    if (checkBox.dataset.enables)
      forceEnableCheckBoxes(checkBox.dataset.enables)

    if (checkBox.dataset.linkedOptions)
      reEnableCheckBoxes(checkBox.dataset.linkedOptions);

    if (checkBox.dataset.linkedInput && document.getElementById(checkBox.dataset.linkedInput))
      document.getElementById(checkBox.dataset.linkedInput).removeAttribute("disabled");
  }

  if (isLocalStorageOk()) {
    const optionsType = optionName.match(/^(?:abcSort|abcEncode|abcDecode)/)? 'encoder' : 'app';
    goatCountEvent(`#${optionName}-${checkBox.checked? "checked" : "unchecked"}`, `${optionsType}-options`);
  }

  switch (optionName) {

    // App Options

    case 'abcToolsUseLiteEditor':
      document.body.dataset.reload = "true";
      checkBox.checked?
        displayNotification("Refresh to apply: App will open tunes in ABC Tools Lite", "success") :
        displayNotification("Refresh to apply: App will open tunes in ABC Transcription Tools", "success");
      break;

    case 'abcToolsSaveAndRestoreTunes':
      checkBox.checked?
        displayNotification("App will now store last opened Tunebook item between sessions", "success") :
        displayNotification("App will always open first Tunebook item on section change", "success");
      break;

    case 'tuneBookAlwaysUseMobileMode':
      checkBox.checked?
        displayNotification("Persistent Tunebook mobile mode enabled", "success") :
        displayNotification("Persistent Tunebook mobile mode disabled", "success");
      break;

    case 'tuneBookAlwaysUseDesktopMode':
      checkBox.checked?
        displayNotification("Persistent Tunebook desktop mode enabled", "success") :
        displayNotification("Persistent Tunebook desktop mode disabled", "success");
      break;

    case 'tuneBookShareLinksToAbcTools':
      checkBox.checked?
        displayNotification("App will now generate share links to ABC Transcription Tools", "success") :
        displayNotification("App will now generate short share links to Tunebook", "success");
      break;

    case 'abcToolsFullScreenOpensNewWindow':
      checkBox.checked?
        displayNotification("Full Screen button will always redirect to ABC Transcription Tools", "success") :
        displayNotification("Full Screen button will attempt to open Tunebook items in full screen", "success");
      break;

    // Advanced App Options

    case 'tuneBookShowStatusReport':
      checkBox.checked?
        displayNotification("App will show version info and Set / Tune count on Tunebook startup", "success") :
        displayNotification("App will not show version info on Tunebook startup", "success");
      break;

    case 'tuneBookAllowLoadFromHashLink':
      checkBox.checked?
        displayNotification("App will auto-open Tunebook from links on startup", "success") :
        displayNotification("App will always open Launch Screen on startup", "success");
      break;

    case 'tuneBookAddRandomFilterEmojis':
      checkBox.checked?
        displayNotification("App will now add random animal emojis as avatars for Set Leaders filters", "success") :
        displayNotification("App will now add a neutral emoji as Set Leaders filter avatar", "success");
      break;

    case 'abcToolsAllowInstrumentChanges':
      checkBox.checked?
        displayNotification("MIDI presets have been enabled for ABC playback", "success") :
        displayNotification("App will now ignore MIDI presets when playing back tunes", "success");
      break;

    case 'abcToolsAlwaysMuteChords':
      checkBox.checked?
        displayNotification("App will now add instructions to mute chords when opening ABC", "success") :
        displayNotification("App will now play chords by default when playing back tunes", "success");
      break;

    case 'abcToolsAllowTabStyleChanges':
      checkBox.checked?
        displayNotification("Tab presets have been enabled for ABC display", "success") :
        displayNotification("App will now ignore Tab presets when displaying ABC", "success");
      break;

    case 'abcToolsAllowTuneAutoReload':
      checkBox.checked?
        displayNotification("App will now auto-load items when filters are applied or sections swapped", "success") :
        displayNotification("App will stop auto-loading items when filters are applied or sections swapped", "success");
      break;

    case 'listViewerOverrideTuneSelector':
      checkBox.checked?
        displayNotification("Clicking on Tune Selector will now launch List Viewer", "success") :
        displayNotification("Clicking on Tune Selector will now open the default dropdown menu", "success");
      break;

    case 'chordViewerAllowDynamicChords':
      checkBox.checked?
        displayNotification("Chord Viewer will attempt to extract chords from current tune", "success") :
        displayNotification("Chord Viewer will always use Chordbook JSON as source of chords", "success");
      break;

    case 'chordViewerUseBoldFonts':
      checkBox.checked?
        document.querySelector('[data-chord-viewer="chords-container"]').style.fontWeight = "bold" :
        document.querySelector('[data-chord-viewer="chords-container"]').style.removeProperty("font-weight");
      checkBox.checked?
        displayNotification("Chord Viewer will now use bold font weight for chords", "success") :
        displayNotification("Chord Viewer will now use normal font weight for chords", "success");
      break;

    case 'listViewerHideSliderGui':
      checkBox.checked?
        ariaHideMe(document.querySelector('[data-list-viewer="slider"]')) :
        ariaShowMe(document.querySelector('[data-list-viewer="slider"]'));
      checkBox.checked?
        displayNotification("List Viewer Slider GUI has been hidden", "success") :
        displayNotification("List Viewer Slider GUI will now be displayed", "success");
      break;

    case 'listViewerSearchSubTitles':
      checkBox.checked?
        displayNotification("List Viewer Search will now look through all ABC subtitles", "success") :
        displayNotification("List Viewer Search will now look through primary ABC titles", "success");
      break;

    // Encoder Settings

    case 'abcEncodeSortsTuneBook':
      checkBox.checked?
        displayNotification("Encode will now output all Encode and Sort file types", "success") :
        displayNotification("Encode will now output only Encode file types", "success");
      break;

    case 'abcEncodeExportsTuneList':
      checkBox.checked?
        displayNotification("Encode will now output a .txt list of tunes and links for each ABC file", "success") :
        displayNotification("Encode will now skip creating .txt list files for ABC", "success");
      break;

    case 'abcEncodeOutputsAbcToolsString':
      checkBox.checked?
        displayNotification("Encode will now output `const tunes=` string compatible with ABC Tools export website", "success") :
        displayNotification("Encode will now output JSON file compatible with Novi Sad Session Setlist", "success");
      break;

    case 'abcEncodeTuneListLinksToLite':
      checkBox.checked?
        displayNotification("Encode will now link to ABC Tools Lite editor when processing Tunelist", "success") :
        displayNotification("Encode will now link to Michael Eskin’s ABC Transcription Tools when processing Tunelist", "success");
      break;

    case 'abcEncodeUsesLzwCompression':
      checkBox.checked?
        displayNotification("Encode will now use LZString to compress ABC (longer lzw= links to ABC Tools)", "success") :
        displayNotification("Encode will now use Deflate to compress ABC (shorter def= links to ABC Tools)", "success");
      break;

    case 'abcSortEnforcesCustomAbcFields':
      checkBox.checked?
        displayNotification("Sort will now enforce custom fields used by N.S.S.S.", "success") :
        displayNotification("Sort will now support all standard ABC fields", "success");
      break;

    case 'abcSortExportsTunesFromSets':
      checkBox.checked?
        displayNotification("Sort will now output a separate ABC of Tunes converted from Sets", "success") :
        displayNotification("Sort will now output a single sorted ABC file", "success");
      break;

    case 'abcSortExportsChordsFromTunes':
      checkBox.checked?
        displayNotification("Sort will now output a Chordbook JSON extracted from ABC", "success") :
        displayNotification("Sort will now skip ABC chords extraction", "success");
      break;

    case 'abcSortUsesStrictTuneDetection':
      checkBox.checked?
        displayNotification("Sort will now remove tunes with no key or empty K: field", "success") :
        displayNotification("Sort will now allow tunes with no key, adding blank K: fields", "success");
      break;

    // Advanced Encoder Settings

    case 'abcSortFetchesTsoMetaData':
      checkBox.checked?
        displayNotification("Sort will now fetch C: and Z: data from links to The Session found in ABC", "success") :
        displayNotification("Sort will now skip fetching C: and Z: data from The Session", "success");
      break;

    case 'abcSortFormatsSetTitleFirstName':
      checkBox.checked?
        displayNotification("Sort will always use the name of the first tune as Set Title", "success") :
        displayNotification("Sort will now use original Set Title where available", "success");
      break;

    case 'abcSortFormatsSetTitleSlashNames':
      checkBox.checked?
        displayNotification("Sort will always use a slash-separated name list as Set Title", "success") :
        displayNotification("Sort will now use original Set Title where available", "success");
      break;

    case 'abcSortFormatsTitlesTypePrefix':
      checkBox.checked?
        displayNotification("Sort will now add a title prefix with R: data such as POLKA:", "success") :
        displayNotification("Sort will now skip adding a title prefix with R: data", "success");
      break;

    case 'abcSortFormatsTitlesTypeSuffix':
      checkBox.checked?
        displayNotification("Sort will now add a title suffix with R: data such as [Polka]", "success") :
        displayNotification("Sort will now skip adding a title suffix with R: data", "success");
      break;

    case 'abcSortReSortsByAbcTag':
      checkBox.checked?
        displayNotification("Sort will now sort ABCs by custom header value", "success") :
        displayNotification("Sort will now sort ABCs by T: header value", "success");
      break;

    case 'abcSortReSortsByAbcTSansPrefix':
      checkBox.checked?
        displayNotification("Sort will now order ABCs by T: / Title ignoring prefix and The/An/A", "success") :
        displayNotification("Sort will now order ABCs by T: / Title including prefix and The/An/A", "success");
      break;

    case 'abcSortRespectsOriginalOrder':
      checkBox.checked?
        displayNotification("Sort will now keep the original order of ABCs", "success") :
        displayNotification("Sort will now order ABCs by T: / Title including prefix and The/An/A", "success");
      break;

    case 'abcSortFormatsTitlesInIrish':
      checkBox.checked?
        displayNotification("Sort will now attempt to correct capitalization of eclipsed and lenited words in Irish titles", "success") :
        displayNotification("Sort will now skip correcting capitalization of Irish words in tune titles", "success");
      break;

    case 'abcSortFormatsTitlesMovesTheAnA':
      checkBox.checked?
        displayNotification("Sort will now move articles at the start of ABC title to title's end", "success") :
        displayNotification("Sort will now skip moving opening articles to ABC title's end", "success");
      break;

    case 'abcSortFormatsTitlesTitleCase':
      checkBox.checked?
        displayNotification("Sort will now format all titles in AP Style Title Case, skipping uppercased words", "success") :
        displayNotification("Sort will now skip title capitalization", "success");
      break;

    case 'abcSortFormatsTitlesNoCaps':
      checkBox.checked?
        displayNotification("Sort will now attempt to pre-process uppercased words in titles", "success") :
        displayNotification("Sort will now skip pre-processing uppercased words in titles", "success");
      break;

    case 'abcSortNormalizesAbcPartEndings':
      checkBox.checked?
        displayNotification("Sort will now attempt to normalize part endings to ||", "success") :
        displayNotification("Sort will now skip normalizing part endings", "success");
      break;

    case 'abcSortRemovesDuplicatesByContent':
      checkBox.checked?
        displayNotification("Sort will now remove ABCs with identical content (sans X:), leaving the first copy", "success") :
        displayNotification("Sort will now skip deduplicating ABCs by content", "success");
      break;

    case 'abcSortRemovesDuplicatesByTitle':
      checkBox.checked?
        displayNotification("Sort will now remove ABCs with identical Title, leaving the last copy", "success") :
        displayNotification("Sort will now skip deduplicating ABCs by Title", "success");
      break;

    case 'abcSortFormatsTitlesNoTheAnAStart':
      checkBox.checked?
        displayNotification("Sort will now remove articles The/An/A from title's start. It will skip An/A before mutated Irish words", "success") :
        displayNotification("Sort will now skip processing opening articles in titles", "success");
      break;

    case 'abcSortFormatsTitlesNoIrishAnAStart':
      checkBox.checked?
        displayNotification("Sort will now convert An/A + mutated Irish word pairs at title's start to single word in NOM case", "success") :
        displayNotification("Sort will now skip processing An/A + mutated Irish word pairs at title's start", "success");
      break;

    case 'abcSortFormatsTitlesNoTheAnAEnd':
      checkBox.checked?
        displayNotification("Sort will now remove articles The/An/A from title's end, keeping the existing (suffix)/[suffix]", "success") :
        displayNotification("Sort will now skip processing trailing articles in titles", "success");
      break;

    case 'abcSortSkipsTitleEditForOrderedAbc':
      checkBox.checked?
        displayNotification("Sort will now skip changing ABC titles if headers are ordered in line with Encoder specs", "success") :
        displayNotification("Sort will now edit ABC titles even if all the headers are in order", "success");
      break;

    case 'abcSortSkipsDeepEditForOrderedAbc':
      checkBox.checked?
        displayNotification("Sort will now skip filling in ABC field values if headers are ordered in line with Encoder specs", "success") :
        displayNotification("Sort will now run ABCs through entire field-editing algorithm regardless of its contents", "success");
      break;

    case 'abcSortSkipsMergingDuplicateFields':
      checkBox.checked?
        displayNotification("Sort will now skip merging ABC header fields in Sets, allowing for duplicate display in abcjs", "success") :
        displayNotification("Sort will now merge ABC header fields in Sets, fixing duplicate display in abcjs", "success");
      break;

    case 'abcSortSkipsUpdatingTsoMetaData':
      checkBox.checked?
        displayNotification("Sort will now skip fetching The Session metadata if ABC contains line ‘...at The Session’", "success") :
        displayNotification("Sort will always fetch and update metadata in ABCs containing links to The Session", "success");
      break;

    case 'abcSortRemovesLineBreaksInAbc':
      checkBox.checked?
        displayNotification("Sort will now reassemble ABC body line-by-line to ensure it has no empty lines", "success") :
        displayNotification("Sort will now skip processing line breaks in ABC body", "success");
      break;

    case 'abcSortRemovesTextAfterLineBreaksInAbc':
      checkBox.checked?
        displayNotification("Sort will now remove all extra text separated by line breaks from ABC body", "success") :
        displayNotification("Sort will now skip processing line break-separated text in ABC body", "success");
      break;

    default:
      break;
  }

  return;
}

// Handle custom radio input click events

function appRadioBtnHandler(input) {

  if (input === fullScreenViewChordsRadioBtn) {

    localStorage.abcToolsFullScreenBtnShowsChords = 1;
    return;
  }

  if (input === fullScreenViewTunesRadioBtn) {

    localStorage.abcToolsFullScreenBtnShowsChords = 0;
    return;
  }
}

// Handle custom dropdown menu events

async function appDropDownHandler(event) {

  if (event.key !== 'Tab' && 
      (event.type === 'mousedown' ||
      event.type === 'keydown' ||
      event.type === 'touchstart') &&
      checkIfHelpMenuOpen()) {

    event.preventDefault();
    event.target.closest('select').focus();
    helpGuidePopoverHandler(event);
    return;
  }

  if (event.type === 'change') {
    
    if (this === filterOptions) {

      handleSelectorLabels("select", filterOptions, filterOptions.selectedIndex);

      filterTuneBook();
    }
  }

  const isLvwOverrideOn = isLocalStorageOk() && +localStorage.listViewerOverrideTuneSelector === 1;

  if (getViewportWidth() >= 768 || isLvwOverrideOn) return;

  if (event.type === 'mousedown' || event.type === 'keydown' || event.type === 'touchstart') {

    handleSelectorLabels("clearone", this);
  }

  if (event.type === 'blur' || event.type === 'keyup' || event.type === 'touchend') {

    handleSelectorLabels("setone", this);
  }
}

// Filter Tune Selector by selected Tune Type or Set Leader

function filterTuneBook() {

  const filterId = filterOptions.value;

  // Do nothing if placeholder icon selected

  if (filterId === "-1") return;

  // Reset filters, show all Tune Selector options

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
  
  const isSafari = checkIfSafariLikeBrowser();
  const tuneGroups = tuneSelector.querySelectorAll(':scope > optgroup');
  const tuneOptions = tuneSelector.querySelectorAll('optgroup > *');
  const activeFilter = filterOptions.querySelector('option:checked')
  const activeFilterGroup = activeFilter.closest('optgroup');

  // Filter Tune Selector by Tune Type
  
  if (filterId && activeFilterGroup.label.includes("Tune Type")) {

    // Safari only: Repopulate Tune Selector with items matching Tune Type

    if (isSafari) {

      repopulateTuneSelector(filterId, "tuneType");

    } else {

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
  }

  // Filter Tune Selector by Set Leader

  if (filterId && activeFilterGroup.label.includes("Set Leader")) {

    // Safari only: Repopulate Tune Selector with items matching Set Leader

    if (isSafari) {

      repopulateTuneSelector(filterId, "setLeader");

    } else {

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
  }

  tuneSelector.selectedIndex = 0;

  tuneSelector.dispatchEvent(new Event('change'));

  console.log(`NS Session App:\n\nTunebook filtered by "${filterId}"`);

  setTimeout(() => {
    displayNotification(`Tunebook filtered by "${filterId}"`, "status");
  }, 150);

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

    if (getViewportWidth() >= 768 || document.body.dataset.mode === "desktop") {
      
      removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders);
      return;
    }

    if (document.body.dataset.mode === "mobile") {
      
      setMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders, newSelectorLabels);
      return;
    }
  }

  if (actionType === "resize") {

    if (getViewportWidth() >= 768 &&
      (filterHeader.hasAttribute('label') || 
      tunesHeader.hasAttribute('label') || 
      tabsHeader.hasAttribute('label'))) {

      removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders);
      return;
    }

    if (getViewportWidth() < 768) {

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

      if (selectedIndex !== 0 || getViewportWidth() >= 768) {

        parentSelector.style.removeProperty('font-size');
        return
      }

      return;
    }

    if (selectedIndex !== 0 || document.body.dataset.mode === "desktop" || getViewportWidth() >= 768) return;

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

  // Check if the browser is likely a mobile browser

  const isLikelyMobile = isMobileBrowser();

  // Handle global font size adjustments >>>

  const viewPortW = getViewportWidth();
  const viewPortH = getViewportHeight();

  // Adjust font-size value based on viewport size for small and medium-sized screens

  if (document.body.dataset.mode === "mobile" &&
     (viewPortW < 880 || (viewPortH <= 768 && isLikelyMobile))) {

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
  const isFixedViewport = !viewPortMeta.getAttribute("content").startsWith("width=device-width, initial-scale=1.0");

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

    if (isLocalStorageOk() && localStorage.tuneBookFullScreenGuiDisplay) {
      
      abcContainer.style.setProperty("--fullscreen-gui-display", localStorage.tuneBookFullScreenGuiDisplay);
    }

    // Desktop Mode

    if (!checkIfMobileMode()) {

      tuneFrame.style.zoom =
        isLocalStorageOk() && localStorage.tuneBookFullScreenZoom?
          localStorage.tuneBookFullScreenZoom : "100%";

      return;
    }

    // Mobile Mode

    abcContainer.style.width = "100vw";
    abcContainer.style.height = "100vh";
    abcContainer.style.backgroundColor = "white";
    tuneFrame.style.border = "unset";
      
    tuneFrame.style.width =
      isLocalStorageOk() && localStorage.tuneBookFullScreenWidth?
        localStorage.tuneBookFullScreenWidth : "95%";

    return;

  // Execute right after exiting fullscreen

  } else {

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

    // Optional: Focus on the Full Screen button that likely triggered fullscreen mode

    const mainFullScreenBtn = document.querySelector('#fullScreenButton');
    const popUpFullScreenBtn = tuneBookActionsPopup.querySelector('[data-controls="fullscreen-view"]');

    if (tuneBookActionsPopup && tuneBookActionsPopup.matches(':popover-open') && 
        popUpFullScreenBtn && getComputedStyle(popUpFullScreenBtn.parentElement).display !== "none") {

      popUpFullScreenBtn.focus();
      return;
    }

    mainFullScreenBtn.focus();
    return;
  }
}

// Handle all app click events

function appWindowClickHandler(event) {

  const interactableEl = 'button, select, input[type="checkbox"], input[type="radio"]';

  const triggerEl = event.target.closest(interactableEl);

  if (!triggerEl) return;

  const elTag = triggerEl.tagName.toLowerCase();

  // Prevent clicks on elements in Help Guide mode

  if (checkIfHelpMenuOpen()) {

    event.preventDefault();
    helpGuidePopoverHandler(event);
    return;
  }

  // Prevent clicks on elements after long press

  if (triggerEl.dataset.longPress && triggerEl.dataset.activated === "true") {

    event.preventDefault();
    triggerEl.dataset.activated = "false";
    return;
  }

  // Handle all button clicks

  if (elTag === 'button') {

    appButtonHandler(triggerEl);
  }

  // Handle checkbox clicks

  if (elTag === 'input' & triggerEl.type === "checkbox") {

    appCheckBoxHandler(triggerEl);
  }

  // Handle radio input clicks

  if (elTag === 'input' & triggerEl.type === "radio") {

    appRadioBtnHandler(triggerEl);
  }
}

// Handle specific app mouse events

async function appWindowMouseEventHandler(event) {

  const interactableEl = 'button, label, select, input[type="checkbox"], input[type="radio"]';

  const triggerEl = event.target.closest(interactableEl);

  if (!triggerEl ||
      triggerEl.hasAttribute('data-cvw-action') ||
      triggerEl.hasAttribute('data-lvw-action') ||
      checkIfHelpMenuOpen()) return;

  if (event.type === 'mousedown') {

    if (triggerEl.dataset.longPress && triggerEl.dataset.longPress !== "off") {

      if (triggerEl.dataset.favBtn) {

        activateLongPressFavBtn(event, triggerEl);
        return;
      }

      if (triggerEl.id === "tuneSelector" && isLocalStorageOk() && 
          +localStorage.listViewerOverrideTuneSelector === 1) {

        event.preventDefault();
        return;
      }
      return;
    }
    return;
  }

  if (event.type === 'mouseup') {

    if (triggerEl.id === "tuneSelector" && isLocalStorageOk() && 
        +localStorage.listViewerOverrideTuneSelector === 1) {

      await openSettingsMenu("list-viewer");
      return;
    }

    if (triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress === "pressed") {

      if (triggerEl.dataset.favBtn) {

        focusOnActivePopoverElem(
          tuneBookActionsPopup,
          '[data-load="help"]',
          5
        );
      }

      triggerEl.dataset.longPress = "on";
      return;
    }

    if (triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress === "active") {

      appClearLongPressTimeout(triggerEl);
      return;
    }

    return;
  }

  if (event.type === 'mousemove') {

    if (triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress === "active") {

      appClearLongPressTimeout(triggerEl);
      return;
    }

    return;
  }

  if (event.type === 'contextmenu') {

    if (triggerEl.id === "fullScreenButton") {

      event.preventDefault();

      await openSettingsMenu("chord-viewer");
      return;
    }

    if (triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress !== "off") {

      event.preventDefault();

      if (triggerEl.dataset.favBtn) {

        await openSettingsMenu("tunebook-actions-menu", triggerEl.dataset.favBtn);

        focusOnActivePopoverElem(
          tuneBookActionsPopup,
          '[data-load="help"]',
          5
        );
        return;
      }

      if (triggerEl.id === "tuneSelector") {

        await openSettingsMenu("list-viewer");
        return;
      }
      return;
    }

    return;
  }
}

// Handle specific app touch events

function appWindowTouchEventHandler(event) {

  const interactableEl = 'button, label, select, input[type="checkbox"], input[type="radio"]';

  const triggerEl = event.target.closest(interactableEl);

  if (!triggerEl ||
      triggerEl.hasAttribute('data-cvw-action') ||
      triggerEl.hasAttribute('data-lvw-action') ||
      checkIfHelpMenuOpen()) return;

  if (event.type === 'touchstart') {

    if (triggerEl.dataset.longPress && triggerEl.dataset.longPress !== "off") {

      if (triggerEl.dataset.favBtn) {

        activateLongPressFavBtn(event, triggerEl);
        return;
      }

      if (triggerEl.id === "fullScreenButton") {

        activateLongPressFullScreenBtn(event, triggerEl);
        return;
      }

      if (triggerEl.id === "tuneSelector") {

        activateLongPressTuneSelector(event, triggerEl);
        return;
      }
      return;
    }
    return;
  }

  if (event.type === 'touchend') {

    if (triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress === "pressed") {

      if (triggerEl.dataset.favBtn) {

        focusOnActivePopoverElem(
          tuneBookActionsPopup,
          '[data-load="help"]',
          5
        );
      }

      if (triggerEl.id === "tuneSelector") {

        const listViewerDialog =
          document.getElementById("list-viewer");

        setTimeout(() => {
          focusOnActivePopoverElem(
            listViewerDialog,
            '[data-lvw-action="close-list-viewer"]',
            5
          );
        }, 100);
      }

      triggerEl.dataset.longPress = "on";
      triggerEl.dataset.activated = "false";
      return;
    }

    if (triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress === "active") {

      appClearLongPressTimeout(triggerEl);
      return;
    }

    return;
  }

  if (event.type === 'touchmove') {

    if (triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress === "active") {

      appClearLongPressTimeout(triggerEl);
      return;
    }

    return;
  }
}

// Handle specific app keyboard events

async function appWindowKeyboardEventHandler(event) {

  const key = event.key;

  // Handle Escape key press with open popovers

  if (event.type === 'keydown' &&
      key === 'Escape') {
    
    if (tuneBookActionsPopup.matches(':popover-open')) {

      hideTuneBookActionsMenu();
      focusOnTuneBookActions();
      return;
    }

    if (appOptionsPopover.matches(':popover-open')) {

      appOptionsPopover.hidePopover();
      document.querySelector('[data-controls="options-menu"]').focus();
      return;
    }

    if (appSupportPopover.matches(':popover-open')) {

      appSupportPopover.hidePopover();
      document.querySelector('[data-controls="support-menu"]').focus();
      return;
    }
  }

  // Handle Tunebook-specific shortcuts

  if (event.type === 'keydown' &&
      event.shiftKey &&
      checkIfTunebookOpen() &&
      !document.fullscreenElement &&
      !checkIfHelpMenuOpen() &&
      !quickHelpDialog.open &&
      !chordViewerDialog.open &&
      !listViewerDialog.open) {

    if (key === "F1" ||
        key === "F2" ||
        key === "F3" ||
        key === "F4" ||
        key === "F11") {

      goatCountEvent(
        `#pressed-shift-${key.toLowerCase()}`,
        "shortcut"
      );
    }

    switch (key) {
      case "F1":
        event.preventDefault();
        showHelpGuidePopover();
        return;

      case "F2":
        event.preventDefault();
        focusOnTuneBookActions();
        document.activeElement.click();
        return;

      case "F3":
        event.preventDefault();
        await openSettingsMenu("list-viewer");
        return;

      case "F4":
        event.preventDefault();
        toggleAbcFocusLabel("hide");
        focusOnAbcFrame();
        return;

      case "F11":
        event.preventDefault();
        handleFullScreenButton("chord-viewer");
        return;
    
      default:
        break;
    }    
  }

  // Handle Tunebook arrow navigation

  if (event.type === 'keydown' &&
      event.shiftKey &&
      key.startsWith('Arrow') &&
      checkIfTunebookOpen() &&
      !checkIfHelpMenuOpen() &&
      !quickHelpDialog.open &&
      !chordViewerDialog.open &&
      !listViewerDialog.open) {

    const prevBtn =
      getFirstCurrentlyDisplayedElem(
        document.querySelectorAll('[data-load="prev"]')
      );
    const nextBtn =
      getFirstCurrentlyDisplayedElem(
        document.querySelectorAll('[data-load="next"]')
      );

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        switchTuneBookItem("prev");
        lastPressedNavBtn = prevBtn;
        return;

      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        switchTuneBookItem("next");
        lastPressedNavBtn = nextBtn;
        return;

      default:
        break;
    }
  }

  // Handle triggers for ABC Frame focus popup label

  if (event.type === 'keydown' &&
      key === 'Tab' &&
      !checkIfHelpMenuOpen() &&
      ((!event.shiftKey &&
        event.target.id === "fullScreenButton") ||
      (!checkIfMobileMode() &&
        event.shiftKey &&
        event.target.id === "nss-tunebook-exit-footer") ||
      (!document.fullscreenElement &&
        checkIfMobileMode() &&
        event.shiftKey &&
        event.target.dataset.load &&
        event.target.dataset.load === "prev") ||
      (document.fullscreenElement &&
        event.shiftKey &&
        event.target.dataset.load &&
        event.target.dataset.load === "zoom-in") ||
      (document.fullscreenElement &&
        !event.shiftKey &&
        event.target.dataset.load &&
        event.target.dataset.load === "exit-fullscreen") ||
      (document.fullscreenElement &&
        event.shiftKey &&
        abcContainer.hasAttribute("style") &&
        abcContainer.getAttribute("style").startsWith("--fullscreen-gui-display: none") &&
        event.target.dataset.load &&
        event.target.dataset.load === "toggle-gui-fullscreen"))
      ) {

    toggleAbcFocusLabel("show");
    return;
  }

  // Handle Full Screen mode shortcuts

  if (document.fullscreenElement &&
      checkIfTunebookOpen() &&
      event.type === 'keydown' &&
      event.shiftKey) {

    switch(event.keyCode) {
      case 61:
      case 107:
      case 187:
        event.preventDefault();
        zoomTuneBookItem("zoom-in");
        return;

      case 173:
      case 109:
      case 189:
        event.preventDefault();
        zoomTuneBookItem("zoom-out");
        return;
    
      default:
        break;
    }

    switch (key) {
      case "F4":
        event.preventDefault();
        goatCountEvent(
          `#pressedfs-shift-${key.toLowerCase()}`,
          "shortcut"
        );
        focusOnAbcFrame();
        return;

      case "F11":
        event.preventDefault();
        goatCountEvent(
          `#pressedfs-shift-${key.toLowerCase()}`,
          "shortcut"
        );
        exitFullScreenMode();
        return;
    
      default:
        break;
    }
    return;
  }

  // Handle Help Guide menu shortcuts

  if (checkIfHelpMenuOpen() &&
      event.type === 'keydown' &&
      key === "Escape") {

    quitHelpGuidePopover();
    focusOnTuneBookActions();
    return;
  }

  // Handle keyboard events on interactable elements

  const interactableEl = 'button, label, select, input[type="checkbox"], input[type="radio"]';

  const triggerEl = event.target.closest(interactableEl);

  if (!triggerEl ||
      triggerEl.hasAttribute('data-cvw-action') ||
      triggerEl.hasAttribute('data-lvw-action')) return;

  if (checkIfHelpMenuOpen() &&
      event.type === 'keydown' &&
      (key === 'Enter' || key === ' ')) {

    event.preventDefault();
    helpGuidePopoverHandler(event);
    return;
  }

  if (event.type === 'keydown') {

    if (key === "Enter" && event.shiftKey &&
        triggerEl.dataset.longPress &&
        triggerEl.dataset.longPress !== "off") {

      event.preventDefault();

      goatCountEvent(
        `#pressed-shift-${key.toLowerCase()}`,
        "shortcut"
      );

      if (triggerEl.dataset.favBtn) {

        await openSettingsMenu("tunebook-actions-menu", triggerEl.dataset.favBtn);
        return;
      }

      if (triggerEl.id === "fullScreenButton") {

        await openSettingsMenu("chord-viewer");
        return;
      }

      if (triggerEl.id === "tuneSelector") {

        await openSettingsMenu("list-viewer");
        return;
      }
      return;
    }
    return;
  }

  if (event.type === 'keyup') {

    if (key === "Enter" && event.shiftKey &&
        triggerEl.dataset.longPress) {

      if (triggerEl.dataset.favBtn) {

        focusOnActivePopoverElem(
          tuneBookActionsPopup,
          '[data-load="help"]',
          5
        );
      }
      return;
    }
    return;
  }
}

// Set a long press timeout with a callback function

function appSetLongPressTimeout(event, triggerEl, timeOutVal, callBackFn, callBackArgs) {

  triggerEl.dataset.longPress = "active";

  longPressTimeoutId = setTimeout(() => {

    longPressTimeoutId = null;
    callBackFn(...callBackArgs);
    triggerEl.dataset.longPress = "pressed";

    if (triggerEl.tagName.toLowerCase() === "label") {

      triggerEl.querySelector('input').dataset.activated = "true";

    } else {

      triggerEl.dataset.activated = "true";
    }
  }, timeOutVal);
}

// Reset a long press timeout

function appClearLongPressTimeout(targetEl) {

  clearTimeout(longPressTimeoutId);

  if (targetEl) {

    targetEl.dataset.longPress = "on";
  }
}

// Activate long press event on a Tunebook fav button

function activateLongPressFavBtn(event, triggerEl) {

  triggerEl.dataset.longPress = "on";

  const timeOutVal = 500;

  const callBackArgs =
      ["tunebook-actions-menu", triggerEl.dataset.favBtn];

  appSetLongPressTimeout(event, triggerEl, timeOutVal, openSettingsMenu, callBackArgs);
}

// Activate long press event on the Full Screen Button

function activateLongPressFullScreenBtn(event, fullScreenButton) {

  fullScreenButton.dataset.longPress = "on";

  const timeOutVal = 500;

  const callBackArgs = ["chord-viewer"];

  appSetLongPressTimeout(event, fullScreenButton, timeOutVal, openSettingsMenu, callBackArgs);
}

// Activate long press event on the Tune Selector

function activateLongPressTuneSelector(event, tuneSelectorEl) {

  tuneSelectorEl.dataset.longPress = "on";

  const timeOutVal = 500;

  const callBackArgs = ["list-viewer"];

  appSetLongPressTimeout(event, tuneSelectorEl, timeOutVal, openSettingsMenu, callBackArgs);
}

// Handle events with Help Guide Popover open

function helpGuidePopoverHandler(event) {

  const interactableEl = 'a, button, label, select, input[type="checkbox"], input[type="radio"]';

  const triggerEl = event.target.closest(interactableEl);

  if (!triggerEl) return;

  const helpData = triggerEl.dataset.helpGuide;

  if (helpData) {

    if (helpData === 'quit') {

      quitHelpGuidePopover();
      focusOnTuneBookActions();
      return;
    }

    if (helpData === 'quick-help') {

      quitHelpGuidePopover();
      openQuickHelpDialog();
      return;
    }

    if (helpData === 'readme') {

      window.open(triggerEl.href, "_blank");
      return;
    }

    return;
  }
  const helpGuideTitleBox =
    helpGuidePopover.querySelector('[data-title]');
    
  const helpGuideTextBox =
    helpGuidePopover.querySelector('[data-help-guide="text"]');

  if (helpGuideTitleBox.dataset.title === "default") {

    helpGuideTitleBox.dataset.title = "custom";
  }

  const elTitleText = 
    triggerEl.hasAttribute("aria-title")?
      triggerEl.getAttribute("aria-title") : triggerEl.title || null;

  const helpGuideDescr = addHelpGuideDescription(triggerEl);

  helpGuideTitleBox.textContent =
    elTitleText && helpGuideDescr? `${elTitleText}:` :
    elTitleText ?? "No help description for this element";

  helpGuideTextBox.textContent = helpGuideDescr? `${helpGuideDescr}\n\n` : '';
}

// Handle Help Guide descriptions

function addHelpGuideDescription(el) {

  let helpText = '';

  const elLoads = el.dataset.load;

  if (!elLoads) return null;

  switch (elLoads) {
    case 'launcher':
      helpText =
        "Exit to app's start screen. Press Open Setlist / Open Tunelist / Play Along buttons to switch between app sections. Click Options⚙️ button to adjust Tunebook settings.";
      break;

    case 'tunebook-actions-menu':
      helpText =
        "Open a popup menu with shortcuts to Tunebook modules and features. Use the minimize button to close the menu. Actions are navigable via keyboard with the Tab key.";
      break;

    case 'tunelist':
      helpText =
        "Load the Session Tunelist without exiting Tunebook. By default the last loaded Set is saved and then restored when Setlist is reopened. If Save & Restore is disabled in App Options, the first item on the list is always loaded.";
      break;

    case 'setlist':
      helpText =
        "Load the Session Setlist without exiting Tunebook. By default the last loaded Tune is saved and then restored when Tunelist is reopened. If Save & Restore is disabled in App Options, the first item on the list is always loaded.";
      break;

    case 'prev':
    case 'next':
      helpText =
        "Switch between Tunebook items. Arrow navigation is located on top of the page in Desktop mode and in the middle of the page in Mobile mode and in Full Screen view.";
      break;

    case 'tunebook-filters':
      helpText =
        "Apply a filter from the dropdown list to the currently loaded Setlist or Tunelist. Selecting a filter modifies options shown in Tune Selector and List Viewer.";
      break;

    case 'tunebook-tunes':
      helpText =
        "Select an item from the dropdown list to load into ABC Transcription Tools. Use Right-Click / Shift + Enter / Long Touch to open List Viewer / Set Maker.";
      break;

    case 'tunebook-tabsmidi':
      helpText =
        "Apply Tabs & MIDI presets from the dropdown list to Tunebook items being viewed and played back in ABC Transcription Tools. When viewing the Tunebook on a narrow screen, rotate the device to reveal this selector.";
      break;

    case 'fullscreen-mode':
      helpText =
        "Open the current ABC or chords in Full Screen mode depending on the settings. Using Right-Click / Shift + Enter / Long Touch on the button opens Chord Viewer. Use Shift + F11 keyboard shortcut while outside of ABC Transcription Tools to activate this button.";
      break;

    case 'fs-radio-tunes':
    case 'fs-radio-chords':
      helpText =
        "Choose the default behavior for the Full Screen button. Useful for those frequently switching between ABC and Chord Viewer. Use Right-Click / Shift + Enter / Long Touch on the slot to pick alternative fav buttons from Tunebook Actions.";
      break;

    case 'share-link':
      helpText =
        "Generate a short link to the currently selected Set or Tune or an active Tunebook filter. The link opens the item directly in the app. If no items or filters are selected, the last loaded link to ABC Transcription Tools will be copied instead.";
      break;

    case 'list-viewer':
      helpText =
        "Load the List Viewer / Set Maker module to view the searchable list of filtered items. Use the Start button or select an item with Right-Click / Shift + Enter / Long Touch to switch to the Set Maker mode. Use the slider to resize rows. Toggle between color schemes with the theme button.";
      break;

    case 'chord-viewer':
      helpText =
        "Load the Chord Viewer module to view guitar chords for the current ABC. Use the Chord Viewer slider to scale the chords, press the theme button to toggle between color schemes.";
      break;

    case 'tunebook-compact-mode':
      helpText =
        "Switch to compact Tunebook mode with footer bar hidden. Tunebook Actions are accessible via header while in compact mode. Reload the app to reset the layout.";
      break;

    case 'switch-mobile-mode':
      helpText =
        "Adjust the Tunebook layout to suit devices with small and medium-sized screens. ABC Transcription Tools are view-only while in Mobile mode (Double Tap the tune to play, Long Touch to rewind). Rotate the device to see more elements in Mobile mode.";
      break;

    case 'help':
      helpText =
        "Launch Help Guide Dialog. Use Shift + F1 keyboard shortcut to open this menu while outside of the ABC Transcription Tools frame. To view Michael Eskin's User Guide click on \u2754 button within ABC Transcription Tools.";
      break;
  
    default:
      helpText = '';
      break;
  }

  return helpText;
}

// Handle Help Guide Popover closing

function quitHelpGuidePopover() {

  if (checkIfIosBrowser()) {

    reEnableTuneBookSelectors();
  }

  helpGuidePopover.hidePopover();
}

// Handle ABC Tools iframe load event
// Restore focus to Tunebook GUI trapped by vanilla ABC Tools
// (Temporary workaround until fixed in upstream)

function appAbcToolsLoadHandler() {

  const localStorageOk = isLocalStorageOk();

  if (!localStorageOk ||
      (localStorageOk &&
      +localStorage.abcToolsUseLiteEditor === 0)) {

    focusOnTuneBookGui();
  }
}

// Handle Broadcast Channel messages shared between app & SW
// Display notifications depending on update message type

function appUpdateMessageHandler(event) {
console.warn("Broadcast msg received");
  // if (event.data.msg && event.data.msg === "db-updated") {
  if (event.data.msg && event.data.msg.startsWith("db-updated")) {
console.warn(`Broadcast msg: ${event.data.msg}`);
    setTimeout(() => {

      // displayNotification("Session DB updated: Refresh to apply", "success");
      displayNotification(`Session DB updated to ${event.data.msg.replace("db-updated-", '')}: Refresh to apply`, "success");
    }, 50);
  }
}

////////////////////////////////////////////
// APP SCRIPTS: ROUTERS & HASH MANIPULATORS
///////////////////////////////////////////

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

      console.warn(`NS Session App:\n\nInvalid section hash in user query\n\nQuery params are supported in Setlist and Tunelist`);
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

  if (initialHash && isLocalStorageOk() && 
      +localStorage.tuneBookAllowLoadFromHashLink === 0) {

    console.log(`NS Session App:\n\nHash routing is being blocked\n
    Hash links loading on startup allowed? [${!!+localStorage.tuneBookAllowLoadFromHashLink}]\n
    Tunebook previously initialized? [${!!+localStorage.tuneBookInitialized_NSSSAPP}]`);

    window.location.hash = "#launcher";

    lastAppSectionOpened = "launcher";

    initAppRouter();
    return;
  }

  // Initialize hash routing
  initAppRouter();
  // Do initial app routing
  appRouter();
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

////////////////////////////////////////////
// APP SCRIPTS: LINK SHARING
///////////////////////////////////////////

// Create a share link for Tunebook item or filter

function getShareLink(optionType) {

  let shareLink = '';

  // Return share link to ABC Tools if relevant setting is on

  if (isLocalStorageOk() && +localStorage.tuneBookShareLinksToAbcTools === 1) {

    const abcToShare = tuneSelector.value || getLastTunebookUrl();

    return getAbcLinkToPreferredEditor(abcToShare);
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

      const abcToShare = tuneSelector.value || getLastTunebookUrl();

      return getAbcLinkToPreferredEditor(abcToShare);

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

async function copyTextToClipboard(inputText, isSilentCopy) {

  if (!navigator.clipboard && inputText) {

    if (!isSilentCopy) displayNotification(inputText, "report");
    console.log(
      `NS Session App:\n\nThis browser does not support Clipboard API.` +
      isSilentCopy? '' : ` Displaying text in status bar...`
    );
    return;
  }

  if (!inputText && !isSilentCopy) {

    displayNotification("Select an item to share", "warning");
    console.log(`NS Session App:\n\nNo text copied to clipboard, input string missing or empty`);
    return;
  }

  try {

    navigator.clipboard.writeText(inputText);

    if (!isSilentCopy) displayNotification("Copied to clipboard", "success");
    console.log(`NS Session App:\n\nText copied to clipboard:\n\n${inputText}`);

  } catch(error) {

    if (!isSilentCopy) displayNotification("Could not copy to clipboard", "warning");
    console.warn(`NS Session App:\n\nError trying to copy text to clipboard`);
    goatCountEvent("!error-copy-text-clipboard", "nss-app__copyTextToClipboard");
  }
}

////////////////////////////////////////////
// APP SCRIPTS: EVENT LISTENERS & SETTINGS
///////////////////////////////////////////

// Initialize custom settings in app menus (requires localStorage)

function initAppSettings() {

  if (!isLocalStorageOk()) {
  
    console.warn(`NS Session App:\n\nThis browser does not support Local Storage. Custom settings will not be saved`);
    displayNotification("This browser does not support Local Storage: Settings won't be saved", "warning");
    goatCountEvent("!error-init-local-storage", "nss-app__initAppSettings");
    return;
  }

  initTunebookOptions();
  initEncoderSettings();
  initAppCheckBoxes();
}

// Initialize previously not set local storage item

export function initLocalStorage(locStorName, locStorValue, isHardReset) {

  if (!isLocalStorageOk() ||
     (!isHardReset && localStorage.getItem(locStorName))) return;

  localStorage.setItem(locStorName, locStorValue);
}

// Initialize settings stored in an object using key-value pairs

export function initSettingsFromObject(settingsObj, isHardReset = false) {
  
  if (!isLocalStorageOk()) return;

  const locStorKeys = Object.keys(settingsObj);

  locStorKeys.forEach(key => {

    initLocalStorage(key, settingsObj[key], isHardReset);
  });
}

// Reset Tunebook options in App menu to defaults

function resetAppOptions() {

  initTunebookOptions(true);
  initAppCheckBoxes();

  goatCountEvent(`#reset-app-options`, "app-ui");

  displayNotification("Tunebook options have been reset to defaults", "success");
  console.log('NS Session App:\n\nApp options reset to defaults');
}

// Log the current values of settings using keys listed in an object
// Mark user-modified settings with a '*' indicator

export function printLocalStorageSettings(settingsObj, showModified) {

  if (!isLocalStorageOk()) return;

  const locStorKeys = Object.keys(settingsObj);

  let settingsReport = "Settings ('*' marks modified):\n\n";

  locStorKeys.forEach(key => {

    let modIndicator =
      showModified && localStorage[key] !== settingsObj[key]? '*' : '';

    settingsReport += `${key}: ${localStorage[key]}${modIndicator}\n`;
  });

  if (showModified) console.log(settingsReport);

  return settingsReport;
}

// Export the current user settings for app or ABC Encoder
// Use keys from settings object and localStorage values

function exportLocalStorageSettings(settingsObj) {

  if (!isLocalStorageOk()) return;

  const locStorKeys = Object.keys(settingsObj);

    let exportSettingsObject = {};

  locStorKeys.forEach(key => {

    exportSettingsObject[key] = localStorage[key];
  });

  exportSettingsObject["abcSortReSortsByLastTagValue"] =
      localStorage.abcSortReSortsByLastTagValue || '';

  return JSON.stringify([exportSettingsObject], null, 2);
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

export function initAppCheckBoxes(isHardReset) {

  if (!isLocalStorageOk()) return;

  if (isHardReset) {

    allCheckBoxes.forEach(checkBox => checkBox.removeAttribute("disabled"));
  }

  allCheckBoxes.forEach(checkBox => {

    if (+localStorage[checkBox.dataset.option] === 1) {

      checkBox.checked = true;

      if (checkBox.dataset.disables)
        disableCheckBoxes(checkBox.dataset.disables)

      if (checkBox.dataset.enables)
        forceEnableCheckBoxes(checkBox.dataset.enables)

      if (checkBox.dataset.linkedInput && document.getElementById(checkBox.dataset.linkedInput))
        document.getElementById(checkBox.dataset.linkedInput).removeAttribute("disabled");
    
    } else {

      checkBox.checked = false;

      if (checkBox.dataset.linkedOptions)
        disableCheckBoxes(checkBox.dataset.linkedOptions);

      if (checkBox.dataset.linkedInput && document.getElementById(checkBox.dataset.linkedInput))
        document.getElementById(checkBox.dataset.linkedInput).setAttribute("disabled", "");
    }
  });
}

// Disable one or several App & Encoder Settings checkboxes
// Reset the associated localStorage item's value

function disableCheckBoxes(datasetDisables) {

  const disableBoxesArr = datasetDisables.split(' ');

  disableBoxesArr.forEach(boxData => {

    const boxEl = document.querySelector(`[data-option="${boxData}"]`);
    
    if (boxEl.checked) boxEl.checked = false;
              
    localStorage.setItem(boxData, 0);
    
    boxEl.setAttribute("disabled", "");
  });
}

// Reenable one or several App & Encoder Settings checkboxes

function reEnableCheckBoxes(datasetDisables) {

  const reEnableBoxesArr = datasetDisables.split(' ');

  reEnableBoxesArr.forEach(boxData => {

    const boxEl = document.querySelector(`[data-option="${boxData}"]`);
    
    boxEl.removeAttribute("disabled");
  });
}

// Enable one or several App & Encoder Settings checkboxes
// Disable the checkbox in checked state

function forceEnableCheckBoxes(datasetEnables) {

  const enableBoxesArr = datasetEnables.split(' ');

  enableBoxesArr.forEach(boxData => {

    const boxEl = document.querySelector(`[data-option="${boxData}"]`);
    
    boxEl.checked = true;
              
    localStorage.setItem(boxData, 1);
    
    boxEl.setAttribute("disabled", "");

  });
}

// Initialize Tunebook Options radio buttons on page load

function initTunebookRadioBtns() {

  if (!isLocalStorageOk()) return;

  if(+localStorage.abcToolsFullScreenBtnShowsChords === 1) {

    fullScreenViewChordsRadioBtn.checked = true;

  } else {

    fullScreenViewTunesRadioBtn.checked = true;
  }
}

// Initialize Tunebook Fav Buttons
// Restore previously switched favs

function initTunebookFavBtns() {

  if (!isLocalStorageOk()) return;

  const favDataLeft = localStorage.tuneBookFavBtnLeft;
  const favDataRight = localStorage.tuneBookFavBtnRight;

  const isMobileMode = checkIfMobileMode();

  // Tweak default fav buttons for mobile mode users
  
  if (isMobileMode && !favDataLeft && !favDataRight) {

    initTunebookAltFavBtnLeft();

    initTunebookAltFavBtnRight();

    return;
  }

  // Restore fav buttons previously picked by the user

  if (favDataLeft && favDataLeft !== "select-fullscreen-tunes") {

    const copyLeftElem =
      document.querySelector(`[data-tbk-action="${favDataLeft}"]`);

    switchTuneBookFavBtn(copyLeftElem, "pick-fav-left");
  }

  if (favDataRight && favDataRight !== "select-fullscreen-chords") {

    const copyRightElem =
      document.querySelector(`[data-tbk-action="${favDataRight}"]`);
    
    switchTuneBookFavBtn(copyRightElem, "pick-fav-right");
  }
}

// Initialize alternative Left Tunebook Fav Button

function initTunebookAltFavBtnLeft() {

  const copyLeftElem =
    document.querySelector(`[data-tbk-action="show-help"]`);

  switchTuneBookFavBtn(copyLeftElem, "pick-fav-left");
}

// Initialize alternative Right Tunebook Fav Button

function initTunebookAltFavBtnRight() {

  const currentViewportW = getViewportWidth();

  const copyRightElem = currentViewportW < 528?
    document.querySelector(`[data-tbk-action="open-launch-screen"]`) :
    document.querySelector(`[data-tbk-action="open-list-viewer"]`);
    
  switchTuneBookFavBtn(copyRightElem, "pick-fav-right");
}

// Initialize app mode based on viewport dimensions

function initAppMode() {

  if (getViewportWidth() < 880 || getViewportHeight() <= 768) {

    document.body.dataset.mode = "mobile";

  } else {

    document.body.dataset.mode = "desktop";
  }
}

// Initialize Tunebook mode based on viewport dimensions
// Optional: Always load Tunebook in chosen mode if persistent setting enabled

function initTunebookMode() {

  const viewPortW = getViewportWidth();
  const viewPortH = getViewportHeight();

  if (isLocalStorageOk() &&
      +localStorage.tuneBookAlwaysUseDesktopMode === 0 &&
      (lastTuneBookMode !== "desktop" &&
      (lastTuneBookMode === "mobile" || viewPortW < 880 || viewPortH <= 768)) ||
      +localStorage.tuneBookAlwaysUseMobileMode === 1) {

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

// Initialize Help Dialog

function initQuickHelpDialog() {

  if (!quickHelpDialog) return;

  ['mouseover', 'focusin'].forEach(eventType => {

    quickHelpDialog.addEventListener(eventType, showQuickHelpDescription);
  });
}

// Initialize popup ABC Frame focus button with control hints

function initAbcFrameLabel() {

  const focusLabelBtn =
    document.querySelector('[data-focus="abc-frame"]');

  if (!focusLabelBtn) return;

  focusLabelBtn.addEventListener('focusout', () => toggleAbcFocusLabel("hide"));
}

// Initialize browser metadata body attribute for specific tweaks

function initBrowserTweaks() {

  document.body.dataset.browser = getBrowserId();
}

// Initialize GoatCounter, a privacy-oriented analytics tool

async function initGoatCounter() {
  
  const controller = new AbortController();
  const timeoutMs = 3000;
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {

    const response =
      // await fetch('//gc.zgo.at/count.js');
      await fetch('//gc.zgo.at/count.js', { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) {
      
      throw new Error("Failed to load GoatCounter script");
    }

    const goatScript = document.createElement('script');
  
    goatScript.dataset.goatcounter =
      "https://session.goatcounter.com/count";

    goatScript.async = true;

    goatScript.src = "//gc.zgo.at/count.js";

    document.head.appendChild(goatScript);

  } catch (error) {

    clearTimeout(timeoutId);

    console.warn(`GoatCounter disabled (${error.message})`);
  }
}

// Count events with GoatCounter

export function goatCountEvent(eventPath, eventTitle) {

  if (window.goatcounter && navigator.onLine) {

    window.goatcounter.count({
        path: `${eventPath}`,
        title: `${eventTitle}`,
        event: true,
    });
  }
}

// Initialize popover polyfill warning if the browser doesn't support Popover API

function initPopoverWarning() {

  const isPopoverPolyfilled = document.body?.showPopover && !/native code/i.test(document.body.showPopover.toString());

  if (isPopoverPolyfilled) {

    console.log(`NS Session App:\n\nThis browser does not support Popover API. Polyfill has been applied`);
  }
}

// Initialize update messages shared between app and service worker

function initUpdateMessages() {

  updateMsgChannel.addEventListener('message', appUpdateMessageHandler);
}

// Initialize ABC Tools iframe

function initTuneFrame() {

  if (!tuneFrame) return;

  tuneFrame.addEventListener('load', appAbcToolsLoadHandler);
}

// Add global event listeners to the app's window object
// Delegate each type of event to specialized handler functions

function initWindowEvents() {

  window.addEventListener('click', appWindowClickHandler);

  window.addEventListener('mousedown', appWindowMouseEventHandler);

  window.addEventListener('mouseup', appWindowMouseEventHandler);

  window.addEventListener('mousemove', appWindowMouseEventHandler);

  window.addEventListener('contextmenu', appWindowMouseEventHandler);

  window.addEventListener('keydown', appWindowKeyboardEventHandler);

  window.addEventListener('keyup', appWindowKeyboardEventHandler);

  window.addEventListener('touchstart', appWindowTouchEventHandler, { passive: true });

  window.addEventListener('touchend', appWindowTouchEventHandler, { passive: true });

  window.addEventListener('touchmove', appWindowTouchEventHandler, { passive: true });

  window.addEventListener('resize', appWindowResizeHandler);

  window.addEventListener('beforeunload', () => { resetViewportWidth() });

  initFullScreenEvents();
}

// Initialize event listeners and settings on Launch Screen load

document.addEventListener('DOMContentLoaded', () => {

  initGoatCounter();
  initBrowserTweaks();
  initPopoverWarning();
  initUpdateMessages();
  initTuneFrame();
  initQuickHelpDialog();
  initWindowEvents();
  initAppSettings();
  initAbcFrameLabel();
  initChordViewer();
  initListViewer();
  appRouterOnLoad();
  fetchAppVersionData();

  console.log(`NS Session App:\n\nLaunch Screen initialized`);
});

////////////////////////////////////////////
// APP SCRIPTS: SERVICE WORKER
///////////////////////////////////////////  

// Register service worker on window load

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(`[NS App Service Worker]\n\n` + `Registered with scope:\n\n` + registration.scope);
        initSessionDb();
      })
      .catch((error) => {
        goatCountEvent(
          "!error-sw-register",
          "nss-app__serviceWorker"
        );
        console.warn(`[NS App Service Worker]\n\n` + `Registration failed!\n\n` + error);
      });
  });
}