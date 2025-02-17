import { checkTuneBookSetting, tuneSets, tuneList, filterOptions, initCustomDropDownMenus, openSettingsMenu } from "./scripts-ns-sessions.js"; // Import N.S.S.S. custom elements and tune JSONs from NS Sessions DB 

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// lz-string by Pieroxy (LZ-based compression algorithm)
// Copyright (c) 2013 Pieroxy pieroxy@pieroxy.net https://github.com/pieroxy/lz-string
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Updated to lz-string.min version 1.5.0
// eslint-disable-next-line no-undef
export const LZString=function(){var r=String.fromCharCode,o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",e={};function t(r,o){if(!e[r]){e[r]={};for(var n=0;n<r.length;n++)e[r][r.charAt(n)]=n}return e[r][o]}var i={compressToBase64:function(r){if(null==r)return"";var n=i._compress(r,6,function(r){return o.charAt(r)});switch(n.length%4){default:case 0:return n;case 1:return n+"===";case 2:return n+"==";case 3:return n+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(n){return t(o,r.charAt(n))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(r){return null==r?"":""==r?null:i._decompress(r.length,16384,function(o){return r.charCodeAt(o)-32})},compressToUint8Array:function(r){for(var o=i.compress(r),n=new Uint8Array(2*o.length),e=0,t=o.length;e<t;e++){var s=o.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null==o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;e<t;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(r){return null==r?"":i._compress(r,6,function(r){return n.charAt(r)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(o){return t(n,r.charAt(o))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(r,o,n){if(null==r)return"";var e,t,i,s={},u={},a="",p="",c="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<r.length;i+=1)if(a=r.charAt(i),Object.prototype.hasOwnProperty.call(s,a)||(s[a]=f++,u[a]=!0),p=c+a,Object.prototype.hasOwnProperty.call(s,p))c=p;else{if(Object.prototype.hasOwnProperty.call(u,c)){if(c.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(t=c.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;e<h;e++)m=m<<1|t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=c.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[c]}else for(t=s[c],e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;0==--l&&(l=Math.pow(2,h),h++),s[p]=f++,c=String(a)}if(""!==c){if(Object.prototype.hasOwnProperty.call(u,c)){if(c.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(t=c.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;e<h;e++)m=m<<1|t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=c.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[c]}else for(t=s[c],e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;0==--l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==o-1){d.push(n(m));break}v++}return d.join("")},decompress:function(r){return null==r?"":""==r?null:i._decompress(r.length,32768,function(o){return r.charCodeAt(o)})},_decompress:function(o,n,e){var t,i,s,u,a,p,c,l=[],f=4,h=4,d=3,m="",v=[],g={val:e(0),position:n,index:1};for(t=0;t<3;t+=1)l[t]=t;for(s=0,a=Math.pow(2,2),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;switch(s){case 0:for(s=0,a=Math.pow(2,8),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;c=r(s);break;case 1:for(s=0,a=Math.pow(2,16),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;c=r(s);break;case 2:return""}for(l[3]=c,i=c,v.push(c);;){if(g.index>o)return"";for(s=0,a=Math.pow(2,d),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;switch(c=s){case 0:for(s=0,a=Math.pow(2,8),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;l[h++]=r(s),c=h-1,f--;break;case 1:for(s=0,a=Math.pow(2,16),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;l[h++]=r(s),c=h-1,f--;break;case 2:return v.join("")}if(0==f&&(f=Math.pow(2,d),d++),l[c])m=l[c];else{if(c!==h)return null;m=i+i.charAt(0)}v.push(m),l[h++]=i+m.charAt(0),i=m,0==--f&&(f=Math.pow(2,d),d++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module?module.exports=LZString:"undefined"!=typeof angular&&null!=angular&&angular.module("LZString",[]).factory("LZString",function(){return LZString});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website Scripts (Modified and Refactored)
// Created with ABC Tools Player Website Generator: https://github.com/seisiuneer/abctools/blob/main/website_generator.js
// Script Generation Date in ABC Transcription Tools: 2024-12-04
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website: Global Variables
////////////////////////////////////////////////////////////

let tunes = [];

let isFirstTuneBookLoad = true;

let tabStyle = "noten";

let isBanjo = false;
let isFlute = false;
let isDulcimer = false;

let isUPipes = false;
let isMelodeon = false;
let isSolfege = false;

let lastURL = "";

/////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website: OG Page Elements
////////////////////////////////////////////////////////////

export const tuneFrame = document.querySelector('#tuneFrame');
export const tuneSelector = document.querySelector('#tuneSelector');
export const displayOptions = document.getElementById('displayOptions');

///////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website: Refactored Scripts
//////////////////////////////////////////////////////////////

////////////////////////////////
// TUNEBOOK LOAD FUNCTIONS
///////////////////////////////

// Initialize ABC Transcription Tools, add event listeners to Tunebook elements

export function initAbcTools() {

    // Initialize Global Settings for ABC Tools

    if (!localStorage?.abcToolsSaveAndRestoreTunes) {

        localStorage.abcToolsSaveAndRestoreTunes = 1;
    }

    if (!localStorage?.abcToolsAllowInstrumentChanges) {

        localStorage.abcToolsAllowInstrumentChanges = 1;
    }

    // Select Session DB JSON to open in ABC Tools

    tunes = checkTuneBookSetting() === 1? tuneSets : tuneList;

    // Initialize the Full Screen Button

    const fullScreenButton = document.getElementById('fullscreenbutton');

    fullScreenButton.addEventListener('click', function() {

        const fullScreenSetting = +document.querySelector('input[name="nss-radio-view"]:checked').value;

        if (fullScreenSetting === 1 && lastURL != "") {

            window.open(lastURL, '_blank');
            return;
        }

        if (fullScreenSetting === 2) {

            openSettingsMenu(this.dataset.load);
        }
    });
    
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
    window.addEventListener('resize', resizeIframe);

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

        setTimeout(function() {

            loadTuneBookItem(tunes, 0);

        }, 150);
    }
}

// Load a Set or a Tune into the Tuneframe

export function loadTuneBookItem(currentTuneBook, itemNumber) {

    let theURL = itemNumber >= 0? currentTuneBook[itemNumber].url : tuneSelector.value;

    if (theURL == "") return;

    theURL = theURL.replace(/&format=([^&]+)/g,"&format="+tabStyle);

    if (+localStorage?.abcToolsAllowInstrumentChanges === 1) {
        
      theURL = injectInstrument(theURL);
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

    tuneBook.forEach(tune => {
        const option = document.createElement('option');
        option.value = tune.url;
        option.textContent = tune.name;
        option.dataset.tunetype = tune.type;
        option.dataset.leaders = tune.leaders;
        tuneSelector.appendChild(option);
    });
}

// Populate filter dropdown menu with options

export function populateFilterOptions(filters) {

    filters.forEach(filterList => {

        if (filterList.id) {

            const filterHeader = document.createElement('option');

            if (filterList.id === "tuneTypes") {
                
                filterHeader.value = 1;
                filterHeader.textContent = "👇 Tune Type 👇";
                filterOptions.appendChild(filterHeader);
            }

            if (filterList.id === "setLeaders") {
                
                filterHeader.value = 2;
                filterHeader.textContent = "👇 Set Leader 👇";
                filterOptions.appendChild(filterHeader);
            }
        }

        filterList.list?.forEach(filter => {

            const filterOption = document.createElement('option');
            filterOption.value = filter;
            filterOption.textContent = `🎻 ${filter}`;
            filterOptions.appendChild(filterOption);
        });
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

    // Set tabStyle setting depending on displayOptions value

    if (displayOptions.value === "-1" && !isFirstTuneBookLoad) {

        return;
    }

    if (displayOptions.value !== "-1") {

        isBanjo = false;
        isFlute = false;
        isDulcimer = false;
        isUPipes = false;
        isMelodeon = false;
        isSolfege = false;

        switch (displayOptions.value) {
            case "0": // Standard notation + piano voice
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
            default:
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

        if (tuneSelector.value !== "") {

            loadTuneBookItem(tunes);
            return;
        }

        loadTuneBookItem(tunes, 0);
    }
}

// Inject custom MIDI settings into ABC by modifying a default template string

function injectInstrument(theURL) {

    let originalAbcInLZW = extractLZWParameter(theURL);

    originalAbcInLZW = originalAbcInLZW.replace("lzw=","");

    let abcInLZW = LZString.decompressFromEncodedURIComponent(originalAbcInLZW);

    let injectMidiString = `%abcjs_soundfont fluid\n%%MIDI program 0\n%%MIDI bassprog 0\n%%MIDI chordprog 0\n%%MIDI bassvol 64\n%%MIDI chordvol 64`;

    // Inject a template MIDI string into the ABC if no MIDI instructions found

    if (!abcInLZW.includes("%abcjs_soundfont")) {

        abcInLZW = abcInLZW.replace(`K:`, `${injectMidiString}\nK:`);

    } else {

        abcInLZW.replace(/(%abcjs_soundfont)[\s\S]*?(K:)/gm, `${injectMidiString}\nK:`)
    }
    
    // Update the decompressed ABC with the new MIDI settings

    switch (tabStyle) {
        case "mandolin":
            if (isBanjo) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 105");
            }
            else {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 141");
            }
            break;
        case "gdad":
            abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 140");
            break;
        case "guitare":
        case "guitard":
            abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 24\n%%MIDI transpose -12");
            break;
        case "whistle":
            if (isFlute) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 73");
            }
            else {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 78");
            }
            abcInLZW = abcInLZW.replace("%%MIDI bassvol 64","%%MIDI bassvol 64");
            abcInLZW = abcInLZW.replace("%%MIDI chordvol 64","%%MIDI chordvol 64");
            break;
        case "notenames":
            if (isSolfege) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 136");
                break;
            } 
            abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 133");
            break;
        case "noten":
            if (isDulcimer) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 15");
            }
            else if (isUPipes) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 129");
            }
            else if (isMelodeon) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 135");     
            }
            else {
                return theURL;
            }
            break;
    }

    const newLZWparam = "lzw="+LZString.compressToEncodedURIComponent(abcInLZW);

    originalAbcInLZW = "lzw="+originalAbcInLZW;

    theURL = theURL.replace(originalAbcInLZW, newLZWparam);

    return theURL;
}

// Refresh tab & MIDI selector options, set dropdown menu to default option

function refreshTabsDisplayOptions() {

    displayOptions.options[0].selected = "selected";
    displayOptions.value = "-1";
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

// Decompress the tune LZW, replace the instrument and volumes

function extractLZWParameter(url) {
    // Use a regular expression to find the part starting with &lzw= followed by any characters until the next &
    const match = url.match(/lzw=([^&]*)/);

    // If a match is found, return the part after &lzw=
    return match ? match[0] : null;
}

////////////////////////////////
// RESIZE TOOLS FRAME FUNCTIONS
///////////////////////////////

// Calculate sizes of Tunebook section elements

function getElementsTotalHeight() {

    const ids = ['title', 'subtitle', 'displayOptions', 'footer'];

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