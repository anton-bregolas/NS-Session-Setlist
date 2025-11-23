///////////////////////////////////////////////////////////////////////
// Novi Sad Session ABC Encoder Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2024-2025
///////////////////////////////////////////////////////////////////////

import { apStyleTitleCase } from './scripts-3p/ap-style-title-case/ap-style-title-case.js';
import { LZString } from './scripts-3p/lz-string/lz-string.min.js';
import { pThrottle } from './scripts-3p/p-throttle/p-throttle.js'
import { makeAbcChordBook } from './scripts-chord-viewer.js'
import { localStorageOk, fetchData, initSettingsFromObject, initAppCheckBoxes, displayWarningEffect, displayNotification } from './scripts-nss-app.js';

////////////////////////////////
// ABC ENCODER GLOBAL SETTINGS
///////////////////////////////

// Define Encoder elements with custom scripted behavior

const encoderSettings = document.querySelector('[aria-label="Encoder Settings Menu"]');
const inputSortAbcTag = document.querySelector('#nss-input-sort-by');

// Default ABC Encoder Settings
// Set via initEncoderSettings on first load

export const abcEncoderDefaults = {

    abcEncodeSortsTuneBook: "0",
    abcEncodeExportsTuneList: "0",
    abcEncodeOutputsAbcToolsString: "0",
    abcSortEnforcesCustomAbcFields: "1",
    abcSortExportsTunesFromSets: "1",
    abcSortExportsChordsFromTunes: "1",
    abcSortUsesStrictTuneDetection: "0",
    abcSortFetchesTsoMetaData: "0",
    abcSortFormatsSetTitleFirstName: "1", // Disables abcSortFormatsSetTitleSlashNames
    abcSortFormatsSetTitleSlashNames: "0",  // Disables abcSortFormatsSetTitleFirstName
    abcSortFormatsTitlesTypePrefix: "1", // Disables abcSortFormatsTitlesTypeSuffix abcSortFormatsTitlesMovesTheAnA; Force-enables abcSortFormatsTitlesNoTheAnAEnd
    abcSortFormatsTitlesTypeSuffix: "0", // Disables abcSortFormatsTitlesTypePrefix
    abcSortReSortsByAbcTag: "0",            // Disables abcSortReSortsByAbcTSansPrefix abcSortRespectsOriginalOrder
    abcSortReSortsByAbcTSansPrefix: "0",   // Disables abcSortReSortsByAbcTag abcSortRespectsOriginalOrder
    abcSortRespectsOriginalOrder: "0",  // Disables abcSortReSortsByAbcTag abcSortReSortsByAbcTSansPrefix
    abcSortFormatsTitlesInIrish: "1",
    abcSortFormatsTitlesMovesTheAnA: "0", // Disables abcSortFormatsTitlesTypePrefix abcSortFormatsTitlesNoTheAnAEnd; Force-enables abcSortFormatsTitlesNoTheAnAStart abcSortFormatsTitlesNoIrishAnAStart
    abcSortFormatsTitlesTitleCase: "1",
    abcSortFormatsTitlesNoCaps: "0",
    abcSortNormalizesAbcPartEndings: "1",
    abcSortRemovesDuplicatesByContent: "0", // Disables abcSortRemovesDuplicatesByTitle
    abcSortRemovesDuplicatesByTitle: "1",   // Disables abcSortRemovesDuplicatesByContent
    abcSortFormatsTitlesNoTheAnAStart: "1",
    abcSortFormatsTitlesNoIrishAnAStart: "1",
    abcSortFormatsTitlesNoTheAnAEnd: "1", // Disables abcSortFormatsTitlesMovesTheAnA
    abcSortSkipsDeepEditForOrderedAbc: "1",
    abcSortSkipsTitleEditForOrderedAbc: "1", // Linked with abcSortSkipsTitleEditForOrderedAbc
    abcSortSkipsMergingDuplicateFields: "0",
    abcSortSkipsUpdatingTsoMetaData: "1",
    abcSortRemovesLineBreaksInAbc: "1",
    abcSortRemovesTextAfterLineBreaksInAbc: "0"
};

// Define custom regular expressions that affect Encoder behavior

// Lax detection mode: Tune headers are allowed to contain just T: for the purposes of splitting Sets into Tunes
// Sets or Tunes missing a K: field will have a blank ABC Key field added to them by Sort (only for first tune)
const matchTuneHeadersLax = new RegExp(/^T:.*[\s]*(?:^(?:[A-JL-Zmr]:|%).*[\s]*)*(?:^K:[ ]*.*[\s]*)?(?=^[\S]+|$)/, "gm");
const matchIndividualTunesLax = new RegExp (/^T:.*[\s]*(?:^(?:[A-Zmr]:|%).*[\s]*)*(?:(?!^T:).*[\s]*)+/, "gm");

// Strict detection mode: Every tune header must contain K: field for the purposes of splitting Sets into Tunes
// Sets or Tunes missing a K: field will be filtered out by Sort with invalid ABC printed to the console
const matchTuneHeadersStrict = new RegExp(/^T:.*[\s]*(?:^(?:[A-Zmr]:|%).*[\s]*)*^K:[ ]*.+[\s]*(?=^[\S]+|$)/, "gm");
const matchIndividualTunesStrict = new RegExp (/^T:.*[\s]*(?:^(?:[A-JL-Zmr]:|%).*[\s]*)*(?:^K:[ ]*.+[\s]*)*(?:(?!^T:).*[\s]*)+/, "gm");

// Quick edit mode for ordered ABCs: abcSortSkipsDeepEditForOrderedAbc
//
const matchOrderedCustomAbc = /^C: C:.*[\s]*C: Set Leaders:.*[\s]*(?:N:.*[\s]*)*(?:S:.*[\s]*)*Z:.*at The Session.*[\s]*(?:N:.*[\s]*)*R:.*[\s]*M:.*[\s]*L:.*[\s]*Q:.*[\s]*(?:%.*[\s]*)*K:.*[\s]*/;
const matchOrderedStandardAbc = /^(?:C:(?! C:| Set Leaders:).*[\s]*)*(?:C: Set Leaders:.*[\s]*)*(?:S:.*[\s]*)*(?:Z:.*[\s]*)*(?:N:.*[\s]*)*(?:[ABD-IOPU-W]:.*[\s]*)*R:.*[\s]*M:.*[\s]*L:.*[\s]*(?:Q:.*[\s]*)*(?:%.*[\s]*)*K:.*[\s]*/;
const matchOrderedStandardAbcPlusTsoMeta = /^(?:C:(?! C:| Set Leaders:).*[\s]*)*(?:C: Set Leaders:.*[\s]*)*(?:S:.*[\s]*)*Z:.*at The Session.*[\s]*(?:N:.*[\s]*)*(?:[ABD-IOPU-W]:.*[\s]*)*R:.*[\s]*M:.*[\s]*L:.*[\s]*(?:Q:.*[\s]*)*(?:%.*[\s]*)*K:.*[\s]*/;
const matchOrderedMergedSecondaryHeader = /^(?:[IPUV]:.*[\s]*)*(?:R:.*[\s]*)*(?:M:.*[\s]*)*(?:L:.*[\s]*)*(?:Q:.*[\s]*)*(?:%.*[\s]*)*K:.*[\s]*/;

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
    "hop-jig",
    "hop jig",
    "jig",
    "march",
    "mazurka",
    "polka",
    "reel",
    "single-jig",
    "single jig",
    "slide",
    "slip-jig",
    "slip jig",
    "strathspey",
    "waltz"
];

// List of overrides for ABC string formatting
// Other strings will be formatted by default

const irishTitleCaseExceptions = [

    { string: "mb", override: "mB" },
    { string: "gc", override: "gC" },
    { string: "dn", override: "dN" },
    { string: "bhf", override: "bhF" },
    { string: "ng", override: "nG" },
    { string: "pb", override: "bP" },
    { string: "dt", override: "dT" },
    { string: "ts", override: "tS" },
    { string: "t-a", override: "t-A" },
    { string: "t-á", override: "t-Á" },
    { string: "t-e", override: "t-E" },
    { string: "t-é", override: "t-É" },
    { string: "t-i", override: "t-I" },
    { string: "t-í", override: "t-Í" },
    { string: "t-o", override: "t-O" },
    { string: "t-ó", override: "t-Ó" },
    { string: "t-u", override: "t-U" },
    { string: "t-ú", override: "t-Ú" }
];

const irishLenitedLettersMap = [

    { string: "bh", override: "B" },
    { string: "ch", override: "C" },
    { string: "dh", override: "D" },
    { string: "fh", override: "F" },
    { string: "gh", override: "G" },
    { string: "mh", override: "M" },
    { string: "ph", override: "P" },
    { string: "sh", override: "S" },
    { string: "th", override: "T" }
]

const makeTitleCaseExceptions = [

    { string: "st. patrick's an dro", override: "St. Patrick's An Dro" },
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
// Pass the resulting abc/text or JSON output to downloadAbcEncoderFile

async function saveAbcEncoderOutput(rawAbcContent, fileName, taskType) {

    // Verify that localStorage is available
    const customSettingsOn = localStorageOk();

    let abcEncoderOutput = '';
    let abcEncoderTunesOutput = '';

    // Process input data depending on task type and Encoder settings
    // Generate additional file formats before returning main output

    if (taskType === "abc-encode") {

        // Encode each Set or Tune from input ABC with lz-string, extract metadata, make abc-encoded JSON

        const abcEncodedOutput = await getEncodedAbc(rawAbcContent, fileName);

        abcEncoderOutput = abcEncodedOutput[0];
        abcEncoderTunesOutput = abcEncodedOutput[1];

        const isForAbcToolsWebsite = +localStorage.abcEncodeOutputsAbcToolsString;

        // Optional: Save plain text Tunelist generated from source ABC

        if (customSettingsOn && +localStorage.abcEncodeExportsTuneList) {

            downloadAbcEncoderFile(exportPlainTuneList(abcEncoderOutput), "Tunelist[SourceABC].txt");
        }

        // Optional: Save additional JSON array of objects containing all individual Setlist Tunes encoded

        if (customSettingsOn && +localStorage.abcSortExportsTunesFromSets && abcEncoderTunesOutput !== '') {

            downloadAbcEncoderFile(abcEncoderTunesOutput, isForAbcToolsWebsite? "ABC-ENCODED-TUNES.txt" : "tunes.json");

            // Optional: Save plain text Tunelist of all individual Setlist Tunes from source ABC

            if (+localStorage.abcEncodeExportsTuneList) {

                downloadAbcEncoderFile(exportPlainTuneList(abcEncoderTunesOutput), "Tunelist[TunesABC].txt");
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

        if (customSettingsOn && +localStorage.abcSortFetchesTsoMetaData) {

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

        // Optional: Save additional ABC file containing all individual Setlist Tunes

        if (customSettingsOn && +localStorage.abcSortExportsTunesFromSets && abcEncoderTunesOutput !== '') {

            const isCustomFieldSetEnforced = !!+localStorage.abcSortEnforcesCustomAbcFields;

            const fileExt = fileName.includes('.')? fileName.slice(fileName.lastIndexOf('.') + 1) : 'txt';
            
            downloadAbcEncoderFile(abcEncoderTunesOutput, isCustomFieldSetEnforced? `NS-Session-Tunes.${fileExt}` : `${fileName.slice(0, fileName.lastIndexOf('.'))} [ABC-SORTED-TUNES].${fileExt}`);

            // Optional: Save additional Chordbook JSON containing extracted chords arranged as Tunelist

            if (+localStorage.abcSortExportsChordsFromTunes && abcSortedOutput[3] !== '') {

                downloadAbcEncoderFile(abcSortedOutput[3], "chords-tunes.json", "abc-extract-chords");
            }
        }

        // Optional: Save additional Chordbook JSON containing extracted chords arranged as Setlist

        if (customSettingsOn && +localStorage.abcSortExportsChordsFromTunes && abcSortedOutput[2] !== '') {

            downloadAbcEncoderFile(abcSortedOutput[2], abcSortedOutput[2].includes("setTitle")? "chords-sets.json" : "chords-tunes.json", "abc-extract-chords");
        }
    }

    // Save main ABC Encoder output file
    downloadAbcEncoderFile(abcEncoderOutput, fileName, taskType);

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

                let rawAbcContent = await readFileContent(rawAbcFile);

                console.log("ABC Encoder:\n\nABC file contents read");

                if (taskType === "abc-decode" && rawAbcContent.startsWith("const tunes=")) {

                    rawAbcContent = rawAbcContent.slice(12, -1);
                }

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

// Read and validate a file uploaded via Encoder Settings menu
// Parse Encoder Settings from .json file, pass to
// Parse Session Survey Data from .tsv file, pass to fillSurveyDataArray
  
export async function parseEncoderImportFile(triggerBtn) {

    try {

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json, .tsv';

        fileInput.onchange = async function() {

            const fileExt =
                this.files[0].name.split('.').pop().toLowerCase();

            if (fileExt !== 'json' && fileExt !== 'tsv') {

                console.warn("ABC Encoder:\n\n Settings import file rejected, unsupported file type");

                displayNotification("Unsupported file type: Import .json file to restore settings or .tsv file to add Session Survey data", "warning");
                displayWarningEffect(triggerBtn);

                return;
            }

            const rawImportFileData = this.files[0];

            try {

                const importFileContents = await readFileContent(rawImportFileData);

                console.log("ABC Encoder:\n\nSettings import file contents read");

                const isEncoderSettingsFile =
                    importFileContents.startsWith(`[\n  {\n    "abcEncodeSortsTuneBook":`);

                const isSessionSurveyFile = 
                    importFileContents.startsWith("Timestamp\tI am...\tI can start...");


                if (fileExt === 'json' && !isEncoderSettingsFile) {

                    console.warn("ABC Encoder:\n\nInvalid Encoder Settings file!");

                    displayNotification("Not a valid Encoder Settings file", "warning");
                    displayWarningEffect(triggerBtn);

                    return;
                }

                if (fileExt === 'tsv' && !isSessionSurveyFile) {

                    console.warn("ABC Encoder:\n\nInvalid Session Survey Data file!");

                    displayNotification("Not a valid session survey file", "warning");
                    displayWarningEffect(triggerBtn);

                    return;
                }

                // Process Encoder Settings JSON, restore user settings 

                if (isEncoderSettingsFile) {

                    restoreEncoderSettingsFromFile(importFileContents);
                    return;
                }

                // Process Survey Data and fill sessionSurveyData array

                if (isSessionSurveyFile) {

                    console.log("ABC Encoder:\n\nProcessing Session Survey Data...")

                    fillSurveyDataArray(importFileContents);
                    triggerBtn.dataset.state = "filled";
                    return;
                }

            } catch (error) {

                console.error("ABC Encoder:\n\nError reading imported data file:\n\n", error);

                displayNotification("Error reading imported data file", "error");
                displayWarningEffect(triggerBtn);
            }
        };
        
        fileInput.click();

    } catch (error) {

        console.error("ABC Encoder:\n\nParsing sequence failed!\n\n", error);

        displayNotification("Error parsing imported data file", "error");
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

export function downloadAbcEncoderFile(fileContent, fileName, taskType) {

    const isForAbcToolsWebsite = localStorageOk() && +localStorage.abcEncodeOutputsAbcToolsString;

    const fileExt =
        isForAbcToolsWebsite || !fileName.includes('.')? 'txt' : fileName.slice(fileName.lastIndexOf('.') + 1);

    const abcFile =
        new Blob(
            [fileContent],
            { type: !isForAbcToolsWebsite &&
                (taskType === "abc-encode" ||
                taskType === "abc-extract-chords" ||
                taskType === "export-settings")?
                "application/json" :
                "text/plain" }
        );

    const abcFileName = taskType === "abc-encode" && isForAbcToolsWebsite? "ABC-ENCODED.txt" :
                        taskType === "abc-encode" && fileName.startsWith("NS-Session-Sets") ? "sets.json" :
                        taskType === "abc-encode" && fileName.startsWith("NS-Session-Tunes") ? "tunes.json" :
                        taskType === "abc-encode" ? "ABC-ENCODED.json" :
                        taskType === "abc-decode" && fileName.startsWith("sets") ? `NS-Session-Sets.${fileExt}` :
                        taskType === "abc-decode" && fileName.startsWith("tunes") ? `NS-Session-Tunes.${fileExt}` :
                        taskType === "abc-decode" ? `ABC-DECODED.${fileExt}` :
                        taskType === "abc-sort" && !fileName.startsWith("NS-Session") && !fileName.startsWith("[ABC-SORTED]") ? `${fileName.slice(0, fileName.lastIndexOf('.'))} [ABC-SORTED].${fileExt}` :
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
                Object.keys(testJson[0]).join(', ') === "name, type, url" ||
                Object.keys(testJson[0]).join(', ') === "Name, URL") {

                return true;
            }

        } catch (error) {

            console.log(`ABC Encoder:\n\nDecoding task failed. Details:\n\n${error}`);

            return false;
        }
    }

    return false;
}

////////////////////////////////
// INPUT FILTERING FUNCTIONS
///////////////////////////////

function filterInputSortAbcTag() {

    const inputFilter = 
        inputSortAbcTag.value.
        toUpperCase().
        replace(/[^ABCDFGHIKLMNOPQRSTUVWZ]/g, '');

    inputSortAbcTag.value = inputFilter.slice(-1);

    if (localStorageOk()) {

        localStorage.abcSortReSortsByLastTagValue = inputSortAbcTag.value;
    } 
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

        // Do not process ABCs containing TSO metadata if skip setting is on

        if (localStorageOk() &&
            +localStorage.abcSortSkipsUpdatingTsoMetaData === 1 &&
            abcItem.includes('at The Session')) {

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

            if (abcItem.match(/^C: C:/m)) {

                let abcCCS = abcItem.match(/^C: C:.*/m)[0];
                let abcS = abcCCS.split(/; S:[ ]*/)[1];

                abcItem = abcS?
                    abcItem.replace(/^C: C:.*/m, `C: ${abcCString}; S: ${abcS}`) :
                    abcItem.replace(/^C: C:.*/m, `C: ${abcCString}`);

            } else if (abcItem.match(/^C:/m)) {

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

// ABC Encoder SORT main handler function >>>
// Send raw ABC contents to sortFilterAbc for processing
// Send sorted ABC to Chord Viewer's makeAbcChordBook
// Return a nested array with (* marks optional): 
// [Sorted source ABC (Sets or Tunes)],
// [Sorted Tunes ABC Extracted from Sets],*
// [Sorted Chordbook Extracted from Source ABC],*
// [Sorted Chordbook Extracted from Tunes ABC]*

function getSortedAbc(abcContent) { 

    // Verify that localStorage is available
    const customSettingsOn = localStorageOk();

    console.log("ABC Encoder:\n\nSorting ABC file contents...");

    displayNotification("Sorting ABC file contents...");

    const sortedAbcContentArr = sortFilterAbc(abcContent);

    if (sortedAbcContentArr[0]?.length > 0) {

        const sortedAbcOutput = sortedAbcContentArr[0].join('\n\n');

        let sortedAbcTunes = '';
        let sortedAbcChords = '';
        let sortedAbcTuneChords = '';

        console.log("ABC Encoder:\n\nABC file contents sorted!");

        if (customSettingsOn && +localStorage.abcSortExportsChordsFromTunes) {

            console.log(`ABC Encoder:\n\nExtracting Chords from ABC...`);

            displayNotification("Extracting Chords from ABC...");

            sortedAbcChords = makeAbcChordBook(sortedAbcOutput);
        }

        if (sortedAbcContentArr[1]?.length > 0) {

            sortedAbcTunes = sortedAbcContentArr[1].join('\n\n');

            if (customSettingsOn && +localStorage.abcSortExportsChordsFromTunes) {

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

// Take ABC content through several sorting stages:
// Stage 1: Pre-process ABC >>> Filter and deduplicate source ABC 
// Stage 2: Process ABC >>> Run ABC through addCustomAbcFields, sort and renumber
// Stage 3: Create Tunes ABC >>> Source ABC includes Sets? Split, process, sort and renumber Tunes ABC  
// Stage 4: Post-process ABC >>> Remove unwanted lines and line breaks before returning processed ABC & Tunes ABC

export function sortFilterAbc(abcContent) {

    // Verify that localStorage is available
    const customSettingsOn = localStorageOk();

    try {

        // Pre-process ABC split by X: headers >>>

        const splitAbcArr = abcContent.split(/^X.*/gm);

        // Filter out empty strings and items that do not start with T:

        const filteredAbcArr = splitAbcArr.map(abc => abc.trim()).filter(abc => abc.startsWith("T:"));

        // Deduplicate filtered ABC array if user settings allow it

        let preProcessedAbcArr = [...filteredAbcArr];

        // Remove all text separated by empty lines inside ABCs

        if (customSettingsOn && +localStorage.abcSortRemovesTextAfterLineBreaksInAbc) {

            preProcessedAbcArr = removeTextAfterLineBreaksInAbc(preProcessedAbcArr);
        }

        // Remove all empty lines inside ABCs, normalizing line breaks

        if (customSettingsOn && +localStorage.abcSortRemovesLineBreaksInAbc) {

            preProcessedAbcArr = removeLineBreaksInAbc(preProcessedAbcArr);
        }

        // Normalize format of part endings in ABC body to ||

        if (customSettingsOn && +localStorage.abcSortNormalizesAbcPartEndings) {
    
            preProcessedAbcArr = preProcessedAbcArr.map(abc => normalizePartEndings(abc));
        }

        // Remove duplicates using a Title Map
        // For collections with unique ABC titles
        // Allows easy integration of updated ABCs
        // Last copy found overwrites duplicates

        if (customSettingsOn && +localStorage.abcSortRemovesDuplicatesByTitle) {

            const uniqueAbcMap = new Map(preProcessedAbcArr.map(abc => ([abc.match(/^T:.*/)[0], abc])));

            preProcessedAbcArr = Array.from(uniqueAbcMap.values());
        }

        // Remove duplicates using a Set
        // For collections allowing identical titles
        // Removes completely identical items only (sans X:)
        // First copy found is used for the purposes of item order

        if (customSettingsOn && +localStorage.abcSortRemovesDuplicatesByContent) {

            const uniqueAbcSet = new Set(preProcessedAbcArr);

            preProcessedAbcArr = Array.from(uniqueAbcSet.values());
        }

        // Process filtered ABC content >>>

        // Send each item in the pre-processed ABC array to addCustomAbcFields

        const processedAbcArr = preProcessedAbcArr.map(abc => addCustomAbcFields(abc)).filter(Boolean);

        // Sort the ABC array either by the processed title or by a user-defined field

        const keepOriginalOrder = customSettingsOn && !!+localStorage.abcSortRespectsOriginalOrder;

        let sortedAbcArr = keepOriginalOrder? [...processedAbcArr] : [...processedAbcArr].sort();

        const isSortByAbcTagOn = customSettingsOn && !!+localStorage.abcSortReSortsByAbcTag;
        const isSmartTitleSortOn = customSettingsOn && !!+localStorage.abcSortReSortsByAbcTSansPrefix;

        // Smart title sorting style: Sort by ABC Title after removing PREFIX: and articles

        if (isSmartTitleSortOn) {

            sortedAbcArr = processedAbcArr.sort((a, b) => {

                const lineA = 
                    a.match(/^T:.*/m)[0].replace(/^T:\s*/, '').
                    replace(/^.*:\s*/, '').
                    replace(/^(?:[Tt][Hh][Ee][ ]|[Aa][Nn][ ]|[Aa][ ])\s*/, '');

                const lineB =
                    b.match(/^T:.*/m)[0].replace(/^T:\s*/, '').
                    replace(/^.*:\s*/, '').
                    replace(/^(?:[Tt][Hh][Ee][ ]|[Aa][Nn][ ]|[Aa][ ])\s*/, '');
                
                return lineA.localeCompare(lineB);
            });

        // Custom field sorting style: Sort by the value of a specific ABC field

        } else if (isSortByAbcTagOn) {

            let abcTagInput = inputSortAbcTag.value;

            if (!abcTagInput.match(/[RKMNSZABCDFGHILNOPQUVW]/)) abcTagInput = "R";

            const abcFieldMatch = new RegExp(`(?<=^${abcTagInput}:).*`, "m");

            sortedAbcArr = processedAbcArr.sort((a, b) => {

                const matchA = a.match(abcFieldMatch);
                const matchB = b.match(abcFieldMatch);

                if (matchA && matchB) {

                    return matchA[0].trim().localeCompare(matchB[0].trim());
                }

                return !matchA && !matchB? 0 : !matchA? 1 : -1;
            });
        }

        // Renumber the sorted ABC array

        const renumberedAbcArr = sortedAbcArr.map(abc => `X: ${sortedAbcArr.indexOf(abc) + 1}\n${abc}`);

        // Process an additional array of Tunes >>>

        // Send the Sets found in processed ABC to makeTunesFromSets,  

        let renumberedAbcTunesArr = [];

        if (customSettingsOn && +localStorage.abcSortExportsTunesFromSets) {
            
            const abcSetsFoundArr = [];
            const abcTunesFoundArr = [];

            const isStrictDetectMode = customSettingsOn && !!+localStorage.abcSortUsesStrictTuneDetection;

            processedAbcArr.forEach(abc => {

                const matchTuneHeaders = abc.match(isStrictDetectMode? matchTuneHeadersStrict : matchTuneHeadersLax);

                const isTuneSet = matchTuneHeaders && matchTuneHeaders.length > 1;

                if (isTuneSet) {

                    abcSetsFoundArr.push(abc);
                    return;
                }

                abcTunesFoundArr.push(abc);
            });

            if (abcSetsFoundArr.length > 0) {

                const exportedTunesArr = makeTunesFromSets(abcSetsFoundArr);

                let completeAbcTunesArr = [...exportedTunesArr, ...abcTunesFoundArr]; 

                // Remove duplicates using a Title Map

                if (customSettingsOn && +localStorage.abcSortRemovesDuplicatesByTitle) {

                    const uniqueAbcTunesMap = new Map(completeAbcTunesArr.map(abc => ([abc.match(/^T:.*/)[0], abc])));

                    completeAbcTunesArr = Array.from(uniqueAbcTunesMap.values());

                    // console.log(`ABC Encoder:\n\nDeduplication is ON, items with identical titles removed (last copy stays)`);
                }

                // Remove duplicates using a Set

                if (customSettingsOn && +localStorage.abcSortRemovesDuplicatesByContent) {

                    const uniqueAbcTunesSet = new Set(completeAbcTunesArr);

                    completeAbcTunesArr = Array.from(uniqueAbcTunesSet.values());

                    // console.log(`ABC Encoder:\n\nDeduplication is ON, items with identical content removed (first copy stays)`);
                }

                let sortedAbcTunesArr = [...completeAbcTunesArr];

                sortedAbcTunesArr = sortedAbcTunesArr.sort()
                
                renumberedAbcTunesArr = sortedAbcTunesArr.map(abc => `X: ${sortedAbcTunesArr.indexOf(abc) + 1}\n${abc}`);

                console.log(`ABC Encoder:\n\nABC Tunebook generated from Sets data`);
            }
        }

        // Post-process sorted and renumbered ABC array >>>

        // Replace all duplicate ABC header fields if their values are the same

        const isHeaderMergingOn =
            customSettingsOn && !+localStorage.abcSortSkipsMergingDuplicateFields;

        if (isHeaderMergingOn) {

            const sortedTidyAbcArr = renumberedAbcArr.map(abc => 

                ['R', 'M', 'L', 'Q'].reduce((processedAbc, fieldName) => 

                    replaceDuplicateAbcFields(processedAbc, fieldName) || processedAbc,
                    
                abc)
            );

            return [sortedTidyAbcArr, renumberedAbcTunesArr];
        }

        // Default option: Return sorted ABCs as is (everything in-between X: fields)

        return [renumberedAbcArr, renumberedAbcTunesArr];

    } catch (error) {

        displayNotification("Failed to sort ABC", "error");
        throw new Error("ABC Encoder:\n\nFailed to sort ABC\n\n", { cause: error });
    }
}

// Optionally look for and remove empty lines inside an ABC

function removeLineBreaksInAbc(abcContentArr) {

    if (abcContentArr.length > 0) {

        return abcContentArr.map(abc => abc.split('\n').map(line => line.trim()).filter(line => line !== '').join('\n'));
    }

    return abcContentArr;
}

// Optionally look for and remove all content separated by an empty line inside an ABC

function removeTextAfterLineBreaksInAbc(abcContentArr) {

    if (abcContentArr.length > 0) {

        // Regex implementation:

        // return abcContentArr.map(abc => abc.match(/^[\s\S]*?(?=(\r?\n\n|\r?\n\r\n))|^[\s\S]*/m)[0]);
        
        // Step-by-step implementation:

        const splitAbcLinesArr = abcContentArr.map(abc => abc.split('\n'));

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

    return abcContentArr;
}

// Make selected ABC field text Title Case via ap-style-title-case
// Optionally pre-process words in ALL CAPS to enable title-casing
// Optionally post-process words in Irish to fix capitalization

function makeStringTitleCase(abcString) {

    let preProcessedAbc = abcString.trim();    

    if (!preProcessedAbc || !localStorageOk()) return abcString;

    if (+localStorage.abcSortFormatsTitlesNoCaps) {

        preProcessedAbc = makeStringProperCase(preProcessedAbc);
    }
    
    let abcTitleCaseOutput = apStyleTitleCase(preProcessedAbc);

    if (+localStorage.abcSortFormatsTitlesInIrish) {

        abcTitleCaseOutput = applyIrishTitleFormatting(abcTitleCaseOutput);
    }

    if (preProcessedAbc.includes('\u00a0')) {
        
        abcTitleCaseOutput =
            restoreNonBreakSpacesInStr(preProcessedAbc, abcTitleCaseOutput);
    }

    return abcTitleCaseOutput;
}

// Make selected ABC field text Proper Case
// Override exceptions with strings from makeProperCaseExceptions

function makeStringProperCase(abcString, doNormalizeHyphens) {

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

    let abcStringArr = [];

    // Normalize common hyphenated tune types, removing hyphens

    if (doNormalizeHyphens && abcBasicTuneTypes.includes(abcString.toLowerCase())) {

        abcStringArr = abcString.split(/[\s-]/);
    
    } else {

        abcStringArr = abcString.split(/[\s]/);
    }

    let abcProperCaseOutput =
    
            abcStringArr
                .filter(Boolean)
                .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
                .map(word => word.replaceAll(/\bO['’`]([a-z])/g, (match, letter) => `O'${letter.toUpperCase()}`))
                .join(' ');

    if (abcString.includes('\u00a0')) {
        
        abcProperCaseOutput =
            restoreNonBreakSpacesInStr(abcString, abcProperCaseOutput);
    }

    return abcProperCaseOutput;
}

// Make ABC Tune Type plural using ABC R: field data
// Return a value in Proper Case by default

function makeTuneTypePlural(abcR) {

    if (abcR) {

        let tuneTypeAffix = '';
    
        tuneTypeAffix = ["march","schottis","waltz"].includes(abcR.toLowerCase())? 
            'es' : 
            's';

        return `${abcR}${tuneTypeAffix}`;
    }

    return "Various";
}

// Make ABC Tune Type singular based on TYPE prefix data
// Return a value in Proper Case by default

function getTuneTypeFromPrefix(abcTitlePrefix) {

    if (abcTitlePrefix && ["march","schottis","waltz"].includes(abcTitlePrefix.toLowerCase())) {

        return makeStringProperCase(abcTitlePrefix, true).replace(/es$/, '');
    }

    if (abcTitlePrefix && abcTitlePrefix.toUpperCase() !== "VARIOUS") {

        return makeStringProperCase(abcTitlePrefix, true).replace(/s$/, '')
    }

    return "Various";
}

// Create a TYPE prefix in plural using ABC R: field data
// Return a value in upper case by default

function getPluralTunePrefix(abcR) {
    
    if (abcR && abcBasicTuneTypes.includes(abcR.toLowerCase())) {

        return makeTuneTypePlural(abcR).toUpperCase();
    }

    return "VARIOUS";
}

// Format ABC Title handler function:
// Apply optional formatting changes to ABC titles
// Process each slash-separated title separately
// Return ABC title override if exception is found

function formatAbcTitle(abcTitle) {

    let inputAbcTitle = abcTitle.trim();

    if (!inputAbcTitle || !localStorageOk()) return abcTitle;

    // Account for slash-separated titles
    const abcTitleArr = 
        inputAbcTitle.trim().
        split(/(?:[\s]*[^0-9]\/[\s]*)/).
        filter(Boolean);

    let abcTitleOutput = '';

    // Process each slash-separated title individually
    abcTitleArr.forEach((title, index) => {

        // Separate title prefix and suffix before formatting

        let titlePrefix = 
            title.match(/^[A-Z-\s]*:/)? 
                `${title.match(/^[A-Z-\s]*:/)[0]} ` : '';

        let titleSuffix = 
            title.match(/(?:\(.*?\)|\[.*?\])/g)? 
                ` ${title.match(/(?:\(.*?\)|\[.*?\])/g).join(' ')}` : '';

        let titleSeparator =
            index > 0 && index < abcTitleArr.length? ' / ' : '';

        let formattedAbcTitle = 
            title.replace(/^[A-Z-\s]*:/, '').
            replaceAll(/(?:\(.*?\)|\[.*?\])/g, '').
            trim();

        // Check if the list of exceptions contains title string

        let abcTitleOverride = '';
        
        for (const caseObj of makeTitleCaseExceptions) {

            const excMatch = 
                formattedAbcTitle.toLowerCase().match(caseObj.string);

            if (excMatch) {
                abcTitleOverride = caseObj.override;
                // console.warn(`Title exception found! Output: ${titleOverride}`);
                break;
            }
        }

        // Return title override if exception is found

        if (abcTitleOverride) {

            abcTitleOutput += 
                titleSeparator +
                titlePrefix +
                abcTitleOverride +
                titleSuffix;
            return;
        }

        // Split the formatted title into individual words
        // Keep initial title array for reference

        const splitAbcTitleArr =
            formattedAbcTitle.split(' ').filter(Boolean);

        // Optional: Remove opening article An from Irish titles, try to fix grammar
        // Replace A/An + eclipsed word pairs with capitalized noun in nominative case
        // Replace A/An + lenited word pairs with capitalized noun in nominative case

        if (+localStorage.abcSortFormatsTitlesNoIrishAnAStart && 
            formattedAbcTitle.toLowerCase().match(/^(?:(?:an|a)[ ]+)(?!dro)(?=[\S]+)/)) {

            const mutatedWord = splitAbcTitleArr[1].toLowerCase();

            if (mutatedWord.match(/^(?:gc|dn|bhf|ng|pb|dt|ts|t-[aáeéiíoóuú])/)) {

                for (const caseObj of irishTitleCaseExceptions) { 

                    if (mutatedWord.startsWith(caseObj.string)) {

                        formattedAbcTitle = 

                            caseObj.override.slice(-1)
                            +
                            splitAbcTitleArr.slice(1)
                            .join(' ')
                            .slice(caseObj.string.length)

                        break;
                    }
                }
            }

            if (mutatedWord.match(/^(?:bh|ch|dh|fh|gh|mh|ph|sh|th)/)) {

                for (const caseObj of irishLenitedLettersMap) { 

                    if (mutatedWord.startsWith(caseObj.string)) {

                        formattedAbcTitle = 

                            caseObj.override
                            +
                            splitAbcTitleArr.slice(1)
                            .join(' ')
                            .slice(2)

                        break;
                    }
                }
            }
        }

        // Optional: Move articles A, An The to the end of the title
        // This would apply to A/An + eclipsed / lenited word pairs in Irish titles

        if (+localStorage.abcSortFormatsTitlesMovesTheAnA && 
            formattedAbcTitle.toLowerCase().match(/^(?:(?:the|an|a)[ ]+)(?!dro)(?=[\S]+)/)) {

            formattedAbcTitle =    

                formattedAbcTitle.replace(/^(?:([Tt][Hh][Ee]|[Aa][Nn]|[Aa])[ ]+)(.+)/, `$2, $1`);
        }

        // Optional: Remove articles A, An, The at the start of the title
        // Ignore A/An + eclipsed / lenited word pairs in Irish titles

        if (+localStorage.abcSortFormatsTitlesNoTheAnAStart && 
            formattedAbcTitle.toLowerCase().match(/^(?:(?:the|an|a)[ ]+)(?!dro)(?=[\S]+)/)) {

            const splitTitleArr = formattedAbcTitle.split(' ').filter(Boolean);
            const firstWord = splitTitleArr[1].toLowerCase();

            if (!firstWord.match(/^(?:gc|dn|bhf|ng|pb|dt|bh|ch|dh|fh|gh|mh|ph|sh|th|ts|t-[aáeéiíoóuú])|dro/)) {

                formattedAbcTitle = 

                    formattedAbcTitle.replace(/^(?:(?:[Aa][Nn]|[Aa])[ ]+)/, '');
            }

            formattedAbcTitle =    

                formattedAbcTitle.replace(/^(?:(?:[Tt][Hh][Ee])[ ]+)/, '');
        }

        // Optional: Remove articles A, An, The at the end of the title
        // Remove trailing comma and extra spaces adjacent to the article

        if (+localStorage.abcSortFormatsTitlesNoTheAnAEnd) {

            formattedAbcTitle = 
            
                formattedAbcTitle.replace(/(?:[ ]+|(?:,[ ]*))(?:[Tt][Hh][Ee]|[Aa][Nn]|[Aa])[ ]*$/, '');
        }

        // Title Case and rejoin the title >>>

        // Optional: Format title in AP-style Title Case
        // Optionally pre-process words in ALL CAPS
        // Optionally post-process words in Irish

        if (+localStorage.abcSortFormatsTitlesTitleCase) {

            formattedAbcTitle = makeStringTitleCase(formattedAbcTitle);
        }

        abcTitleOutput += 
            titleSeparator +
            titlePrefix +
            formattedAbcTitle +
            titleSuffix;
    });
    
    return abcTitleOutput;
}

// Scan ABC title for words matching Irish eclipsis / urú and other Title Case exceptions
// Replace matching words with those correctly capitalized

function applyIrishTitleFormatting(abcTitle) {

    const formattedIrishTitle = 
        
        abcTitle.split(' ')
                .map(word => {
                    for (const caseObj of irishTitleCaseExceptions) { 
                        if (word.toLowerCase().startsWith(caseObj.string))
                            return caseObj.override + word.slice(caseObj.string.length);
                    }
                    return word;
                })
                .join(' ');

    return formattedIrishTitle;
}

// Assemble ABC title (single or multi-line)
// Optional: Add TYPE: prefix to ABC Title
// Optional: Add [Type] suffix to ABC Title

function joinAbcTitle(abcTitleArr, abcTitlePrefix, abcTitleSuffix, abcSetTitle, abcMedleyTuneSuffix) {

    const splitAbcTitle =
        abcTitleArr[0].split(' / ');

    let primaryTitle =
        abcSetTitle? abcSetTitle :
        splitAbcTitle[0].trim();

    // Remove the trailing dot to normalize sets from The Session
    if (primaryTitle.match(/\.$/)) {

        primaryTitle = primaryTitle.replace(/\.$/, '');
    }

    const outputTitlePrefix =
        abcTitlePrefix? `${abcTitlePrefix}: ` : '';

    let outputTitleSuffix = '';

    if (abcTitleSuffix && !primaryTitle.includes(abcTitleSuffix)) {

        outputTitleSuffix =
            abcMedleyTuneSuffix && abcTitleSuffix !== ' Set [Medley]'? '' :
            primaryTitle.match(/[ ]+[Ss][Ee][Tt]/)? abcTitleSuffix.replace(' Set', '') :
            abcTitleSuffix;
    }

    let abcTitleOutput = 
        `T: ${outputTitlePrefix}${primaryTitle}${outputTitleSuffix}`;

    let secondaryTitle = '';

    if (splitAbcTitle.length > 1 && !abcSetTitle) {

        secondaryTitle = 
        
            splitAbcTitle.slice(1).
                map(title => title.trim()).
                join(' / ');
                
        abcTitleOutput += `\nT: ${secondaryTitle}`;
    }

    if (abcTitleArr.length > 1) {

        secondaryTitle = abcMedleyTuneSuffix?

            abcTitleArr.slice(1).
                map((title, i) =>
                    i === 0?
                    title.split(' / ')[0] + abcMedleyTuneSuffix +
                        `${title.split(' / ').slice(1).length?
                            ' / ' + title.split(' / ').slice(1).join(' / ') : ''}` :
                    title).
                join(' / ') :

            abcTitleArr.slice(1).join(' / ');

        abcTitleOutput += `\nT: ${secondaryTitle}`;
    }

    if (abcSetTitle && !secondaryTitle) {

        let firstTuneTitle = abcMedleyTuneSuffix?
        
            abcTitleArr.map((title, i) =>
                i === 0?
                title.split(' / ')[0] + abcMedleyTuneSuffix +
                    `${title.split(' / ').slice(1).length?
                        ' / ' + title.split(' / ').slice(1).join(' / ') : ''}` :
                title).
                join(' / ') :

            abcTitleArr.join(' / ');

        abcTitleOutput += `\nT: ${firstTuneTitle}`;
    }

    return abcTitleOutput;
}

// Assemble ABC Set Title depending on set title format settings

function joinAbcSetTitle(abcTitleGroups, isSetTitleSlashSeparated, isSetTitleFirstName) {

    let abcSetTitleOutput =

        isSetTitleSlashSeparated? 
        
            abcTitleGroups.map(
                (titleGroup, index) =>
                    index === 0 && titleGroup.length > 1?
                    titleGroup[1].split(' / ')[0].
                        replaceAll(/[ ]+\[.*\]/g, '').replaceAll(/[ ]+\(.*\)/g, '') :
                    titleGroup[0].split(' / ')[0].
                        replaceAll(/[ ]+\[.*\]/g, '').replaceAll(/[ ]+\(.*\)/g, '')
            ).join(' / ') : 

        isSetTitleFirstName && abcTitleGroups[0][1]?

            abcTitleGroups[0][1].split(' / ')[0].
                replaceAll(/[ ]+\[.*\]/g, '').replaceAll(/[ ]+\(.*\)/g, '') :
            
            abcTitleGroups[0][0].split(' / ')[0].
                replaceAll(/[ ]+\[.*\]/g, '').replaceAll(/[ ]+\(.*\)/g, '');

    return abcSetTitleOutput;
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

// Process the custom C: C: S: header field, separate Tune Composers from Tune Sources
// Return correct C: C: S: field value for a Tune depending on its abcIndex in the Set

function processAbcCCS(abcCCS, abcC, abcS, abcIndex) {

    const abcCCSVal =
        abcCCS.replace('C: C:', '').trim();
   
    let abcCFromCCSArr =
        abcCCSVal.split('; S: ')[0]?.split(' / ');

    let abcSFromCCSArr =
        abcCCSVal.split('; S: ')[1]?.split(' / ');

    const lineEndIdxMatch = new RegExp(`\\[${abcIndex + 1}\\]$`);
    const cValMatch = abcCFromCCSArr.find(cVal => cVal.match(lineEndIdxMatch)) || '';
    
    let abcCVal = 
        abcCFromCCSArr && abcCFromCCSArr.find(cVal => cVal.match(/\[\d\]$/))?
            cValMatch.replace('C:', '').trim().replaceAll(/\s*\[\d\]\s*/g, '') :
        abcCFromCCSArr && abcCFromCCSArr[0]?
            getValueByAbcIndex(abcCFromCCSArr, abcIndex).trim() : '';

    let abcSVal = '';

    if (abcSFromCCSArr && abcSFromCCSArr[0] && !abcCCSVal.includes("S: See Notes")) {

        abcSVal = abcSFromCCSArr[0].includes(' + ')?
            abcIndex === 0? `${abcSFromCCSArr[0].split(' + ')[0]}; ${abcSFromCCSArr[0].split(' + ')[1]}` :
            `${abcSFromCCSArr[0].split(' + ')[0]}; ${getValueByAbcIndex(abcSFromCCSArr, abcIndex).trim()}` :
            getValueByAbcIndex(abcSFromCCSArr, abcIndex).trim();
    }

    if (!abcCVal && abcC) {

        const mergedAbcCArr =
            abcC.split('\n')[0].split(' / ');

        abcCVal = 
            mergedAbcCArr.length > 1?
                getValueByAbcIndex(mergedAbcCArr, abcIndex).trim() :
            mergedAbcCArr[0].trim();
    }

    if (!abcSVal && abcS) {

        const mergedAbcSArr =
            abcS.split('\n')[0].split(' / ');

        const firstSource =
            mergedAbcSArr[0].trim();

        abcSVal = 
            firstSource.startsWith('http')? 
                '' :
            mergedAbcSArr.length > 1?
                getValueByAbcIndex(mergedAbcSArr, abcIndex).trim() :
            firstSource;
    }

    return `${abcCVal? abcCVal : 'Trad[?]'}; S: ${abcSVal? abcSVal : 'Various'}`;
}

// Process an array of custom N: Set Leaders: header fields
// Return C: Set Leaders: field value depending on abcIndex

function processAbcNSL(abcNSLArr, abcIndex) {

    const targetLine = 
        abcNSLArr.find(line => line.startsWith(`N: Set Leaders: [${abcIndex + 1}]`));

    // return targetLine? targetLine.replace(`N: Set Leaders: [${abcIndex + 1}] `, '') : '';
    return targetLine? targetLine.replaceAll(/\s*\[\d\]\s*/g, ' ') : '';
}

// Process ABC Composer Field text for individual tunes being converted to sets
// Return correct C: field value for a Tune depending on its abcIndex in the Set

function processAbcC(abcC, abcIndex) {

    let abcCArr = abcC.split(' / ');

    let abcCVal = 
        abcCArr && abcCArr.length > 0?
            getValueByAbcIndex(abcCArr, +abcIndex).trim() : '';
    
    return abcCVal;
}

// Process ABC Transcription Field text, separate Editors from The Session authors
// Return correct Z: field value for a Tune depending on its abcIndex in the Set

function processAbcZ(abcZ, abcIndex) {

    let abcEds =
        abcZ.includes(';')? abcZ.split(';')[0].trim() : '';

    let abcTsoArr =
        abcZ.includes(';')?
            abcZ.split(';')[1]?.split(' / ') :
            abcZ.split(' / ');

    let abcTso = 
        abcTsoArr.length?
            getValueByAbcIndex(abcTsoArr, +abcIndex).trim() : '';

    abcTso = 
        abcTso && abcTso.includes('The Session')? abcTso :
            abcTso? abcTso + ' at The Session' : 'The Session';

    return `${abcEds? abcEds : '[Unedited]'}; ${abcTso}`;
}

// Process an array of ABC header lines, extracting field values
// Account for single slash-separated ABC header tag lines
// Account for several numbered ABC header tag lines
// Account for several unnumbered ABC header tag lines
// Return the joined ABC field value depending on tune's abcIndex

function processMergedAbcHeader(headerLinesArr, abcIndex) {

    if (!headerLinesArr.length) return '';

    const tag = headerLinesArr[0][0];

    const lineIdxMatch = new RegExp(`\\[${abcIndex + 1}\\]`);

    let abcTagVal = '';

    if (headerLinesArr.length === 1) {

        const abcHeaderVal = headerLinesArr[0];

        if (abcHeaderVal.trim() === `${tag}:`) return '';

        const abcHeaderValArr = abcHeaderVal.replace(`${tag}: `, '').split(' / ');

        const matchesTuneIdx = abcHeaderValArr.find(tagLine => tagLine.match(lineIdxMatch));
        const matchesAnyIdx = abcHeaderValArr.find(tagLine => tagLine.match(/\s*\[\d\]\s*/));

        abcTagVal = 
            "CAO".includes(tag) && matchesTuneIdx?
                matchesTuneIdx.replaceAll(/\s*\[\d\]\s*/g, '') :
            matchesTuneIdx?
                matchesTuneIdx.replaceAll(/\s*\[\d\]\s*/g, ' ') :
            matchesAnyIdx? '' :
            abcHeaderValArr.length? 
                `${tag}: ${getValueByAbcIndex(abcHeaderValArr, +abcIndex).trim()}` :
            '';
    }

    if (headerLinesArr.length > 1) {

        const matchesTuneIdx = headerLinesArr.filter(tagLine => tagLine.match(lineIdxMatch));
        const noIdxLinesArr = headerLinesArr.filter(tagLine => !tagLine.match(/\s*\[\d\]\s*/));

        const tsoLinksArr = 
            headerLinesArr.filter(tagLine => tagLine.startsWith(`${tag}: https://thesession.org/tunes/`));
        const otherLinesArr = 
            headerLinesArr.filter(tagLine => !tagLine.startsWith(`${tag}: https://thesession.org/tunes/`));

        abcTagVal =
            "CAO".includes(tag) && matchesTuneIdx.length?
                `${matchesTuneIdx.map(
                    tagLine => tagLine.replaceAll(/\s*\[\d\]\s*/g, '')
                ).join('\n')}${noIdxLinesArr? `\n${noIdxLinesArr.join('\n')}` : ''}` :
            matchesTuneIdx.length?
                `${matchesTuneIdx.map(
                    tagLine => tagLine.replaceAll(/\s*\[\d\]\s*/g, ' ')
                ).join('\n')}${noIdxLinesArr? `\n${noIdxLinesArr.join('\n')}` : ''}` :
            tsoLinksArr.length? 
                `${getValueByAbcIndex(tsoLinksArr, +abcIndex)
                    }${otherLinesArr? `\n${otherLinesArr.join('\n')}` : ''}` :
            headerLinesArr.join('\n');
    }

    return abcTagVal;
}

// Process an array of mixed ABC header lines and join output field values

function massProcessMergedAbcHeader(mixedHeaderLinesArr, abcIndex) {

    const abcTagsSet = 
        new Set(mixedHeaderLinesArr.map(line => line[0]));

    const abcTagsArr =
        Array.from(abcTagsSet).sort();

    let joinedAbcLines = '';

    abcTagsArr.forEach(tag => {

        const headerLinesArr =
            mixedHeaderLinesArr.filter(tagLine => tagLine.match(`^${tag}:`));

        joinedAbcLines += 
            `${processMergedAbcHeader(headerLinesArr, abcIndex)}\n`;
    });

    return joinedAbcLines;
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

// Scan ABC body for all standard header fields except T: and R: (handled separately)
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

// Normalize spacing in ABC header lines
// Process T: and R: fields separately

function normalizeHeaderLine(headerLine, isSkippingAbcTitleEditAllowed) {

    let processedLine = headerLine.trim();

    // Skip processing empty lines, comment lines and directives

    if (!processedLine ||
        processedLine.startsWith('%')) return processedLine;

    // Replace non-standard header "comments" with %-prefixed line

    if (processedLine.startsWith('"')) {
        
        return `% ${processedLine.replaceAll(/"/g, '')}`;
    }

    // Process lines with header tags, ensure uniform spacing

    const headerTag = processedLine[0];
    const tagMatch = new RegExp(`^${headerTag}:[ ]*`);

    processedLine = processedLine.replace(tagMatch, '');

    if (!isSkippingAbcTitleEditAllowed && headerTag === "T") {

        return `${headerTag}: ${formatAbcTitle(processedLine)}`;
    }

    if (headerTag === "R") {

        return `${headerTag}: ${makeStringProperCase(processedLine, true)}`;
    }

    return `${headerTag}: ${processedLine}`;
}

// Replace several variants of ABC part separators with uniform style

function normalizePartEndings(abcContent) {

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
// Optional: Use abcToMatch as template for filling in ABC field values
// Optional: Use setToTunes + abcIndex for Set -> Tune conversion

function addCustomAbcFields(abcContent, abcToMatchArr, setToTunes, abcIndex) {

    // Verify that localStorage is available

    const customSettingsOn = localStorageOk();

    // Check if Encoder settings require certain fields

    const isStrictDetectMode = 
        customSettingsOn && !!+localStorage.abcSortUsesStrictTuneDetection;

    const isCustomFieldSetEnforced = 
        customSettingsOn && !!+localStorage.abcSortEnforcesCustomAbcFields;

    const isSkippingAbcTitleEditAllowed = !setToTunes &&
        customSettingsOn && !!+localStorage.abcSortSkipsTitleEditForOrderedAbc;

    // Check if ABC header merging is allowed 

    const isHeaderMergingOn =
        customSettingsOn && !+localStorage.abcSortSkipsMergingDuplicateFields;

    // Set abcToMatch string value if ABC array was passed

    let abcToMatch = '';

    if (abcToMatchArr) {

        abcToMatch = isHeaderMergingOn? abcToMatchArr[0] : abcToMatchArr.join('');
    }

    // Separate ABC headers for editing
    // Strict mode? Invalidate ABCs with missing K: field

    const matchTuneHeadersArr = 
        abcContent.match(isStrictDetectMode? matchTuneHeadersStrict : matchTuneHeadersLax);

    if (!matchTuneHeadersArr || 
        (isStrictDetectMode && abcContent.match(matchTuneHeadersLax).length > matchTuneHeadersArr.length)) {

        console.warn(`ABC Encoder:\n\nInvalid ABC detected and skipped with strict detect mode ${isStrictDetectMode? 'ON' : 'OFF'}:\n\n${abcContent}${abcToMatch? '\n\nABC to Match:\n\n' + abcToMatch : 'No abcToMatch'}`);
        return '';
    }

    // Set custom flags based on header content and parameters

    const isTuneSet = 
        matchTuneHeadersArr && matchTuneHeadersArr.length > 1;

    const isFirstTuneInSet = 
        setToTunes && abcIndex === 0;
        
    const hasExtraTitle = 
        isFirstTuneInSet && matchTuneHeadersArr[0].match(/^T:.*/gm).length > 1;

    const isSetTitleFirstName =
        customSettingsOn && !!+localStorage.abcSortFormatsSetTitleFirstName;

    const isSetTitleSlashSeparated =
        customSettingsOn && !!+localStorage.abcSortFormatsSetTitleSlashNames;

    // Pre-process ABC headers for each tune >>>
    // Normalize and format header lines

    let abcHeadersArr = [];

    matchTuneHeadersArr.forEach((header, index) => {

        if (index === 0 && hasExtraTitle) {
            // Set-to-tunes mode? Remove Set title
            header = header.replace(/^T:.*\s*/, '');
        }

        abcHeadersArr[index] = 
            header.split('\n').
            map(line => // Process line breaks; process T: and R: titles if allowed
                normalizeHeaderLine(line, isSkippingAbcTitleEditAllowed)).
            filter(Boolean);
    });

    // Merge stackable secondary ABC headers into the primary ABC header

    if (isTuneSet && isHeaderMergingOn) {

        abcHeadersArr = mergeSetHeaderFields(abcHeadersArr);
    }

    // Pre-process ABC body for each tune >>>

    const abcContentArr = 
        abcContent.match(isStrictDetectMode? matchIndividualTunesStrict : matchIndividualTunesLax);

    const abcBodiesArr = [];

    abcContentArr.forEach((abcContent, index) => {

        abcBodiesArr[index] = 
            formatAbcBodyFields(
                abcContent.replace(matchTuneHeadersArr[index], '')
            ).trim();
    });

    // Process ABC titles >>>

    // Get first ABC Title of primary tune for reference

    const abcFirstTitle = 
        abcHeadersArr[0].find(tagLine => tagLine.startsWith('T:')).
        replace('T:', '').trim();

    // Group ABC Titles by tune

    const abcTitleGroups = [];

    abcHeadersArr.forEach(headerArr => {

        if (isSkippingAbcTitleEditAllowed) {

            abcTitleGroups.push(
                headerArr.
                    filter(tagLine => tagLine.startsWith("T:")).
                    map(title => title.replace(/^T:[ ]/, ''))
            );
            
            return;
        }

        abcTitleGroups.push(
            headerArr.
                filter(tagLine => tagLine.startsWith("T:")).
                map(
                    title => title.replace(/^T:[ ]/, '').
                    replace(/^[A-Z-\s]+:[ ]/, '').
                    replace(/[ ]+(?:[Ss][Ee][Tt])(?=[ ]*(?:$|\[.*\]))/, '').
                    replaceAll(/[ ]+\[.*\]/g, '')
                )
        );
    });

    // Get base ABC Set Title using tune titles

    let abcSetTitle = '';

    if (isTuneSet && !isSkippingAbcTitleEditAllowed) {

        abcSetTitle = joinAbcSetTitle(abcTitleGroups, isSetTitleSlashSeparated, isSetTitleFirstName);
    }

    // Process ABC Prefix and Suffix for primary tune >>>

    // Get ABC Rhythm from the last R: field of the primary tune

    const abcRArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("R:"));

    let abcR = 
        abcRArr.length? abcRArr[abcRArr.length - 1].replace('R: ', '') : '';

    // Check if ABC Set is a Medley

    let isMedley;

    if (isTuneSet) {

        const abcSetRArr = 
            abcHeadersArr.map(headerArr =>
                headerArr.filter(tagLine => tagLine.startsWith("R:"))).
                filter(arr => arr.length > 0).
                map(arr => arr[arr.length - 1]);

        isMedley =

            // Skip sets with tunes of the same basic type
            (areAllArrValsTheSame(abcSetRArr) &&
            abcBasicTuneTypes.includes(abcR.toLowerCase())) ||

            // Skip specific combinations of basic tune types
            abcSetRArr.every(value => value === "R: Air" || value === "R: Waltz") ||
            abcSetRArr.every(value => value === "R: Mazurka" || value === "R: Waltz") ||
            abcSetRArr.every(value => value === "R: Jig" || value === "R: Single Jig") ||
            abcSetRArr.every(value => value === "R: Slide" || value === "R: Single Jig")?

            false : true;
    }

    // Check if a TYPE: prefix or a [type] suffix needs to be added to primary tune
    // Define initial values for abcTitlePrefix and abcTitleSuffix

    let isTitleTypePrefixOn = customSettingsOn && 
        +localStorage.abcSortFormatsTitlesTypePrefix && 
        !+localStorage.abcSortFormatsTitlesTypeSuffix && 
        !+localStorage.abcSortFormatsTitlesMovesTheAnA &&
        !isSkippingAbcTitleEditAllowed;

    let isTitleTypeSuffixOn = customSettingsOn && 
        +localStorage.abcSortFormatsTitlesTypeSuffix && 
        !+localStorage.abcSortFormatsTitlesTypePrefix &&
        !isSkippingAbcTitleEditAllowed;

    let abcTitlePrefix = '';
    let abcTitleSuffix = '';

    if (isTitleTypePrefixOn) {
        
        abcTitlePrefix = 
            isMedley? 
                "MEDLEY" :
            isTuneSet?
                getPluralTunePrefix(abcR) :
            abcBasicTuneTypes.includes(abcR.toLowerCase())?
                abcR.toUpperCase() :
            "VARIOUS";
    }

    if (isTuneSet) {

        abcTitleSuffix += ` Set`;
    }

    if (isTitleTypeSuffixOn) {

        abcTitleSuffix +=
            // Medleys
            isMedley? ` [Medley]` :
            // Sets
            abcR && isTuneSet? ` [${makeTuneTypePlural(abcR)}]` :
            // Tunes
            abcR? ` [${abcR}]` : '';

    } else if (!isSkippingAbcTitleEditAllowed && !isTuneSet && abcR &&
            !abcBasicTuneTypes.includes(abcR.toLowerCase())) { 
        
        // Account for tunes with uncommon tune types
        abcTitleSuffix = ` [${abcR}]`;
    }

    // Process each ABC Title group
    
    const abcTitlesArr = [];

    abcTitleGroups.forEach((titleGroup, index) => {

        let abcMedleyTuneSuffix = isMedley && !isSkippingAbcTitleEditAllowed?
            ` [${getLastAbcHeaderValueOfKind(abcHeadersArr.slice(0, index + 1), "R")}]` : '';

        abcTitlesArr.push(
            index === 0?
            joinAbcTitle(titleGroup, abcTitlePrefix, abcTitleSuffix, abcSetTitle, abcMedleyTuneSuffix) :
            joinAbcTitle(titleGroup, null, abcMedleyTuneSuffix)
        )
    });

    // QUICK EDIT CASE:

    const isSkippingOrderedAbcAllowed =
        customSettingsOn && !!+localStorage.abcSortSkipsDeepEditForOrderedAbc;

    if (isSkippingOrderedAbcAllowed && !abcToMatch && abcR) {

        const isTsoMetadataSettingOn = 
            customSettingsOn && !!+localStorage.abcSortFetchesTsoMetaData;

        // Define the custom layout ABC primary header must match

        let abcPrimaryHeadersLayout = 
            isCustomFieldSetEnforced? matchOrderedCustomAbc :
            isTsoMetadataSettingOn? matchOrderedStandardAbcPlusTsoMeta :
            matchOrderedStandardAbc;

        // Define the custom layout ABC secondary headers must match

        let abcSecondaryHeadersLayout = 
            isTuneSet && isHeaderMergingOn? matchOrderedMergedSecondaryHeader :
            abcPrimaryHeadersLayout;

        // Check if headers match custom layouts

        const isPrimaryHeaderOrdered = 
            !!abcHeadersArr[0].filter(line => !line.startsWith('T:')).join('\n').match(abcPrimaryHeadersLayout);

        const areSecondaryHeadersOrdered = 
            isTuneSet && 
            abcHeadersArr.slice(1).length === 
                abcHeadersArr.slice(1).
                map(headerArr => headerArr.filter(line => !line.startsWith('T:')).join('\n').match(abcSecondaryHeadersLayout)).
                filter(Boolean).
                length;

        // Return ABC with processed Title and quick-styled fields if all custom fields are already in place

        if (isPrimaryHeaderOrdered && (!isTuneSet || areSecondaryHeadersOrdered)) {

            const outputAbcArr = [];

            abcHeadersArr.forEach((headerArr, i) => {

                outputAbcArr.push(
                    `${i > 0? '\n' : ''}` +
                    `${i === 0? abcTitlesArr[i] : abcTitlesArr[i].split('\nT: ').join(' / ')}\n` +
                    headerArr.filter(header => 
                        !header.startsWith("T:")).join('\n') +
                    `\n${abcBodiesArr[i]}`
                );
            });

            let quickEditAbcOutput = '';

            const hasIndexedLines = outputAbcArr.find(line => line.match(/\[\d\]/));
            const hasOnlyFirstIdxLines = !outputAbcArr.find(line => line.match(/\[[2-9]\]/));

            if (hasIndexedLines && hasOnlyFirstIdxLines) {

                quickEditAbcOutput =
                    outputAbcArr.
                        map(line => 
                            line.match(/^[ACO]:(?! C:| Set Leaders:)/)? 
                                line.replaceAll(/\s*\[\d\]\s*/g, '') : 
                                line.replaceAll(/\s*\[\d\]\s*/g, ' ')).
                        join('');

                return quickEditAbcOutput;
            }

            quickEditAbcOutput = 
                outputAbcArr.join('');

            return quickEditAbcOutput;
        }
    }

    // DEEP EDIT CASE:

    const abcToMatchHeadersArr = [];
    const abcInheritedHeadersArr = [];

    // Process abcToMatch header data

    if (abcToMatch) {

        const abcToMatchRawHeadersArr =
            abcToMatchArr.join('').match(isStrictDetectMode? matchTuneHeadersStrict : matchTuneHeadersLax);

        abcToMatchRawHeadersArr.forEach((header, index) => {

            abcToMatchHeadersArr[index] = 
                header.split('\n').
                // Process line breaks, T: and R: titles
                map(line => normalizeHeaderLine(line)).
                filter(Boolean);
        });

        if (abcIndex) {

            ['R', 'M', 'L', 'Q', 'K', 'I', 'U', 'V'].forEach(tag => {

                for (let i = abcIndex - 1; i >= 0; i--) {

                    const filteredArr = 
                        abcToMatchHeadersArr[i].
                            filter(tagLine => tagLine.startsWith(tag) &&
                                tagLine.replace(`${tag}:`, '').trim());

                    if (filteredArr.length) {

                        abcInheritedHeadersArr.push(
                            filteredArr[filteredArr.length - 1]
                        );
                        break;
                    }
                }
            });
        }
    }

    // Process ABC primary header data >>>
    
    // Fill ABC primary header arrays

    const abcCArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.match(/^C:(?! C:| Set Leaders:)/));
    const abcSArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("S:"));
    const abcCCSArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("C: C:"));
    const abcCSLArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("C: Set Leaders:"));
    const abcZArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("Z:"));
    const abcNArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.match(/^N:(?! Set Leaders:)/));
    const abcNSLArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("N: Set Leaders:"));
    const abcVarStackArr =
        abcHeadersArr[0].filter(tagLine => tagLine.match(/^[ABDFGHOW]:/));
    const abcVarNonStackArr =
        abcHeadersArr[0].filter(tagLine => tagLine.match(/^[IPUV]:/));
    const abcMArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("M:"));
    const abcLArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("L:"));
    const abcQArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("Q:"));
    const abcKArr = 
        abcHeadersArr[0].filter(tagLine => tagLine.startsWith("K:"));

    // Fill ABC To Match primary header arrays

    const abcToMatchCArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.match(/^C:(?! C:| Set Leaders:)/)) : [];
    const abcToMatchSArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("S:")) : [];
    const abcToMatchCCSArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("C: C:")) : [];
    const abcToMatchCSLArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("C: Set Leaders:")) : [];
    const abcToMatchZArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("Z:")) : [];
    const abcToMatchNArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.match(/^N:(?! Set Leaders:)/)) : [];
    const abcToMatchNSLArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("N: Set Leaders:")) : [];
    const abcToMatchVarStackArr =
        abcToMatch && isHeaderMergingOn?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.match(/^[ABDFGHOW]:/)) : [];
    const abcToMatchVarNonStackArr =
        abcToMatch?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.match(/^[IPUV]:/)) : [];
    const abcToMatchRArr =
        abcToMatch?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("R:")) : [];
    const abcToMatchMArr =
        abcToMatch?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("M:")) : [];
    const abcToMatchLArr =
        abcToMatch?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("L:")) : [];
    const abcToMatchQArr =
        abcToMatch?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("Q:")) : [];
    const abcToMatchKArr =
        abcToMatch?
            abcToMatchHeadersArr[0].filter(tagLine => tagLine.startsWith("K:")) : [];

    // Define variables to store custom ABC fields data

    let abcC; // ABC Composer field data
    let abcS; // ABC Source field data
    let abcCSL; // ABC C: Set Leaders data (custom field)
    let abcNSL; // ABC N: Set Leaders data (custom field)
    let abcCCS; // ABC Composer & Source data (custom field) 
    let abcZ; // ABC Transcription field data
    let abcN; // ABC Notes field data
    let abcVarStack; // Various other stackable ABC field data
    let abcVarNonStack; // Various other non-stackable ABC field data
    let abcM; // ABC Meter field data (last value applies)
    let abcL; // ABC Note Length field data (last value applies)
    let abcQ; // ABC Tempo field data (last value applies)
    let abcK; // ABC Key field data (last value applies)

    // Set ABC primary header values
    // Use ABC To Match for fallback values

    if (!abcR) {

        const inheritedR =
            abcInheritedHeadersArr.length? abcInheritedHeadersArr.find(line => line.startsWith('R:')) : '';

        abcR = 
            inheritedR? 
                inheritedR.replace('R:', '').trim() :
            abcToMatchRArr.length && abcToMatchRArr[abcToMatchRArr.length - 1].replace('R:', '').trim()? 
                abcToMatchRArr[abcToMatchRArr.length - 1].replace('R:', '').trim() :
            "Various";
    }

    abcC =
        setToTunes && abcToMatchCArr.length?
            processMergedAbcHeader(abcToMatchCArr, abcIndex).replace('C:', '').trim() :
        abcToMatchCArr.length?
            abcToMatchCArr.join('\n').replace('C:', '').trim() :
        abcCArr.length?
            abcCArr.join('\n').replace('C:', '').trim() :
        '';
    abcS =
        setToTunes && abcToMatchSArr.length?
            processMergedAbcHeader(abcToMatchSArr, abcIndex).replace('S:', '').trim() :
        abcToMatchSArr.length?
            abcToMatchSArr.join('\n').replace('S:', '').trim() :
        abcSArr.length?
            abcSArr.join('\n').replace('S:', '').trim() :
        '';
    abcCSL =
        setToTunes && abcToMatchNSLArr.length?
            processAbcNSL(abcToMatchNSLArr, abcIndex).replace('N: Set Leaders:', '').trim() :
        abcToMatchCSLArr.length?
            abcToMatchCSLArr[0].replace('C: Set Leaders:', '').trim() :
        abcCSLArr.length?
            abcCSLArr[0].replace('C: Set Leaders:', '').trim() :
        '';
    abcNSL =
        setToTunes?
            '' :
        abcNSLArr.length?
            `${abcNSLArr.join('\n')}\n` :
        abcToMatchNSLArr.length?
            `${abcToMatchNSLArr.join('\n')}\n` :
        '';
    abcCCS =
        setToTunes && abcToMatchCCSArr.length?
            processAbcCCS(abcToMatchCCSArr[0], abcC, abcS, abcIndex) :
        abcToMatchCCSArr.length?
            abcToMatchCCSArr[0].replace('C: C:', '').trim() :
        abcCCSArr.length?
            abcCCSArr[0].replace('C: C:', '').trim() :
        '';
    abcZ =
        setToTunes && abcToMatchZArr.length?
            processAbcZ(abcToMatchZArr[0].replace('Z:', '').trim(), abcIndex).
                replaceAll(/(?:\[\d\]\s*)+/g, '') :
        abcToMatchZArr.length?
            abcToMatchZArr.join('\n').replace('Z:', '').trim() :
        abcZArr.length?
            abcZArr.join('\n').replace('Z:', '').trim() :
        '';
    abcN =
        setToTunes && abcToMatchNArr.length?
            processMergedAbcHeader(abcToMatchNArr, abcIndex).replace('N:', '').trim() :
        abcToMatchNArr.length?
            abcToMatchNArr.join('\n').replace('N:', '').trim() :
        abcNArr.length?
            abcNArr.join('\n').replace('N:', '').trim() :
        '';
    abcVarStack =
        setToTunes && abcToMatchVarStackArr.length?
            massProcessMergedAbcHeader(abcToMatchVarStackArr, abcIndex) :
        abcToMatchVarStackArr.length? 
            `${abcToMatchVarStackArr.join('\n')}\n` :
        abcVarStackArr.length? 
            `${abcVarStackArr.join('\n')}\n` :
        '';
    abcVarNonStack =
        setToTunes && abcToMatchVarNonStackArr.length? 
            `${abcToMatchVarNonStackArr.join('\n').
                replaceAll(/(?:\[\d\]\s*)+/g, ' ')}\n` :
        abcVarNonStackArr.length?
            `${abcVarNonStackArr.join('\n')}\n` :
        '';
    abcM =
        abcMArr.length && abcMArr[abcMArr.length - 1].replace('M:', '').trim()?
            abcMArr[abcMArr.length - 1].replace('M:', '').trim() :
        abcInheritedHeadersArr.length && abcInheritedHeadersArr.find(line => line.startsWith('M:'))?
            abcInheritedHeadersArr.find(line => line.startsWith('M:')).replace('M:', '').trim() :
        abcToMatchMArr.length?
            abcToMatchMArr[abcToMatchMArr.length - 1].replace('M:', '').trim() :
        '';
    abcL =
        abcLArr.length && abcLArr[abcLArr.length - 1].replace('L:', '').trim()?
            abcLArr[abcLArr.length - 1].replace('L:', '').trim() :
        abcInheritedHeadersArr.length && abcInheritedHeadersArr.find(line => line.startsWith('L:'))?
            abcInheritedHeadersArr.find(line => line.startsWith('L:')).replace('L:', '').trim() :
        abcToMatchLArr.length?
            abcToMatchLArr[abcToMatchLArr.length - 1].replace('L:', '').trim() :
        '';
    abcQ =
        abcQArr.length && abcQArr[abcQArr.length - 1].replace('Q:', '').trim()?
            abcQArr[abcQArr.length - 1].replace('Q:', '').trim() :
        abcInheritedHeadersArr.length && abcInheritedHeadersArr.find(line => line.startsWith('Q:'))?
            abcInheritedHeadersArr.find(line => line.startsWith('Q:')).replace('Q:', '').trim() :
        !isMedley && abcToMatchQArr.length?
            abcToMatchQArr[abcToMatchQArr.length - 1].replace('Q:', '').trim() :
        '';
    abcK =
        abcKArr.length && abcKArr[abcKArr.length - 1].replace('K:', '').trim()?
            abcKArr[abcKArr.length - 1].replace('K:', '').trim() :
        abcInheritedHeadersArr.length && abcInheritedHeadersArr.find(line => line.startsWith('K:'))?
            abcInheritedHeadersArr.find(line => line.startsWith('K:')).replace('K:', '').trim() :
        abcToMatchKArr.length?
            abcToMatchKArr[abcToMatchKArr.length - 1].replace('K:', '').trim() :
        '';

    // Strict mode: Invalidate tunes with missing K: field
    
    if (!abcK && isStrictDetectMode) {

        console.warn(`ABC Encoder:\n\nInvalid ABC detected and skipped with strict detect mode ON:\n\n${abcContent}${abcToMatch? '\n\nABC to Match:\n\n' + abcToMatch : 'No abcToMatch'}`);
        return '';
    }

    // Reassemble ABC Title with updated R: value >>>

    // Create updated ABC Title groups array if Quick Edit mode skipped formatting titles

    const abcUpdTitleGroups = [];

    if (isSkippingAbcTitleEditAllowed) {

        abcHeadersArr.forEach(headerArr => {

            abcUpdTitleGroups.push(
                headerArr.
                    filter(tagLine => tagLine.startsWith("T:")).
                    map(
                        title => normalizeHeaderLine(title).
                        replace(/^T:[ ]/, '').
                        replace(/^[A-Z-\s]+:[ ]/, '').
                        replace(/[ ]+(?:[Ss][Ee][Tt])(?=[ ]*(?:$|\[.*\]))/, '').
                        replaceAll(/[ ]+\[.*\]/g, '')
                    )
            );
        });
    }

    // Update Title Prefix & Suffix values

    abcTitlePrefix = '';
    abcTitleSuffix = '';

    isTitleTypePrefixOn = customSettingsOn && 
        +localStorage.abcSortFormatsTitlesTypePrefix && 
        !+localStorage.abcSortFormatsTitlesTypeSuffix && 
        !+localStorage.abcSortFormatsTitlesMovesTheAnA;

    isTitleTypeSuffixOn = customSettingsOn && 
        +localStorage.abcSortFormatsTitlesTypeSuffix && 
        !+localStorage.abcSortFormatsTitlesTypePrefix;

    if (isTitleTypePrefixOn) {
        
        abcTitlePrefix = 
            isMedley? 
                "MEDLEY" :
            isTuneSet?
                getPluralTunePrefix(abcR) :
            abcBasicTuneTypes.includes(abcR.toLowerCase())?
                abcR.toUpperCase() :
            "VARIOUS";
    }

    if (isTuneSet) {

        abcTitleSuffix = ` Set`;
    }

    if (isTitleTypeSuffixOn) {
        
        abcTitleSuffix +=
            // Medleys
            isMedley? ` [Medley]` :
            // Sets
            abcR && isTuneSet? ` [${makeTuneTypePlural(abcR)}]` :
            // Tunes
            abcR? ` [${abcR}]` : '';
    
    } else if (!isTuneSet && !abcBasicTuneTypes.includes(abcR.toLowerCase())) {

        abcTitleSuffix = ` [${abcR}]`;
    }

    if (isTuneSet && isSkippingAbcTitleEditAllowed) {

        abcSetTitle =
            joinAbcSetTitle(abcUpdTitleGroups, isSetTitleSlashSeparated, isSetTitleFirstName);
    }

    // Get an updated ABC Titles array
    
    const abcUpdTitlesArr = [];

    if (isSkippingAbcTitleEditAllowed) {

        abcUpdTitleGroups.forEach((updTitleGroup, index) => {

            let abcMedleyTuneSuffix = isMedley?
                ` [${getLastAbcHeaderValueOfKind(abcHeadersArr.slice(0, index + 1), "R")}]` : '';

            abcUpdTitlesArr.push(
                index === 0?
                joinAbcTitle(updTitleGroup, abcTitlePrefix, abcTitleSuffix, abcSetTitle, abcMedleyTuneSuffix) :
                joinAbcTitle(updTitleGroup, null, abcMedleyTuneSuffix)
            )
        });

    } else {

        abcTitleGroups.forEach((titleGroup, index) => {

            let abcMedleyTuneSuffix = isMedley?
                ` [${getLastAbcHeaderValueOfKind(abcHeadersArr.slice(0, index + 1), "R")}]` : '';

            abcUpdTitlesArr.push(
                index === 0?
                joinAbcTitle(titleGroup, abcTitlePrefix, abcTitleSuffix, abcSetTitle, abcMedleyTuneSuffix) :
                joinAbcTitle(titleGroup, null, abcMedleyTuneSuffix)
            )
        });
    }

    // Process and fill in ABC header fields with missing data >>>
    
    // Update ABC Meter field if missing, derive M: from Tune Type
    
    if (!abcM) {
        
        switch (abcR.toLowerCase()) {
            
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
                console.warn(`ABC Encoder:\n\nMissing M: field has been added to ${abcFirstTitle}, action may be required`);
                break;
        }
        
        // console.log(`ABC Encoder:\n\nM: field updated in ${abcFirstTitle}`);
    }

    // Update ABC Note Length field if missing, infer L: value from Tune Type

    if (!abcL) {

        const doubleLengthTypes = ["3/2 hornpipe", "three-two", "three two", "3/2"];

        if (doubleLengthTypes.includes(abcR.toLowerCase())) {

            abcL = "1/4"

        } else {

            abcL = "1/8";
        }

        // console.warn(`ABC Encoder:\n\nMissing L: field added to ${abcFirstTitle}, action may be required`);
    }

    // Add ABC Tempo field if missing, derive Q: value from Tune Type

    if (!abcQ && isCustomFieldSetEnforced) {

        switch (abcR.toLowerCase()) {

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
                // console.warn(`ABC Encoder:\n\nMissing Q: field added to ${abcFirstTitle}, action may be required`);
                break;
        }
    }

    // Add N: with The Session tune setting link if N: is missing (N.S.S.S.)

    if (!abcN && isCustomFieldSetEnforced) {

        const abcSLinksArr =
            abcToMatchSArr.length?
                abcToMatchSArr.filter(line => line.replace(/^S:[ ]*/, '').startsWith('http')) :
            abcSArr.length?
                abcSArr.filter(line => line.replace(/^S:[ ]*/, '').startsWith('http')) :
            [];

        if (abcSLinksArr.length) {

            abcN =
                setToTunes && abcToMatchSArr.length?
                    processMergedAbcHeader(abcSLinksArr, abcIndex).replaceAll(/^S:[ ]*/gm, 'N: ').replace('N:', '').trim() :
                    abcSLinksArr.join('\n').replaceAll(/^S:[ ]*/gm, 'N: ').replace('N:', '').trim();
        }
    }

    // Add ABC Transcription field if missing, fill in the default value (N.S.S.S.)

    if (!abcZ && isCustomFieldSetEnforced) {

        abcZ = "[Unedited]; The Session";
        // console.log(`ABC Encoder:\n\nMissing Z: field added to ${abcFirstTitle}`);
    }

    // Standard C: and S: fields are used >>>

    if (!isCustomFieldSetEnforced) {

        // Reset ABC Transcription field if it contains placeholder value

        if (abcZ === "[Unedited]; The Session") {

            abcZ = '';
        }

        // Get abcS value from custom C: C: S: field

        if (abcCCS) {

            let abcSFromCCS = abcCCS.split(/; S:[ ]*/)[1];

            if (abcSFromCCS && abcSFromCCS !== "See Notes") {

                abcS = abcS? `${abcSFromCCS}\nS: ${abcS}` : abcSFromCCS;
            }
        }

        // Get abcC value from custom C: C: S: field

        if (!abcC && abcCCS) {

            abcC = abcCCS.split(/; S:[ ]*/)[0] || "Trad[?]";
        }
    }

    // N.S.S.S. Tunebook-specific C: C: S: field is used >>>

    // Add C: C: S: Composer and Source field if missing

    if (isCustomFieldSetEnforced && !abcCCS) {

        // Attempt to fill in C: C: S: data using C: and S: fields

        let abcSStr =
            abcSArr.find( // Exclude fields containing links
                line => !line.replace('S:', '').trim().startsWith('http')
            );

        if (abcC && abcSStr) {

            abcCCS = `${abcC}; ${abcSStr}`;

        // Attempt to fill in C: C: S: data using C: field value

        } else if (abcC) {

            abcCCS = `${abcC}; S: Various`;

        // Fill in default C: C: S: values

        } else {

            abcCCS = "Trad[?]; S: Various"
        }
    }

    // Split long C: C: S: lines, move S: data to footnotes

    if (isCustomFieldSetEnforced && abcCCS.length > 97) {

        let abcCFromCCS = abcCCS.split('; S:')[0];
        let abcSFromCCS = abcCCS.split('; S:')[1].trim();

        const abcSFromCCSArr = abcSFromCCS.split(' / ');
        let sLinePrefix = '';

        if (abcSFromCCSArr.length > 1 && abcSFromCCSArr[0].includes(' + ')) {

            sLinePrefix = `${abcSFromCCSArr[0].split(' + ')[0]}; `;
            abcSFromCCSArr[0] = abcSFromCCSArr[0].split(' + ')[1];
        }
        
        abcS =
            abcSFromCCSArr.map(
                (sLine, i) => 
                    `${i > 0? ' / ' : ''}[${i + 1}] ${sLinePrefix}${sLine}`
            ).join('');

        abcCCS = `${abcCFromCCS}; S: See Notes`;
    }

    // Account for header comments

    const abcCommentsMatch = matchTuneHeadersArr[0].match(/^%.*/gm);

    let abcHeaderComments = abcCommentsMatch? `${abcCommentsMatch.join('\n')}\n` : '';

    const outputUpdAbcArr = [];

    abcHeadersArr.forEach((headerArr, i) => {

        if (i === 0 && isCustomFieldSetEnforced) {

            const primaryHeaderStr = 

                `${abcUpdTitlesArr[0]}\n` +
                `C: C: ${abcCCS}\n` +
                `C: Set Leaders: ${abcCSL}\n` +
                `${abcCCS.includes('S: See Notes')? `S: ${abcS}\n` : ''}` +
                `Z: ${abcZ}\n` +
                `N: ${abcN}\n` +
                abcNSL +
                `R: ${abcR}\n` +
                `M: ${abcM}\n` +
                `L: ${abcL}\n` + 
                `Q: ${abcQ}\n` + 
                abcHeaderComments +
                `K: ${abcK}\n` +
                `${abcBodiesArr[0]}`;

            outputUpdAbcArr.push(primaryHeaderStr);
            return;
        }

        if (i === 0 && !isCustomFieldSetEnforced) {

            const primaryHeaderStr = 

                `${abcUpdTitlesArr[0]}\n` +
                `${abcC? `C: ${abcC}\n` : ''}` +
                `${abcCSL? `C: Set Leaders: ${abcCSL}\n` : ''}` +
                `${abcS? `S: ${abcS}\n` : ''}` +
                `${abcZ? `Z: ${abcZ}\n` : ''}` +
                `${abcN? `N: ${abcN}\n` : ''}` +
                abcNSL +
                abcVarStack +
                abcVarNonStack +
                `R: ${abcR}\n` +
                `M: ${abcM}\n` +
                `L: ${abcL}\n` + 
                `${abcQ? `Q: ${abcQ}\n` : ''}` +
                abcHeaderComments +
                `K: ${abcK}\n` +
                `${abcBodiesArr[0]}`;

            outputUpdAbcArr.push(primaryHeaderStr);
            return;
        }

        let secondaryHeadersStr = '';

        secondaryHeadersStr += 
            isSkippingAbcTitleEditAllowed?
            `\n${abcUpdTitlesArr[i].split('\nT: ').join(' / ')}\n` :
            `\n${abcTitlesArr[i].split('\nT: ').join(' / ')}\n`;

        secondaryHeadersStr += 

            headerArr.filter(
                header => !header.startsWith("T:")
            ).join('\n');

        secondaryHeadersStr += 

            secondaryHeadersStr.match(/^K:[ ]*[a-zA-Z#♯♭]+/gm)? 
                `\n${abcBodiesArr[i]}` :

            secondaryHeadersStr.match(/K:[ ]*$/)?
                getLastAbcHeaderValueOfKind(outputUpdAbcArr, "K") +
                `\n${abcBodiesArr[i]}` :

                `${secondaryHeadersStr.match(/^[^T]:/gm)? '\n' : ''}` +
                `K: ${getLastAbcHeaderValueOfKind(outputUpdAbcArr, "K")}` +
                `\n${abcBodiesArr[i]}`;

        outputUpdAbcArr.push(secondaryHeadersStr);
    });

    let deepEditAbcOutput = '';

    const hasIndexedLines = outputUpdAbcArr.find(line => line.match(/\[\d\]/));
    const hasOnlyFirstIdxLines = !outputUpdAbcArr.find(line => line.match(/\[[2-9]\]/));

    if (hasIndexedLines && hasOnlyFirstIdxLines) {

        deepEditAbcOutput =
            outputUpdAbcArr.
                map(line => 
                    line.match(/^[ACO]:(?! C:| Set Leaders:)/)? 
                        line.replaceAll(/\s*\[\d\]\s*/g, '') : 
                        line.replaceAll(/\s*\[\d\]\s*/g, ' ')).
                join('');

        return deepEditAbcOutput;
    }

    deepEditAbcOutput = 
        outputUpdAbcArr.join('');

    return deepEditAbcOutput;
}

// Merge duplicate Set Tune headers into the primary tune header
// Account for abcjs-stackable and custom composite headers

function mergeSetHeaderFields(abcHeadersArr) {

    const mergedPrimaryArr = [];
    const filteredSecondaryArr = [];

    const tuneSetSize = abcHeadersArr.length;

    // Make a raw mixed array with primary header data
    // Map each line adding Tune No. index for numbering
    // Add all stackable ABC fields from secondary headers
    
    let mixedIndexedHeaderArr = [];

    abcHeadersArr.forEach((headerArr, index) => {

        const headerIndexArr =
            index === 0?
            headerArr.map(header => [header, 1]) :
            headerArr.filter(header => 
                header.match(/^[CSZNABDFGHOW]:/)).
                    map(header => [header, index + 1]);

        if (headerIndexArr.length) {

            mixedIndexedHeaderArr.push(headerIndexArr);
        }
    });

    // Check if there are secondary stackable headers

    const hasStackableHeaders = mixedIndexedHeaderArr.length > 1;

    mixedIndexedHeaderArr = mixedIndexedHeaderArr.flat();

    // Prepare used lines array
    // Keep track of processed line values sans indices

    const usedLinesArr = [];

    // Process mixed header array
    // Push processed lines to mergedPrimaryArr
    // Respect the insertion order of tags
    // Prioritize lines common to all tunes in the Set

    mixedIndexedHeaderArr.forEach(headerIndexArr => {

        const headerLine = headerIndexArr[0];
        if (usedLinesArr.includes(headerLine)) return;

        const tag = headerLine[0];

        // Handle technical and tune-critical tags
        // Include T: and R: tags and comment lines

        if (tag.match(/[TIPUVRMLQK%"]/)) {

            mergedPrimaryArr.push(headerLine);
            return;
        }

        // Handle custom composite N.S.S.S. headers

        if (headerLine.startsWith("C: C:") ||
            headerLine.startsWith("C: Set Leaders:")) {

            let mergedCCLine = '';
            let mergedSLine = '';

            const joinCCArr = 
                mixedIndexedHeaderArr.
                    filter(arr => arr[0].startsWith("C: C:"));

            const joinCSLArr = 
                mixedIndexedHeaderArr.
                    filter(arr => arr[0].startsWith("C: Set Leaders:"));

            // Process C: S: headers

            if (joinCCArr.length) {

                const strCArr = [];
                const strSArr = [];

                joinCCArr.forEach(ccArr => {
                    
                    strCArr.push(ccArr[0].replace(/C: C:[ ]*/, '').split(/; S:[ ]*/)[0] || "Trad[?]");
                    strSArr.push(ccArr[0].replace(/C: C:[ ]*/, '').split(/; S:[ ]*/)[1] || "Various");
                    usedLinesArr.push(ccArr[0]);
                });

                let strC = reduceArrToSlashSeparatedList(strCArr);
                let strS = reduceArrToSlashSeparatedList(strSArr);

                mergedCCLine = `C: C: ${strC}; S: ${strS}`;

                if (mergedCCLine.slice(3).length > 100) {

                    const splitLongSArr = strS.split(' / ');
                    let sLinePrefix = '';

                    if (splitLongSArr.length > 1 && splitLongSArr[0].includes(' + ')) {

                        sLinePrefix = `${splitLongSArr[0].split(' + ')[0]}; `;
                        splitLongSArr[0] = splitLongSArr[0].split(' + ')[1];
                    }

                    mergedCCLine = `C: C: ${strC}; S: See Notes`;

                    mergedSLine =
                        splitLongSArr.map(
                            (tagLine, i) => 
                                `${i > 0? ' /' : 'S:'} [${i + 1}] ${sLinePrefix}${tagLine}`
                        ).join('');
                }
            }

            let mergedCSLLine = '';
            let mergedNSLLine = '';
            
            // Process C: Set Leaders: headers
            
            if (joinCSLArr.length) {

                const strCSLArr = [];

                joinCSLArr.forEach(cslArr => {

                    strCSLArr.push(cslArr[0].replace('C: Set Leaders:', '').trim());
                    usedLinesArr.push(cslArr[0]);
                });

                if (strCSLArr.length === 1 || areAllArrValsTheSame(strCSLArr)) {

                    mergedCSLLine = 
                        `C: Set Leaders: ${strCSLArr[0]}`;
                }
                
                if (strCSLArr.length > 1) {

                    mergedCSLLine = 
                        'C: Set Leaders: See Notes';

                    mergedNSLLine = 
                        'N: Set Leaders: ' +
                        joinCSLArr.map(
                            ([tagLine, tagIdx], i) => 
                                `${i > 0? '\nN: Set Leaders: ' : ''}[${tagIdx}]${tagLine.replace('C: Set Leaders:', '')}`
                        ).join('');
                }
            }

            if (mergedCCLine) mergedPrimaryArr.push(mergedCCLine);
            if (mergedCSLLine) mergedPrimaryArr.push(mergedCSLLine);
            if (mergedNSLLine) mergedPrimaryArr.push(mergedNSLLine);
            if (mergedSLine) mergedPrimaryArr.push(mergedSLine);

            return;
        }

        // Handle tags that abcjs displays as stacked columns

        if (tag.match(/[CSZNABDFGHOW]/)) {

            // Exclude custom composite headers from the filter

            const tagMatch = 
                new RegExp(`^${tag}:(?! ${tag}:| Set Leaders:)`);

            // Get a Map of line-index pairs filtered by tag
            // Group lines by their value to avoid duplication

            const joinMeArr = 
                mixedIndexedHeaderArr.
                    filter(arr => arr[0].match(tagMatch));

            const joinMeMap = new Map();

            joinMeArr.forEach(([tagLine, tagIdx]) => {

                if (!joinMeMap.has(tagLine)) {

                    joinMeMap.set(tagLine, []);
                }

                joinMeMap.get(tagLine).push(tagIdx);
            });

            // Get a sorted array from map's entries
            // Ensures common headers come before unique

            const sortedLineMap = 
                Array.from(joinMeMap.entries()).
                    sort((a, b) => b[1].length - a[1].length);

            sortedLineMap.forEach(([tagLine, tagIdxs]) => {

                if (usedLinesArr.includes(tagLine)) return;

                // Handle header lines common for all tunes

                const uniqueIndices = new Set(tagIdxs);

                if (uniqueIndices.size === tuneSetSize) {

                    mergedPrimaryArr.push(tagLine);
                    usedLinesArr.push(tagLine);
                    return;
                }

                // Handle unmerged lines containing hyperlinks

                if (tagLine.includes('http')) {

                    let idxStr = '';

                    if (hasStackableHeaders) {

                        [...uniqueIndices].sort((a, b) => a - b).forEach((tuneNo, index) => {
                            
                            idxStr += `${index === 0? ' ' : ''}[${tuneNo}]`;
                        });
                    }

                    mergedPrimaryArr.push(
                        `${tag}:${idxStr} ${tagLine.replace(`${tag}: `, '')}`
                    );
                    usedLinesArr.push(tagLine);
                    return;
                }

                // Handle the remaining mixed and unique header lines
                // Merge header lines to a slash-separated string
                // Each substring contains header text and tune No

                const filteredLineMap = 
                    joinMeArr.filter(([line]) => 
                        !usedLinesArr.includes(line) && !line.includes('http')).
                            sort((a, b) => a[1] - b[1]);

                let mergedTagStr = '';

                filteredLineMap.forEach(([tagLine, tagIdx], index) => {
                    
                    usedLinesArr.push(tagLine);

                    let idxStr = hasStackableHeaders? ` [${tagIdx}]` : '';

                    if (index === 0) {

                        mergedTagStr += 
                            "CAO".includes(tag)? `${tagLine}${idxStr}` :
                            `${tag}:${idxStr} ${tagLine.replace(`${tag}: `, '')}`
                        return;
                    }

                    mergedTagStr +=
                        "CAO".includes(tag)? ` / ${tagLine.replace(`${tag}: `, '')}${idxStr}` :
                        ` /${idxStr} ${tagLine.replace(`${tag}: `, '')}`
                });

                mergedPrimaryArr.push(mergedTagStr);
            });
        }
    }); 

    // Filter secondary header data

    [...abcHeadersArr].slice(1).forEach((headerArr, index) => {

        filteredSecondaryArr[index] = 
            [headerArr.filter(header => 
                header.match(/^(?:[TIPUVRMLQK]:)|%/))];
    });

    const primaryHeaderOutput = mergedPrimaryArr.flat();

    const secondaryHeaderOutput = filteredSecondaryArr.flat();

    return [primaryHeaderOutput, ...secondaryHeaderOutput];
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

// Restore non-breaking spaces in a processed string using the original string

function restoreNonBreakSpacesInStr(originalStr, processedStr) {

    let outputNbspStr = '';

    let j = 0;
    
    for (let i = 0; i < originalStr.length && j < processedStr.length; i++, j++) {

        if (originalStr[i] === '\u00A0' && processedStr[j] === ' ') {

            outputNbspStr += '\u00A0';

        } else {

            outputNbspStr += processedStr[j];
        }
    }
    
    outputNbspStr += processedStr.slice(j);

    return outputNbspStr;
}

// Find the last ABC header field value with the matching tag
// Account for nested ABC arrays and arrays of ABC strings

function getLastAbcHeaderValueOfKind(abcArr, tag) {

    const tagLineMatch = new RegExp(`^${tag}:`, 'gm');

    if (!abcArr || !tag) return '';

    // Handle nested ABC array (headers already split)

    if (Array.isArray(abcArr[0])) {

        const matchingLinesArr = 
            abcArr.map(linesArr =>
                linesArr.filter(line => line.match(tagLineMatch))).
                flat();

        const lastMatchingTagLine =
            matchingLinesArr[matchingLinesArr.length - 1];

        const tagLineValue = 
            lastMatchingTagLine.replace(`${tag}:`, '').trim();

        return tagLineValue;
    }

    // Handle array of ABC strings (headers need to be split)

    if (abcArr.find(abc => abc.match(tagLineMatch))) {

        const matchingTunesArr =
            abcArr.filter(abc => abc.match(tagLineMatch));

        const lastMatchingTune =
            matchingTunesArr[matchingTunesArr.length - 1];

        const matchingLinesArr = 
            lastMatchingTune.split('\n').filter(line => line.match(tagLineMatch));

        const lastMatchingTagLine =
            matchingLinesArr[matchingLinesArr.length - 1];

        const tagLineValue = 
            lastMatchingTagLine.replace(`${tag}:`, '').trim();

        return tagLineValue;
    }

    return '';
}

////////////////////////////////
// ENCODE ABC FUNCTIONS
///////////////////////////////

// Pass ABC contents to Sort and Encode functions, return a JSON array of objects

async function getEncodedAbc(abcContent, fileName) {

    // Verify that localStorage is available
    const customSettingsOn = localStorageOk();

    let sortedAbcContent = [];

    if (customSettingsOn && +localStorage.abcEncodeSortsTuneBook) {

        sortedAbcContent = await saveAbcEncoderOutput(abcContent, fileName, "abc-sort");

    } else {

        sortedAbcContent = [abcContent];
    }

    if (sortedAbcContent[0]?.length > 0) {

        console.log("ABC Encoder:\n\nEncoding ABC file contents...\n\n" + `[Source: ${fileName}]`);

        displayNotification("Encoding ABC file contents...");

        const encodedAbcOutput = customSettingsOn && +localStorage.abcEncodeOutputsAbcToolsString?

            `const tunes=${JSON.stringify(encodeTunesForAbcTools(sortedAbcContent[0]))};` :

            JSON.stringify(encodeTunesForAbcTools(sortedAbcContent[0]), null, 2);

        let encodedAbcTunesOutput = '';

        if (customSettingsOn && +localStorage.abcSortExportsTunesFromSets && sortedAbcContent[1]?.length > 0) {

            encodedAbcTunesOutput = +localStorage.abcEncodeOutputsAbcToolsString?
            
            `const tunes=${JSON.stringify(encodeTunesForAbcTools(sortedAbcContent[0]))};` :
            
            JSON.stringify(encodeTunesForAbcTools(sortedAbcContent[1]), null, 2);
        }

        return [encodedAbcOutput, encodedAbcTunesOutput];
    }
}

// Encode ABC contents into ABC Tools-readable URL using lz-string, extract
// Tune Name, Tune Type and Set Leaders, return data in an array of objects
// Additionally extract Subtitles for Tune / Set if secondary titles found

function encodeTunesForAbcTools(abcContent) {

    try {

        const rawAbcArr = abcContent.split('X:').filter(abc => abc !== '');

        const encodedAbcArr = [];

        const isForAbcToolsWebsite = +localStorage.abcEncodeOutputsAbcToolsString;

        // Extract Tune Name, Tune Type and Set Leaders custom keys, push to JSON object

        for (let i = 0; i < rawAbcArr.length; i++) {

            const splitTuneArr = rawAbcArr[i].split('\n');

            encodedAbcArr[i] = {};

            splitTuneArr.forEach(tuneLine => {

                if (isForAbcToolsWebsite) {

                    if (tuneLine.startsWith('T:') && !encodedAbcArr[i].Name) {

                        encodedAbcArr[i].Name = tuneLine.split('T:')[1].trim();
                    }                    
                    return;
                }
                
                if (tuneLine.startsWith('T:') && !encodedAbcArr[i].name) {

                    // Extract primary title

                    const abcPrimaryTitle = tuneLine.split('T:')[1].trim();

                    encodedAbcArr[i].name = abcPrimaryTitle;

                    // Extract secondary titles

                    const subTitlesArr =
                        splitTuneArr.filter(line => line.match(/^T:.*/)).slice(1);

                    let subTitlesStr = '';

                    if (subTitlesArr.length) {

                        subTitlesStr = 
                            subTitlesArr.
                                map(title => title.replace(/T:\s*/, '')).
                                join('; ');
                    }

                    encodedAbcArr[i].subtitles = subTitlesStr;
                }

                if (tuneLine.startsWith('R:') && !encodedAbcArr[i].type) {

                    const tuneTypeArr =
                        tuneLine.split('R:')[1].
                        trim().split(/[\s,-]/);

                    let tuneType = '';

                    tuneType =
                        tuneTypeArr.filter(word => word !== '').
                        map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).
                        join(' ');

                    encodedAbcArr[i].type = tuneType;
                }

                if (tuneLine.startsWith('C: Set Leaders:') && !encodedAbcArr[i].leaders) {

                    encodedAbcArr[i].leaders = tuneLine.split('C: Set Leaders:')[1].trim();
                }
            });

            // If tune name includes TYPE: prefix that does not match Tune Type, replace it with Custom Type

            if (!isForAbcToolsWebsite && encodedAbcArr[i].name.match(/^.*:/)) {

                const customTuneTypeProperCase = makeStringProperCase(encodedAbcArr[i].name.split(':')[0]);

                if (encodedAbcArr[i].type !== customTuneTypeProperCase) {

                    encodedAbcArr[i].type = customTuneTypeProperCase;
                }
            }

            // Generate URL to Michael Eskin's ABC Tools with default parameters

            const encodedAbcString = LZString.compressToEncodedURIComponent(`X:${rawAbcArr[i].replaceAll(/(\r?\n\n|\r?\n\r\n)/g, '')}`);

            const encodedAbcTitle = isForAbcToolsWebsite? encodedAbcArr[i].Name.replaceAll(' ', '_') : encodedAbcArr[i].name.replaceAll(' ', '_');

            const abcToolsUrl = `https://michaeleskin.com/abctools/abctools.html?lzw=${encodedAbcString}&format=noten&ssp=10&name=${encodedAbcTitle}`;

            if (isForAbcToolsWebsite) {

                encodedAbcArr[i].URL = abcToolsUrl;

            } else {

                encodedAbcArr[i].url = abcToolsUrl;
            }
        }

        console.log("ABC Encoder:\n\nABC file contents encoded!");

        return encodedAbcArr;

    } catch (error) {

        console.warn("ABC Encoder:\n\nFailed to encode ABC!\n\n", { cause: error });

        displayNotification("Failed to encode ABC", "error");

        addEncoderWarningMsg = "Encoding ABC failed";
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

export function makeTunesFromSets(abcSetsArr) {

    console.log(`ABC Encoder:\n\nConverting ABC Sets data into Tunes...`);

    const isStrictDetectMode = localStorageOk() && !!+localStorage.abcSortUsesStrictTuneDetection;

    const abcTuneGroupsArr = abcSetsArr.map(abcSet => 

        abcSet.match(isStrictDetectMode? matchIndividualTunesStrict : matchIndividualTunesLax)

    ).filter(Boolean);

    const abcTunesArr = abcTuneGroupsArr.map(abcSetArr =>

        abcSetArr.map(tuneSet => {

            const abcIndex = abcSetArr.indexOf(tuneSet);

            return addCustomAbcFields(tuneSet, abcSetArr, true, abcIndex);

        }).filter(Boolean)
    );

    return abcTunesArr.flat(Infinity);
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
// IMPORT FILE FUNCTIONS
///////////////////////////////

// Process Settings JSON and restore user settings

function restoreEncoderSettingsFromFile(importFileData) {

    if (!localStorageOk()) return;

    try {

        const settingsJson = JSON.parse(importFileData);
        const settingsObj = settingsJson[0];

        for (const key in settingsObj) {

            localStorage[key] = settingsObj[key];
        }

    } catch (error) {

        displayNotification("Error parsing imported settings file", "error");
        console.error("ABC Encoder:\n\nParsing settings file data failed\n\n", error);
    }

    initAppCheckBoxes(true);
    restoreEncoderSettingsInputs();

    displayNotification("ABC Encoder settings have been restored", "success");
    console.log("ABC Encoder:\n\nEncoder settings restored");
}

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

    const splitAbcArr = abcContent.split(/X:[ ]*/);
    let updatedAbcContent = '';

    console.log("ABC Encoder:\n\nUpdating ABC output with Session Survey Data...");

    splitAbcArr.forEach(abc => {

        if (!abc) return;

        const abcTitle = abc.match(/^T:.*/gm)[0].replace('T:', '').trim();
        const abcTitleArr = abcTitle.split(/:[ ]*/);

        const titleName = abcTitleArr[1]? abcTitleArr[1] : abcTitleArr[0];
        const titlePrefix = abcTitleArr[1]? abcTitleArr[0] : '';

        let updatedAbc = '';

        // Get a string of current Set Leaders
        const abcSetLeadersStr =
            abc.match(/^C: Set Leaders:.*/gm)[0]?.
            replace('C: Set Leaders:', '').trim();

        // Create an array of Set Leaders or an empty array
        const abcSetLeadersArr = 
            abcSetLeadersStr? abcSetLeadersStr.split(', ') : [];

        // Search Survey Data headers for the current Tune / Set
        const surveyHeader = titlePrefix? 
            sessionSurveyData[0].find(header => 
                header.toLowerCase().startsWith(titlePrefix.toLowerCase()) &&
                header.endsWith(titleName)) :
            sessionSurveyData[0].find(header => 
                header.startsWith(titleName));

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

export function initEncoderSettings(isHardReset) {

    initSettingsFromObject(abcEncoderDefaults, isHardReset);
    initEncoderSettingsInputs();
}

// Reset ABC Encoder settings and input values to defaults

export function resetEncoderSettings() {

    if (!encoderSettings || !localStorageOk()) return;

    initEncoderSettings(true);
    initAppCheckBoxes(true);

    localStorage.abcSortReSortsByLastTagValue = "R";
    inputSortAbcTag.value = '';

    displayNotification("Encoder settings have been reset to defaults", "success");
    console.log('ABC Encoder:\n\nEncoder settings reset to defaults');
}

// Restore last saved values of ABC Encoder settings inputs

function restoreEncoderSettingsInputs() {

    if (!encoderSettings || !localStorageOk()) return;

    const lastInputVal = localStorage.abcSortReSortsByLastTagValue;

    if (lastInputVal && lastInputVal.match(/^[ABCDFGHIKLMNOPQRSTUVWZ]/)) {

        inputSortAbcTag.value = lastInputVal;

    } else {

        inputSortAbcTag.value = '';
    }
}

// Initialize inputs in ABC Encoder settings

function initEncoderSettingsInputs() {

    if (!encoderSettings) return;

    inputSortAbcTag.addEventListener('input', filterInputSortAbcTag);

    restoreEncoderSettingsInputs();
}