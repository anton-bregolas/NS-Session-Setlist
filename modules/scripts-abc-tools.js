///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website Scripts (Modified and Refactored for Novi Sad Session Setlist)
// Source file created with ABC Transcription Tools Website Builder: https://github.com/seisiuneer/abctools/blob/main/website_generator.js
// OG Script Generation Date in ABC Transcription Tools: 2024-12-04
// ABC Transcription Tools (c) 2023-2025 Michael Eskin
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Import N.S.S.S. custom elements and tune JSONs from NS Sessions DB
import { localStorageOk, initSettingsFromObject, checkTuneBookSetting, checkIfMobileMode, tuneSets, tuneList, 
        filterOptions, initCustomDropDownMenus, openSettingsMenu, handleSelectorLabels } from "./scripts-ns-sessions.js";
// Import lz-string compression algorithm
import { LZString } from "./scripts-3p/lz-string/lz-string.min.js";

/////////////////////////////////////////////////////////////////////////////
// ABC Tunebook Website: Default Settings
/////////////////////////////////////////////////////////////////////////////

export const abcTunebookDefaults = {

    abcToolsSaveAndRestoreTunes: "1",
    abcToolsAllowInstrumentChanges: "1",
    abcToolsAllowTabStyleChanges: "1",
    abcToolsFullScreenBtnShowsChords: "0",
    abcToolsAllowTuneAutoReload: "1",
    abcToolsAlwaysMuteChords: "0",
    tuneBookAlwaysUseMobileMode: "0",
    tuneBookAlwaysUseCompactMode: "0",
    tuneBookShowStatusReport: "0",
    tuneBookAllowLoadFromHashLink: "1",
    chordViewerAllowDynamicChords: "0",
};

/////////////////////////////////////////////////////////////////////////////
// ABC Tunebook Website: Global Variables
/////////////////////////////////////////////////////////////////////////////

let tunes = [];

let isFirstTuneBookLoad = true;

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

/////////////////////////////////////////////////////////////////////////////
// ABC Tunebook Website: OG Page Elements
/////////////////////////////////////////////////////////////////////////////

export const tuneFrame = document.querySelector('#tuneFrame');
export const tuneSelector = document.querySelector('#tuneSelector');
export const displayOptions = document.querySelector('#displayOptions');

/////////////////////////////////////////////////////////////////////////////
// ABC Tunebook Website: Refactored Scripts
/////////////////////////////////////////////////////////////////////////////

////////////////////////////////
// TUNEBOOK LOAD FUNCTIONS
///////////////////////////////

// Initialize default Global settings for ABC Tools

export function initTunebookOptions() {

    initSettingsFromObject(abcTunebookDefaults);
}

// Initialize ABC Transcription Tools, add event listeners to Tunebook elements

export function initAbcTools() {

    // Select Session DB JSON to open in ABC Tools

    tunes = checkTuneBookSetting() === "setlist"? tuneSets : tuneList;

    // Initialize the Full Screen Button

    const fullScreenButton = document.getElementById('fullScreenButton');

    fullScreenButton.addEventListener('click', handleFullScreenButton);
    
    // Populate the selector with options from JSON

    if (tunes.length > 1) {

        // Populate Tunebook menu with Sets or Tunes
        populateTuneSelector(tunes);

        // Initialize custom N.S.S.S. elements
        populateFilterOptions(sortFilterOptions(tunes));
        initCustomDropDownMenus();

        // Update iframe src when an option is selected
        tuneSelector.addEventListener('change', () => {

            // Load a new Set or Tune into the Tuneframe

            loadTuneBookItem(tunes);
        });
    }

    // Initialize the Tabs & MIDI dropdown menu
    displayOptions.addEventListener('change', loadTabsMidiOptions);

    // Restore last saved Tunebook options & trigger last saved item load

    if (localStorageOk()) {

        if (+localStorage.abcToolsSaveAndRestoreTunes === 1 &&
            localStorage.lastTabMidiOption_NSSSAPP || 
            (localStorage.lastTuneBookSet_NSSSAPP ||
            localStorage.lastTuneBookTune_NSSSAPP)) {

            restoreTuneBookOptions();
            
            return;
        }
    }

    // Load the first Set or Tune into the Tuneframe

    refreshTabsDisplayOptions();

    isFirstTuneBookLoad = false;

    setTimeout(function() {

        tuneSelector.selectedIndex = 1;
        tuneSelector.dispatchEvent(new Event('change'));

    }, 150);
}

// Load a Set or a Tune into the Tuneframe

export function loadTuneBookItem(currentTuneBook, itemNumber) {

    handleSelectorLabels("select", tuneSelector, tuneSelector.selectedIndex);

    let theURL = itemNumber >= 0? currentTuneBook[itemNumber].url : tuneSelector.value;

    if (theURL == "") return;

    if (checkIfMobileMode() === true) {

        theURL = theURL.replace("&name=", "&noui&name=");
    }

    if (localStorageOk()) {

        if (+localStorage.abcToolsAllowTabStyleChanges === 1) {

            theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format="+tabStyle);

        } else {

            theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format=noten");
        }

        if (+localStorage.abcToolsAllowInstrumentChanges === 1) {

            theURL = injectInstrument(theURL);
        }

        if (+localStorage.abcToolsAlwaysMuteChords === 1) {

            theURL = muteChordsPlayback(theURL);
        }

    // Fallback logic if localStorage is unavailable
    
    } else {

        theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format="+tabStyle);
    }

    tuneFrame.src = theURL;
    lastURL = theURL;

    // Save last Tunebook item loaded
    if (localStorageOk() && +localStorage.abcToolsSaveAndRestoreTunes === 1) {

        setTimeout(() => {

            saveLastTuneBookItem();
            
        }, 250);
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
        option.dataset.tunetype = tune.type;
        option.dataset.leaders = tune.leaders;

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

            filterList.list?.forEach(filter => {

                const filterOption = document.createElement('option');
                filterOption.value = filter;
                filterOption.textContent = `🎻 ${filter}`;
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

////////////////////////////////
// MIDI & INSTRUMENTS FUNCTIONS
///////////////////////////////

// Load Tabs and MIDI selected in displayOptions, update URL & ABC

function loadTabsMidiOptions() {

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

        switch (displayOptions.value) {
            case "0": // Standard notation + default ABC Tools voice
                    tabStyle = "noten";
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
            // falls through
            case "10": // Uilleann pipes voice only
                    isUPipes = true;
            // falls through
            case "11": // Melodeon voice only
                    isMelodeon = true;
            // falls through
            case "13": // Piano voice only
                    isPianoForced = true;
            // falls through
            case "14": // Bouzouki backed by Clavinet
                    isClaviZouki = true;
            // falls through
            default: // Standard notation
                    tabStyle = "noten";
                    break;
        }
    }

    // Trigger the (re)loading of Tunebook item

    tunes = checkTuneBookSetting() === "setlist"? tuneSets : tuneList;

    if (tunes.length > 1 && localStorageOk()) {

        if (isFirstTuneBookLoad === true 
            && +localStorage.abcToolsSaveAndRestoreTunes === 1
            && ((checkTuneBookSetting() === "setlist" && localStorage.lastTuneBookSet_NSSSAPP)
            || (checkTuneBookSetting() === "tunelist" && localStorage.lastTuneBookTune_NSSSAPP))) {

            isFirstTuneBookLoad = false;
            restoreLastTunebookItem();
            return;
        }

        if (tuneSelector.value !== "" && +localStorage.abcToolsAllowTuneAutoReload === 1) {

            loadTuneBookItem(tunes);
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
            
            loadTuneBookItem(tunes); 
            return;
        }

        tuneSelector.selectedIndex = 1;
        tuneSelector.dispatchEvent(new Event('change'));
    }
}

// Inject custom MIDI settings into ABC by modifying a default template string

function injectInstrument(theURL) {

    const originalAbcInLZW = extractLZWParameter(theURL);

    const encodedAbcContent = originalAbcInLZW.replace("lzw=", '');

    let abcContent = LZString.decompressFromEncodedURIComponent(encodedAbcContent);

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
            else if (!isPianoForced) {
                return theURL;
            }
            break;
    }

    const newLZWparam = "lzw=" + LZString.compressToEncodedURIComponent(abcContent);

    theURL = theURL.replace(originalAbcInLZW, newLZWparam);

    return theURL;
}

// Inject mute chord and bass MIDI instructions overriding the existing settings

function muteChordsPlayback(theURL) {

    const originalAbcInLZW = extractLZWParameter(theURL);

    const encodedAbcContent = originalAbcInLZW.replace("lzw=", '');

    let abcContent = LZString.decompressFromEncodedURIComponent(encodedAbcContent);

    const injectMidiString = `%%MIDI bassvol 0\n%%MIDI chordvol 0`;

    abcContent = abcContent.replace(`K:`, `${injectMidiString}\nK:`);

    const newLZWparam = "lzw=" + LZString.compressToEncodedURIComponent(abcContent);

    theURL = theURL.replace(originalAbcInLZW, newLZWparam);

    return theURL;
}

// Refresh tab & MIDI selector options, set dropdown menu to default option

function refreshTabsDisplayOptions() {

    displayOptions.selectedIndex = 0;
    displayOptions.value = "-1";
    // handleSelectorLabels("setone", displayOptions);
}

////////////////////////////////
// SAVE AND RESTORE FUNCTIONS
///////////////////////////////

// Store the last selected Set or Tune and Tab & MIDI option in user's local storage

function saveLastTuneBookItem() {

    if (!localStorageOk()) return;

    if (tunes.length > 1) {

        console.log(`NS Session App:\n\nSaving current Tunebook item...`);

        if (tuneSelector.value !== "") {

            const currentTuneName = tuneSelector.options[tuneSelector.selectedIndex].text;

            checkTuneBookSetting() === "setlist"?
            localStorage.lastTuneBookSet_NSSSAPP = currentTuneName :
            localStorage.lastTuneBookTune_NSSSAPP = currentTuneName;

        } else {

            const defaultTuneName = tuneSelector.options[1].text
            
            checkTuneBookSetting() === "setlist"?
            localStorage.lastTuneBookSet_NSSSAPP = defaultTuneName :
            localStorage.lastTuneBookTune_NSSSAPP = defaultTuneName;
        }
    }
    
    const theLastTuneTab = document.getElementById('displayOptions').value;

    if (+theLastTuneTab > -1) {

        console.log(`NS Session App:\n\nSaving Tab & MIDI setting...`);

        localStorage.lastTabMidiOption_NSSSAPP = theLastTuneTab;
    }
}

// Look for saved Tunebook options in user's local storage, fire displayOptions change event
// Trigger the loading of last saved Tab & MIDI options and Tunebook item via loadTabsMidiOptions

function restoreTuneBookOptions() {

    if (!localStorageOk()) return;

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

    if (!localStorageOk()) return;

    setTimeout(function() {

        if (tunes.length > 1) {

            const theLastTuneName = checkTuneBookSetting() === "setlist"? 
                                    localStorage.lastTuneBookSet_NSSSAPP :
                                    localStorage.lastTuneBookTune_NSSSAPP;

                if (theLastTuneName && (theLastTuneName != "")) {

                    console.log(`NS Session App:\n\nRestoring last Tunebook item saved:\n\n[${theLastTuneName}]`);

                    setSelectedTuneByName(theLastTuneName);
                }
            }

    }, 250);
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

////////////////////////////////
// ENCODE & DECODE FUNCTIONS
///////////////////////////////

// Extract the LZW-compressed string containing ABC from a URL

function extractLZWParameter(url) {

    // Find the part of URL starting with &lzw= followed by any characters until the next &
    const match = url.match(/lzw=(?:[^&]*)/);

    // If a match is found, return the part after &lzw=
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

    } else if (viewPortMeta.getAttribute("content") !== "width=device-width, initial-scale=1.0") {

        viewPortMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
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

async function handleFullScreenButton() {

    const fullScreenSetting = +document.querySelector('input[name="nss-radio-view"]:checked').value;
    
    // View ABC Tools frame in Full Screen using Fullscreen API

    if (fullScreenSetting === 0) {

        // If Tunebook is in desktop mode on a narrow device, open ABC Tools in new window
        // If browser does not support Fullscreen API, open ABC Tools in new window

        if ((document.body.dataset.mode &&
            document.body.dataset.mode === "desktop" &&
            getViewportWidth() <= 870) ||
            
            (!document.body.requestFullscreen && 
            !document.body.webkitRequestFullscreen && 
            !document.body.mozRequestFullScreen &&
            !document.body.msRequestFullscreen)) {

            openInAbcTools();
            return;
        }

        const abcToolsContainer = document.querySelector('.nss-abctools-embed');

        const requestFullScreen = abcToolsContainer.requestFullscreen ||
                                  abcToolsContainer.webkitRequestFullScreen ||
                                  abcToolsContainer.mozRequestFullScreen ||
                                  abcToolsContainer.msRequestFullScreen;

        try {

            await requestFullScreen.call(abcToolsContainer);

        } catch {

            console.log(`NS Session App:\n\nFull Screen mode not available. Opening tune in new window...`);
            
            openInAbcTools();
        }

        return;
    }

    // Open Chord Viewer
    
    if (fullScreenSetting === 1) {
        
        openSettingsMenu(this.dataset.load);
        return;
    }

    // Open ABC Tools in new window

    if (fullScreenSetting === 2) {

        openInAbcTools();
        return;
    }
}

// Open last ABC Tools tune link in new window or browser tab

function openInAbcTools() {

    if (lastURL != "") {

        window.open(lastURL, '_blank');
    }
}

// Get last ABC Tools URL (for use in external modules)

export function getLastTunebookUrl() {

    return lastURL;
}