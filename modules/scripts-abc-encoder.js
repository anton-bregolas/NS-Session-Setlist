///////////////////////////////////////////////////////////////////////
// Novi Sad Session ABC Encoder Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2024-2025
///////////////////////////////////////////////////////////////////////

import { apStyleTitleCase } from './scripts-3p/ap-style-title-case/ap-style-title-case.js';
import { LZString } from './scripts-3p/lz-string/lz-string.min.js';
import { pThrottle } from './scripts-3p/p-throttle/p-throttle.js'
import { makeAbcChordBook } from './scripts-chord-viewer.js'
import { localStorageOk, fetchData, initSettingsFromObject, displayWarningEffect, displayNotification } from './scripts-nss-app.js';

////////////////////////////////
// ABC ENCODER GLOBAL SETTINGS
///////////////////////////////

// Default ABC Encoder Settings
// Set via initEncoderSettings on first load

export const abcEncoderDefaults = {

    abcEncodeSortsTuneBook: "0",
    abcEncodeExportsTuneList: "0",
    abcSortEnforcesCustomAbcFields: "1",
    abcSortExportsTunesFromSets: "1",
    abcSortExportsChordsFromTunes: "1",
    abcSortNormalizesAbcPartEndings: "1",
    abcSortFetchesTsoMetaData: "0",
    abcSortRemovesLineBreaksInAbc: "1",
    abcSortRemovesTextAfterLineBreaksInAbc: "0",
    abcSortUsesStrictTuneDetection: "0"
};

// Define custom regular expressions that affect Encoder behavior

// Lax detection mode: Tune headers are allowed to contain just T: for the purposes of splitting Sets into Tunes
// Sets or Tunes missing a K: field will have a blank ABC Key field added to them by Sort (only for first tune)
const matchTuneHeadersLax = new RegExp(/^T:.*[\s]*(?:^[A-Z]:.*[\s]*)*(?=^[\S]+)/, "gm");
const matchIndividualTunesLax = new RegExp (/^T:.*[\s]*(?:^[A-Z]:.*[\s]*)*(?:[^T]+[\s]*)+(?=(?:^T:|$))/, "gm");

// Strict detection mode: Every tune header must contain K: field for the purposes of splitting Sets into Tunes
// Sets or Tunes missing a K: field will be filtered out by Sort with invalid ABC printed to the console
const matchTuneHeadersStrict = new RegExp(/^T:.*[\s]*(?:^[A-Z]:.*[\s]*)*^K:[ ]*.+/, "gm");
const matchIndividualTunesStrict = new RegExp (/^T:.*[\s]*(?:^[A-JL-Z]:.*[\s]*)*(?:^K:[ ]*.+[\s]*)(?:[^T]+[\s]*)+(?=(?:^T:|$))/, "gm");

// Define an additional array of Session Survey Data
// When not empty, its data will be used to modify ABC Sort output
// Use parseSessionSurveyData to fill it with data from a .tsv file

const sessionSurveyData = [];

// Keep track of additional info messages at various processing steps

let addEncoderInfoMsg = '';
let addEncoderWarningMsg = '';

// List of basic Tune Types in Session DB
// Other tunes will be prefixed by Various

const abcBasicTuneTypes = [

    "air",
    "barndance",
    "fling",
    "highland",
    "hornpipe",
    "hop jig",
    "jig",
    "march",
    "mazurka",
    "polka",
    "reel",
    "single jig",
    "slide",
    "slip jig",
    "waltz"
];

// List of overrides for ABC string formatting
// Other strings will be formatted by default

const makeTitleCaseExceptions = [

    { string: "an seanchaí muimhneach", override: "An Seanchaí Muimhneach" },
    { string: "an tseanbhean bhocht", override: "An tSeanbhean Bhocht" },
    { string: "an súisin bán", override: "An Súisin Bán" },
    { string: "bimíd ag ól", override: "Bimíd ag Ól" },
    { string: "casadh an tsúgáin", override: "Casadh an tSúgáin" },
    { string: "cnoc na gclárac", override: "Cnoc na gClárac" },
    { string: "dance ti' thy daddy", override: "Dance ti' Thy Daddy" },
    { string: "tá an coileach ag fógairt an lae", override: "Tá an Coileach ag Fógairt an Lae" },
    { string: "st. patrick's an dro set", override: "St. Patrick's An Dro Set" },
    { string: "an dro de la saint-patrick", override: "An Dro de la Saint-Patrick" }
];

const makeProperCaseExceptions = [

    { string: "three-two", override: "3/2 Hornpipe" },
    { string: "three two", override: "3/2 Hornpipe" }
];

////////////////////////////////
// ABC FILE PARSERS & HANDLERS
///////////////////////////////

// ABC Encoder Main Handler Function
// Process and output files passed to ABC Encoder depending on task type
// Pass the resulting abc/text or JSON output to downloadAbcFile

async function saveAbcEncoderOutput(rawAbcContent, fileName, taskType) {

    let abcEncoderOutput = '';
    let abcEncoderTunesOutput = '';

    // Process input data depending on task type and Encoder settings
    // Generate additional file formats before returning main output

    if (taskType === "abc-encode") {

        // Encode each Set or Tune from input ABC with lz-string, extract metadata, make abc-encoded JSON

        const abcEncodedOutput = await getEncodedAbc(rawAbcContent, fileName);

        abcEncoderOutput = abcEncodedOutput[0];
        abcEncoderTunesOutput = abcEncodedOutput[1];

        if (localStorageOk()) {

            // Optional: Save plain text Tunelist generated from source ABC

            if (+localStorage.abcEncodeExportsTuneList === 1) {

                downloadAbcFile(exportPlainTuneList(abcEncoderOutput), "Tunelist[Source].txt");
            }

            // Optional: Save additional JSON array of objects containing all individual Setlist Tunes encoded

            if (+localStorage.abcSortExportsTunesFromSets === 1 && abcEncoderTunesOutput !== '') {

                downloadAbcFile(abcEncoderTunesOutput, "tunes.json");

                // Optional: Save plain text Tunelist of all individual Setlist Tunes from source ABC

                if (+localStorage.abcEncodeExportsTuneList === 1) {

                    downloadAbcFile(exportPlainTuneList(abcEncoderTunesOutput), "Tunelist[Tunes].txt");
                }
            }
        }
    }

    // Decode tunes contained in input JSON file, decompress using lz-string, return generated ABC file

    if (taskType === "abc-decode") { 

        abcEncoderOutput = getDecodedAbc(rawAbcContent);
    }

    // Sort ABC input data: Apply NS Session format style to each Set or Tune, sort by Tune Title, return sorted ABC

    if (taskType === "abc-sort") {

        let abcSortedOutput = [];

        if (localStorageOk() && +localStorage.abcSortFetchesTsoMetaData === 1) {

            let preProcessedAbc = await preProcessAbcMetadata(rawAbcContent);

            abcSortedOutput = getSortedAbc(preProcessedAbc);

        } else {

            abcSortedOutput = getSortedAbc(rawAbcContent);
        }

        if (!abcSortedOutput || !abcSortedOutput[0]) return;

        abcEncoderOutput = abcSortedOutput[0];
        abcEncoderTunesOutput = abcSortedOutput[1];

        if (sessionSurveyData.length > 0) {

            abcEncoderOutput = applySessionSurveyResults(abcEncoderOutput);
           
            if (abcEncoderTunesOutput) {
                
                abcEncoderTunesOutput = applySessionSurveyResults(abcEncoderTunesOutput);
            }
        }

        if (localStorageOk()) {

            // Optional: Save additional ABC file containing all individual Setlist Tunes

            if (+localStorage.abcSortExportsTunesFromSets === 1 && abcEncoderTunesOutput !== '') {

                const isCustomFieldSetEnforced = localStorageOk() && !!+localStorage.abcSortEnforcesCustomAbcFields;
                const fileExt = fileName.includes('.')? fileName.slice(fileName.lastIndexOf('.') + 1) : 'txt';
                
                downloadAbcFile(abcEncoderTunesOutput, isCustomFieldSetEnforced? `NS-Session-Tunes.${fileExt}` : `${fileName.slice(0, fileName.lastIndexOf('.'))} [ABC-SORTED-TUNES].${fileExt}`);

                // Optional: Save additional Chordbook JSON containing extracted chords arranged as Tunelist

                if (+localStorage.abcSortExportsChordsFromTunes === 1 && abcSortedOutput[3] !== '') {

                    downloadAbcFile(abcSortedOutput[3], "chords-tunes.json", "abc-extract-chords");
                }
            }

            // Optional: Save additional Chordbook JSON containing extracted chords arranged as Setlist

            if (+localStorage.abcSortExportsChordsFromTunes === 1 && abcSortedOutput[2] !== '') {

                downloadAbcFile(abcSortedOutput[2], abcSortedOutput[2].includes("setTitle")? "chords-sets.json" : "chords-tunes.json", "abc-extract-chords");
            }
        }
    }

    // Save main ABC Encoder output file
    downloadAbcFile(abcEncoderOutput, fileName, taskType);

    if (addEncoderWarningMsg) {

        displayNotification(`Encoder task completed. ${addEncoderWarningMsg}`, "warning");
        addEncoderWarningMsg = '';
    
    } else {
        
        displayNotification(`Encoder task completed${addEncoderInfoMsg? '. ' + addEncoderInfoMsg : ''}`, "success");
    }

    addEncoderInfoMsg = '';

    // Return an array containing Encoder Output and optional Encoder Tunes Output
    return [abcEncoderOutput, abcEncoderTunesOutput];
}

// Parse ABC Encoder input depending on task type
  
export async function parseAbcFromFile(taskType, triggerBtn) {

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.abc, .txt, .json';

    try {

        fileInput.onchange = async function() {

            console.log("ABC Encoder:\n\nParsing ABC file...");

            const rawAbcFile = this.files[0];

            try {

                const rawAbcContent = await readFileContent(rawAbcFile);

                console.log("ABC Encoder:\n\nABC file contents read");

                if (!validateAbcFile(rawAbcContent, taskType)) {

                    console.warn("ABC Encoder:\n\nInvalid data type or format!");

                    displayNotification("Invalid data type or format", "warning");
                    displayWarningEffect(triggerBtn);

                    return;
                }

                // Process and save ABC Encoder input
                saveAbcEncoderOutput(rawAbcContent, rawAbcFile.name, taskType);

            } catch (error) {

                console.error("ABC Encoder:\n\nError reading ABC file content:\n\n", error);

                displayNotification("Error reading file content", "error");
                displayWarningEffect(triggerBtn);
            }
        }
        
        fileInput.click();

    } catch (error) {

        console.error("ABC Encoder:\n\nParsing sequence failed!\n\n", error);

        displayNotification("Failed to parse file", "error");
        displayWarningEffect(triggerBtn);
    }
}

// Parse Session Survey Data from .tsv file
  
export async function parseSessionSurveyData(triggerBtn) {

    try {

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.tsv';

        fileInput.onchange = async function() {

            console.log("ABC Encoder:\n\nParsing Session Survey Data...");

            const rawSurveyData = this.files[0];

            try {

                const surveyDataOutput = await readFileContent(rawSurveyData);

                console.log("ABC Encoder:\n\nSession Survey Data contents read");

                if (!surveyDataOutput.startsWith("Timestamp\tI am...\tI can start...")) {

                    console.warn("ABC Encoder:\n\nInvalid Session Survey Data file!");

                    displayNotification("Not a valid session survey file", "warning");
                    displayWarningEffect(triggerBtn);

                    return;
                }

                // Process Survey Data and fill sessionSurveyData array
                fillSurveyDataArray(surveyDataOutput);
                triggerBtn.dataset.state = "filled";

            } catch (error) {

                console.error("ABC Encoder:\n\nError reading Session Survey Data file:\n\n", error);

                displayNotification("Error reading session survey file", "error");
                displayWarningEffect(triggerBtn);
            }
        };
        
        fileInput.click();

    } catch (error) {

        console.error("ABC Encoder:\n\nParsing sequence failed!\n\n", error);

        displayNotification("Error parsing session survey file", "error");
        displayWarningEffect(triggerBtn);
    }
}

// Read an imported file as text file

async function readFileContent(file) {

    return new Promise((resolve, reject) => {
  
        const reader = new FileReader();
  
        reader.onload = (event) => {
  
            resolve(event.target.result);
        };
  
        reader.onerror = (error) => {
  
            reject(error);
        };
  
        reader.readAsText(file);
    });
}

// Download a file containing ABC Encoder output, assign file name depending on task type

function downloadAbcFile(abcContent, fileName, taskType) {

    const fileExt = fileName.includes('.')? fileName.slice(fileName.lastIndexOf('.') + 1) : 'txt';

    const abcFile = new Blob([abcContent], { type: taskType === "abc-encode" || taskType === "abc-extract-chords"? "application/json" : "text/plain" });

    const abcFileName = taskType === "abc-encode" && fileName.startsWith("NS-Session-Sets") ? "sets.json" :
                        taskType === "abc-encode" && fileName.startsWith("NS-Session-Tunes") ? "tunes.json" :
                        taskType === "abc-encode" ? "ABC-ENCODED.json" :
                        taskType === "abc-decode" && fileName.startsWith("sets") ? `NS-Session-Sets.${fileExt}` :
                        taskType === "abc-decode" && fileName.startsWith("tunes") ? `NS-Session-Tunes.${fileExt}` :
                        taskType === "abc-decode" ? `ABC-DECODED.${fileExt}` :
                        taskType === "abc-sort" && !fileName.startsWith("NS-Session") && !fileName.startsWith("abc-sorted") ? `${fileName.slice(0, fileName.lastIndexOf('.'))} [ABC-SORTED].${fileExt}` :
                        fileName;
    
    const abcLink = document.createElement("a");

    abcLink.href = URL.createObjectURL(abcFile);
    abcLink.download = abcFileName;
    document.body.appendChild(abcLink);
  
    abcLink.click();
    
    document.body.removeChild(abcLink);

    console.log(`ABC Encoder:\n\n${abcFileName} saved!`);
}

////////////////////////////////
// VALIDATE ABC FUNCTIONS
///////////////////////////////

// Check if the file contains valid ABC format depending on the task

function validateAbcFile(abcContent, taskType) {

    if ((taskType === "abc-encode" || taskType === "abc-sort") && abcContent.startsWith("X:")) {

        return true;
    }

    if (taskType === "abc-decode") {

        try {

            const testJson = JSON.parse(abcContent);

            if (Object.keys(testJson[0]).join(', ') === "name, leaders, type, url" ||
                Object.keys(testJson[0]).join(', ') === "Name, URL") {

                return true;
            }

        } catch (error) {

            console.warn(error);

            return false;
        }
    }

    return false;
}

////////////////////////////////
// FETCH ABC METADATA FUNCTIONS
///////////////////////////////

// Limit the rate of requests to The Session for large tunebooks

const throttleTsoRequests = pThrottle({
    limit: 50,
    interval: 10000,
});

// Handle the fetching of metadata for reference settings from The Session using links in ABC

async function preProcessAbcMetadata(rawAbcContent) {

    // Check raw ABC for links to The Session, return unchanged if none found

    const abcHasTsoLinks = rawAbcContent.includes('https://thesession.org/');

    if (!abcHasTsoLinks) {

        addEncoderInfoMsg = "No links to The Session found in ABC";
        return rawAbcContent;
    }

    // Check raw ABC for links to sets and settings, return unchanged if none found
    
    const tsoSetUrlArr = rawAbcContent.match(/https:\/\/thesession\.org\/members\/[0-9]+\/sets\/[0-9]+/g);
    const tsoSettingUrlArr = rawAbcContent.match(/https:\/\/thesession\.org\/tunes\/[0-9]+#setting[0-9]+/g);

    if (!tsoSetUrlArr && !tsoSettingUrlArr) {

        addEncoderInfoMsg = "No links to sets or settings on The Session found in ABC";
        return rawAbcContent;
    }

    // Fail-fast check: Test connection to The Session before firing promises

    try {

        console.log('ABC Encoder:\n\nTesting connection to The Session...');

        const testJsonUrl = "https://thesession.org/tunes/1?format=json";
        
        await fetchData(testJsonUrl, "json");

    } catch (error) {

        console.warn('ABC Encoder:\n\nFailed to connect to The Session. Details:\n\n', error.message);

        addEncoderWarningMsg = "Failed to get metadata from The\xa0Session";
        
        return rawAbcContent;
    }

    // Process ABC items - Sets or Tunes - containing fetchable links to The Session

    let preProcessedAbcArr = rawAbcContent.split('X:');
    let metaAddedCounter = 0;
    let metaFoundCounter = 0;

    console.log('ABC Encoder:\n\nChecking ABC for links to The Session with fetchable metadata...');

    preProcessedAbcArr = await Promise.all(preProcessedAbcArr.map(async (abcItem) => {
    
        if (!abcItem) return abcItem;

        // Do not process ABCs that already contain TSO metadata

        if (abcItem.includes('at The Session')) {

            metaFoundCounter++;
            return abcItem;
        }

        // Account for various types of The Session links passed

        const tsoSettingUrlArr = abcItem.match(/https:\/\/thesession\.org\/tunes\/[0-9]+#setting[0-9]+/g);
        const tsoSetUrlArr = abcItem.match(/https:\/\/thesession\.org\/members\/[0-9]+\/sets\/[0-9]+/g);
        
        if (!tsoSettingUrlArr && !tsoSetUrlArr) return abcItem;

        // Keep pre-existing data intact in ABC Transcription fields, ignore data in ABC Composer fields
        
        let abcZString = abcItem.match(/^Z:.+/m) && abcItem.match(/(?<=^Z:).+/m)[0].trim()? 
            `${abcItem.match(/^Z:[^;\r\n]+/m)[0]}; ` :
            'Z: [Unedited]; ';
        
        let abcCString = 'C: ';
        
        // Process links to TSO sets or settings via fetchTsoMetadata, fetching JSON data to an array

        let tsoMetaDataArr =
            tsoSettingUrlArr && tsoSettingUrlArr.length > 0? await fetchTsoMetadata(tsoSettingUrlArr, "setting") :
            tsoSetUrlArr && tsoSetUrlArr.length > 0? await fetchTsoMetadata(tsoSetUrlArr, "set") : null;

        if (!tsoMetaDataArr || !tsoMetaDataArr[0]) return abcItem;

        // Process links to each setting if data is being extracted from TSO sets
        // Step required as TSO set JSONs do to not contain Composer data

        if (typeof(tsoMetaDataArr[0]) === "string" &&
            tsoMetaDataArr[0].startsWith('https://thesession.org/tunes/')) {

            tsoMetaDataArr = await fetchTsoMetadata(tsoMetaDataArr, "setting");
        }

        // Reduce metadata sub-arrays to slash-separated strings
        // Replace sets of identical values with a single string

        if (Array.isArray(tsoMetaDataArr[0])) {

            const setAbcCArr = tsoMetaDataArr.map(arr => arr[0]);
            const setAbcZArr = tsoMetaDataArr.map(arr => arr[1]);

            tsoMetaDataArr = [
                reduceArrToSlashSeparatedList(setAbcCArr), 
                reduceArrToSlashSeparatedList(setAbcZArr)
            ];

            // Assign C: and Z: values

            abcCString += tsoMetaDataArr[0];
            
            abcZString += `${tsoMetaDataArr[1]} at The Session`;

            metaAddedCounter++;

            // Replace the first found Z: field in ABC
            // Else insert Z: field value before N: or R:

            if (abcItem.match(/^Z:/m)) {

                abcItem = abcItem.replace(/^Z:.*/m, abcZString);

            } else if (abcItem.match(/^N:/m)) {

                abcItem = abcItem.replace(/^N:/m, `${abcZString}\nN:`);

            } else if (abcItem.match(/^R:/m)) {

                abcItem = abcItem.replace(/^R:/m, `${abcZString}\nR:`);
            }

            // Replace the first found C: field in ABC
            // Else insert C: field value before Z:

            if (abcItem.match(/^C:/m)) {

                abcItem = abcItem.replace(/^C:.*/m, abcCString);

            } else {

                abcItem = abcItem.replace(/^Z:/m, `${abcCString}\nZ:`);
            }
        }
        
        return abcItem;
    }));

    if (!preProcessedAbcArr[1]) {

        console.warn('ABC Encoder:\n\nNo valid metadata from The Session could be added');
        addEncoderWarningMsg = "No valid metadata from The Session could be added";

    } else if (!metaAddedCounter) {

        console.log(`ABC Encoder:\n\nThe Session metadata found in ${metaFoundCounter} item(s), fetching cancelled`);
        addEncoderInfoMsg = "The Session metadata found in source ABC";

    } else {

        console.log(`ABC Encoder:\n\nThe Session metadata added to ${metaAddedCounter} item(s)${metaFoundCounter? ', found in ' + metaFoundCounter + ' item(s)' : ''}`);
        addEncoderInfoMsg = "The Session metadata has been added";
    }

    return preProcessedAbcArr[1]? preProcessedAbcArr.join('X:') : rawAbcContent;
}

// Fetch metadata from an array of links to The Session Sets or Settings
// Limit the number of concurrent requests with throttleTsoRequests

async function fetchTsoMetadata(urlArr, urlType) {
    
    const tsoMetaDataOutputArr = await Promise.all(urlArr.map(throttleTsoRequests(async (url) => {
        
        let tsoJsonUrl = urlType === "setting"? `${url.split('#')[0]}?format=json` : 
        urlType === "set"? `${url}?format=json` : '';
        
        if (!tsoJsonUrl) return;
        
        console.log('ABC Encoder:\n\nFetching metadata from The Session...');
        // console.log('ABC Encoder:\n\nFetching metadata from The Session for...' + '\n\n' + url);

        displayNotification("Fetching metadata from The\xa0Session...");

        const tsoJsonObj = await fetchData(tsoJsonUrl, "json");

        if (urlType === "setting") {

            const tsoSettingId = +url.split('#setting')[1];
            const tsoTuneSettingObj = tsoJsonObj.settings.find(setting => setting.id === tsoSettingId);

            let tsoC = tsoJsonObj.composer? tsoJsonObj.composer : 'Trad.';
            let tsoZ = tsoTuneSettingObj? tsoTuneSettingObj.member.name : 'Anon.';

            return [tsoC, tsoZ];
        }

        if (urlType === "set") {

            const tsoSettingUrlArr = [];

            tsoJsonObj.settings.forEach(tuneSetting => {

                tsoSettingUrlArr.push(tuneSetting.url);
            });

            return tsoSettingUrlArr;
        }

    })));

    // Return a nested array of TSO metadata extracted from Setting URLs
    // Return an array of links to TSO settings extracted from Set URLs

    return urlType === "set"? tsoMetaDataOutputArr[0] : tsoMetaDataOutputArr;
}

////////////////////////////////
// SORT ABC FUNCTIONS
///////////////////////////////

// Sort, filter and renumber raw ABC contents and return a string of ABCs

function getSortedAbc(abcContent) { 

    console.log("ABC Encoder:\n\nSorting ABC file contents...");

    displayNotification("Sorting ABC file contents...");

    const sortedAbcContentArr = sortFilterAbc(abcContent);

    if (sortedAbcContentArr[0]?.length > 0) {

        const sortedAbcOutput = sortedAbcContentArr[0].join('\n\n');

        let sortedAbcTunes = '';
        let sortedAbcChords = '';
        let sortedAbcTuneChords = '';

        console.log("ABC Encoder:\n\nABC file contents sorted!");

        if (localStorageOk() && +localStorage.abcSortExportsChordsFromTunes === 1) {

            console.log(`ABC Encoder:\n\nExtracting Chords from ABC...`);

            displayNotification("Extracting Chords from ABC...");

            sortedAbcChords = makeAbcChordBook(sortedAbcOutput);
        }

        if (sortedAbcContentArr[1]?.length > 0) {

            sortedAbcTunes = sortedAbcContentArr[1].join('\n\n');

            if (localStorageOk() && +localStorage.abcSortExportsChordsFromTunes === 1) {

                console.log(`ABC Encoder:\n\nExtracting Chords from ABC Tunes...`);

                sortedAbcTuneChords = makeAbcChordBook(sortedAbcTunes);
            }
        }

        return [sortedAbcOutput, sortedAbcTunes, sortedAbcChords, sortedAbcTuneChords];

    } else {

        console.warn("ABC Encoder:\n\nNo valid ABC data found after sorting");
        displayNotification("No valid ABC data found", "warning");
        return;
    }
}

// Return a sorted, filtered and renumbered array of ABCs

export function sortFilterAbc(abcContent) {

    try { 

        // Filter and sort ABC content, renumber Sets / Tunes, add missing custom ABC fields

        const splitAbcArr = abcContent.split(/X.*/gm);

        const filteredAbcArr = splitAbcArr.map(abc => abc.trim()).filter(abc => abc.startsWith("T:"));

        const uniqueAbcMap = new Map(filteredAbcArr.map(abc => ([abc.match(/^T:.*/)[0], abc])));

        const uniqueAbcArr = Array.from(uniqueAbcMap.values());

        const sortedAbcArr = uniqueAbcArr.sort().map(abc => {

            const processedAbc = addCustomAbcFields(abc);

            if (!processedAbc) return;

            return `X: ${uniqueAbcArr.indexOf(abc) + 1}\n${processedAbc}`;
        
        }).filter(Boolean);

        // Filter and sort an additional array of Tunes if abcContent contains Sets and abcSortExportsTunesFromSets setting is on

        let sortedAbcTunesArr = [];

        const isStrictDetectMode = localStorageOk() && !!+localStorage.abcSortUsesStrictTuneDetection;

        const matchTuneBlocks = uniqueAbcArr[0].match(isStrictDetectMode? matchTuneHeadersStrict : matchTuneHeadersLax);

        const isTuneSet = matchTuneBlocks && matchTuneBlocks.length > 1;
        
        if (localStorageOk() && +localStorage.abcSortExportsTunesFromSets === 1 && isTuneSet) {

            const exportedTunesArr = makeTunesFromSets(uniqueAbcArr);

            sortedAbcTunesArr = exportedTunesArr.sort().map(abc => `X: ${exportedTunesArr.indexOf(abc) + 1}\n${abc}`);

            console.log(`ABC Encoder:\n\nABC Tunebook generated from Sets data`);
        }

        // Replace all duplicate ABC header fields if their values are the same

        const sortedTidyAbcArr = sortedAbcArr.map(abc => 

            ['R', 'M', 'L', 'Q'].reduce((processedAbc, fieldName) => 

                replaceDuplicateAbcFields(processedAbc, fieldName) || processedAbc,
                
            abc)
        );

        if (localStorageOk()) {

            // Option A: Also remove all empty lines inside ABCs

            if (+localStorage.abcSortRemovesLineBreaksInAbc === 1) {

                return [removeLineBreaksInAbc(sortedTidyAbcArr), removeLineBreaksInAbc(sortedAbcTunesArr)];
            }

            // Option B: Also remove all text separated by empty lines inside ABCs

            if (+localStorage.abcSortRemovesTextAfterLineBreaksInAbc === 1) {

                return [removeTextAfterLineBreaksInAbc(sortedTidyAbcArr), removeTextAfterLineBreaksInAbc(sortedAbcTunesArr)];
            }
        }
        
        // Default option: Return sorted ABCs as is (everything in-between X: fields)

        return [sortedTidyAbcArr, sortedAbcTunesArr];

    } catch (error) {

        displayNotification("Failed to sort ABC", "error");
        throw new Error("ABC Encoder:\n\nFailed to sort ABC\n\n", { cause: error });
    }
}

// Optionally look for and remove empty lines inside an ABC

function removeLineBreaksInAbc(sortedAbcArr) {

    if (sortedAbcArr.length > 0) {

        return sortedAbcArr.map(abc => abc.split('\n').map(line => line.trim()).filter(line => line !== '').join('\n'));
    }

    return sortedAbcArr;
}

// Optionally look for and remove all content separated by an empty line inside an ABC

function removeTextAfterLineBreaksInAbc(sortedAbcArr) {

    if (sortedAbcArr.length > 0) {

        // Regex implementation:

        // return sortedAbcArr.map(abc => abc.match(/^[\s\S]*?(?=(\r?\n\n|\r?\n\r\n))|^[\s\S]*/m)[0]);
        
        // Step-by-step implementation:

        const splitAbcLinesArr = sortedAbcArr.map(abc => abc.split('\n'));

        const filteredAbcArr = [];

        splitAbcLinesArr.forEach(abc => {

            const filteredAbcLinesArr = [];

            for (let line of abc) {

                if (line.trim() === "") {  

                    break;
                }

                filteredAbcLinesArr.push(`${line}\n`);
            }

            filteredAbcArr.push(filteredAbcLinesArr.join('').trim());
        });

        return filteredAbcArr;
    }

    return sortedAbcArr;
}

// Make selected ABC field text Title Case via ap-style-title-case
// Override exceptions with strings from makeTitleCaseExceptions

function makeStringTitleCase(abcString) {

    let abcTitleCaseOutput = '';
    
    let abcTitleArr = abcString.trim().split(/(?:[\s]*[^0-9]\/[\s]*)/);

    for (let i = 0; i < abcTitleArr.length; i++) {

        let inputTitle = abcTitleArr[i];
        let titleOverride = '';
        
        for (const caseObj of makeTitleCaseExceptions) {

            const excMatch = inputTitle.toLowerCase().match(caseObj.string);

            if (excMatch) {

                let titleSuffix = inputTitle.match(/(?:\(.*?\)[\s]*?)*\[.*?\]/);
    
                titleOverride = `${caseObj.override}${titleSuffix? ' ' + titleSuffix[0] : ''}`;
                // console.warn(`Title exception found! Output: ${titleOverride}`);
                break;
            }
        }
        
        if (i > 0) {

            abcTitleCaseOutput += " / ";
        }

        if (titleOverride) {
    
            abcTitleCaseOutput += titleOverride;

        } else {

            inputTitle = toSortFriendlyTitle(inputTitle);
            abcTitleCaseOutput += apStyleTitleCase(inputTitle);
        }
    }

    return abcTitleCaseOutput;
}

// Make selected ABC field text Proper Case
// Override exceptions with strings from makeProperCaseExceptions

function makeStringProperCase(abcString) {

    let stringOverride = '';

    for (const caseObj of makeProperCaseExceptions) {

        if (abcString.toLowerCase() === caseObj.string) {

            stringOverride = caseObj.override;
            break;
        }
    }

    if (stringOverride) {

        return stringOverride;
    }

    return abcString
            .split(/[\s,-]/)
            .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
}

// Make ABC Tune Type singular based on Title Prefix (formatting style for Tunes)

function makeTuneTypeSingular(abcTitlePrefix) {

    if (["march","schottis","waltz"].includes(abcTitlePrefix.toLowerCase())) {

        return makeStringProperCase(abcTitlePrefix).replace(/es$/, '');
    }

    if (abcTitlePrefix.toUpperCase() !== "VARIOUS") {

        return makeStringProperCase(abcTitlePrefix).replace(/s$/, '')
    }

    return "Various";
}

// Make ABC Tune Type plural in the Title Prefix (formatting style for Sets)
// Check if number of T: fields is more than 2 (Primary Title + Subtitle)
// Add plural affix to ABC Tune Type name depending on type

function makeTuneTypePlural(abcContent, abcR) {

    const isStrictDetectMode = localStorageOk() && !!+localStorage.abcSortUsesStrictTuneDetection;

    const matchTuneBlocks = abcContent.match(isStrictDetectMode? matchTuneHeadersStrict : matchTuneHeadersLax);

    const isTuneSet = matchTuneBlocks && matchTuneBlocks.length > 1;

    if (abcR && abcBasicTuneTypes.includes(abcR.toLowerCase())) {

        let tuneTypeSuffix = '';

        if (isTuneSet) {
    
            tuneTypeSuffix = ["march","schottis","waltz"].includes(abcR.toLowerCase())? 'es' : 's';
        }

        return `${abcR + tuneTypeSuffix}`.toUpperCase()
    }

    return "VARIOUS";
}

// Remove articles from the start of the ABC Title to make it sort-friendly

function toSortFriendlyTitle(abcTitle) {
    
    return abcTitle.replace(/^(?:(?:The|An|A)[\s]+)/, '').trim();
}

// Scan ABC body for R: and T: fields and process them accordingly

function formatAbcBodyTitles(abcContent) {

    let formattedAbc = abcContent.replace(/(?<=^R:).*/gm, tuneType => ` ${makeStringProperCase(tuneType.trim())}`);

    if (formattedAbc.match(/^T:.*/m)) {

        formattedAbc = processAbcSubtitles(formattedAbc);
    }

    return formattedAbc;
}

// Process ABC Subtitles (single-line T:)
// Make selected ABC field text Title Case
// Remove articles to make ABC sort-friendly

function processAbcSubtitles(abcContent) {

    let processedAbcContent = abcContent.replace(/(?<=^T:).*/gm, 
        
        match => ` ${makeStringTitleCase(match.trim())}`
    );

    return processedAbcContent;
}

// Process unordered ABC Subtitle of the primary tune
// Used when at least one subtitle is separated 
// by other ABC fields from the main ABC title
// Return a single string of slash-separated subtitles

function processUnorderedSubTitle(abcContent) {

    abcContent = processAbcSubtitles(abcContent);

    let processedSubTitle = '';

    const subTitlesArr = abcContent.match(/^T:.*/gm);

    subTitlesArr.forEach(subTitle => {
        
        processedSubTitle += `${subTitle.match(/(?<=^T:).*/)[0].trim()}${subTitlesArr.indexOf(subTitle) === subTitlesArr.length - 1? '' : ' / '}`;
    });

    return processedSubTitle;
}

// Merge unordered ABC Subtitle into the Primary Title
// Insert Subtitle as the last line of the Primary Title

function mergeAbcSubTitle(abcTitle, abcSubTitle) {

    const titleLines = abcTitle.match(/^T:.*/gm);

    if (titleLines.length > 1) {

        return `${abcTitle.trim()} / ${abcSubTitle}`
    }

    return `${abcTitle}\nT: ${abcSubTitle}`
}

// Process ABC Primary Title (single or multi-line)
// Make selected ABC field text Title Case
// Remove articles to make ABC sort-friendly
// Optional: Add TYPE: prefix to ABC Title

function processAbcTitle(abcTitle, abcTitlePrefix, abcTitleSuffix) {

    const abcTitleArr = abcTitle.trim().split('\n');

    let primaryTitle = abcTitleArr[0].match(/(?<=^T:).*/)[0].trim();

    if (primaryTitle.match(/^.*:/)) {

        primaryTitle = primaryTitle.replace(/^.*:/, '').trim();
    }

    if (primaryTitle.match(/\.$/)) {

        primaryTitle = primaryTitle.replace(/\.$/, '');
    }

    let formattedTitle = makeStringTitleCase(primaryTitle);

    let formattedPrefix = abcTitlePrefix? `${abcTitlePrefix}: ` : '';

    let formattedSuffix = abcTitleSuffix? ` ${abcTitleSuffix}` : '';

    let abcTitleOutput = `T: ${formattedPrefix}${formattedTitle}${formattedSuffix}`;

    if (abcTitleArr.length > 1) {

        for (let i = 1; i < abcTitleArr.length; i++) {

            let secondaryTitle = abcTitleArr[i].match(/(?<=^T:).*/)[0].trim();

            abcTitleOutput += `\nT: ${makeStringTitleCase(secondaryTitle)}`;
        }
    }

    return abcTitleOutput;
}

// Return the item in an ABC Field Text array based on abcIndex of the Tune in the Set
// If abcIndex is greater than the number of items, return the last (or the first) array item

function getValueByAbcIndex(abcArr, abcIndex) {

    if (abcIndex <= abcArr.length - 1) {

        return abcArr[abcIndex];
    
    } else {

        const valueIndex = abcArr.length - 1 < 0? 0 : abcArr.length - 1;

        return abcArr[valueIndex];
    }
}

// Process ABC Transcription Field text, separate Tune Composers from Tune Sources
// Return correct C: C: S: field value for a Tune depending on its abcIndex in the Set

function processAbcCCS(abcCCS, abcC, abcSArr, abcIndex) {
   
    let abcCFromCCSArr = abcCCS.split('S:')[0]?.replace(';', '').split('/');
    let abcSFromCCSArr = abcCCS.split('S:')[1]?.split('/');
    
    let abcCVal = 
        abcCFromCCSArr && abcCFromCCSArr[0]? getValueByAbcIndex(abcCFromCCSArr, +abcIndex).trim() : 
        abcC && abcC.split('/').length > 1? getValueByAbcIndex(abcC.split('/'), +abcIndex).trim() : abcC;

    let abcSVal = 
        abcSFromCCSArr && abcSFromCCSArr[0]? getValueByAbcIndex(abcSFromCCSArr, +abcIndex).trim() : '';

    if (!abcSVal && abcSArr && abcSArr[0] && !abcSArr[0].trim().startsWith('http')) {

        abcSVal = 
            abcSArr[0].split('/').length > 1? getValueByAbcIndex(abcSArr[0].split('/'), +abcIndex).trim() : 
            abcSArr[0];
    }

    return `${abcCVal? abcCVal : 'Trad.'}; S: ${abcSVal? abcSVal : 'Various'}`;
}

// Process ABC Composer Field text for individual tunes being converted to sets
// Return correct C: field value for a Tune depending on its abcIndex in the Set

function processAbcC(abcC, abcIndex) {

    let abcCArr = abcC.split('/');

    let abcCVal = 
        abcCArr && abcCArr.length > 0? getValueByAbcIndex(abcCArr, +abcIndex).trim() : '';
    
    return abcCVal;
}

// Process ABC Transcription Field text, separate Editors from The Session authors
// Return correct Z: field value for a Tune depending on its abcIndex in the Set

function processAbcZ(abcZ, abcIndex) {

    let abcEds = abcZ.split(';')[0].trim();
    let abcTsoArr = abcZ.split(';')[1]?.split('/');
    let abcTso = abcTsoArr && abcTsoArr.length > 0? getValueByAbcIndex(abcTsoArr, +abcIndex).trim() : '';

    abcTso = abcTso && abcTso.includes('The Session')? abcTso : abcTso? abcTso + ' at The Session' : 'The Session';
    
    return `${abcEds? abcEds : '[Unedited]'}; ${abcTso}`;
}

// Process a single ABC header field
// Apply uniform spacing between field tag and text
// Replace all line breaks with uniform \n

function processAbcHeaderField(abcFieldLine) {

    return `${abcFieldLine.replace(/^([A-Zmrsw]:)[\s]*/, `$1 `).trim()}\n`;
}

// Process an array of matched ABC Fields
// Return a string with uniform opening spaces and newline breaks

function massProcessAbcHeaderFields(abcFieldsArr) {

    const processedFieldsArr = 
        abcFieldsArr.map(fieldLine => processAbcHeaderField(fieldLine));

    return processedFieldsArr.join('');
}

// Scan ABC body for all standard header fields
// Process each field, making uniform spacings and line breaks

function formatAbcBodyFields(abcBodyContent) {

    const bodyFieldsMinusTR = new RegExp(/^[A-Zmrsw]:.*[\s]*/, "gm");

    const bodyFieldMatch = abcBodyContent.match(bodyFieldsMinusTR);

    if (bodyFieldMatch) {

        const processedAbcBodyContent = 
            abcBodyContent.replaceAll(bodyFieldsMinusTR, (match) => processAbcHeaderField(match));

        return processedAbcBodyContent;
    }

    return abcBodyContent;
}

// Replace several variants of ABC part separators with uniform style

function processPartEndings(abcContent) {

    let abcOutput = abcContent.replaceAll(/\|](?=\r?\n|$)/g, '||') // |AB cd|] > |AB cd||
                           .replaceAll(/:\|(?=(?:\r?\n[^[]|$))/g, ':||') // |AB cd:| > |AB cd:||
                           .replaceAll(/(?<=[^\\n])\|[ ]*\[(?=\d)/g, '|') // |[1 AB cd:|[2 ef g2|| > |1 AB cd:|2 ef g2||
                           .replaceAll(/(?<=:\|\d[^|]*)\|(?=\r?\n|$)/g, '||') // |2 AB cd| > |2 AB cd||
                           .replaceAll(/(?<=[^|])\|(?=\r?\nT|$)/g, '||') // |AB cd| + T: New Tune > |AB cd|| + T: New Tune
                           .replaceAll(/:\|*:\r?\n/g, ':||\n|:') // |AB cd:: or |AB cd:|: > |AB cd:|| + |:
                           .replaceAll(/:\|*:/g, ':||\n|:') // |AB cd::ef g2| > |AB cd:|| + |:ef g2|
                           .replaceAll(/\|\|:/g, '|:') // ||:AB cd| > |:AB cd|

    return abcOutput;
}

// Scan the selected Set or Tune for custom N.S.S.S. ABC fields and update mismatching ABCs
// Process Set or Tune Title and Tune Type and replace them with the custom style format
// Optional: Use abcMatch as template for ABC fields text
// Optional: Use setToTunes + abcIndex + isMedley

function addCustomAbcFields(abcContent, abcMatch, setToTunes, abcIndex, isMedley) {

    // Set-to-tunes: Replace Set Title before processing first tune in a set

    const abcTitles = abcContent.match(/^T:.*/gm);

    if (setToTunes && abcIndex === 0 && abcTitles && abcTitles.length > 1) {
        
        abcContent = abcContent.replace(/^T:.*[\s]*/, '');
    }

    // Check if ABC contains a set of tunes

    const isStrictDetectMode = localStorageOk() && !!+localStorage.abcSortUsesStrictTuneDetection;

    const matchTuneBlocks = abcContent.match(isStrictDetectMode? matchTuneHeadersStrict : matchTuneHeadersLax);

    if (!matchTuneBlocks || (isStrictDetectMode && abcContent.match(matchTuneHeadersLax).length > matchTuneBlocks.length)) {

        console.warn(`ABC Encoder:\n\nInvalid ABC detected and skipped:\n\n${abcContent}${abcMatch? '\n\nParent ABC:\n\n' + abcMatch : ''}`);
        return '';
    }

    const isTuneSet = matchTuneBlocks && matchTuneBlocks.length > 1;

    // Define start values for primary ABC Title and modified ABC copy

    const abcContentTitle = abcContent.match(/(?<=^T:).*/m)[0].trim();

    let updatedAbc = abcContent.trim();

    let abcTitle = '';

    // Separate primary ABC Title(s) from the rest of the ABC

    // ABC content starts with T: >>>

    if (updatedAbc.match(/^T:.*/)) {

        do {
            abcTitle += `${updatedAbc.match(/^T:.*/)[0]}\n`;
            updatedAbc = updatedAbc.replace(/^T:.*/, '').trim();

        } while (updatedAbc.startsWith("T:"));

    // ABC content does not start with T: >>>

    } else {

        abcTitle = `T: ${abcContentTitle}`;
    }

    // Derive ABC Tune Type from ABC R: field or TYPE: prefix

    let abcR = abcContent.match(/(?<=^R:).*/m)? abcContent.match(/(?<=^R:).*/m)[0].trim() : abcTitle.includes('[')? abcTitle.match(/\[.*?\]/)[0].replaceAll(/[\[\]]/g, '') : '';

    let abcTitlePrefix = abcContentTitle.match(/.*:/)? abcContentTitle.match(/.*(?=:)/)[0].trim().toUpperCase() : makeTuneTypePlural(abcContent, abcR);

    let abcTitleSuffix = isTuneSet && !abcContentTitle.toUpperCase().endsWith("SET")? "Set" : '';

    let abcTuneType = abcR? makeStringProperCase(abcR) : makeTuneTypeSingular(abcTitlePrefix);

    // Standardize format of part endings in ABC body

    if (localStorageOk() && +localStorage.abcSortNormalizesAbcPartEndings === 1) {
   
        updatedAbc = processPartEndings(updatedAbc);
    }
        
    // QUICK EDIT CASE:

    const isCustomFieldSetEnforced = localStorageOk() && !!+localStorage.abcSortEnforcesCustomAbcFields;
    const isTsoMetadataSettingOn = localStorageOk() && !!+localStorage.abcSortFetchesTsoMetaData;

    // Determine the custom layout type the ABC must match

    let abcCustomFieldsLayout;

    if (isCustomFieldSetEnforced) {

        abcCustomFieldsLayout = /^C: C:.*[\s]*C: Set Leaders:.*[\s]*Z:.*at The Session[\s]*(?:N:.*[\s]*)*R:.*[\s]*M:.*[\s]*L:.*[\s]*Q:.*[\s]*K:.*[\s]*/gm;
    
    } else if (isTsoMetadataSettingOn) {

        abcCustomFieldsLayout = /^(?:C:.*[\s]*)*(?:S:.*[\s]*)*Z:.*at The Session[\s]*(?:N:.*[\s]*)*(?:[ABD-IOPU-Wm]:.*[\s]*)*R:.*[\s]*M:.*[\s]*L:.*[\s]*(?:Q:.*[\s]*)*K:.*[\s]*/gm;
    
    } else {

        abcCustomFieldsLayout = /^(?:C:.*[\s]*)*(?:S:.*[\s]*)*(?:Z:.*[\s]*)*(?:N:.*[\s]*)*(?:[ABD-IOPU-Wm]:.*[\s]*)*R:.*[\s]*M:.*[\s]*L:.*[\s]*(?:Q:.*[\s]*)*K:.*[\s]*/gm;
    }

    // Return ABC with processed Title and quick-styled fields if all custom fields are already in place

    if (!abcMatch && updatedAbc.match(abcCustomFieldsLayout)) {

        let updatedAbcTitle = processAbcTitle(abcTitle, abcTitlePrefix, abcTitleSuffix);

        updatedAbc = formatAbcBodyTitles(updatedAbc);
        
        updatedAbc = formatAbcBodyFields(updatedAbc);

        return `${updatedAbcTitle}\n${updatedAbc}`;
    }

    // DEEP EDIT CASE:

    // Define variables to store custom ABC fields data

    let abcC; // ABC Composer field data
    let abcS; // ABC Source field data
    let abcCSL; // ABC Set Leaders data (N.S.S.S.)
    let abcCCS; // ABC Composer & Source data (N.S.S.S.) 
    let abcZ; // ABC Transcription field data
    let abcN; // ABC Notes field data
    let abcM; // ABC Meter field data
    let abcL; // ABC Note Length field data
    let abcQ; // ABC Tempo field data
    let abcK; // ABC Key field data

    // Set ABC field variable values for individual tunes

    if (!isTuneSet) {

        abcC = abcContent.match(/(?<=^C:).*/m)? abcContent.match(/(?<=^C:).*/m)[0].trim() : '';
        abcS = abcContent.match(/(?<=^S:).*/m)? abcContent.match(/(?<=^S:).*/gm) : [];
        abcCSL = abcContent.match(/(?<=^C: Set Leaders:).*/m)? abcContent.match(/(?<=^C: Set Leaders:).*/m)[0].trim() : '';
        abcCCS = abcContent.match(/(?<=^C: C:).*/m)? abcContent.match(/(?<=^C: C:).*/m)[0].trim() : '';
        abcZ = abcContent.match(/(?<=^Z:).*/m)? abcContent.match(/(?<=^Z:).*/m)[0].trim() : '';
        abcN = abcContent.match(/(?<=^N:).*/m)? abcContent.match(/(?<=^N:).*/gm) : [];
        abcM = abcContent.match(/(?<=^M:).*/m)? abcContent.match(/(?<=^M:).*/m)[0].trim() : '';
        abcL = abcContent.match(/(?<=^L:).*/m)? abcContent.match(/(?<=^L:).*/m)[0].trim() : '';
        abcQ = abcContent.match(/(?<=^Q:).*/m)? abcContent.match(/(?<=^Q:).*/m)[0].trim() : '';
        abcK = abcContent.match(/(?<=^K:).*/m)? abcContent.match(/(?<=^K:).*/m)[0].trim() : '';
    }

    // Set ABC field variable values for the first tune in a set

    let titleTune = '';

    if (isTuneSet) {

        const abcTunesArr = abcContent.match(isStrictDetectMode? matchIndividualTunesStrict : matchIndividualTunesLax);

        if (!abcTunesArr || !abcTunesArr[0]) {

            console.warn(`ABC Encoder:\n\nInvalid ABC detected and skipped:\n\n${abcContent}`);
            return '';
        }

        titleTune = abcTunesArr[0];

        abcC = titleTune.match(/(?<=^C:).*/m)? titleTune.match(/(?<=^C:).*/m)[0].trim() : '';
        abcS = titleTune.match(/(?<=^S:).*/m)? titleTune.match(/(?<=^S:).*/gm) : [];
        abcCSL = titleTune.match(/(?<=^C: Set Leaders:).*/m)? titleTune.match(/(?<=^C: Set Leaders:).*/m)[0].trim() : '';
        abcCCS = titleTune.match(/(?<=^C: C:).*/m)? titleTune.match(/(?<=^C: C:).*/m)[0].trim() : '';
        abcZ = titleTune.match(/(?<=^Z:).*/m)? titleTune.match(/(?<=^Z:).*/m)[0].trim() : '';
        abcN = titleTune.match(/(?<=^N:).*/m)? titleTune.match(/(?<=^N:).*/gm) : [];
        abcM = titleTune.match(/(?<=^M:).*/m)? titleTune.match(/(?<=^M:).*/m)[0].trim() : '';
        abcL = titleTune.match(/(?<=^L:).*/m)? titleTune.match(/(?<=^L:).*/m)[0].trim() : '';
        abcQ = titleTune.match(/(?<=^Q:).*/m)? titleTune.match(/(?<=^Q:).*/m)[0].trim() : '';
        abcK = titleTune.match(/(?<=^K:).*/m)? titleTune.match(/(?<=^K:).*/m)[0].trim() : '';
    }

    // Strict mode: Invalidate tunes with missing K: field
    
    if (!abcK && isStrictDetectMode) {

        console.warn(`ABC Encoder:\n\nInvalid ABC detected and skipped with strict detect mode on:\n\n${abcContent}${abcMatch? '\n\nParent ABC:\n\n' + abcMatch : ''}`);
        return '';
    }

    // Retrieve custom ABC field data if abcMatch is provided
    
    if (abcMatch) {
        
        if (!isMedley) {
            
            if (!abcR) {
                
                abcR = abcMatch.match(/(?<=^R:).*/m)? abcMatch.match(/(?<=^R:).*/m)[0].trim() : 
                abcMatch.match(/^T:.*:/) && abcBasicTuneTypes.includes(abcMatch.match(/(?<=^T:).*:/)[0].trim().toLowerCase)? abcMatch.match(/(?<=^T:).*:/)[0].trim() :
                'Various';
                abcTuneType = makeStringProperCase(abcR);
                abcTitlePrefix = abcBasicTuneTypes.includes(abcR.toLowerCase())? abcR.toUpperCase() : "VARIOUS";
            }
            
            if (!abcQ) {
                
                abcQ = abcMatch.match(/(?<=^Q:).*/m)? abcMatch.match(/(?<=^Q:).*/m)[0].trim() : '';
            }
        }
        
        abcC = abcMatch.match(/(?<=^C:).*/m)? abcMatch.match(/(?<=^C:).*/m)[0].trim() : '';
        abcS = abcMatch.match(/(?<=^S:).*/m)? abcMatch.match(/(?<=^S:).*/gm) : [];
        abcCSL = abcMatch.match(/(?<=^C: Set Leaders:).*/m)? abcMatch.match(/(?<=^C: Set Leaders:).*/m)[0].trim() : '';
        abcCCS = abcMatch.match(/(?<=^C: C:).*/m)? abcMatch.match(/(?<=^C: C:).*/m)[0].trim() : '';
        abcZ = abcMatch.match(/(?<=^Z:).*/m)? abcMatch.match(/(?<=^Z:).*/m)[0].trim() : '';
        abcN = abcMatch.match(/(?<=^N:).*/m)? abcMatch.match(/(?<=^N:).*/gm) : [];
        abcM = abcM === '' && abcMatch.match(/(?<=^M:).*/m)? abcMatch.match(/(?<=^M:).*/m)[0].trim() : abcM;
        abcL = abcL === '' && abcMatch.match(/(?<=^L:).*/m)? abcMatch.match(/(?<=^L:).*/m)[0].trim() : abcL;
        
        // Convert N.S.S.S. T: Set Subtitle to T: Tune Title + T: Subtitle
        
        if (setToTunes) {
            
            if (abcTitle.includes('[') && abcTitlePrefix !== "VARIOUS") {
                
                abcTitle = abcTitle.replace(/(?:[\s]*\[.*\])/, '');
            }
            
            if (abcTitle.includes('/') && abcTitle.match(/(?:[\s]*[^0-9]\/[\s]*)/)) {
                
                abcTitle = abcTitle.replace(/(?:[\s]*[^0-9]\/[\s]*)/, `\nT: `);
            }

            abcC = processAbcC(abcC, abcIndex);

            abcZ = processAbcZ(abcZ, abcIndex);

            if (isCustomFieldSetEnforced) abcCCS = processAbcCCS(abcCCS, abcC, abcS, abcIndex);
        }
    }

    // Update primary ABC title to match TYPE: Title format
    
    abcTitle = processAbcTitle(abcTitle, abcTitlePrefix, abcTitleSuffix);

    // Find stray ABC subtitles that do not observe the ABC Standard order

    const unorderedSubTitle = new RegExp(/(?<=^T:.*[\s]*)(?:^[A-SU-Z]:.*[\s]*)+(?:^T:.+)[\s]*(?:^[A-Z]:.*[\s]*)*(?=^K:)/, "gm");
    
    const unorderedSubTitleMatch = titleTune? titleTune.match(unorderedSubTitle) : abcContent.match(unorderedSubTitle);

    let abcSubTitle = unorderedSubTitleMatch? processUnorderedSubTitle(unorderedSubTitleMatch[0]) : '';

    // Remove all ABC header text and reconstruct ABC fields in the correct order
    
    let abcBody = updatedAbc.replace(/^(?:[A-Z]:.*(?:\r?\n|$))*/, '');

    // N.S.S.S.-style field groups
    
    let abcHeaders = '';
    let abcNotes = '';

    // Additional ABC Standard fields

    let abcComposers = '';
    let abcEditors = '';
    let abcSources = '';
    let abcExtras = '';
    
    // Update ABC Meter field if missing, derive M: from Tune Type
    
    if (!abcM) {
        
        switch (abcTuneType.toLowerCase()) {
            
            case "an dro":
            case "barndance":
            case "fling":
            case "highland":
            case "hornpipe":
            case "march":
            case "reel":
            case "schottis":
            case "schottische":
            case "strathspey":
                abcM = "4/4";
                break;

            case "hop jig":
            case "mazurka":
            case "polska":
            case "waltz":
                abcM = "3/4";
                break;

            case "jig":
                abcM = "6/8";
                break;

            case "polka":
            case "single reel":
                abcM = "2/4";
                break;

            case "slide":
            case "single jig":
                abcM = "12/8";
                break;
                    
            case "slip jig":
                abcM = "9/8";
                break;

            case "3/2 hornpipe":
            case "three-two":
                abcM = "3/2";
                break;
        
            default:
                abcM = "4/4";
                console.warn(`ABC Encoder:\n\nMissing M: field has been added to ${abcContentTitle}, action may be required`);
                break;
        }
        
        // console.log(`ABC Encoder:\n\nM: field updated in ${abcContentTitle}`);
    }

    // Update ABC Note Length field if missing, infer L: value from Tune Type

    if (!abcL) {

        const doubleLengthTypes = ["3/2 hornpipe", "three-two", "three two", "3/2"];

        if (doubleLengthTypes.includes(abcTuneType.toLowerCase())) {

            abcL = "1/4"

        } else {

            abcL = "1/8";
        }

        // console.warn(`ABC Encoder:\n\nMissing L: field added to ${abcContentTitle}, action may be required`);
    }

    // Add ABC Tempo field if missing, derive Q: value from Tune Type

    if (!abcQ) {

        switch (abcTuneType.toLowerCase()) {

            case "air":
                abcQ = abcM === "3/4"? "1/4=100" : "1/2=40";
                break;
                
            case "barndance":
            case "highland":
            case "schottis":
            case "schottische":
                abcQ = "1/2=86";
                break;

            case "fling":
            case "hornpipe":
            case "march":
            case "strathspey":
                abcQ = "1/2=82";
                break;

            case "hop jig":
                abcQ = "1/4=146";
                break;

            case "jig":
            case "single jig":
                abcQ = "3/8=116";
                break;

            case "mazurka":
                abcQ = "1/4=136";
                break;

            case "polka":
            case "single reel":
                abcQ = "1/4=140";
                break;
            
            case "polska":
                abcQ = "1/4=115";
                break;

            case "reel":
            case "an dro":
                abcQ = "1/2=100";
                break;

            case "slide":
                abcQ = "3/8=130";
                break;
                    
            case "slip jig":
                abcQ = "3/8=114";
                break;

            case "3/2 hornpipe":
            case "three-two":
                abcQ = "1/2=146";
                break;

            case "waltz":
                abcQ = "1/4=144";
                break;
        
            default:
                abcQ = abcL === "1/4"? "1/2=146" : "1/2=111";
                // console.warn(`ABC Encoder:\n\nMissing Q: field added to ${abcContentTitle}, action may be required`);
                break;
        }
    }

    // Combine the array of N: fields into a single string

    if (abcN.length > 0) {

        abcN.forEach(abcNote => abcNotes += `N: ${abcNote.trim()}\n`);

    } else {

        abcNotes = isCustomFieldSetEnforced? `N: \n` : '';
    }

    // Add ABC Transcription field if missing, fill in the default value

    if (!abcZ && isCustomFieldSetEnforced) {

        abcZ = "[Unedited]; The Session";
        // console.log(`ABC Encoder:\n\nMissing Z: field added to ${abcContentTitle}`);
    }

    // Standard C: and S: fields are used >>>

    if (!isCustomFieldSetEnforced) {

        // Fill in Editors string if ABC Transcription field has data

        if (abcZ && abcZ !== "[Unedited]; The Session") abcEditors = `Z: ${abcZ.trim()}\n`;

        // Fill in Sources string if data found in ABC Source field(s)

        if (abcS.length > 0) {

            // Account for links to tune settings contained in sets from The Session

            if (setToTunes && abcIndex !== undefined && abcS[abcIndex] && abcS[abcIndex].trim().startsWith('https://thesession.org/tunes/')) {

                abcSources = `S: ${abcS[abcIndex].trim()}\n`;

            // Combine the array of S: fields into a single string

            } else {
   
                abcS.forEach(abcSource => abcSources += `S: ${abcSource.trim()}\n`);
            }
        }

        // Fill in Composers string if ABC Composer field has data

        if (abcC) {

            abcComposers = `C: ${abcC}\n`;
        }

        // Fill in miscellaneous other ABC Standard fields

        const extraFieldsMatch = titleTune? titleTune.match(/^[ABD-IOPU-Wm]:.*/gm) : abcContent.match(/^[ABD-IOPU-Wm]:.*/gm);

        if (extraFieldsMatch) {

            abcExtras = massProcessAbcHeaderFields(extraFieldsMatch);
        }
    }

    // N.S.S.S. Tunebook-specific C: C: S: field is used >>>

    // Add C: C: S: Composer and Source field if missing

    if (isCustomFieldSetEnforced && !abcCCS) {

        // Attempt to fill in C: C: S: data using C: and S: fields

        if (abcC && abcS && abcS[0] && !abcS[0].trim().startsWith('http')) {

            abcCCS = `${abcC}; S: ${abcS[0]}`;

        // Attempt to fill in C: C: S: data using C: field value

        } else if (abcC) {

            abcCCS = `${abcC}; S: Various`;

        // Fill in default C: C: S: values

        } else {

            abcCCS = "Trad?; S: Various"
        }
        // console.log(`ABC Encoder:\n\nMissing C: / S: field added to ${abcContentTitle}`);
    }

    // Combine all ABC fields after Title(s) into an ordered headers string

    if (isCustomFieldSetEnforced) {

        // Use custom N.S.S.S. headers
    
        abcHeaders = `C: C: ${abcCCS}\nC: Set Leaders: ${abcCSL}\nZ: ${abcZ}\n${abcNotes}R: ${abcTuneType}\nM: ${abcM}\nL: ${abcL}\nQ: ${abcQ}\nK: ${abcK}`;

    } else {

        // Use standard ABC headers used

        abcHeaders = `${abcComposers}${abcSources}${abcEditors}${abcNotes}${abcExtras}R: ${abcTuneType}\nM: ${abcM}\nL: ${abcL}\nQ: ${abcQ}\nK: ${abcK}`;
    }

    // Format ABC body Titles, process ABC body fields

    abcBody = formatAbcBodyTitles(abcBody);
    abcBody = formatAbcBodyFields(abcBody);

    // Merge ABC Subtitle into Primary Title

    if (abcSubTitle) {
        
        abcTitle = mergeAbcSubTitle(abcTitle, abcSubTitle);
    }

    // Return ABC with updated Title, Headers and Body

    return `${abcTitle}\n${abcHeaders}\n${abcBody}`;
}

////////////////////////////////
// SORT UTILITY FUNCTIONS
///////////////////////////////

// Check if all the values collected in an array are the same before sorting

const areAllArrValsTheSame = arr => arr.every(value => value === arr[0]);

// Produce a slash-separated list of values from an array
// Return single value if all array values are the same

function reduceArrToSlashSeparatedList(arr) {

    return areAllArrValsTheSame(arr)? arr[0] :
                
        arr.reduce((startStr, currentStr, i) => {

            const strSeparator = i === arr.length - 1 ? '' : ' / ';
        
            return `${startStr}${currentStr}${strSeparator}`;
            
        }, '');
}

// Check if ABC contains several fields and all these fields are duplicates
// Remove all instances of duplicate fields except for the first one

function replaceDuplicateAbcFields(abcContent, fieldName) {

    const matchPattern = new RegExp(`^${fieldName}:.*[\\s]*`, "gm");

    const fieldMatchArr = abcContent.match(matchPattern);

    if (!fieldMatchArr) return;

    const filteredFieldMatchArr = fieldMatchArr.map(line => line.trim());
    
    if (filteredFieldMatchArr && 
        filteredFieldMatchArr.length > 1 && 
        areAllArrValsTheSame(filteredFieldMatchArr)) {

        return abcContent.replaceAll(matchPattern, (match, offset) => 
            offset === abcContent.indexOf(match)? match : '');
    }
}

////////////////////////////////
// ENCODE ABC FUNCTIONS
///////////////////////////////

// Pass ABC contents to Sort and Encode functions, return a JSON array of objects

async function getEncodedAbc(abcContent, fileName) {

    let sortedAbcContent = [];

    if (localStorageOk() && +localStorage.abcEncodeSortsTuneBook === 1) {

        sortedAbcContent = await saveAbcEncoderOutput(abcContent, fileName, "abc-sort");

    } else {

        sortedAbcContent = [abcContent];
    }

    if (sortedAbcContent[0]?.length > 0) {

        console.log("ABC Encoder:\n\nEncoding ABC file contents...\n\n" + `[Source: ${fileName}]`);

        displayNotification("Encoding ABC file contents...");

        const encodedAbcJson = JSON.stringify(encodeTunesForAbcTools(sortedAbcContent[0]), null, 2);

        let encodedAbcTunesJson = '';

        if (localStorageOk() && +localStorage.abcSortExportsTunesFromSets === 1 && sortedAbcContent[1]?.length > 0) {

            encodedAbcTunesJson = JSON.stringify(encodeTunesForAbcTools(sortedAbcContent[1]), null, 2);
        }

        return [encodedAbcJson, encodedAbcTunesJson];
    }
}

// Encode ABC contents into ABC Tools-readable URL using lz-string, extract
// Tune Name, Tune Type and Set Leaders, return data in an array of objects

function encodeTunesForAbcTools(abcContent) {

    try {

        const rawAbcArr = abcContent.split('X:').filter(abc => abc !== '');

        const encodedAbcArr = [];

        // Extract Tune Name, Tune Type and Set Leaders custom keys, push to JSON object

        for (let i = 0; i < rawAbcArr.length; i++) {

            const splitTuneArr = rawAbcArr[i].split('\n');

            encodedAbcArr[i] = {};

            splitTuneArr.forEach(tuneLine => {
                
                if (tuneLine.startsWith('T:') && !encodedAbcArr[i].name) {

                    encodedAbcArr[i].name = tuneLine.split('T:')[1].trim();
                }

                if (tuneLine.startsWith('R:') && !encodedAbcArr[i].type) {

                    const tuneTypeArr = tuneLine.split('R:')[1].trim().split(/[\s,-]/);
                    let tuneType = '';

                    tuneType = tuneTypeArr.filter(word => word !== '').map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');

                    encodedAbcArr[i].type = tuneType;
                }

                if (tuneLine.startsWith('C: Set Leaders:') && !encodedAbcArr[i].leaders) {

                    encodedAbcArr[i].leaders = tuneLine.split('C: Set Leaders:')[1].trim();
                }
            });

            // If tune name includes TYPE: prefix that does not match Tune Type, replace it with Custom Type

            if (encodedAbcArr[i].name.match(/^.*:/)) {

                const customTuneTypeProperCase = makeStringProperCase(encodedAbcArr[i].name.split(':')[0]);

                if (encodedAbcArr[i].type !== customTuneTypeProperCase) {

                    encodedAbcArr[i].type = customTuneTypeProperCase;
                }
            }

            // Generate URL to Michael Eskin's ABC Tools with default parameters

            const encodedAbcString = LZString.compressToEncodedURIComponent(`X:${rawAbcArr[i].replaceAll(/(\r?\n\n|\r?\n\r\n)/g, '')}`);

            encodedAbcArr[i].url = `https://michaeleskin.com/abctools/abctools.html?lzw=${encodedAbcString}&format=noten&ssp=10&name=${encodedAbcArr[i].name.replaceAll(' ', '_')}`;
        }

        console.log("ABC Encoder:\n\nABC file contents encoded!");

        return encodedAbcArr;

    } catch (error) {

        console.warn("ABC Encoder:\n\nFailed to encode ABC!\n\n", { cause: error });

        displayNotification("Failed to encode ABC", "error");
    }
}

////////////////////////////////
// DECODE ABC FUNCTIONS
///////////////////////////////

// Decode ABC contents encoded via lz-string and return a string of ABCs

function getDecodedAbc(abcContent) { 

    const encodedAbcJson = JSON.parse(abcContent);
    const decodedAbcArr = [];
    let decodedAbcOutput = "";

    console.log("ABC Encoder:\n\nDecoding ABC file contents...");

    displayNotification("Decoding file contents...");

    encodedAbcJson.forEach(abcObject => {

        let encodedAbcString = '';

        if (Object.hasOwn(abcObject, "url")) {

            encodedAbcString = abcObject.url?.match(/lzw=(?:[^&]*)/)[0];

        } else if (Object.hasOwn(abcObject, "URL")) {

            encodedAbcString = abcObject.URL?.match(/lzw=(?:[^&]*)/)[0];
        }

        if (encodedAbcString) {

            let decodedAbcString = LZString.decompressFromEncodedURIComponent(encodedAbcString.split('lzw=')[1]);

            if (encodedAbcJson.indexOf(abcObject) !== encodedAbcJson.length - 1) {

                decodedAbcArr.push(`${decodedAbcString}\n\n`);
            
            } else {

                decodedAbcArr.push(decodedAbcString);
            }

        }
    });

    decodedAbcOutput = decodedAbcArr.join('');

    console.log("ABC Encoder:\n\nABC file contents decoded!");

    if (decodedAbcOutput.startsWith("X:")) {

        return decodedAbcOutput;
        
    } else {

        console.warn("ABC Encoder:\n\nNo valid ABC data found after decoding");
        displayNotification("No valid ABC data found", "warning");
        return;
    }
}

////////////////////////////////
// CONVERT TUNEBOOK FUNCTIONS
///////////////////////////////

// Convert sets into separate tunes by adding missing ABC fields

function makeTunesFromSets(abcSetsArr) {

    console.log(`ABC Encoder:\n\nConverting ABC Sets data into Tunes...`);

    const isStrictDetectMode = localStorageOk() && !!+localStorage.abcSortUsesStrictTuneDetection;

    const abcTuneGroupsArr = abcSetsArr.map(abcSet => {

        if (abcSet.match(/MEDLEY/gi)) {

            abcSet = abcSet.replace(/T:/g, 'T:[MEDLEY]');
        }

        return abcSet.match(isStrictDetectMode? matchIndividualTunesStrict : matchIndividualTunesLax);

    }).filter(Boolean);

    const abcTunesArr = abcTuneGroupsArr.map(abcSetArr =>

        abcSetArr.map(tuneSet => {

            const abcIndex = abcSetArr.indexOf(tuneSet);

            const isMedley = tuneSet.includes('[MEDLEY]');

            if (isMedley) {

                tuneSet = tuneSet.replaceAll(/\[MEDLEY\]/g, '');
            }

            return addCustomAbcFields(tuneSet, abcSetArr[0], true, abcIndex, isMedley);

        }).filter(Boolean)
    );

    const uniqueTunesMap = new Map(abcTunesArr.flat(Infinity).map(abc => ([abc.match(/^T:.*/)[0], abc])));

    const uniqueTunesArr = Array.from(uniqueTunesMap.values());

    return uniqueTunesArr;
}

////////////////////////////////
// EXPORT TUNELIST FUNCTIONS
///////////////////////////////

// Export tab-separated list of Session DB Tunes / Tune Types / Links

function exportPlainTuneList(abcContent) {

    let tuneListStr = '';

    const abcArr = JSON.parse(abcContent);

    abcArr.forEach(abcObj => {

        let abcTitle = abcObj.name;

        if (abcTitle.match(/^.*:/)) {
            
            abcTitle = abcTitle.split(':')[1].trim();
        }

        tuneListStr += `${abcObj.type? abcObj.type : '?'}\t${abcTitle? abcTitle : 'Gan Ainm'}\t${abcObj.url? abcObj.url : ''}\t${abcObj.leaders? abcObj.leaders.split(/,[\s]*/g).join(`\t`) : '—'}\n`;
    });

    return tuneListStr;
}

////////////////////////////////
// SESSION SURVEY FUNCTIONS
///////////////////////////////

// Process raw Session Survey Data
// Push an array of headers to sessionSurveyData array
// Push a nested array of responses to sessionSurveyData array

function fillSurveyDataArray(surveyData) {

    // Empty the existing Survey Data array
    sessionSurveyData.length = 0;

    const surveyDataLines = surveyData.split('\n');

    const surveyDataHeaders = 
        surveyDataLines[0].split('\t')
        .map(header => header.replace(/.*\[(.*)]$/, `$1`))
        .slice(1);

    const surveyDataResponses = [];

    for (let i = 1; i < surveyDataLines.length; i++) {

        surveyDataResponses.push(surveyDataLines[i].split('\t').slice(1));
    }

    // Update Session Survey Data array
    sessionSurveyData.push(surveyDataHeaders);
    sessionSurveyData.push(surveyDataResponses);

    console.log("ABC Encoder:\n\nSession Survey Data added to Encoder");
    displayNotification("Session Survey Data added to Encoder", "success");
}

// Modify abcContent with Session Survey Data:
// Find Survey Data header matching ABC title
// Add or remove Leaders in C: Set Leaders: field
// Return an updated abcContent string

function applySessionSurveyResults(abcContent) {

    const splitAbcArr = abcContent.split('X: ');
    let updatedAbcContent = '';

    console.log("ABC Encoder:\n\nUpdating ABC output with Session Survey Data...");

    splitAbcArr.forEach(abc => {

        if (!abc) return;

        const abcTitle = abc.match(/(?<=^T:).*/m)[0].trim();
        const abcTitleArr = abcTitle.split(': ');
        const titlePrefix = abcTitleArr[0];
        const titleName = abcTitleArr[1];
        let updatedAbc = '';

        // Create an array of current Set Leaders
        const abcSetLeadersArr = abc.match(/(?<=^C: Set Leaders:).*/m)[0].trim().split(', ');

        // Search Survey Data headers for the current Tune / Set
        const surveyHeader = sessionSurveyData[0].find(header => 
                             header.toLowerCase().startsWith(titlePrefix.toLowerCase()) &&
                             header.endsWith(titleName));
        
        if (surveyHeader) {

            const headerIndex = sessionSurveyData[0].indexOf(surveyHeader);

            // Update the array of Set Leaders
            sessionSurveyData[1].forEach(response => {

                const leaderName = response[0];
                const responseData = response[headerIndex];

                if (!abcSetLeadersArr.includes(leaderName) && 
                    responseData === 'Yes') {

                    console.log(`${leaderName} wants to be added to ${abcTitle}`);
                    abcSetLeadersArr.push(leaderName);
                }

                if (abcSetLeadersArr.includes(leaderName) &&
                   (!responseData || responseData === 'No')) {

                    console.warn(`${leaderName} wants to be removed from ${abcTitle}`);
                    const leaderIndex = abcSetLeadersArr.indexOf(leaderName);
                    abcSetLeadersArr.splice(leaderIndex, 1);
                }
            });
            // Update current ABC with new Set Leaders data
            updatedAbc = abc.replace(/(?<=^C: Set Leaders:).*/m, ` ${abcSetLeadersArr.join(', ')}`);
        }
        // Add updated or unmodified ABC to output string
        updatedAbcContent += `X: ${updatedAbc || abc}`;
    });

    return updatedAbcContent;
}

////////////////////////////////
// INITIALIZE ENCODER SETTINGS
///////////////////////////////

// Initialize default ABC Encoder settings on first page load

export function initEncoderSettings() {

    initSettingsFromObject(abcEncoderDefaults);
}