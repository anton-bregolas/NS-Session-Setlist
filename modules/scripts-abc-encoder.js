import { LZString } from './scripts-abc-tools.js';

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

// Return a sorted, filtered and renumbered array of ABCs

function sortFilterAbc(abcContent) {

    try { 

        const splitAbc = abcContent.split(/X.*/gm);

        const filteredAbc = splitAbc.sort().filter(string => string.trim() !== '' && string.startsWith("\r\nT:") || string.startsWith("\nT:"));

        const sortedAbc = filteredAbc.map(abc => { return `X: ${filteredAbc.indexOf(abc) + 1}\n` + abc.replaceAll('\n\n', '').trim() });

        return sortedAbc;

    } catch (error) {

        throw new Error("ABC Encoder:\n\nFailed to sort ABC\n\n", { cause: error });
    }
}

// Sort, filter and renumber raw ABC contents and return a string of ABCs

function getSortedAbc(abcContent) { 

    console.log("ABC Encoder:\n\nSorting ABC file contents...");

    const sortedAbcContent = sortFilterAbc(abcContent);

    if (sortedAbcContent.length > 0) {

        const sortedAbcOutput = sortedAbcContent.join('\n\n');

        console.log("ABC Encoder:\n\nABC file contents sorted!");

        return sortedAbcOutput;

    } else {

        console.warn("ABC Encoder:\n\nNo valid ABC data found after sorting");
        return;
    }
}

// Encode ABC contents into ABC Tools-readable URL using lz-string, extract
// Tune Name, Tune Type and Set Leaders, return data in an array of objects

function encodeTunesForAbcTools(abcContent) {

    try {

        const rawAbcArr = abcContent.split('X:');

        const encodedAbcArr = [];

        for (let i = 1; i < rawAbcArr.length; i++) {

            const splitTuneArr = rawAbcArr[i].split('\n');

            encodedAbcArr[i - 1] = {};

            splitTuneArr.forEach(tuneLine => {
                
                if (tuneLine.startsWith('T:') && !encodedAbcArr[i - 1].Name) {

                    encodedAbcArr[i - 1].Name = tuneLine.split('T:')[1].trim();
                }

                if (tuneLine.startsWith('R:') && !encodedAbcArr[i - 1].Type) {

                    const tuneType = tuneLine.split('R:')[1].trim();

                    encodedAbcArr[i - 1].Type = tuneType[0].toUpperCase() + tuneType.slice(1);
                }

                if (tuneLine.startsWith('C: Set Leaders:') && !encodedAbcArr[i - 1].Leaders) {

                    encodedAbcArr[i - 1].Leaders = tuneLine.split('C: Set Leaders:')[1].trim();
                }
            });

            const customTuneType = encodedAbcArr[i - 1].Name.split(':')[0];
            const customTuneTypeProperCase = customTuneType[0] + customTuneType.slice(1).toLowerCase();

            if (encodedAbcArr[i - 1].Name !== customTuneTypeProperCase) {
                
                encodedAbcArr[i - 1].Type = customTuneTypeProperCase;
            }

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

// Decode ABC contents encoded via lz-string and return a string of ABCs

function getDecodedAbc(abcContent) { 

    const encodedAbcJson = JSON.parse(abcContent);
    const decodedAbcArr = [];
    let decodedAbcOutput = "";

    console.log("ABC Encoder:\n\nDecoding ABC file contents...");

    encodedAbcJson.forEach(abcObject => {

        const encodedAbcString = abcObject.URL?.match(/lzw=([^&]*)/)[0];

        if (encodedAbcString) {

            let decodedAbcString = LZString.decompressFromEncodedURIComponent(encodedAbcString.split('lzw=')[1]).replaceAll('\n\n', '').trim();

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

// Download a file containing the resulting ABC content

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
