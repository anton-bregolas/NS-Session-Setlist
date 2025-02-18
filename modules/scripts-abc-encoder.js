import { apStyleTitleCase } from './scripts-ap-style-title-case.js';
import { LZString } from './scripts-abc-tools.js';

////////////////////////////////
// ABC ENCODER GLOBAL SETTINGS
///////////////////////////////

// Default ABC Encoder settings on first load
// Set in initEncoderSettings and user Options

// abcEncoderExportsTuneList = 1
// abcEncoderSortsTuneBook = 0
// abcSortExportsTunesFromSets = 1
// abcSortExportsChordsFromTunes = 1
// abcSortRemovesLineBreaksInAbc = 0
// abcSortRemovesTextAfterLineBreaksInAbc = 0

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

    { string: "an súisin bán", override: "An Súisin Bán"},
    { string: "casadh an tsúgáin", override: "Casadh an tSúgáin"},
    { string: "dance ti' thy daddy", override: "Dance ti' Thy Daddy"},
    { string: "tá an coileach ag fógairt an lae", override: "Tá an Coileach ag Fógairt an Lae"}
];

const makeProperCaseExceptions = [

    { string: "three-two", override: "3/2 Hornpipe"},
    { string: "three two", override: "3/2 Hornpipe"},
    { string: "3/2", override: "3/2 Hornpipe"}
];

////////////////////////////////
// ABC FILE PARSERS & HANDLERS
///////////////////////////////

// Convert an imported ABC file into a JSON array of tunes / sets
  
export async function parseAbcFromFile(taskType) {

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

                let abcContentResult = "";

                if (!validateAbcFile(rawAbcContent, taskType)) {

                    console.warn("ABC Encoder:\n\nInvalid data type or format!");
                    return;
                }

                if (taskType === "abc-encode") {

                    const abcEncodedOutput = getEncodedAbc(rawAbcContent);

                    abcContentResult = abcEncodedOutput[0];

                    if (+localStorage.abcEncoderExportsTuneList === 1) {

                        downloadAbcFile(exportTuneList(abcContentResult), "Tunelist.txt");
                    }

                    if (+localStorage.abcSortExportsTunesFromSets === 1 && abcEncodedOutput[1] !== '') {

                        downloadAbcFile(abcEncodedOutput[1], "tunes.json");

                        if (+localStorage.abcEncoderExportsTuneList === 1) {

                            downloadAbcFile(abcEncodedOutput[1], "TunelistTunes.txt");
                        }
                    }
                }

                if (taskType === "abc-decode") { 

                    abcContentResult = getDecodedAbc(rawAbcContent);
                }

                if (taskType === "abc-sort") {

                    const abcSortedOutput = getSortedAbc(rawAbcContent);

                    abcContentResult = abcSortedOutput[0];

                    if (+localStorage.abcSortExportsTunesFromSets === 1 && abcSortedOutput[1] !== '') {
                        
                        downloadAbcFile(abcSortedOutput[1], "NS-Session-Tunes.abc");

                        if (+localStorage.abcSortExportsChordsFromTunes === 1 && abcSortedOutput[3] !== '') {

                            downloadAbcFile(abcSortedOutput[3], `chords-tunes.json`, "abc-extract-chords");
                        }
                    }

                    if (+localStorage.abcSortExportsChordsFromTunes === 1 && abcSortedOutput[2] !== '') {

                        downloadAbcFile(abcSortedOutput[2], `chords-sets.json`, "abc-extract-chords");
                    }
                }

                // console.log("ABC Encoder:\n\nDownloading new ABC file...");
                downloadAbcFile(abcContentResult, rawAbcFile.name, taskType);

            } catch (error) {

                console.error("ABC Encoder:\n\nError reading ABC file content:\n\n", error);
            }
        }
        
        fileInput.click();

    } catch (error) {

        console.error("ABC Encoder:\n\nParsing sequence failed!\n\n", error);
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
                        taskType === "abc-encode" ? "tunes-encoded.json" :
                        taskType === "abc-decode" && fileName.startsWith("sets") ? "NS-Session-Sets.abc" :
                        taskType === "abc-decode" && fileName.startsWith("tunes") ? "NS-Session-Tunes.abc" :
                        taskType === "abc-decode" ? "tunes-decoded.abc" :
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

            if (testJson[0]["Name"]) {

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

        const sortedAbcArr = filteredAbcArr.sort().map(abc => `X: ${filteredAbcArr.indexOf(abc) + 1}\n${addCustomAbcFields(abc)}`);

        let sortedAbcTunesArr = [];

        // Filter and sort an additional array of Tunes if abcContent contains Sets and abcSortExportsTunesFromSets setting is on

        if (+localStorage.abcSortExportsTunesFromSets === 1 && filteredAbcArr[0].match(/^T:/gm).length > 2) {

            const exportedTunesArr = makeTuneListFromSets(filteredAbcArr);

            sortedAbcTunesArr = exportedTunesArr.sort().map(abc => `X: ${exportedTunesArr.indexOf(abc) + 1}\n${abc}`);

            console.log(`ABC Encoder:\n\nABC Tunebook generated from Sets data`);
        }

        // Option A: Also remove all empty lines inside ABCs

        if (+localStorage.abcSortRemovesLineBreaksInAbc === 1) {

            return [removeLineBreaksInAbc(sortedAbcArr), removeLineBreaksInAbc(sortedAbcTunesArr)];
        }

        // Option B: Also remove all text separated by empty lines inside ABCs

        if (+localStorage.abcSortRemovesTextAfterLineBreaksInAbc === 1) {

            return [removeTextAfterLineBreaksInAbc(sortedAbcArr), removeTextAfterLineBreaksInAbc(sortedAbcTunesArr)];
        }

        // Default option: Return sorted ABCs as is (everything in-between X: fields)

        return [sortedAbcArr, sortedAbcTunesArr];

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

        let titleOverride = '';
        
        for (const caseObj of makeTitleCaseExceptions) {
            
            if (abcTitleArr[i].toLowerCase() === caseObj.string) {
                
                titleOverride = caseObj.override;
                break;
            }
        }
        
        if (i > 0) {

            abcTitleCaseOutput += " / ";
        }

        if (titleOverride) {
    
            abcTitleCaseOutput += titleOverride;

        } else {

            abcTitleCaseOutput += apStyleTitleCase(abcTitleArr[i]);
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
        
        match => ` ${makeStringTitleCase(toSortFriendlyTitle(match.trim()))}`
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

    let formattedTitle = makeStringTitleCase(toSortFriendlyTitle(primaryTitle));

    let formattedPrefix = abcTitlePrefix? `${abcTitlePrefix}: ` : '';

    let abcTitleOutput = `T: ${formattedPrefix}${formattedTitle}`;

    if (abcTitleArr.length > 1) {

        for (let i = 1; i < abcTitleArr.length; i++) {

            let secondaryTitle = abcTitleArr[i].match(/(?<=^T:).*/)[0].trim();

            abcTitleOutput += `\nT: ${makeStringTitleCase(toSortFriendlyTitle(secondaryTitle))}`;
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

    let abcR = abcContent.match(/(?<=^R:).*/m)? abcContent.match(/(?<=^R:).*/m)[0].trim() : abcTitle.includes('[')? abcTitle.match(/\[[\s\S]*?\]/)[0].replace('[', '').replace(']', '') : '';

    let abcTitlePrefix = abcTitle.match(/^T:.*:/)? abcTitle.match(/(?<=^T:).*(?=:)/)[0].trim().toUpperCase() : makeTuneTypePlural(abcContent, abcR);

    let abcTitleSuffix = abcContent.match(/^T:/gm).length > 2 && !abcContentTitle.toUpperCase().endsWith("SET")? " Set" : '';

    let abcTuneType = abcR? makeStringProperCase(abcR) : makeTuneTypeSingular(abcTitlePrefix);

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
    
    // Remove all ABC header text and reconstruct ABC fields in the correct order
    
    let abcBody = updatedAbc.replace(/^(?:[A-Z]:.*\r?\n)*/, '');
    
    let abcHeaders = '';
    let abcNotes = '';
    
    // Update ABC Meter field if missing, derive M: from Tune Type
    
    if (!abcM) {
        
        switch (abcTuneType.toLowerCase()) {
            
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

    return `${abcTitle}\n${abcHeaders}\n${abcBody}`;
}

////////////////////////////////
// ENCODE ABC FUNCTIONS
///////////////////////////////

// Pass ABC contents to Sort and Encode functions, return a JSON array of objects

function getEncodedAbc(abcContent) {

    let sortedAbcContent = [];

    if (+localStorage.abcEncoderSortsTuneBook === 1) {

        sortedAbcContent = getSortedAbc(abcContent);

    } else {

        sortedAbcContent = [abcContent];
    }

    if (sortedAbcContent[0]?.length > 0) {

        console.log("ABC Encoder:\n\nEncoding ABC file contents...");

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

        const encodedAbcString = abcObject.url?.match(/lzw=([^&]*)/)[0];

        if (encodedAbcString) {

            let decodedAbcString = LZString.decompressFromEncodedURIComponent(encodedAbcString.split('lzw=')[1]);

            // Optional: Remove all empty lines in decoded ABC

            // decodedAbcString = decodedAbcString.replaceAll('\n\n', '').trim();

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

function makeTuneListFromSets(abcContentArr) {

    console.log(`ABC Encoder:\n\nConverting ABC Sets data into Tunes...`);

    const abcSetsArr = abcContentArr.map(abcSet => {

        if (abcSet.match(/MEDLEY/gi)) {

            abcSet = abcSet.replace(/T:/g, 'T:[MEDLEY]');
        }

        return abcSet.replace(/^T:.*\s/, '').match(/T:[\s\S]*?(?=(?:T:|$))/g);
    });

    const abcTunesArr = abcSetsArr.map(abcSetArr =>

        abcSetArr.map(tuneSet => {

            const abcIndex = abcSetArr.indexOf(tuneSet);

            const isMedley = tuneSet.includes('[MEDLEY]');

            if (isMedley) {

                tuneSet = tuneSet.replaceAll(/\[MEDLEY\]/g, '');
            }

            return addCustomAbcFields(tuneSet, abcSetArr[0], true, abcIndex, isMedley);
        })
    );

    const abcTunesOutput = abcTunesArr.flat(Infinity);

    return abcTunesOutput;
}

// Convert N.S.S.S. list of Sets or Tunes into a Chordbook JSON
// Extract chords from each ABC item via getChordsFromTune

function makeAbcChordBook(abcContent) {

    let chordBookOutput = '';

    const splitAbcArr = abcContent.split(/X.*/gm).filter(abc => abc != '').map(abc => abc.trim());

    const abcChordsArr = [];

    splitAbcArr.forEach(abc => {

        let abcChordsObj;
        let abcTitle = '';
        let abcMeter = '';
        let abcBody = '';

        if (abc.match(/^T:/gm).length > 2) {

            const abcPrimaryTitle = abc.match(/(?<=^T:).*/m)[0].trim();
            const abcTunesArr = abc.replace(/^T:.*/, '').trim().split('T:').filter(tune => tune != '');

            abcChordsObj = { "setTitle": abcPrimaryTitle, "tuneChords": [] };

            abcTunesArr.forEach(tune => {

                abcTitle = tune.match(/^.*/)[0].split(' / ')[0].trim();
                abcMeter = tune.match(/^M:/m)? tune.match(/(?<=^M:).*/m)[0].trim() : abc.match(/(?<=^M:).*/m)[0].trim();
                abcBody = tune.replace(/^(?:[A-Z]:.*\r?\n)*/, '');

                const tuneChordObj = getChordsFromTune(abcBody, abcTitle, abcMeter);

                abcChordsObj.tuneChords.push(tuneChordObj);
            });
        
        } else {

            abcTitle = abc.match(/(?<=^T:).*/m)[0].trim();
            abcMeter = abc.match(/(?<=^M:).*/m)[0].trim();
            abcBody = abc.replace(/^(?:[A-Z]:.*\r?\n)*/, '');

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

    const tuneMeter = abcMeter? abcMeter : "4/4";
    let minTuneBeats = 2;

    switch (tuneMeter) {
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

            if (!abcBar.match(/\"[\S]*\"/)) {

                return;
            }

            let voltaNo = '';

            if (abcBar.match(/^[\d]/)) {

                voltaNo = abcBar[0];
            }

            if (barCounter >= 4 && !voltaNo) {

                abcPartChords += `|\n`;

                barCounter = 0;
            }

            const abcBarChordsArr = abcBar.match(/\"[\S]*\"/g);

            abcPartChords += `|${voltaNo} ${getCompleteAbcChordBar(abcBarChordsArr, minTuneBeats)}`;

            barCounter++;
        });

        abcChords += abcPartChords? `PART ${partCounter}:\n${abcPartChords}||\n` : '';
    });

    abcChordsObj.chords = abcChords.trim();
    
    return abcChordsObj;
}

// Process an ABC bar of chords, completing missing beats if necessary

function getCompleteAbcChordBar(abcBarChordsArr, minTuneBeats) {

    let abcBarChordsInput = abcBarChordsArr.map(c => c.replaceAll('"', '')).filter(c => c != '');

    if (abcBarChordsArr && abcBarChordsInput.length > 0) {

        if (abcBarChordsInput.length === 1) {

            return `${abcBarChordsInput[0]} `.repeat(minTuneBeats);
        }

        return `${abcBarChordsInput.join(' ')} `;

    } else {

        return '– ';
    }
}

////////////////////////////////
// EXPORT TUNELIST FUNCTIONS
///////////////////////////////

// Export tab-separated list of Session DB Tunes / Tune Types / Links

function exportTuneList(abcContent) {

    let tuneListStr = '';

    const abcArr = JSON.parse(abcContent);

    abcArr.forEach(abcObj => {

        let abcTitle = abcObj.name;

        if (abcTitle.match(/^.*:/)) {
            
            abcTitle = abcTitle.split(':')[1].trim();
        }

        tuneListStr += `${abcObj.type}\t${abcTitle}\t${abcObj.url}\t${abcObj.leaders.split(/,[\s]*/g).join(`\t`)}\n`;
    });

    return tuneListStr;
}

////////////////////////////////
// INITIALIZE ENCODER SETTINGS
///////////////////////////////

// Initialize default ABC Encoder settings on first page load

export function initEncoderSettings() {

    if (!localStorage?.abcEncoderExportsTuneList) {

        localStorage.abcEncoderExportsTuneList = 1;
    }

    if (!localStorage?.abcEncoderSortsTuneBook) {

        localStorage.abcEncoderSortsTuneBook = 0;
    }

    if (!localStorage?.abcSortExportsChordsFromTunes) {

        localStorage.abcSortExportsChordsFromTunes = 1;
    }

    if (!localStorage?.abcSortExportsTunesFromSets) {

        localStorage.abcSortExportsTunesFromSets = 1;
    }

    if (!localStorage?.abcSortRemovesLineBreaksInAbc) {

        localStorage.abcSortRemovesLineBreaksInAbc = 0;
    }

    if (!localStorage?.abcSortRemovesTextAfterLineBreaksInAbc) {

        localStorage.abcSortRemovesTextAfterLineBreaksInAbc = 0;
    }
}