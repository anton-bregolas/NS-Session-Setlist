///////////////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website Scripts [Refactored]
// Modified and expanded for Novi Sad Session Setlist
// MIT License
// ABC Transcription Tools (c) Michael Eskin 2023-2025
// Novi Sad Session Tunebook (c) Anton Zille 2024-2025
///////////////////////////////////////////////////////////////////////

// Import lz-string compression algorithm
import { LZString } from "./scripts-3p/lz-string/lz-string.min.js";
// Import deflate compression algorithm & utility functions
import { deflateCompress, deflateDecompress,
         isLocalStorageOk, sanitizeQueryParam } from "./scripts-abc-utils.js";
// Import N.S.S.S. custom elements and tune JSONs from NS Sessions DB
import { initSettingsFromObject, checkTuneBookSetting, checkIfMobileMode, tuneSets, tuneList, filterOptions,
         initCustomDropDownMenus, openSettingsMenu, handleSelectorLabels, switchTuneBookItem,
         displayNotification, displayWarningEffect, goatCountEvent } from "./scripts-nss-app.js";
// Import custom UI tweaks & enhancements for dropdown menus
import { getSupportedAnimalEmojis } from "./scripts-emoji-manager.js";

///////////////////////////////////////////
// ABC Tunebook Website: Default Settings
//////////////////////////////////////////

export const abcTunebookDefaults = {
    // Tunebook options
    abcToolsUseLiteEditor: "1",
    abcToolsSaveAndRestoreTunes: "1",
    tuneBookAlwaysUseMobileMode: "0",
    tuneBookAlwaysUseDesktopMode: "0",
    tuneBookShareLinksToAbcTools: "0",
    // Advanced Tunebook options
    abcToolsFullScreenOpensNewWindow: "0",
    tuneBookShowStatusReport: "0",
    tuneBookAllowLoadFromHashLink: "1",
    tuneBookAddRandomFilterEmojis: "1",
    abcToolsAllowInstrumentChanges: "1",
    abcToolsAlwaysMuteChords: "0",
    abcToolsAllowTabStyleChanges: "1",
    abcToolsAllowTuneAutoReload: "1",
    listViewerOverrideTuneSelector: "0",    
    chordViewerAllowDynamicChords: "0",
    chordViewerUseBoldFonts: "0",
    listViewerHideSliderGui: "0",
    listViewerSearchSubTitles: "1"
};

///////////////////////////////////////////
// ABC Tunebook Website: Global Variables
//////////////////////////////////////////

let tunes = [];

let isFirstTuneBookLoad = true;
let isTuneRestorePaused = false;

let tabStyle = "noten";

let isBanjo = false;
let isFlute = false;
let isDulcimer = false;
let isClaviZouki = false;
let isUPipes = false;
let isMelodeon = false;
let isSolfege = false;
let isPianoForced = false;

let lastURL = "";

///////////////////////////////////////////
// ABC Tunebook Website: OG Page Elements
//////////////////////////////////////////

export const tuneFrame = document.querySelector('#tuneFrame');
export const tuneSelector = document.querySelector('#tuneSelector');
export const displayOptions = document.querySelector('#displayOptions');

///////////////////////////////////////////
// ABC Tunebook Website: Refactored Scripts
//////////////////////////////////////////

////////////////////////////////
// TUNEBOOK LOAD FUNCTIONS
///////////////////////////////

// Initialize default Global settings for ABC Tools

export function initTunebookOptions(isHardReset) {

    initSettingsFromObject(abcTunebookDefaults, isHardReset);
}

// Initialize ABC Transcription Tools, add event listeners to Tunebook elements

export async function initAbcTools(itemQuery) {

    // Select Session DB JSON to open in ABC Tools

    tunes = checkTuneBookSetting() === "setlist"? tuneSets : tuneList;
    
    // Populate the selector with options from JSON

    if (tunes.length > 1) {

        // Check if restoring and loading Tunebook items needs to be paused

        if (itemQuery) isTuneRestorePaused = true;

        // Populate Tunebook menu with Sets or Tunes
        populateTuneSelector(tunes);

        // Initialize custom N.S.S.S. elements
        populateFilterOptions(sortFilterOptions(tunes));
        initCustomDropDownMenus();

        // Update iframe src when an option is selected
        tuneSelector.addEventListener('change', async() => {

            // Load a new Set or Tune into the Tuneframe

            await loadTuneBookItem(tunes);
        });

        // Initialize the Tabs & MIDI dropdown menu
        displayOptions.addEventListener('change', loadTabsMidiOptions);

    } else {

        console.warn(`NS Session App:\n\nTunebook appears empty, reload the app`);
        
        displayNotification("No Tunebook items found. Reload the app to try again", "error");
        
        goatCountEvent("!error-init-tunebook", "nss-app__initAbcTools");
        
        return;
    }

    // Restore last saved Tunebook options
    // Trigger last saved item load if no query available

    let isTuneBookItemLoading;

    if (isLocalStorageOk()) {

        if (+localStorage.abcToolsSaveAndRestoreTunes === 1 &&
            localStorage.lastTabMidiOption_NSSSAPP || 
            (localStorage.lastTuneBookSet_NSSSAPP ||
            localStorage.lastTuneBookTune_NSSSAPP)) {

            restoreTuneBookDisplayOptions();
            isTuneBookItemLoading = true;
        }
    }

    // Load a Tunebook item using query params

    if (itemQuery) {
            
        loadFromQueryString(itemQuery);
        
        return;
    }

    if (isTuneBookItemLoading) return;

    // Load the first Tunebook item by default

    refreshTabsDisplayOptions();

    isFirstTuneBookLoad = false;

    tuneSelector.selectedIndex = 1;
    tuneSelector.dispatchEvent(new Event('change'));
}

// Load a Set or a Tune into the Tuneframe

export async function loadTuneBookItem(currentTuneBook, itemNumber, passedUrl) {

    handleSelectorLabels("select", tuneSelector, tuneSelector.selectedIndex);

    let theURL;

    if (passedUrl) {

        theURL = passedUrl;

    } else {

        theURL = itemNumber >= 0? currentTuneBook[itemNumber].url : tuneSelector.value;
    }

    if (theURL == "") return;

    if (checkIfMobileMode() === true) {

        theURL = theURL.replace("&name=", "&noui&name=");
    }

    if (isLocalStorageOk()) {

        if (+localStorage.abcToolsAllowTabStyleChanges === 1) {

            theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format="+tabStyle);

        } else {

            theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format=noten");
        }

        if (+localStorage.abcToolsAllowInstrumentChanges === 1) {

            theURL = await injectInstrument(theURL);
        }

        if (+localStorage.abcToolsAlwaysMuteChords === 1) {

            theURL = await muteChordsPlayback(theURL);
        }

    // Fallback logic if localStorage is unavailable

    } else {

        theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format="+tabStyle);
    }

    // Create final link to the preferred ABC editor
    theURL = getAbcLinkToPreferredEditor(theURL);

    tuneFrame.src = theURL;
    lastURL = theURL;

    // Save last Tunebook item loaded
    if (isLocalStorageOk() && +localStorage.abcToolsSaveAndRestoreTunes === 1) {

        setTimeout(() => {

            saveLastTuneBookItem();
            
        }, 150);
    }
}

// Populate tune dropdown menu with options

export function populateTuneSelector(tuneBook) {

    let currentTuneType = '';

    tuneBook.forEach(tune => {

        const option = document.createElement('option');
        option.value = tune.url;
        option.textContent = tune.name;
        option.label = tune.name.split(': ')[1];
        option.dataset.subtitles = tune.subtitles || '';
        option.dataset.tunetype = tune.type;
        option.dataset.leaders = tune.leaders || '';

        if (currentTuneType !== tune.type) {

            const tuneGroup = document.createElement('optgroup');
            tuneGroup.label = `${tune.type} 🎵`;
            tuneGroup.dataset.tunetype = tune.type;
            currentTuneType = tune.type;
            tuneGroup.appendChild(option);
            tuneSelector.appendChild(tuneGroup);

        } else {

            const lastOptGroup = tuneSelector.querySelector('optgroup:last-of-type');
            lastOptGroup.appendChild(option);
        }
    });
}

// Populate filter dropdown menu with options

export function populateFilterOptions(filters) {

    const tuneLeadersNo = filters[1].list? filters[1].list.length : 0;

    const areRandomEmojisOn =
        isLocalStorageOk() && +localStorage.tuneBookAddRandomFilterEmojis;

    const randomAvatars = 
        areRandomEmojisOn && tuneLeadersNo? getSupportedAnimalEmojis(tuneLeadersNo) : [];

    filters.forEach(filterList => {

        if (filterList.id) {

            const filterGroup = document.createElement('optgroup');

            if (filterList.id === "tuneTypes") {
                
                filterGroup.label = "👇 Tune Type:👇";
                filterOptions.appendChild(filterGroup);
            }

            if (filterList.id === "setLeaders") {
                
                filterGroup.label = "👇 Set Leader:👇";
                filterOptions.appendChild(filterGroup);
            }

            filterList.list?.forEach((filter, i) => {

                const filterOption = document.createElement('option');
                filterOption.value = filter;
                filterOption.textContent =
                    filterList.id === "setLeaders" && randomAvatars.length?
                        `${randomAvatars[i]} ${filter}` : 
                    filterList.id === "setLeaders"?
                        `👤 ${filter}` :
                        `🎻 ${filter}`;
                filterGroup.appendChild(filterOption);
            });
        }
    });
}

// Gather and sort custom metadata found in tunes array

export function sortFilterOptions(currentTuneBook) {

    const allTuneTypes = {"id": "tuneTypes", "list": []};
    const allTuneLeaders = {"id": "setLeaders", "list": []};

    currentTuneBook.forEach(tune => {

        const tuneType = tune.type;
        const tuneLeaders = tune.leaders;

        if (tuneType && !allTuneTypes.list.includes(tuneType)) {

            allTuneTypes.list.push(tuneType);
        }

        if (tuneLeaders) {

            tuneLeaders.split(', ').forEach(tuneLeader => {

                if(!allTuneLeaders.list.includes(tuneLeader)) {

                    allTuneLeaders.list.push(tuneLeader);
                }
            });
        }
    });

    allTuneTypes.list.sort();
    allTuneLeaders.list.sort();

    return [allTuneTypes, allTuneLeaders];
}

// Handle Tunebook item loading using query param text
// Handle Tunebook filter loading using query param text

export function loadFromQueryString(queryString) {

  const tuneBookItemMatch = /type=(.+)&name=(.+)/;

  const tuneBookFilterMatch = /filter=(.+)/;

  if (queryString.match(tuneBookItemMatch)) {

    const itemType = sanitizeQueryParam(queryString.replace(tuneBookItemMatch, `$1`));

    const itemName = sanitizeQueryParam(queryString.replace(tuneBookItemMatch, `$2`));

    setSelectedTuneByQuery(itemType, itemName);

    return;
  }

  if (queryString.match(tuneBookFilterMatch)) {

    const filterParam = sanitizeQueryParam(queryString.replace(tuneBookFilterMatch, `$1`));

    setFilterByQuery(filterParam);

    return;
  }

  console.warn(`NS Session App:\n\nInvalid params passed in user query`);

  displayNotification("Invalid query provided, check input URL", "warning");

  isTuneRestorePaused = false;

  return;
}

////////////////////////////////
// MIDI & INSTRUMENTS FUNCTIONS
///////////////////////////////

// Load Tabs and MIDI selected in displayOptions, update URL & ABC

async function loadTabsMidiOptions() {

    handleSelectorLabels("select", displayOptions, displayOptions.selectedIndex);

    // Set tabStyle setting depending on displayOptions value

    if (displayOptions.value === "-1" && !isFirstTuneBookLoad) {

        return;
    }

    if (displayOptions.value !== "-1") {

        isBanjo = false;
        isFlute = false;
        isDulcimer = false;
        isClaviZouki = false;
        isUPipes = false;
        isMelodeon = false;
        isSolfege = false;
        isPianoForced = false;

        tabStyle = "noten";

        switch (displayOptions.value) {
            case "0": // Standard notation + default ABC Tools voice
                break;
            case "1": // Note names + concertina voice
                tabStyle = "notenames";
                break;
            case "12": // Note names + solfa voice
                isSolfege = true;
                tabStyle = "notenames";
                break;
            case "2": // Whistle voice + tabs
                tabStyle = "whistle";
                break;
            case "3": // Irish flute voice + tabs
                isFlute = true;
                tabStyle = "whistle";
                break;
            case "4": // GDAD Bouzouki voice + tabs
                tabStyle = "gdad";
                break;
            case "5": // EADGBE Guitar voice + tabs
                tabStyle = "guitare";
                break;
            case "6": // DADGAD Guitar voice + tabs
                tabStyle = "guitard";
                break;
            case "7": // Mandolin voice + tabs
                tabStyle = "mandolin";
                break;
            case "8": // Tenor banjo voice + tabs
                isBanjo = true;
                tabStyle = "mandolin";
                break;
            case "9": // Hammered dulcimer voice only
                isDulcimer = true;
                break;
            case "10": // Uilleann pipes voice only
                isUPipes = true;
                break;
            case "11": // Melodeon voice only
                isMelodeon = true;
                break;
            case "13": // Piano voice only
                isPianoForced = true;
                break;
            case "14": // Bouzouki backed by Clavinet
                isClaviZouki = true;
                break;
            default: // Standard notation
                break;
        }
    }

    if (isTuneRestorePaused) return;

    // Trigger the (re)loading of Tunebook item

    tunes = checkTuneBookSetting() === "setlist"? tuneSets : tuneList;

    if (tunes.length > 1 && isLocalStorageOk()) {

        if (isFirstTuneBookLoad === true 
            && +localStorage.abcToolsSaveAndRestoreTunes === 1
            && ((checkTuneBookSetting() === "setlist" && localStorage.lastTuneBookSet_NSSSAPP)
            || (checkTuneBookSetting() === "tunelist" && localStorage.lastTuneBookTune_NSSSAPP))) {

            isFirstTuneBookLoad = false;
            restoreLastTunebookItem();
            return;
        }

        if (tuneSelector.value !== "" && +localStorage.abcToolsAllowTuneAutoReload === 1) {

            await loadTuneBookItem(tunes);
            return;
        }

        if (+localStorage.abcToolsAllowTuneAutoReload === 1) {

            tuneSelector.selectedIndex = 1;
            tuneSelector.dispatchEvent(new Event('change'));
            return;
        }

    // Fallback logic if localStorage is unavailable

    } else if (tunes.length > 1) {

        if (tuneSelector.value !== "") {
            
            await loadTuneBookItem(tunes); 
            return;
        }

        tuneSelector.selectedIndex = 1;
        tuneSelector.dispatchEvent(new Event('change'));
    }
}

// Inject custom MIDI settings into ABC by modifying a default template string

async function injectInstrument(theURL) {

    const originalEncodedAbc = extractEncodedAbc(theURL);

    const encodedAbcContent = originalEncodedAbc.replace(/(?:lzw|def)=/, '');

    let abcContent = originalEncodedAbc.match(/lzw=/)?
        LZString.decompressFromEncodedURIComponent(encodedAbcContent) :
        await deflateDecompress(encodedAbcContent);

    let injectMidiString = `%soundfont fluid\n%%MIDI program 0\n%%MIDI bassprog 0\n%%MIDI chordprog 0\n%%MIDI bassvol 55\n%%MIDI chordvol 40`;

    // Inject a template MIDI string into the ABC if no MIDI instructions found

    if (!abcContent.includes("%soundfont")) {

        abcContent = abcContent.replace(`K:`, `${injectMidiString}\nK:`);

    } else {

        abcContent.replace(/(%soundfont)[\s\S]*?(K:)/gm, `${injectMidiString}\nK:`);
    }
    
    // Update the decompressed ABC with the new MIDI settings

    switch (tabStyle) {
        case "mandolin":
            if (isBanjo) {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 105");
            }
            else {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 141");
            }
            break;
        case "gdad":
            abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 139");
            break;
        case "guitare":
        case "guitard":
            abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 24\n%%MIDI transpose -12");
            break;
        case "whistle":
            if (isFlute) {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 73");
            }
            else {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 78");
            }
            break;
        case "notenames":
            if (isSolfege) {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 136");
                break;
            } 
            abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 133");
            break;
        case "noten":
            if (isDulcimer) {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 15").
                                        replace("%%MIDI bassvol 55","%%MIDI bassvol 40").replace("%%MIDI chordvol 40","%%MIDI chordvol 30");
            }
            else if (isClaviZouki) {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 139").replace("%%MIDI bassprog 0", "%%MIDI bassprog 7").
                                        replace("%%MIDI chordprog 0", "%%MIDI chordprog 7").replace("%%MIDI chordvol 40","%%MIDI chordvol 25");
            }
            else if (isUPipes) {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 129");
            }
            else if (isMelodeon) {
                abcContent = abcContent.replace("%%MIDI program 0","%%MIDI program 135");     
            }
            else if (isPianoForced) {
                abcContent = abcContent.replace(/%%MIDI program \d*/,"%%MIDI program 0").
                                        replace(/%%MIDI bassprog \d*/, "%%MIDI bassprog 0").replace(/%%MIDI chordprog \d*/, "%%MIDI chordprog 0").
                                        replace(/%%MIDI chordvol \d*/,"%%MIDI chordvol 64").replace(/%%MIDI bassvol \d*/,"%%MIDI bassvol 64");
            } else {
                return theURL;
            }
            break;
    }

    const newEncodedAbc = originalEncodedAbc.match(/lzw=/)?
        "lzw=" + LZString.compressToEncodedURIComponent(abcContent) :
        "def=" + await deflateCompress(abcContent);

    theURL = theURL.replace(originalEncodedAbc, newEncodedAbc);

    return theURL;
}

// Inject mute chord and bass MIDI instructions overriding the existing settings

async function muteChordsPlayback(theURL) {

    const originalEncodedAbc = extractEncodedAbc(theURL);

    const encodedAbcContent = originalEncodedAbc.replace(/(?:lzw|def)=/, '');

    let abcContent = originalEncodedAbc.match(/lzw=/)?
        LZString.decompressFromEncodedURIComponent(encodedAbcContent) :
        await deflateDecompress(encodedAbcContent);

    const injectMidiString = `%%MIDI bassvol 0\n%%MIDI chordvol 0`;

    abcContent = abcContent.replace(`K:`, `${injectMidiString}\nK:`);

    const newEncodedAbc = originalEncodedAbc.match(/lzw=/)?
        "lzw=" + LZString.compressToEncodedURIComponent(abcContent) :
        "def=" + await deflateCompress(abcContent);

    theURL = theURL.replace(originalEncodedAbc, newEncodedAbc);

    return theURL;
}

// Refresh tab & MIDI selector options, set dropdown menu to default option

function refreshTabsDisplayOptions() {

    displayOptions.selectedIndex = 0;
    displayOptions.value = "-1";
}

////////////////////////////////
// SAVE AND RESTORE FUNCTIONS
///////////////////////////////

// Store the last selected Set or Tune and Tab & MIDI option in user's local storage

function saveLastTuneBookItem() {

    if (!isLocalStorageOk()) return;

    if (tunes.length > 1) {

        if (tuneSelector.value !== "") {

            const currentTuneName = tuneSelector.options[tuneSelector.selectedIndex].text;

            checkTuneBookSetting() === "setlist"?
            localStorage.lastTuneBookSet_NSSSAPP = currentTuneName :
            localStorage.lastTuneBookTune_NSSSAPP = currentTuneName;

            console.log(`NS Session App:\n\n"${currentTuneName}" saved as last opened item`);

        } else {

            const defaultTuneName = tuneSelector.options[1].text
            
            checkTuneBookSetting() === "setlist"?
            localStorage.lastTuneBookSet_NSSSAPP = defaultTuneName :
            localStorage.lastTuneBookTune_NSSSAPP = defaultTuneName;

            console.log(`NS Session App:\n\n"${defaultTuneName}" saved as last opened item`);
        }
    }
    
    const theLastTuneTab = document.getElementById('displayOptions').value;

    if (+theLastTuneTab > -1) {

        localStorage.lastTabMidiOption_NSSSAPP = theLastTuneTab;

        console.log(`NS Session App:\n\nSaving last used custom Tab & MIDI setting [${theLastTuneTab}]`);
    }
}

// Look for saved Tunebook options in user's local storage, fire displayOptions change event
// Trigger the loading of last saved Tab & MIDI options and Tunebook item via loadTabsMidiOptions

function restoreTuneBookDisplayOptions() {

    if (!isLocalStorageOk()) return;

    let theLastTuneTab = localStorage.lastTabMidiOption_NSSSAPP;
        
    if (!theLastTuneTab || theLastTuneTab === "" || theLastTuneTab === "0") {

        theLastTuneTab = "-1";
        localStorage.lastTabMidiOption_NSSSAPP = "-1";
        refreshTabsDisplayOptions();
    }

    if (theLastTuneTab !== "-1") {

        console.log(`NS Session App:\n\nRestoring last saved Tab & MIDI setting [${theLastTuneTab}]`);
    }

    displayOptions.value = theLastTuneTab;

    displayOptions.dispatchEvent(new Event('change'));
}

// Restore the last selected Set or Tune from user's local storage

export function restoreLastTunebookItem() {

    if (!isLocalStorageOk() || isTuneRestorePaused === true) return;

    if (tunes.length > 1) {

        const theLastTuneName = checkTuneBookSetting() === "setlist"? 
                                localStorage.lastTuneBookSet_NSSSAPP :
                                localStorage.lastTuneBookTune_NSSSAPP;

        if (theLastTuneName && (theLastTuneName != "")) {

            console.log(`NS Session App:\n\nRestoring last Tunebook item saved:\n\n[${theLastTuneName}]`);

            setSelectedTuneByName(theLastTuneName);
        }
    }
}

// Check if Tunebook contains an item with the name passed
// Fire a change event on tuneSelector if a match is found

function setSelectedTuneByName(optionText) {

    let gotMatch = false;

    for (let i = 0; i < tuneSelector.options.length; i++) {

        if (tuneSelector.options[i].text === optionText) {

            tuneSelector.selectedIndex = i;
            gotMatch = true;
            break;
        }
    }

    if (gotMatch) {

        tuneSelector.dispatchEvent(new Event('change'));
    }
}

// Check if Tunebook contains an item matching the query text passed
// Fire a change event on tuneSelector if a match is found
// Refresh Tunebook item if no match is found

export function setSelectedTuneByQuery(itemType, itemName) {

    const itemTitle = `${itemType}_${itemName}`;

    let gotMatch = false;

    for (let i = 0; i < tuneSelector.options.length; i++) {

        if (sanitizeQueryParam(tuneSelector.options[i].text) === itemTitle) {

            tuneSelector.selectedIndex = i;
            gotMatch = true;
            break;
        }
    }

    isFirstTuneBookLoad = false;

    // Load matching Tunebook item if match found

    if (gotMatch) {

        tuneSelector.dispatchEvent(new Event('change'));
        isTuneRestorePaused = false;
        return;
    }

    // Display warning and clear hash if no match

    console.warn(`NS Session App:\n\nInvalid item params in user query`);
    
    displayNotification("Invalid query provided, check input URL", "warning");

    isTuneRestorePaused = false;

    const currentSection = checkTuneBookSetting();

    window.location.hash = `#${currentSection}`;
}

// Check if Filter dropdown contains a filter matching the query param
// Clear filters and fire a change event on filterOptions if a match is found

export function setFilterByQuery(filterParam) {

    let gotMatch = false;

    for (let i = 0; i < filterOptions.options.length; i++) {

        if (sanitizeQueryParam(filterOptions.options[i].text.slice(2)) === filterParam) {

            filterOptions.selectedIndex = i;
            gotMatch = true;
            break;
        }
    }

    isFirstTuneBookLoad = false;

    // Load matching Tunebook filter if match found

    if (gotMatch) {

        filterOptions.dispatchEvent(new Event('change'));

        switchTuneBookItem("next");
        
        isTuneRestorePaused = false;

        return;
    }

    // Display warning if no match

    console.warn(`NS Session App:\n\nInvalid filter params in user query`);
    
    displayNotification("Invalid query provided, check input URL", "warning");

    isTuneRestorePaused = false;
}

////////////////////////////////
// ENCODE & DECODE FUNCTIONS
///////////////////////////////

// Extract compressed ABC string from a URL

function extractEncodedAbc(url) {

    // Find the part of URL starting with lzw= / def= followed by any characters until the next &
    const match = url.match(/(?:lzw|def)=(?:[^&]*)/);

    // If a match is found, return the part after lzw= / def=
    return match ? match[0] : null;
}

////////////////////////////////
// RESIZE VIEWPORT FUNCTIONS
///////////////////////////////

// Set viewport width to a fixed value or reset it to device-width

export function resetViewportWidth(fixedWidthPx) {

    const viewPortMeta = document.querySelector("meta[name=viewport]");

    if (fixedWidthPx) {

        viewPortMeta.setAttribute("content", `width=${fixedWidthPx}`);

        return;

    } else if (viewPortMeta.getAttribute("content") !== "width=device-width, initial-scale=1.0") {

        viewPortMeta.setAttribute("content", "width=device-width, initial-scale=1.0");

        return;
    }
}

// Calculate the current visual viewport height
// Return innerHeight if browser does not support Visual Viewport API

export function getViewportHeight() {

    if (window.visualViewport) {

        return Math.floor(window.visualViewport.height);
    }

    return window.innerHeight;
}

// Calculate the current visual viewport width to account for scrollbars
// Return innerWidth if browser does not support Visual Viewport API

export function getViewportWidth() {

    if (window.visualViewport) {

        return Math.floor(window.visualViewport.width);
    }

    return window.innerWidth;
}

////////////////////////////////
// HANDLER FUNCTIONS
///////////////////////////////

// Handle Full Screen Button action depending on app settings

export async function handleFullScreenButton(altView) {

    if (!lastURL) {

        displayNotification("Select an item in Tune Selector", "warning");
        displayWarningEffect(document.querySelector('#fullScreenButton'));
        return;
    }

    const fullScreenSetting = +document.querySelector('input[name="nss-radio-view"]:checked').value;
    
    const isAlwaysOpenInAbcTools = isLocalStorageOk()? !!+localStorage.abcToolsFullScreenOpensNewWindow : false;
    
    // View ABC Tools frame in Full Screen using Fullscreen API

    if (fullScreenSetting === 0 || !altView) {

        // If browser does not support Fullscreen API, open ABC Tools in new window

        if (isAlwaysOpenInAbcTools === true ||
            (!document.body.requestFullscreen && 
            !document.body.webkitRequestFullscreen && 
            !document.body.mozRequestFullScreen &&
            !document.body.msRequestFullscreen)) {

            openInAbcTools();
            return;
        }

        const abcToolsContainer = document.querySelector('.nss-abc-embed');

        const requestFullScreen = abcToolsContainer.requestFullscreen ||
                                  abcToolsContainer.webkitRequestFullScreen ||
                                  abcToolsContainer.mozRequestFullScreen ||
                                  abcToolsContainer.msRequestFullScreen;

        try {

            await requestFullScreen.call(abcToolsContainer);

            goatCountEvent("#fullscreen-view", "app-ui");

            const exitFullScreenBtn = document.querySelector('[data-load="exit-fullscreen"]');

            setTimeout(() => {
                
                exitFullScreenBtn.focus();
            }, 50);

        } catch {

            console.log(`NS Session App:\n\nFull Screen mode not available. Opening tune in new window...`);

            goatCountEvent("!error-use-fullscreen-api", "nss-app__handleFullScreenButton");
            
            openInAbcTools();
        }

        return;
    }

    // Open Chord Viewer
    
    if (fullScreenSetting === 1) {
        
        await openSettingsMenu(altView);
        return;
    }
}

// Open last ABC Tools tune link in new window or browser tab

function openInAbcTools() {

    if (lastURL != "") {

        lastURL = getAbcLinkToPreferredEditor(lastURL);
        goatCountEvent("#open-in-abctools", "app-ui");
        window.open(lastURL, '_blank');
    }
}

// Get last ABC Tools URL (for use in external modules)

export function getLastTunebookUrl() {

    lastURL = getAbcLinkToPreferredEditor(lastURL);

    return lastURL;
}

// Complete a link to ABC Transcription Tools with encoded ABC content attached
// Ensure the link is opened in the preferred ABC Tools editor

export function getAbcLinkToPreferredEditor(url) {

    // Fallback case for Session DB using full ABC Tools links

    if (url.startsWith('https')) {

        const abcPlusQueries = url.split('.html?')[1];

        if (isLocalStorageOk() &&
            +localStorage.abcToolsUseLiteEditor === 1 &&
            !url.startsWith(`https://abc.tunebook.app/`)) {

            return `https://abc.tunebook.app/abctools.html?${abcPlusQueries}`;
        }

        if (isLocalStorageOk() &&
            +localStorage.abcToolsUseLiteEditor === 0 &&
            !url.startsWith(`https://michaeleskin.com/`)) {

            return `https://michaeleskin.com/abctools/abctools.html?${abcPlusQueries}`;
        }

        return url;
    }

    // Session DB standard for NS Session Setlist v.1.2+ and later

    if (isLocalStorageOk() && +localStorage.abcToolsUseLiteEditor === 1) {

        return `https://abc.tunebook.app/abctools.html?${url}`;
    }

    return `https://michaeleskin.com/abctools/abctools.html?${url}`;
}