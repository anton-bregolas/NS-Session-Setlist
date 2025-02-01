import { LZString } from './scripts-abc-tools.js';
import { updateData } from './scripts-ns-sessions.js';

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

                    abcContentResult = getEncodedAbc(rawAbcContent);
                    downloadAbcFile(exportTuneList(abcContentResult), "Tunelist.txt");
                }

                if (taskType === "abc-decode") { 

                    abcContentResult = getDecodedAbc(rawAbcContent);
                }

                if (taskType === "abc-sort") { 

                    abcContentResult = getSortedAbc(rawAbcContent);
                }

                console.log("ABC Encoder:\n\nDownloading new ABC file...");

                downloadAbcFile(abcContentResult, rawAbcFile.name, taskType);

            } catch (error) {

                console.error("ABC Encoder:\n\nError reading ABC file content:\n\n", error);
            }
        }
        
        fileInput.click();

    } catch (error) {

        console.error("ABC Encoder:\n\nParsing sequence failed!");
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

    const abcFile = new Blob([abcContent], { type: taskType === "abc-encode"? "application/json" : "text/plain" });
    const abcFileName = taskType === "abc-encode" && fileName.startsWith("NS-Session-Sets") ? "tunesets.json" :
                        taskType === "abc-encode" && fileName.startsWith("NS-Session-Tunes") ? "tunes.json" :
                        taskType === "abc-encode" ? "tunes-encoded.json" :
                        taskType === "abc-decode" && fileName.startsWith("tunesets") ? "NS-Session-Sets.abc" :
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

// Return a sorted, filtered and renumbered array of ABCs

function sortFilterAbc(abcContent) {

    try { 

        const splitAbcArr = abcContent.split(/X.*/gm);

        const filteredAbcArr = splitAbcArr.map(abc => abc.trim()).filter(abc => abc.startsWith("T:"));

        const sortedAbcArr = filteredAbcArr.sort().map(abc => `X: ${filteredAbcArr.indexOf(abc) + 1}\n${addMissingFields(abc)}`);

        // Option A: Also remove all empty lines inside ABCs

        // return removeLineBreaksInAbc(sortedAbcArr);

        // Option B: Also remove all text separated by empty lines inside ABCs

        // return removeTextAfterLineBreaksInAbc(sortedAbcArr);

        // Default option: Return sorted ABCs as is (everything in-between X: fields)

        return sortedAbcArr;

    } catch (error) {

        throw new Error("ABC Encoder:\n\nFailed to sort ABC\n\n", { cause: error });
    }
}

// Optionally look for and remove empty lines inside an ABC

function removeLineBreaksInAbc(sortedAbcArr) {

    return abcContent.map(abc => abc.split('\n').map(line => line.trim()).filter(line => line !== '').join('\n'));
}

// Optionally look for and remove all content separated by an empty line inside an ABC

function removeTextAfterLineBreaksInAbc(sortedAbcArr) {

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

// Update the tune with custom N.S.S.S. ABC fields if any of them are missing 

function addMissingFields(abcContent) {

    let abcTitle = '';
    let updatedAbc = abcContent;

    // Separate primary title(s) of Tune / Set from the rest of the ABC

    do {
        abcTitle += `${updatedAbc.match(/^T:.*/)[0]}\n`;
        updatedAbc = updatedAbc.replace(/^T:.*/, '').trim();

    } while (updatedAbc.startsWith("T:"));
    
    // Check basic ABC fields, add defaults if missing

    if (!updatedAbc.includes('R:')) {

        let abcTitlePrefix = '';
        let abcTuneType = '';
        
        if (abcTitle.match(/^T:.*:/)) {

            abcTitlePrefix = abcTitle.split('T: ')[1].split(':')[0].trim();
            abcTuneType = abcTitlePrefix.split(/[\s,-]/).map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            abcTuneType = abcTuneType.replace(/es$/, '').replace(/s$/, '');
        }
        
        updatedAbc = updatedAbc.replace('K:', `R: ${abcTuneType}\nK:`);
        console.warn(`ABC Encoder:\n\nMissing R: field added to ${abcTitle.split('T: ')[1]}`);
    }

    if (!updatedAbc.includes('M:')) {

        let abcTuneType = updatedAbc.split('R: ')[1].split('\n')[0];
        let defaultMeter = '';

        if (abcTuneType) {

            switch (abcTuneType.toLowerCase()) {
                    
                case "barndance":
                case "hornpipe":
                case "march":
                case "reel":
                    defaultMeter = "4/4";
                    break;

                case "air":
                case "hop jig":
                case "waltz":
                    defaultMeter = "3/4";
                    break;

                case "jig":
                    defaultMeter = "6/8";
                    break;

                case "polka":
                    defaultMeter = "2/4";
                    break;

                case "slide":
                case "single jig":
                    defaultMeter = "12/8";
                    break;
                        
                case "slip jig":
                    defaultMeter = "9/8";
                    break;

                case "three-two":
                    defaultMeter = "3/2";
                    break;
            
                default:
                    break;
            }
        }

        updatedAbc = updatedAbc.replace('K:', `M: ${defaultMeter}\nK:`);
        console.warn(`ABC Encoder:\n\nMissing M: field added to ${abcTitle.split('T: ')[1]}`);
    }

    if (!updatedAbc.includes('L:')) {

        updatedAbc = updatedAbc.replace('K:', `L: 1/8\nK:`);
        console.warn(`ABC Encoder:\n\nMissing L: field added to ${abcTitle.split('T: ')[1]}`);
    }

    // Check for missing custom ABC fields, add from the bottom up

    if (!updatedAbc.includes('N:')) {

        updatedAbc = `N: \n` + updatedAbc;
        console.log(`ABC Encoder:\n\nMissing N: field added to ${abcTitle.split('T: ')[1]}`);
    }

    if (!updatedAbc.includes('Z:')) {

        updatedAbc = `Z: [Unedited]; The Session\n` + updatedAbc;
        console.log(`ABC Encoder:\n\nMissing Z: field added to ${abcTitle.split('T: ')[1]}`);
    }

    if (!updatedAbc.includes('C: Set Leaders:')) {

        updatedAbc = `C: Set Leaders: \n` + updatedAbc;
        console.log(`ABC Encoder:\n\nMissing Set Leaders field added to ${abcTitle.split('T: ')[1]}`);
    }
    
    if (!updatedAbc.includes('C: C:')) {

        updatedAbc = `C: C: Trad.; S: Various\n` + updatedAbc;
        console.log(`ABC Encoder:\n\nMissing C: / S: field added to ${abcTitle.split('T: ')[1]}`);
    }

    // Check for missing tempo field, add Q: value depending on Tune Type

    if (!updatedAbc.includes('Q:')) {

        let defaultTempo = '';
        let tuneType = updatedAbc.split('R: ')[1].split('\n')[0].trim();

        if (tuneType) {

            switch (tuneType.toLowerCase()) {

                case "air":
                    defaultTempo = "1/2=40";
                    break;
                    
                case "barndance":
                    defaultTempo = "1/2=86";
                    break;

                case "hornpipe":
                case "march":
                    defaultTempo = "1/2=82";
                    break;

                case "hop jig":
                    defaultTempo = "1/4=146";
                    break;

                case "jig":
                case "single jig":
                    defaultTempo = "3/8=116";
                    break;

                case "polka":
                    defaultTempo = "1/4=140";
                    break;

                case "reel":
                    defaultTempo = "1/2=100";
                    break;

                case "slide":
                    defaultTempo = "3/8=130";
                    break;
                        
                case "slip jig":
                    defaultTempo = "3/8=114";
                    break;

                case "three-two":
                    defaultTempo = "1/2=146";
                    break;

                case "waltz":
                    defaultTempo = "1/4=144";
                    break;
            
                default:
                    break;
            }

            updatedAbc = updatedAbc.replace('K:', `Q: ${defaultTempo}\nK:`);
            console.log(`ABC Encoder:\n\nMissing Q: field added to ${abcTitle.split('T: ')[1]}`);
        }
    }

    return `${abcTitle}${updatedAbc}`;
}

// Sort, filter and renumber raw ABC contents and return a string of ABCs

function getSortedAbc(abcContent) { 

    console.log("ABC Encoder:\n\nSorting ABC file contents...");

    const sortedAbcContentArr = sortFilterAbc(abcContent);

    if (sortedAbcContentArr.length > 0) {

        const sortedAbcOutput = sortedAbcContentArr.join('\n\n');

        console.log("ABC Encoder:\n\nABC file contents sorted!");

        return sortedAbcOutput;

    } else {

        console.warn("ABC Encoder:\n\nNo valid ABC data found after sorting");
        return;
    }
}

////////////////////////////////
// ENCODE ABC FUNCTIONS
///////////////////////////////

// Encode ABC contents into ABC Tools-readable URL using lz-string, extract
// Tune Name, Tune Type and Set Leaders, return data in an array of objects

function encodeTunesForAbcTools(abcContent) {

    try {

        const rawAbcArr = abcContent.split('X:');

        const encodedAbcArr = [];

        // Extract Tune Name, Tune Type and Set Leaders custom keys, push to JSON object

        for (let i = 1; i < rawAbcArr.length; i++) {

            const splitTuneArr = rawAbcArr[i].split('\n');

            encodedAbcArr[i - 1] = {};

            splitTuneArr.forEach(tuneLine => {
                
                if (tuneLine.startsWith('T:') && !encodedAbcArr[i - 1].Name) {

                    encodedAbcArr[i - 1].Name = tuneLine.split('T:')[1].trim();
                }

                if (tuneLine.startsWith('R:') && !encodedAbcArr[i - 1].Type) {

                    const tuneTypeArr = tuneLine.split('R:')[1].trim().split(/[\s,-]/);
                    let tuneType = '';

                    tuneType = tuneTypeArr.filter(word => word !== '').map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');

                    encodedAbcArr[i - 1].Type = tuneType;
                }

                if (tuneLine.startsWith('C: Set Leaders:') && !encodedAbcArr[i - 1].Leaders) {

                    encodedAbcArr[i - 1].Leaders = tuneLine.split('C: Set Leaders:')[1].trim();
                }
            });

            // If tune name includes TYPE: prefix that does not match Tune Type, replace it with Custom Type

            if (encodedAbcArr[i - 1].Name.match(/^.*:/)) {

                const customTuneTypeArr = encodedAbcArr[i - 1].Name.split(':')[0].split(/[\s,-]/);
                const customTuneTypeProperCase = 
                      customTuneTypeArr.map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');

                if (encodedAbcArr[i - 1].Type !== customTuneTypeProperCase) {

                    encodedAbcArr[i - 1].Type = customTuneTypeProperCase;
                }
            }

            // Generate URL to Michael Eskin's ABC Tools with default parameters

            const encodedAbcString = LZString.compressToEncodedURIComponent(`X:${rawAbcArr[i].replaceAll('\n\n', '')}`);

            encodedAbcArr[i - 1].URL = `https://michaeleskin.com/abctools/abctools.html?lzw=${encodedAbcString}&format=noten&ssp=10&name=${encodedAbcArr[i - 1].Name.replaceAll(' ', '_')}`;
        }

        console.log("ABC Encoder:\n\nABC file contents encoded!");

        return encodedAbcArr;

    } catch (error) {

        console.warn("ABC Encoder:\n\nFailed to encode ABC!\n\n", { cause: error });
    }
}

// Pass ABC contents to Sort and Encode functions, return a JSON array of objects

function getEncodedAbc(abcContent) {

    const sortedAbcContent = getSortedAbc(abcContent);

    if (sortedAbcContent.length > 0) {

        console.log("ABC Encoder:\n\nEncoding ABC file contents...");

        const encodedAbcJson = JSON.stringify(encodeTunesForAbcTools(sortedAbcContent), null, 2);

        return encodedAbcJson;
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

        const encodedAbcString = abcObject.URL?.match(/lzw=([^&]*)/)[0];

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
// EXPORT TUNELIST FUNCTIONS
///////////////////////////////

// Export tab-separated list of Session DB Tunes / Tune Types / Links

function exportTuneList(abcContent) {

    let tuneListStr = '';

    const abcArr = JSON.parse(abcContent);

    abcArr.forEach(abcObj => {

        let abcName = abcObj.Name;

        if (abcName.match(/^.*:/)) {
            
            abcName = abcName.split(': ')[1];
        }

        tuneListStr += `${abcObj.Type}\t${abcName}\t${abcObj.URL}\t${abcObj.Leaders.split(', ').join(`\t`)}\n`;
    });

    return tuneListStr;
}