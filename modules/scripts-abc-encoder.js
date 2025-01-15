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

        console.log(splitAbc);

        const filteredAbc = splitAbc.sort().filter(string => string.trim() !== '' && string.startsWith("\r\nT:") || string.startsWith("\nT:"));

        const sortedAbc = filteredAbc.map(abc => { return `X: ${filteredAbc.indexOf(abc) + 1}` + abc });

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

        const sortedAbcOutput = sortedAbcContent.join('');

        console.log("ABC Encoder:\n\nABC file contents sorted!");

        return sortedAbcOutput;

    } else {

        console.warn("ABC Encoder:\n\nNo valid ABC data found after sorting");
        return;
    }
}

// Encode ABC contents using lz-string and return a stringified JSON

function getEncodedAbc(abcContent) {


    return abcContent;
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

// Download a file containing the resulting ABC content

function downloadAbcFile(abcContent, fileName, taskType) {

    const abcFile = new Blob([abcContent], { type: taskType === "abc-encode"? "application/json" : "text/plain" });
    const abcFileName = taskType === "abc-encode" && fileName === "NS-Session-Sets.abc" ? "tunesets.json" :
                        taskType === "abc-encode" && fileName === "NS-Session-Tunes.abc" ? "tunes.json" :
                        taskType === "abc-decode" && fileName === "tunesets.json" ? "NS-Session-Sets.abc" :
                        taskType === "abc-decode" && fileName === "tunes.json" ? "NS-Session-Tunes.abc" :
                        fileName;
    
    const abcLink = document.createElement("a");

    abcLink.href = URL.createObjectURL(abcFile);
    abcLink.download = abcFileName;
    document.body.appendChild(abcLink);
  
    abcLink.click();
    
    document.body.removeChild(abcLink);

    console.log(`ABC Encoder:\n\n${abcFileName} saved!`);
}
