///////////////////////////////////////////////////////////////////////
// Novi Sad Session ABC Encoder Module
// https://github.com/anton-bregolas/
// (c) Anton Zille 2024-2025
///////////////////////////////////////////////////////////////////////

import { apStyleTitleCase } from './scripts-3p/ap-style-title-case/ap-style-title-case.js';
import { LZString } from './scripts-3p/lz-string/lz-string.min.js';
import { limitFunction } from './scripts-3p/p-limit/p-limit.js'
import { pThrottle } from './scripts-3p/p-throttle/p-throttle.js'
import { fetchData, initSettingsFromObject, showRedOutlineWarning } from './scripts-ns-sessions.js';

////////////////////////////////
// ABC ENCODER GLOBAL SETTINGS
///////////////////////////////

// Default ABC Encoder Settings
// Set via initEncoderSettings on first load

export const abcEncoderDefaults = {

    abcEncoderExportsTuneList: "1",
    abcEncoderSortsTuneBook: "0",
    abcSortExportsTunesFromSets: "1",
    abcSortExportsChordsFromTunes: "1",
    abcSortFetchesTsoMetaData: "0",
    abcSortNormalizesAbcPartEndings: "1",
    abcSortRemovesLineBreaksInAbc: "0",
    abcSortRemovesTextAfterLineBreaksInAbc: "0"
};

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

    { string: "an súisin bán", override: "An Súisin Bán" },
    { string: "casadh an tsúgáin", override: "Casadh an tSúgáin" },
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

        // Optional: Save plain text Tunelist generated from source ABC

        if (+localStorage.abcEncoderExportsTuneList === 1) {

            downloadAbcFile(exportPlainTuneList(abcEncoderOutput), "Tunelist[Source].txt");
        }

        // Optional: Save additional JSON array of objects containing all individual Setlist Tunes encoded

        if (+localStorage.abcSortExportsTunesFromSets === 1 && abcEncoderTunesOutput !== '') {

            downloadAbcFile(abcEncoderTunesOutput, "tunes.json");

            // Optional: Save plain text Tunelist of all individual Setlist Tunes from source ABC

            if (+localStorage.abcEncoderExportsTuneList === 1) {

                downloadAbcFile(exportPlainTuneList(abcEncoderTunesOutput), "Tunelist[Tunes].txt");
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

        if (+localStorage.abcSortFetchesTsoMetaData === 1) {

            let preProcessedAbc = await preProcessAbcMetadata(rawAbcContent);

            abcSortedOutput = getSortedAbc(preProcessedAbc);

        } else {

            abcSortedOutput = getSortedAbc(rawAbcContent);
        }

        abcEncoderOutput = abcSortedOutput[0];
        abcEncoderTunesOutput = abcSortedOutput[1]

        // Optional: Save additional ABC file containing all individual Setlist Tunes

        if (+localStorage.abcSortExportsTunesFromSets === 1 && abcEncoderTunesOutput !== '') {
            
            downloadAbcFile(abcEncoderTunesOutput, "NS-Session-Tunes.abc");

            // Optional: Save additional Chordbook JSON containing extracted chords arranged as Tunelist

            if (+localStorage.abcSortExportsChordsFromTunes === 1 && abcSortedOutput[3] !== '') {

                downloadAbcFile(abcSortedOutput[3], "chords-tunes.json", "abc-extract-chords");
            }
        }

        // Optional: Save additional Chordbook JSON containing extracted chords arranged as Setlist

        if (+localStorage.abcSortExportsChordsFromTunes === 1 && abcSortedOutput[2] !== '') {

            downloadAbcFile(abcSortedOutput[2], "chords.json", "abc-extract-chords");
        }
    }

    // Save main ABC Encoder output file
    downloadAbcFile(abcEncoderOutput, fileName, taskType);

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

                    showRedOutlineWarning(triggerBtn);

                    return;
                }

                saveAbcEncoderOutput(rawAbcContent, rawAbcFile.name, taskType);

            } catch (error) {

                console.error("ABC Encoder:\n\nError reading ABC file content:\n\n", error);

                showRedOutlineWarning(triggerBtn);
            }
        }
        
        fileInput.click();

    } catch (error) {

        console.error("ABC Encoder:\n\nParsing sequence failed!\n\n", error);

        showRedOutlineWarning(triggerBtn);
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

    const abcFile = new Blob([abcContent], { type: taskType === "abc-encode" || taskType === "abc-extract-chords"? "application/json" : "text/plain" });
    const abcFileName = taskType === "abc-encode" && fileName.startsWith("NS-Session-Sets") ? "sets.json" :
                        taskType === "abc-encode" && fileName.startsWith("NS-Session-Tunes") ? "tunes.json" :
                        taskType === "abc-encode" ? "ABC-ENCODED.json" :
                        taskType === "abc-decode" && fileName.startsWith("sets") ? "NS-Session-Sets.abc" :
                        taskType === "abc-decode" && fileName.startsWith("tunes") ? "NS-Session-Tunes.abc" :
                        taskType === "abc-decode" ? "ABC-DECODED.abc" :
                        taskType === "abc-sort" && !fileName.startsWith("NS-Session") && !fileName.startsWith("ABC-SORTED") ? `${fileName.split('.')[0]} [ABC-SORTED].abc` :
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

    if (!rawAbcContent.includes('https://thesession.org/')) {

        return rawAbcContent;
    }

    // Process ABC items - Sets or Tunes - containing fetchable links to The Session

    let preProcessedAbcArr = rawAbcContent.split('X:');

    console.log('ABC Encoder:\n\nChecking ABC for links to The Session with fetchable metadata...');

    preProcessedAbcArr = await Promise.all(preProcessedAbcArr.map(async (abcItem) => {
    
        if (!abcItem || abcItem.includes('at The Session')) {
            
            return abcItem;
        }

        const tsoSetUrlArr = abcItem.match(/https:\/\/thesession\.org\/members\/[0-9]+\/sets\/[0-9]+/g);
        const tsoSettingUrlArr = abcItem.match(/https:\/\/thesession\.org\/tunes\/[0-9]+#setting[0-9]+/g);
        
        if (!tsoSetUrlArr && !tsoSettingUrlArr) {
            
            return abcItem;
        }
        
        let abcZString = abcItem.match(/^Z:.*ed\.;/m)? `${abcItem.match(/^Z:.*ed\.;/m)[0]} ` : 'Z: [Unedited]; ';
        
        // Process links to TSO settings via fetchTsoMetadata: fetch JSON data to an array, reduce it to string

        abcZString += tsoSetUrlArr && tsoSetUrlArr.length > 0? await fetchTsoMetadata(tsoSetUrlArr, "set") :
                      tsoSettingUrlArr && tsoSettingUrlArr.length > 0? await fetchTsoMetadata(tsoSettingUrlArr, "setting") : '';

        abcZString = `${abcZString} at The Session`;

        // Replace the first found Z: field in ABC or insert Z: field value before N: or R:

        if (abcItem.match(/^Z:/m)) {

            return abcItem.replace(/^Z:.*/m, `${abcZString}`);

        } else if (abcItem.match(/^N:/m)) {

            return abcItem.replace(/^N:/m, `${abcZString}\nN:`);

        } else if (abcItem.match(/^R:/m)) {

            return abcItem.replace(/^R:/m, `${abcZString}\nR:`);
        }
    }));

    return preProcessedAbcArr[1]? preProcessedAbcArr.join('X:') : rawAbcContent;
}

// Fetch metadata from an array of links to The Session Sets or Settings
// Limit the number of concurrent requests with throttleTsoRequests

async function fetchTsoMetadata(urlArr, urlType) {

    let tsoJsonUrl = '';
    let tsoMetaDataOutput = '';
    
    const tsoMetaDataArr = await Promise.all(urlArr.map(throttleTsoRequests(async (url) => {
        
        tsoJsonUrl = urlType === "setting"? `${url.split('#')[0]}?format=json` : 
        urlType === "set"? `${url}?format=json` : '';
        
        if (!tsoJsonUrl) return;
        
        console.log('ABC Encoder:\n\nFetching metadata from The Session...');
        // console.log('ABC Encoder:\n\nFetching metadata from The Session for...' + '\n\n' + url);

        let tsoMetaData = '';

        const tsoJsonObj = await fetchData(tsoJsonUrl, "json");

        if (urlType === "setting") {

            const tsoSettingId = +url.split('#setting')[1];

            tsoMetaData = tsoJsonObj.settings.find(setting => setting.id === tsoSettingId)?.member.name;
        }

        if (urlType === "set") {

            const tsoSetMetaDataArr = tsoJsonObj.settings.map(setting => {
                
                return setting.member.name || 'Anon.';
            });

            tsoMetaData = reduceArrToSlashSeparatedList(tsoSetMetaDataArr);
        }

        return tsoMetaData || 'Anon.';
    })));

    tsoMetaDataOutput += reduceArrToSlashSeparatedList(tsoMetaDataArr);

    return tsoMetaDataOutput;
}

////////////////////////////////
// SORT ABC FUNCTIONS
///////////////////////////////

// Sort, filter and renumber raw ABC contents and return a string of ABCs

function getSortedAbc(abcContent) { 

    console.log("ABC Encoder:\n\nSorting ABC file contents...");

    const sortedAbcContentArr = sortFilterAbc(abcContent);

    if (sortedAbcContentArr[0]?.length > 0) {

        const sortedAbcOutput = sortedAbcContentArr[0].join('\n\n');

        let sortedAbcTunes = '';
        let sortedAbcChords = '';
        let sortedAbcTuneChords = '';

        console.log("ABC Encoder:\n\nABC file contents sorted!");

        if (+localStorage.abcSortExportsChordsFromTunes === 1) {

            console.log(`ABC Encoder:\n\nExtracting Chords from ABC...`);

            sortedAbcChords = makeAbcChordBook(sortedAbcOutput);
        }

        if (sortedAbcContentArr[1]?.length > 0) {

            sortedAbcTunes = sortedAbcContentArr[1].join('\n\n');

            if (+localStorage.abcSortExportsChordsFromTunes === 1) {

                console.log(`ABC Encoder:\n\nExtracting Chords from ABC Tunes...`);

                sortedAbcTuneChords = makeAbcChordBook(sortedAbcTunes);
            }
        }

        return [sortedAbcOutput, sortedAbcTunes, sortedAbcChords, sortedAbcTuneChords];

    } else {

        console.warn("ABC Encoder:\n\nNo valid ABC data found after sorting");
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

        const sortedAbcArr = uniqueAbcArr.sort().map(abc => `X: ${uniqueAbcArr.indexOf(abc) + 1}\n${addCustomAbcFields(abc)}`);

        // Filter and sort an additional array of Tunes if abcContent contains Sets and abcSortExportsTunesFromSets setting is on

        let sortedAbcTunesArr = [];
        
        if (+localStorage.abcSortExportsTunesFromSets === 1 && uniqueAbcArr[0].match(/^T:/gm).length > 2) {

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

        // Option A: Also remove all empty lines inside ABCs

        if (+localStorage.abcSortRemovesLineBreaksInAbc === 1) {

            return [removeLineBreaksInAbc(sortedTidyAbcArr), removeLineBreaksInAbc(sortedAbcTunesArr)];
        }

        // Option B: Also remove all text separated by empty lines inside ABCs

        if (+localStorage.abcSortRemovesTextAfterLineBreaksInAbc === 1) {

            return [removeTextAfterLineBreaksInAbc(sortedTidyAbcArr), removeTextAfterLineBreaksInAbc(sortedAbcTunesArr)];
        }

        // Default option: Return sorted ABCs as is (everything in-between X: fields)

        return [sortedTidyAbcArr, sortedAbcTunesArr];

    } catch (error) {

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
                // console.warn(`Exception found! Output: ${titleOverride}`);
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

    const isSet = abcContent.match(/^T:/gm).length > 2;

    if (abcR && abcBasicTuneTypes.includes(abcR.toLowerCase())) {

        let tuneTypeSuffix = '';

        if (isSet) {
    
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

// Scan ABC Body for R: and T: fields and process them accordingly

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

// Process ABC Primary Title (single or multi-line)
// Make selected ABC field text Title Case
// Remove articles to make ABC sort-friendly
// Optional: Add TYPE: prefix to ABC Title

function processAbcTitle(abcTitle, abcTitlePrefix) {

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

    let abcTitleOutput = `T: ${formattedPrefix}${formattedTitle}`;

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

function processAbcCCS(abcCCS, abcIndex) {
    
    let abcCArr = abcCCS.split('S:')[0]?.replace(';', '').split('/');
    let abcSTxt = abcCCS.split('S:')[1];

    let abcSArr = abcSTxt && abcSTxt.includes('+')? 
        abcSTxt.split('+')[1].split('/').map(str => `${abcSTxt.split('+')[0].trim()}; ${str.trim()}`) :
        abcSTxt ? abcSTxt.split('/') : [];
    
    let abcC = abcCArr && abcCArr.length > 0? getValueByAbcIndex(abcCArr, +abcIndex).trim() : '';
    let abcS = abcSArr && abcSArr.length > 0? getValueByAbcIndex(abcSArr, +abcIndex).trim() : '';

    return `${abcC? abcC : 'Trad.'}; S: ${abcS? abcS : 'Various'}`;
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

    const abcContentTitle = abcContent.match(/(?<=^T:).*/m)[0].trim();

    let updatedAbc = abcContent;

    let abcTitle = '';

    // Separate primary ABC Title(s) from the rest of the ABC

    do {
        abcTitle += `${updatedAbc.match(/^T:.*/)[0]}\n`;
        updatedAbc = updatedAbc.replace(/^T:.*/, '').trim();

    } while (updatedAbc.startsWith("T:"));

    // Derive ABC Tune Type from ABC R: field or TYPE: prefix

    let abcR = abcContent.match(/(?<=^R:).*/m)? abcContent.match(/(?<=^R:).*/m)[0].trim() : abcTitle.includes('[')? abcTitle.match(/\[.*?\]/)[0].replace('[', '').replace(']', '') : '';

    let abcTitlePrefix = abcTitle.match(/^T:.*:/)? abcTitle.match(/(?<=^T:).*(?=:)/)[0].trim().toUpperCase() : makeTuneTypePlural(abcContent, abcR);

    let abcTitleSuffix = abcContent.match(/^T:/gm).length > 2 && !abcContentTitle.toUpperCase().endsWith("SET")? " Set" : '';

    let abcTuneType = abcR? makeStringProperCase(abcR) : makeTuneTypeSingular(abcTitlePrefix);

    // Standardise format of part endings in ABC body

    if (+localStorage.abcSortNormalizesAbcPartEndings === 1) {
   
        updatedAbc = processPartEndings(updatedAbc);
    }
        
    // QUICK EDIT CASE:

    const abcCustomFieldsLayout = /^C: C:.*[\s]*C: Set Leaders:.*[\s]*Z:.*[\s]*(N:.*[\s]*)*R:.*[\s]*M:.*[\s]*L:.*[\s]*Q:.*[\s]*K:.*[\s]*/gm;

    // Return ABC with processed Title and R: fields if all custom fields are already in place

    if (!abcMatch && updatedAbc.match(abcCustomFieldsLayout)) {

        let updatedAbcTitle = processAbcTitle(abcTitle, abcTitlePrefix) + abcTitleSuffix;

        updatedAbc = formatAbcBodyTitles(updatedAbc);

        return `${updatedAbcTitle}\n${updatedAbc}`;
    }

    // DEEP EDIT CASE:

    // Define variables to store custom ABC fields data

    let abcCSL = abcContent.match(/(?<=^C: Set Leaders:).*/m)? abcContent.match(/(?<=^C: Set Leaders:).*/m)[0].trim() : '';
    let abcCCS = abcContent.match(/(?<=^C: C:).*/m)? abcContent.match(/(?<=^C: C:).*/m)[0].trim() : '';
    let abcZ = abcContent.match(/(?<=^Z:).*/m)? abcContent.match(/(?<=^Z:).*/m)[0].trim() : '';
    let abcN = abcContent.match(/(?<=^N:).*/m)? abcContent.match(/(?<=^N:).*/gm) : [];
    let abcM = abcContent.match(/(?<=^M:).*/m)? abcContent.match(/(?<=^M:).*/m)[0].trim() : '';
    let abcL = abcContent.match(/(?<=^L:).*/m)? abcContent.match(/(?<=^L:).*/m)[0].trim() : '';
    let abcQ = abcContent.match(/(?<=^Q:).*/m)? abcContent.match(/(?<=^Q:).*/m)[0].trim() : '';
    let abcK = abcContent.match(/(?<=^K:).*/m)? abcContent.match(/(?<=^K:).*/m)[0].trim() : '';
    
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

            abcZ = processAbcZ(abcZ, abcIndex);
            abcCCS = processAbcCCS(abcCCS, abcIndex);
        }
    }
    
    // Update primary ABC title to match TYPE: Title format
    
    abcTitle = processAbcTitle(abcTitle, abcTitlePrefix) + abcTitleSuffix;
    
    let abcSubTitle = abcContent.match(/^T:/gm).length > 2? `T: ${abcTitle.match(/(?<=T:.*:[\s]+).*?(?=[,]|$)/)}\n` : '';
    
    // Remove all ABC header text and reconstruct ABC fields in the correct order
    
    let abcBody = updatedAbc.replace(/^(?:[A-Z]:.*\r?\n)*/, '');
    
    let abcHeaders = '';
    let abcNotes = '';
    
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
            case "mazurka":
                abcQ = "1/4=146";
                break;

            case "jig":
            case "single jig":
                abcQ = "3/8=116";
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

        abcNotes = `N: \n`;
    }

    // Add ABC Transcription field if missing, fill in the default value

    if (!abcZ) {

        abcZ = "[Unedited]; The Session";
        // console.log(`ABC Encoder:\n\nMissing Z: field added to ${abcContentTitle}`);
    }

    // Add C: C: S: Composer and Source field if missing, fill in the default value
    
    if (!abcCCS) {

        abcCCS = "Trad.; S: Various"
        // console.log(`ABC Encoder:\n\nMissing C: / S: field added to ${abcContentTitle}`);
    }

    // Combine all ABC fields after Title(s) into an ordered headers string

    abcHeaders = `C: C: ${abcCCS}\nC: Set Leaders: ${abcCSL}\nZ: ${abcZ}\n${abcNotes}R: ${abcTuneType}\nM: ${abcM}\nL: ${abcL}\nQ: ${abcQ}\nK: ${abcK}`;

    // Format ABC Body Titles and Tune Types

    abcBody = formatAbcBodyTitles(abcBody);

    // Return ABC with updated Title and fields

    return `${abcTitle}\n${abcSubTitle}${abcHeaders}\n${abcBody}`;
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

    const matchPattern = new RegExp(`^${fieldName}:.*\r?\n`, 'gm');

    const fieldMatchArr = abcContent.match(matchPattern);
    
    if (fieldMatchArr && 
        fieldMatchArr.length > 1 && 
        areAllArrValsTheSame(fieldMatchArr)) {

        return abcContent.replace(matchPattern, (match, offset) => 
            offset === abcContent.indexOf(match)? match : '');
    }
}

////////////////////////////////
// ENCODE ABC FUNCTIONS
///////////////////////////////

// Pass ABC contents to Sort and Encode functions, return a JSON array of objects

async function getEncodedAbc(abcContent, fileName) {

    let sortedAbcContent = [];

    if (+localStorage.abcEncoderSortsTuneBook === 1) {

        sortedAbcContent = await saveAbcEncoderOutput(abcContent, fileName, "abc-sort");

    } else {

        sortedAbcContent = [abcContent];
    }

    if (sortedAbcContent[0]?.length > 0) {

        console.log("ABC Encoder:\n\nEncoding ABC file contents...\n\n" + `[Source: ${fileName}]`);

        const encodedAbcJson = JSON.stringify(encodeTunesForAbcTools(sortedAbcContent[0]), null, 2);

        let encodedAbcTunesJson = '';

        if (+localStorage.abcSortExportsTunesFromSets === 1 && sortedAbcContent[1]?.length > 0) {

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

    encodedAbcJson.forEach(abcObject => {

        let encodedAbcString = '';

        if (Object.hasOwn(abcObject, "url")) {

            encodedAbcString = abcObject.url?.match(/lzw=([^&]*)/)[0];

        } else if (Object.hasOwn(abcObject, "URL")) {

            encodedAbcString = abcObject.URL?.match(/lzw=([^&]*)/)[0];
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

        console.warn("ABC Encoder:\n\nNo valid ABC data found after sorting");
        return;
    }
}

////////////////////////////////
// CONVERT TUNEBOOK FUNCTIONS
///////////////////////////////

// Convert sets into separate tunes by adding missing ABC fields

function makeTunesFromSets(abcSetsArr) {

    console.log(`ABC Encoder:\n\nConverting ABC Sets data into Tunes...`);

    const abcTuneGroupsArr = abcSetsArr.map(abcSet => {

        if (abcSet.match(/MEDLEY/gi)) {

            abcSet = abcSet.replace(/T:/g, 'T:[MEDLEY]');
        }

        return abcSet.replace(/^T:.*\s/, '').match(/T:[\s\S]*?(?=(?:T:|$))/g);
    });

    const abcTunesArr = abcTuneGroupsArr.map(abcSetArr =>

        abcSetArr.map(tuneSet => {

            const abcIndex = abcSetArr.indexOf(tuneSet);

            const isMedley = tuneSet.includes('[MEDLEY]');

            if (isMedley) {

                tuneSet = tuneSet.replaceAll(/\[MEDLEY\]/g, '');
            }

            return addCustomAbcFields(tuneSet, abcSetArr[0], true, abcIndex, isMedley);
        })
    );

    const uniqueTunesMap = new Map(abcTunesArr.flat(Infinity).map(abc => ([abc.match(/^T:.*/)[0], abc])));

    const uniqueTunesArr = Array.from(uniqueTunesMap.values());

    return uniqueTunesArr;
}

// Convert N.S.S.S. list of Sets or Tunes into a Chordbook JSON
// Extract chords from each ABC item via getChordsFromTune

function makeAbcChordBook(abcContent) {

    let chordBookOutput = '';

    const splitAbcArr = abcContent.split(/X.*/gm)
                                  .filter(abc => abc != '')
                                  .filter(abc => abc.match(/"[\S]?"/) != null)
                                  .map(abc => abc.trim());

    const abcChordsArr = [];

    splitAbcArr.forEach(abc => {

        let abcChordsObj;
        let abcTitle = '';
        let abcMeter = '';
        let abcBody = '';

        if (abc.match(/^T:/gm).length > 2) {

            const abcPrimaryTitle = abc.match(/(?<=^T:).*/m)[0].trim();
            const abcTunesArr = abc.replace(/^T:.*/, '')
                                   .trim()
                                   .split('T:')
                                   .filter(Boolean)
                                   .map(tune => `T:${tune}`);

            abcChordsObj = { "setTitle": abcPrimaryTitle, "tuneChords": [] };

            abcTunesArr.forEach(tune => {

                abcBody = removeAbcHeadersAndCommands(tune);

                // Optional steps (needed for correct calculations)
                abcBody = convertAbcIntervalsToSingleNotes(abcBody);
                abcBody = normalizeAbcTriplets(abcBody);

                if (!abcBody.match(/".*"/)) {
                    return;
                }

                abcTitle = tune.match(/^.*/)[0].split(' / ')[0].trim();
                abcMeter = tune.match(/^M:/m)? tune.match(/(?<=^M:).*/m)[0].trim() : abc.match(/(?<=^M:).*/m)[0].trim();

                const tuneChordObj = getChordsFromTune(abcBody, abcTitle, abcMeter);

                abcChordsObj.tuneChords.push(tuneChordObj);
            });
        
        } else {

            abcTitle = abc.match(/(?<=^T:).*/m)[0].trim();
            abcMeter = abc.match(/(?<=^M:).*/m)[0].trim();

            abcBody = removeAbcHeadersAndCommands(abc);
            abcBody = convertAbcIntervalsToSingleNotes(abcBody);
            abcBody = normalizeAbcTriplets(abcBody);

            abcChordsObj = getChordsFromTune(abcBody, abcTitle, abcMeter);
        }

        if (abcChordsObj) {

            abcChordsArr.push(abcChordsObj);
        }
    });

    if (abcChordsArr.length > 0) {
        
        chordBookOutput = JSON.stringify(abcChordsArr, null, 2);
        
        console.log(`ABC Encoder:\n\nChordbook JSON generated!`);
    }
        
    return chordBookOutput;
}

// Extract chords from ABC Tune and return a single Chordbook object

function getChordsFromTune(abcBody, abcTitle, abcMeter) {

    const abcChordsObj = {};

    const abcPrimaryTitle = abcTitle.replace(/T:[\s]*/, '');

    abcChordsObj.title = abcPrimaryTitle;
    abcChordsObj.meter = abcMeter;

    const tuneMeter = abcMeter? abcMeter : "4/4";
    let minTuneBeats = 2;

    switch (tuneMeter) {
        case "2/2":
        case "2/4":
        case "4/4":
        case "6/8":
        case "12/8":
            minTuneBeats = 2;
            break;
        case "3/4":
        case "3/2":
        case "9/8":
            minTuneBeats = 3;
            break;
        default:
            break;
    }

    const abcPartsArr = abcBody.split('||');
    let partCounter = 0;
    let barCounter;
    let abcChords = '';

    abcPartsArr.forEach(abcPart => {

        partCounter++;
        barCounter = 0;

        const abcBarsArr = abcPart.split('|');

        let abcPartChords = '';

        abcBarsArr.forEach(abcBar => {

            if (!abcBar.match(/".+"/)) {

                return;
            }

            let voltaNo = '';

            if (abcBar.match(/^[\d]/)) {

                voltaNo = +abcBar[0] > 1? `\n|${abcBar[0]}` : abcBar[0];
            }

            if (barCounter >= 4 && !voltaNo) {

                abcPartChords += `|\n`;

                barCounter = 0;
            }
            const abcBarChordsArr = abcBar.match(/".*?"/g);
            
            abcPartChords += `|${voltaNo}\t${getCompleteAbcChordBar(abcBar, abcBarChordsArr, minTuneBeats, abcMeter)}`;

            barCounter++;
        });

        abcChords += abcPartChords? `\n\nPART ${partCounter}:\n${abcPartChords}||` : '';
    });

    abcChordsObj.chords = abcChords.trim();
    
    return abcChordsObj;
}

// Process an ABC bar of chords, completing missing chord-beats if necessary

function getCompleteAbcChordBar(abcBar, abcBarChordsArr, minTuneBeats, abcMeter) {

    let abcBarChordsInput = abcBarChordsArr.map(c => c.replaceAll(/[^a-zA-Z0-9#=_♯♭♮×/()+]/g, '')).filter(Boolean);

    if (abcBarChordsArr && abcBarChordsInput.length > 0) {

        // Handle cases of single chord per bar, ignore bars where the first chord-beat is missing
        if (abcBarChordsInput.length === 1 && abcBar.match(/^:*\d*[\s]*["]/)) {

            if (abcBarChordsInput[0].match(/\(.*\)/)) {

                return `${abcBarChordsInput[0].replaceAll(/\(.*?\)/g, '')}\t${(abcBarChordsInput[0].match(/\(.*\)/)[0] + '\t').repeat(minTuneBeats - 1)}`;
            }

            return `${abcBarChordsInput[0]}\t${(abcBarChordsInput[0] + '\t').repeat(minTuneBeats - 1)}`;
        }

        // Handle cases of fully-stacked chords per bar (3 chords for triple-time tunes, 2 or 4 chords for duple-time tunes)
        if (abcBarChordsInput.length === minTuneBeats || abcBarChordsInput.length === minTuneBeats * 2) {

            if (isTuneTripleMeter(abcMeter)) {

                return `${abcBarChordsInput.join('\t')}\t`;
            }

            if (abcBarChordsInput.length === minTuneBeats) {

                return `${abcBarChordsInput[0]}\t${abcBarChordsInput[1]}\t`;
            }
            
            return `${abcBarChordsInput[0]}\xa0${abcBarChordsInput[1]}\t${abcBarChordsInput[2]}\xa0${abcBarChordsInput[3]}\t`;
        }

        // Handle cases of incomplete chord-beats per bar (2 out of 3 chords for triple-time tunes, missing first chord-beat for duple-time tunes)
        if (abcBarChordsInput.length < minTuneBeats) {

            return countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats, abcMeter);
        }

        // Handle cases of incomplete chord-beats per bar (3 out of 4 chords and/or missing first chord-beat for duple-/quadruple-time tunes)
        if (minTuneBeats < abcBarChordsInput.length < minTuneBeats * 2) {

            return countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats * 2, abcMeter);
        }

    } else {

        return '–\t';
    }
}

// Recover missing chord-beats by counting notes against beats and inserting the sufficient number of chords

function countBeatsInsertChords(abcBar, abcBarChordsInput, minTuneBeats, abcMeter) {

    let completeChordBar = '';

    const splitMeterArr = abcMeter.split('/');
    // Count the number of eighth notes per beat of tune
    const eightsPerBeat =  8 / splitMeterArr[1] * splitMeterArr[0] / minTuneBeats;
    // Filter the notes of the tune from chords, ABC notation symbols and spaces
    const notesBetweenChords = abcBar.split(/"[^"]*"/).map(fr => fr.replaceAll(/[^a-gxzA-G0-9/]/g, '')).filter(fr => fr.match(/^[a-gxzA-G]/));

    let beatCount = 0;

    let isMissingFirstBeat = abcBar.match(/^:*\d*[\s]*["]/)? 0 : 1;

    // Add indicator of missing first beat if no opening chord found
    if (isMissingFirstBeat) {

        completeChordBar += `–${minTuneBeats > 3? '\xa0' : `\t`}`;
        beatCount++;
    }

    // Iterate between groups of notes preceded by chords in source ABC
    // Separate notes, note multipliers (numbers not preceded by /) and note divisors (/, //... or /Num)
    // Calculate the total worth of eighth notes and count the beats for each group
    // Insert a chord of the same index as the group at the start of each beat
    if (notesBetweenChords.length > 0) {

        notesBetweenChords.forEach(abcFragment => {

            const countNotes = abcFragment.match(/[a-gxzA-G]/g).length;
            const countExtraMultiplierSum = abcFragment.match(/[^/]\d+/)? abcFragment.match(/[^/]\d+/g)?.map(match => match.slice(1)).map(num => num - 1).reduce((a, b) => a + b) : 0;
            const extraDivisorArr = abcFragment.includes('/')? abcFragment.match(/[/]+\d*/g) : [];
            const countSimpleDivisorSum = extraDivisorArr.length > 0 && extraDivisorArr.some(str => /[/](?=[^\d]|$)/.test(str))? extraDivisorArr.filter(str => str.match(/[/](?=[^\d]|$)/)).reduce((a, b) => a + (1 - (1 / Math.pow(2, b.length))), 0) : 0;
            const countAllExtraDivisorSum = extraDivisorArr.length > 0 && extraDivisorArr.some(str => /\d/.test(str))? extraDivisorArr.map(str => str.replaceAll(/[^\d]/g, '')).reduce((a, b) => a + (1 - (1 / b)), 0) + countSimpleDivisorSum : countSimpleDivisorSum;
            const countEights = countNotes + countExtraMultiplierSum - countAllExtraDivisorSum;
            const relatedChord = abcBarChordsInput[notesBetweenChords.indexOf(abcFragment)];
            
            let beatsInThisFragment = countEights / eightsPerBeat;

            // Handle chords placed with syncopation
            if (beatsInThisFragment % 1 !== 0) {

                beatsInThisFragment = beatsInThisFragment < 1? 1 : Math.floor(beatsInThisFragment);
            }

            // Add chords related to ABC fragment to completeChordBar string
            for (let n = 0; n < beatsInThisFragment; n++) {
                
                completeChordBar += relatedChord? `${relatedChord}${isTuneTripleMeter(abcMeter) || beatCount % 2 !== 0? '\t' : '\xa0'}` : '';
                beatCount++;
            }
        });
        
        return completeChordBar;

    // If no notes found between chords (empty bar, no beats to count), return the chords plus '*' indicator

    } else {

        if (isTuneTripleMeter(abcMeter)) {

            return `${abcBarChordsInput.join('\t')}*\t`;
        }
        
        return `${abcBarChordsInput[0]}\xa0${abcBarChordsInput[1]}\t${abcBarChordsInput[2]}\xa0*\t`;
    }
}

// Check if the tune is in triple meter based on its M: text

export function isTuneTripleMeter(tuneMeter) {

    if (tuneMeter === "3/4" | tuneMeter === "3/2" | tuneMeter === "9/8") {
  
      return true;
    }
  
    return false;
}

// Strip ABC of all header fields, commands and inline instructions (ornamentation, directions, lyrics etc.) 

function removeAbcHeadersAndCommands(abcContent) {

    let filteredAbc = abcContent.replaceAll(/^(?:[A-Za-z+]:.*\r?\n)*/gm, '')
                                .replaceAll(/^(?:%.*\r?\n)*/gm, '')
                                .replaceAll(/\[\w:.*?\]/g, '')
                                .replaceAll(/<.*?>/g, '')
                                .replaceAll(/!.*?!/g, '')
                                .replaceAll(/\+.*?\+/g, '')
                                .replaceAll(/{.*?}/g, '');
    
    return filteredAbc;
}

// Replace all ABC intervals / inline chords with a single highest note of the interval / chord

function convertAbcIntervalsToSingleNotes(abcContent) {

    let filteredAbc = abcContent.replaceAll(/\[([=_^.~]*[a-gA-G]+[,']*[0-9]*)*?\]/g, `$1`);

    return filteredAbc;
}

// Replace ABC triplets and quadruplets in (3ABC format with A/B/c and A/B/cd

function normalizeAbcTriplets(abcContent) {

    let filteredAbc = abcContent.replaceAll(/\([34](\w)(\w)(\w)/g, `$1/$2/$3`);

    return filteredAbc;
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
// INITIALIZE ENCODER SETTINGS
///////////////////////////////

// Initialize default ABC Encoder settings on first page load

export function initEncoderSettings() {

    initSettingsFromObject(abcEncoderDefaults);
}