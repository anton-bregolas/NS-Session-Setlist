NS Session Setlist
========================================================================================

NS Session Tunebook by Anton Zille & Novi Sad Trad Sessions:

https://github.com/anton-bregolas | https://t.me/irish_sessions_ns

ABC Transcription Tools by Michael Eskin:

https://github.com/seisiuneer/abctools | https://michaeleskin.com/abc

## Version History

v.0.6.1: Convert Sets to Tunes (Set to Tunes Tweaks)

+ Project updates:
  - ABC Encoder: Title Case formatting in Sort refactored to allow for exceptions (titles in Irish etc.)
  - ABC Encoder: Sort now supports multiple Note fields
  - ABC Encoder: Title filtering script tweaked

+ JavaScript updates:
  - Tune Title cleanup logic refactored with regular expressions in addCustomAbcFields (scripts-abc-encoder.js)
  - makeStringTitleCase function and makeTitleCaseExceptions array of objects added to override exceptions in capitalization
  - processAbcTitle now passes strings to makeStringTitleCase
  - addCustomAbcFields now creates an array of N: fields to account for multiple Note fields

+ Session DB updates:
  - Session DB updated to 2025-02-05
  - Sets & Tunes from Oliushka added (v.1)
  - Sets & Tunes from Anton added (v.1)

v.0.6.0: Convert Sets to Tunes

+ Project updates:
  - ABC Encoder: Sort now automatically generates ABC Tunebook from Sets
  - ap-style-title-case v.2.0.0 added as a module for title formatting

+ JavaScript updates:
  - Sets > Tunes conversion functionality added with new and updated ABC Encoder functions (scripts-abc-encoder.js)
    - ABC Sort can now call function makeTuneListFromSets to automatically convert Sets data into separate Tunes
    - sortFilterAbc now includes option to pass Sets data to makeTuneListFromSets and return an additional Tunebook array
  - makeTuneListFromSets checks whether a Set is a Medley, removes Set Title and passes each tune to addCustomAbcFields along with the following arguments:
    - abcMatch - first tune in a set containing most ABC headers
    - setToTunes - set to true for additional Tune Title formatting
    - abcIndex - Tune No. in the Set for splitting data contained in C: C: S: and Z: fields
    - isMedley - set to true for sets containing mix of Tune Types
  - addMissingFields renamed to addCustomAbcFields and refactored with new sorting algorithm:
    - Get and format ABC Title and Tune Type text via processAbcTitle makeStringProperCase
    - Check if ABC matches the N.S.S.S. custom fields layout
    - Return with updated titles if headers are present in the correct order
    - Store ABC field text into abcX variables if data found
    - Update Title and abcX variables using reference ABC if abcMatch was passed
    - Remove all opening headers
    - Reconstruct headers using abcX variables, Tune Type and switch statements
    - Return the reassembled ABC from Title, Headers and Body with a specific order of ABC fields
  - Text formatting functions makeStringProperCase and processAbcTitle added to ABC Sort
  - makeStringProperCase checks an array of objects makeProperCaseExceptions for overrides
  - processAbcTitle passes a string to ap-style-title-case for Title Case capitalization
  - sortFilterAbc now includes additional line break removal options (off by default)
  - Output algorithm updated in parseAbcFromFile
  - encodeTunesForAbcTools tweaked for better readability
  - Global settings variables added for fine-tuning ABC Encoder sort and export functions
  - abcBasicTuneTypes array added to control list of tune types with separate Tunebook category
  - ABC Encoder functions sorting and comments updated

+ Session DB updates:
  - Session DB updated to 2025-02-03
  - Tune Type in T: fields is now indicated in []
  - Tune Keys in T: are now (Amaj) instead of (A)
  - Z: field standard fixed for auto-sorting: "Editor 1, Editor 2; TSO Source 1 / TSO Source N"

v.0.5.5: Session DB Update

+ Project updates:
  - ABC Encoder: Now exports tab-separated plain text Tunelist in addition to JSON file
  - ABC Encoder: Sort function now checks for missing custom fields, adds them to ABC

+ JavaScript updates:
  - exportTuneList function added to scripts-abc-encoder.js
  - addMissingFields function added to ABC Sort:
    - Check ABC for R: / M: / L: fields, warn in console and add defaults if missing
    - Check ABC for C: / Z: / N: / Q: fields, add default custom values if missing
    - M: and Q: fields use switch statements depending on Tune Type

+ Session DB updates:
  - Session DB updated to 2025-01-31
  - Sets & Tunes from Olya added (v.1)

v.0.5.4: Session DB Update

+ Session DB updates:
  - Session DB updated to 2025-01-28
  - Sets & Tunes from Tania added (v.1)
  - Minor fixes in Mars and Tania Sets & Tunes

v.0.5.3: Session DB Update

+ Session DB updates:
  - Session DB updated to 2025-01-26
  - Sets & Tunes from Mars added (v.1)

v.0.5.2: Session DB Update

+ Session DB updates:
  - Session DB updated to 2025-01-25

v.0.5.1: Save & Restore Tunes (Save Last Set & Last Tune)

+ Project updates:
  - Tunebook:	Sets and Tunes are now saved and restored separately on Tunebook launch and switch 
  - Tunebook:	Filters now properly repopulate on Tunebook switch
  - ABC Encoder: Tune Type is now converted to Proper Case, check against TYPE: tweaked

+ JavaScript updates:
  - Sets and Tunes local storage variables added in place of lastTuneBookItem (lastTuneBookSet_NSSSAPP, lastTuneBookTune_NSSSAPP)
  - Checks added to account for Sets or Tunes save and restore logic in ABC Tools scripts (scripts-abc-tools.js)
  - initAbcTools, saveLastTuneBookItem, restoreLastTunebookItem functions updated in ABC Tools scripts
  - checkPersistenceState function added to ABC Tools scripts
  - refreshTuneBook updated with loading last saved Set or Tune; load callback removed from resetTuneBookMenus (scripts-ns-sessions.js)
  - Tunebook Filter fix: sortFilterOptions now receives currentTuneBook as argument
  - Proper Case Tune Type: encodeTunesForAbcTools tweaked to account for multi-word types (scripts-abc-encoder.js)

+ Session DB updates:
  - Session DB updated to 2025-01-24
  - Proper Case tune type naming tweak
  - ABC fixes & tweaks (added to encoded tunes)

v.0.5.0: Save & Restore Tunes

+ Project updates:
  - Tune items are now saved and restored on Tunebook launch
  - ABC Tools scripts refactored, initAbcTools cleaned up
  - Local storage variables added (lastTabMidiOption_NSSSAPP, lastTuneBookItem_NSSSAPP, tuneBookLastOpened_NSSSAPP)

+ JavaScript updates:
  - Tunebook: Last loaded Set or Tune and Tab & MIDI options are now saved into local storage
  - Tunebook: Last saved item and/or options are now restored on new Tunebook launch
  - Tunebook: Default Set or Tune now consistently loads on first Tunebook launch
  - Launcher: Last opened Tunebook variable moved to local storage (tuneBookLastOpened_NSSSAPP)
  - Refactored ABC Tools scripts (scripts-abc-tools.js) leaving initializing scripts in initAbcTools
  - New functions: restoreTuneBookOptions, restoreLastTunebookItem, saveLastTuneBookItem, setSelectedTuneByName
  - Options-updating script (loadTabsMidiOptions) now triggers Tunebook item restoring & loading
  - Tweaked scripts updating tuneBookSetting and tuneBookLastOpened variables (scripts-ns-sessions.js)

+ CSS updates:
  - Removed superfluous highlight of buttons and links for mobile taps (-webkit-tap-highlight-color)

+ Session DB updates:
  - Session DB updated to 2025-01-22
  - ABC fixes & tweaks
  - Soundslice links added

v.0.4.4: Filter Options (Tune Load Tweaks)

+ Project updates:
  - Tunebook now loads the first Set or Tune item into ABC Tools on launch or section switch

+ JavaScript updates:
  - initAbcTools further tweaked in scripts-abc-tools.js
  - loadTuneBookItem(currentTuneBook, itemNumber) script moved into separate export function
  - resetTuneBookMenus in scripts-ns-sessions.js now loads first Tunebook item

+ Session DB updates:
  - Session DB updated to 2025-01-21
  - Sources added to new tunes & sets
  - ABC fixes & tweaks

v.0.4.3: Filter Options (Session DB Update)

+ Session DB updates:
  - Session DB updated to 2025-01-20
  - Tempos (Q:) standardised
  - ABC fixes & tweaks

v.0.4.2: Filter Options (Session DB Update)

+ Session DB updates:
  - Session DB updated to 2025-01-18
  - Four draft sets of various tune types added for Filter Options testing

v.0.4.1: Filter Options (Menu Fixes)

+ Project updates:
  - Rolled back and fixed some changes causing errors in Tabs / MIDI menu after refactoring
  - Refactored script for injecting custom MIDI programs into clean ABC
  - Testing UX for optiomal tune behavior in ABC Tools iframe (tune remains after switching between sections vs. blank page)

+ CSS updates:
  - Option menus slightly expanded in Tunebook

+ JavaScript updates:
  - ABC Tools: injectInstrument refactored, errors fixed
  - Launcher: Fixed tuneSelector values being set to -1
  - Launcher: refreshTabsDisplayOptions added

v.0.4.0: Filter Options (Initial commit)

+ Project updates:
	- Tunebook:	Filter options implemented, Tunebook can now be filtered by Tune Type or Set Leader
 	- Launcher: Code updated and refactored to account for Tunebook state (initialized, section last opened)
  - ABC Tools scripts: Code updated and refactored, custom and general scripts moved from function initializing event listeners

+ HTML updates:
  - Filter Options selector shell added, to be populated programmatically
  - Emojis added to dropdown menus to lighted up lists of options

+ JavaScript updates:
  - Dropdown menu handler functions (appDropDownHandler, initCustomDropDownMenus) added to scripts-ns-sessions.js
  - Filter Options population and sorting functions (populateFilterOptions, sortFilterOptions) added to scripts-abc-encoder.js
  - Tunebook cleanup functions (refreshTuneBook, resetTuneBookMenus, resetTuneBookFilters) added to scripts-ns-sessions.js
  - New global variables (tuneBookInitialized, tuneBookLastOpened) added to keep track of event listeners and last opened section
  - ABC Tools scripts refactored:
    - initAbcTools narrowed down to adding initial event listeners to Tunebook elements to prevent from multiplying event listeners
    - Subheaders for OG Scripts and Customized, New and Exported Tunebook Functions added plus more comments describing functions
    - Exports and constants revisited, duplicates removed, functions closely tied to initAbcTools are to be kept in the same file
    - Original Tunebook elements tuneFrame, tuneSelector and displayOptions are now defined globally in ABC Tools scripts

+ Session DB updates:
  - Session DB updated to 2025-01-17
  - Encoded ABCs now include Type and Leaders keys

v.0.3.2: ABC Encoder (Encoder tweaks)

+ Project updates:
	- ABC Encoder: ABC cleanup logic tweaked, optional algorithms added, documentation improved

+ JavaScript updates:
	- ABC Encoder:
		- sortFilterAbc tweaked and expanded with additional ABC cleanup options
		- Extra line breaks in ABCs are no longer removed by default (potential options feature)
		- Optional functions added for extra ABC line breaks cleanup (removeLineBreaksInAbc, removeTextAfterLineBreaksInAbc)
		- Regex and step-by-step implementations added to removeTextAfterLineBreaksInAbc
		- Custom Type JSON key naming fixed in encodeTunesForAbcTools
		- Subheaders and comments added to scripts-abc-encoder.js

v.0.3.1: ABC Encoder (Encoder scripts)

+ Project updates:
	- ABC Encoder: 
    - Encoder tool functional
    - ABC Encoder also sorts ABCs by default
    - ABC Encoder, Decoder and Sort now remove extra line breaks and spaces between tunes
  - ABC Tools scripts:
    - LZString updated to lz-string.min v.1.5.0

+ JavaScript updates:
  - ABC Encoder: 
    - Handler function for Encode ABC tool (getEncodedAbc) added
    - getEncodedAbc passes ABC contents to sort and encode functions, returns a JSON array of objects
    - Main function for Encode ABC tool (encodeTunesForAbcTools) added
    - Extra line breaks and space cleanup added to sortFilterAbc, encodeTunesForAbcTools and getDecodedAbc
    - Output file naming improved in downloadAbcFile
  - ABC Tools scripts tweaked:
    - Handling of Type and Leaders data added to populateTuneSelector

+ Session DB updates:
  - Session DB updated to 2025-01-16
  - Missing R fields added to tunes and sets
  - Order of R: -> M: -> L: -> Q -> K standardised

v.0.3.0: ABC Encoder (Initial commit)

+ Project updates:
	- ABC Encoder:
		- N.S.S.S. tools page (abc-encoder.html) added with ABC Encoder / ABC Decoder / ABC Sort tools 
		- ABC Encoder scripts (scripts-abc-encoder.js) added to project: Sort and Decoder functional, Encoder in development
		- ABC Encoder styles based on Launch Screen styles, additional styles merged into nss-styles.css
	- Launcher: Links added, responsive design tweaks
	- Tunebook:	Filter selector added, responsive design tweaks
	- Playalong: Links added, responsive design tweaks
	- New Icons added
	
+ HTML updates:
	- ABC Encoder interface added with nav links to raw ABC files, GitHub and ABC Tools
	- Back to Launch Screen nav links added to Encoder and Playalong pages
	- ABC Encoder link and ABC Tools link added to Launch Screen footer
	- YouTube link added to Playalong
	- Additional data- attributes made
	
+ CSS updates:
	- ABC Encoder styles added, some refactoring done in nss-styles.css
	- Playalong styles added including new nav link class nss-link-filled
	- Titles responsive changes partly implemented via CSS pseudoclasses
	- Gradient text class nss-gradient-text added using @supports
	- Responsive design tweaks for Launch Screen, Playalong and Tunebook
	
+ JavaScript updates:
	- ABC Encoder scripts added including:
		- Handler function for ABC Encoder (parseAbcFromFile)
		- File Reader scripts readFileContent, downloadAbcFile
		- New function for input ABC file validation (validateAbcFile)
		- New functions for Sort tool (sortFilterAbc + getSortedAbc)
		- Function for ABC Decode tool (getDecodedAbc) added
	- Main app scripts changed:
		- Title change scripts updateTuneBookTitles and resizeTuneBookHeader refactored
		- Switch buttons behavior tweaked
	- ABC Tools scripts tweaked:
		- MIDI settings now dynamically constructed via a string to be injected into ABC

+ Session DB updates:
  - Session DB updated to 2025-01-15
  - MIDI instructions removed from encoded data files, to be injected dynamically (injectInstrument)

v.0.2.3: Session DB Update

+ Session DB updates:
  - Session DB updated to 2025-01-12
  - Spaces added between ABCs
  - Titles updated to restore "unsafe" characters

v.0.2.2: Play Along Page (Styles updated)

+ HTML updates:
  - Playalong page: 
    - Links wrapped in container divs
    - Links are now display: block and contain overlay div, title text and image

+ CSS updates:
  - Gradient added to h1 and buttons
  - Playalong page:
    - Outline gradient added via div with abs positioning & negative margins
    - Link hover styles updated

v.0.2.1: Play Along Page (Basic HTML)

+ Project updates:
  - Playalong page: Thumbnails updated

+ HTML updates:
  - Playalong page: Basic HTML added

+ CSS updates:
  - Playalong page: Basic styles added

v.0.2.0: Play Along Page (Initial commit)

+ Project updates:
  - Playalong thumbnails added

v.0.1.1: Session DB Update

+ Session DB updates:
  - Session DB updated to 2024-12-22
  - Naming format changed for C: / S: fields
  - Naming format standardised for C: Set Leaders field
  - Z: [Transcription By] and N: [Link to the Set] fields added

v.0.1.0: Initial App Version 

+ Project updates:
  - Project structure reorganised to suit transition to Progressive Web App (PWA)
  - Single-page file split into HTML, CSS and JS files with modular design
  - License files added for NS-Session-Setlist / abctools and Bootstrap icons
  - Icons file added to assets folder

+ HTML updates:
  - Page refactored with basic semantic markup in mind
  - Launch screen section, Tunebook section and Play Along section implemented
  - Scripts moved to modules, CSS moved to styles
  - HTML file renamed to index.html
  - Meta tags updated in <head>

+ JavaScript updates:
  - App scripts moved to scripts-ns-sessions.js
  - Michael Eskin's original scripts moved to scripts-abc-tools.js
  - App now fetches up-to-date Session DB data from the project's GitHub page
  - App scripts organised in subgroups: App Launchers, Switchers, Checkers / Updaters, Fetchers / Data Handlers, Event Handlers, Event Listeners

+ CSS updates:
  - Classes standardised and compartmentalised (exceptions made for some legacy selectors)
  - Media queries added for better mobile experience

+ Accessibility updates: 
  - A11y: Semantic markup added to HTML
  - A11y: Launch buttons enlarged on mobile devices
  - A11y: Tab order of elements updated

+ Session DB updates: 
  - Session DB updated to 2024-12-06

v.0.0.2

+ Basic session page customizations:

  - Tabs & Instrument list updated
  - Full Screen View button enlarged
  - Hide footer button added
  - Style & HTML tweaks

+ JavaScript updates:

  - Functions getElementsTotalHeight and resizeIframe moved to global scope
  - New function: hideParentElement

+ Accessibility updates: 

  - A11y: Outline styles added for tabbing through the page
  - A11y: aria-title and title attributes added for main page buttons
  - A11y: Tab order of buttons fixed

+ Session DB updates: 
  - Session DB updated to 2024-12-05

v.0.0.1

+ Initial commit of raw export website file from Michael Eskin's ABC Transcription Tools.