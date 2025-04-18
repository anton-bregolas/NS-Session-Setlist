///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website Scripts (Modified and Refactored for Novi Sad Session Setlist)
// Source file created with ABC Transcription Tools Website Builder: https://github.com/seisiuneer/abctools/blob/main/website_generator.js
// OG Script Generation Date in ABC Transcription Tools: 2024-12-04
// ABC Transcription Tools (c) 2023-2025 Michael Eskin
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Import N.S.S.S. custom elements and tune JSONs from NS Sessions DB
import { initSettingsFromObject, checkTuneBookSetting, checkIfMobileMode, tuneSets, tuneList, 
        filterOptions, initCustomDropDownMenus, openSettingsMenu } from "./scripts-ns-sessions.js";
// Import lz-string compression algorithm
import { LZString } from "./scripts-3p/lz-string/lz-string.min.js";

/////////////////////////////////////////////////////////////////////////////
// ABC Tunebook Website: Default Settings
/////////////////////////////////////////////////////////////////////////////

export const abcTunebookDefaults = {

    abcToolsSaveAndRestoreTunes: "1",
    abcToolsAllowInstrumentChanges: "1",
    abcToolsAllowTabStyleChanges: "1",
    abcToolsFullScreenBtnShowsChords: "1",
    abcToolsAllowTuneAutoReload: "1",
    abcToolsAlwaysMuteChords: "0",
    tuneBookAlwaysUseMobileMode: "0",
    tuneBookAlwaysUseCompactMode: "0",
    tuneBookShowStatusReport: "0",
    chordViewerAllowDynamicChords: "0"
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

    tunes = checkTuneBookSetting() === 1? tuneSets : tuneList;

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

    // Resize the iframe on window resize
    window.addEventListener('resize', handleResizeWindow);

    // Initial call to ensure it fits when the page loads
    resizeIframe();
    
    // Restore last saved Tunebook options & trigger last saved item load

    if (+localStorage?.abcToolsSaveAndRestoreTunes === 1
        && localStorage?.lastTabMidiOption_NSSSAPP 
        || (localStorage?.lastTuneBookSet_NSSSAPP
        || localStorage?.lastTuneBookTune_NSSSAPP)) {

        restoreTuneBookOptions();

    // Load the first Set or Tune into the Tuneframe

    } else {

        refreshTabsDisplayOptions();

        if (+localStorage?.abcToolsAllowTuneAutoReload === 1) {

            setTimeout(function() {

                loadTuneBookItem(tunes, 0);

            }, 150);

        }
    }
}

// Load a Set or a Tune into the Tuneframe

export function loadTuneBookItem(currentTuneBook, itemNumber) {

    handleSelectorLabels("select", tuneSelector.id, tuneSelector.selectedIndex);

    let theURL = itemNumber >= 0? currentTuneBook[itemNumber].url : tuneSelector.value;

    if (theURL == "") return;

    if (checkIfMobileMode() === true) {

        theURL = theURL.replace("&name=", "&noui&name=");
    }

    if (+localStorage?.abcToolsAllowTabStyleChanges === 1) {

        theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format="+tabStyle);

    } else {

        theURL = theURL.replace(/&format=(?:[^&]+)/g,"&format=noten");
    }

    if (+localStorage?.abcToolsAllowInstrumentChanges === 1) {

        theURL = injectInstrument(theURL);
    }

    if (+localStorage?.abcToolsAlwaysMuteChords === 1) {

        theURL = muteChordsPlayback(theURL);
    }

    tuneFrame.src = theURL;
    lastURL = theURL;

    // Save last Tunebook item loaded
    if (+localStorage?.abcToolsSaveAndRestoreTunes === 1) {

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

    handleSelectorLabels("select", displayOptions.id, displayOptions.selectedIndex);

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

    if (tunes.length > 1) {

        if (isFirstTuneBookLoad === true 
            && +localStorage?.abcToolsSaveAndRestoreTunes === 1
            && ((checkTuneBookSetting() === 1 && localStorage?.lastTuneBookSet_NSSSAPP)
            || (checkTuneBookSetting() === 2 && localStorage?.lastTuneBookTune_NSSSAPP))) {

            isFirstTuneBookLoad = false;
            restoreLastTunebookItem();
            return;
        }

        if (tuneSelector.value !== "" && +localStorage?.abcToolsAllowTuneAutoReload === 1) {

            loadTuneBookItem(tunes);
            return;
        }

        if (+localStorage?.abcToolsAllowTuneAutoReload === 1) {

            loadTuneBookItem(tunes, 0);
        }
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
    handleSelectorLabels("select", displayOptions.id, 0);
}

////////////////////////////////
// SAVE AND RESTORE FUNCTIONS
///////////////////////////////

// Store the last selected Set or Tune and Tab & MIDI option in user's local storage

function saveLastTuneBookItem() {

    if (window.localStorage) {

        if (tunes.length > 1) {

            console.log(`NS Session App:\n\nSaving current Tunebook item...`);

            if (tuneSelector.value !== "") {

                const currentTuneName = tuneSelector.options[tuneSelector.selectedIndex].text;

                checkTuneBookSetting() === 1?
                localStorage.lastTuneBookSet_NSSSAPP = currentTuneName :
                localStorage.lastTuneBookTune_NSSSAPP = currentTuneName;

            } else {

                const defaultTuneName = tuneSelector.options[1].text
                
                checkTuneBookSetting() === 1?
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
}

// Look for saved Tunebook options in user's local storage, fire displayOptions change event
// Trigger the loading of last saved Tab & MIDI options and Tunebook item via loadTabsMidiOptions

function restoreTuneBookOptions() {

    if (window.localStorage) {

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
}

// Restore the last selected Set or Tune from user's local storage

export function restoreLastTunebookItem() {

    if (window.localStorage) {

        setTimeout(function() {

            if (tunes.length > 1) {

                const theLastTuneName = checkTuneBookSetting() === 1? 
                                        localStorage?.lastTuneBookSet_NSSSAPP :
                                        localStorage?.lastTuneBookTune_NSSSAPP;

                    if (theLastTuneName && (theLastTuneName != "")) {

                        console.log(`NS Session App:\n\nRestoring last Tunebook item saved:\n\n[${theLastTuneName}]`);

                        setSelectedTuneByName(theLastTuneName);
                    }
                }

        }, 250);
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
// RESIZE TOOLS FRAME FUNCTIONS
///////////////////////////////

// Calculate sizes of Tunebook section elements

function getElementsTotalHeight() {

    const ids = ['nss-tunebook-header', 'nss-tunebook-footer'];

    let totalHeight = 0;

    ids.forEach(id => {

        const element = document.getElementById(id);

        if (element && (element.textContent.trim() !== "")) {

            const elementHeight = element.offsetHeight;
            const computedStyle = window.getComputedStyle(element);

            // Include margins
            const marginTop = parseFloat(computedStyle.marginTop);
            const marginBottom = parseFloat(computedStyle.marginBottom);
            totalHeight += elementHeight + marginTop + marginBottom + 1;
        }
    });
    return totalHeight + 5;
}

// Resize the embedded ABC Tools iframe

export function resizeIframe() {

    tuneFrame.style.width = (window.innerWidth-3) + 'px';
    const otherElementsHeight = getElementsTotalHeight();
    tuneFrame.style.height = (window.innerHeight-otherElementsHeight) + 'px';
}

// Set viewport width to a fixed value or reset it to device-width

export function resetViewportWidth(fixedWidthPx) {

    const viewPortMeta = document.querySelector("meta[name=viewport]");

    if (fixedWidthPx) {

        viewPortMeta.setAttribute("content", `width=${fixedWidthPx}`);

    } else if (viewPortMeta.getAttribute("content") !== "width=device-width, initial-scale=1.0") {

        viewPortMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
    }
}

////////////////////////////////
// HANDLER FUNCTIONS
///////////////////////////////

// Handle full screen action depending on user-defined settings

function handleFullScreenButton() {

    const fullScreenSetting = +document.querySelector('input[name="nss-radio-view"]:checked').value;

    // Open ABC Tools in new window

    if (fullScreenSetting === 0 && lastURL != "") {

        window.open(lastURL, '_blank');
        return;
    }

    // Open Chord Viewer

    if (fullScreenSetting === 1) {

        openSettingsMenu(this.dataset.load);
        return;
    }
}

// Handle window resize action depending on the current Tunebook mode

function handleResizeWindow() {

    // Readjust ABC Tools embed size

    resizeIframe();

    // Change Tunebook selector labels

    handleSelectorLabels("resize");
}

// Handle automatic renaming of Tunebook selector labels in Mobile Mode

export function handleSelectorLabels(actionType, parentSelectorId, selectedIndex) {

    const body = document.querySelector('body');

    if (!body.hasAttribute('data-mode') && actionType !== "init") return;

    const filterHeader = filterOptions.options[0];
    const tunesHeader = tuneSelector.options[0];
    const tabsHeader = displayOptions.options[0];

    const tuneBookSelectors = ['#filterOptions', '#tuneSelector', '#displayOptions'];
    const tuneBookSelectorHeaders = [filterHeader, tunesHeader, tabsHeader];

    const newSelectorLabels = ['✨', '🎼', '🎹'];

    if (actionType === "init") {

        if (window.innerWidth > 768 || !body.hasAttribute('data-mode')) {
            
            removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders);
            
            return;
        }

        if (body.hasAttribute('data-mode')) {
            
            setMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders, newSelectorLabels);
        }
    }

    if (actionType === "resize") {

        if (window.innerWidth > 768) {

            removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders);
        }

        if (window.innerWidth <= 768) {

            if (filterHeader.hasAttribute('label') && 
                tunesHeader.hasAttribute('label') && 
                tabsHeader.hasAttribute('label')) {

                return;
            }

            setMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders, newSelectorLabels);
        }

        return;
    }

    if (actionType === "select") {

        const parentSelector = document.getElementById(parentSelectorId);

        if (parentSelector.hasAttribute('style')) {

            if (selectedIndex != 0 || window.innerWidth > 768) {

                parentSelector.removeAttribute('style');

                return
            } 

            return;
        }

        if (selectedIndex != 0 || !body.hasAttribute('data-mode') || window.innerWidth > 768) return;

        parentSelector.setAttribute('style', 'font-size: 2.4rem');
    }
}

// Set selector attributes associated with the mobile mode

function setMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders, newSelectorLabels) {

    tuneBookSelectorHeaders.forEach(header => {

        const newLabel = newSelectorLabels[tuneBookSelectorHeaders.indexOf(header)];

        header.setAttribute('label', newLabel);
    });

    tuneBookSelectors.forEach(selectorId => {

        const selectorEl = document.querySelector(selectorId);

        if (selectorEl.selectedIndex === 0) {

            selectorEl.setAttribute('style', 'font-size: 2.4rem');
        }
    });
}

// Clear all selector styles and labels previously set via attributes for mobile mode

function removeMobileSelectorStyles(tuneBookSelectors, tuneBookSelectorHeaders) {

    tuneBookSelectors.forEach(selectorId => {

        const selectorEl = document.querySelector(selectorId);
        
        if (selectorEl.hasAttribute('style')) {
            
            selectorEl.removeAttribute('style');
        }
    });

    tuneBookSelectorHeaders.forEach(header => {
    
        if (header.hasAttribute('label')) {
    
            header.removeAttribute('label');
        }
    });
}