NS Session Setlist
========================================================================================

A tunebook app for the Novi Sad Irish Traditional Music Session integrating Michael Eskin's ABC Transcription Tools. Contains Anton Zille's ABC Encoder for converting ABC Sets and Tunes into NS Session DB files and the Chord Viewer module for the simplified display of chords contained in ABC.

🎵 [**TUNEBOOK APP**](https://anton-bregolas.github.io/NS-Session-Setlist/) 🎻 [**ABC ENCODER**](https://anton-bregolas.github.io/NS-Session-Setlist/abc-encoder.html) 🎵

**NS Session Tunebook by Anton Zille & Novi Sad Trad Sessions** 👇

https://github.com/anton-bregolas | https://t.me/irish_sessions_ns

**ABC Transcription Tools by Michael Eskin** 👇

https://github.com/seisiuneer/abctools | https://michaeleskin.com/abc

## Version History

NS Session Setlist v.0.8.7: Encoder Upgrade (Mute Chords & DB Fixes)

+ Project updates:
  - Launcher: Mute Chords checkbox added to Tunebook Options
  - Tunebook: Adds override for MIDI Bass & Chords if active Mute Chords option is on

+ HTML updates
  - Main App (index.html):
    + "MIDI: Always mute chords in playback" checkbox added with default state unchecked
  
+ JavaScript updates
  - ABC Tunebook module (scripts-abc-tools.js)
    + abcToolsAlwaysMuteChords* localStorage variable added
    + muteChordsPlayback*: Decompress encoded ABC, inject MIDI instructions with 0 volume for bass & chords, re-encode update ABC
    + loadTuneBookItem now checks for Mute Chords option and passes the item's URL to muteChordsPlayback if the option is on
    + injectInstrument: Minor cleanup & refactoring to replace confusing variable name

+ Session DB updates:
  - Session DB updated to 2025-03-31
  - Dan Jeremiah's No. 2 restored in tunes, duplicated name fixed
  - Minor fixes in ABC & Chords for Sets & Tunes

<details>
  <summary>v.0.8: Encoder Upgrade</summary>

<details>
<summary>v.0.8.7: Encoder Upgrade (Mute Chords & DB Fixes)</summary>

+ Project updates:
  - Launcher: Mute Chords checkbox added to Tunebook Options
  - Tunebook: Adds override for MIDI Bass & Chords if active Mute Chords option is on

+ HTML updates
  - Main App (index.html):
    + "MIDI: Always mute chords in playback" checkbox added with default state unchecked
  
+ JavaScript updates
  - ABC Tunebook module (scripts-abc-tools.js)
    + abcToolsAlwaysMuteChords* localStorage variable added
    + muteChordsPlayback*: Decompress encoded ABC, inject MIDI instructions with 0 volume for bass & chords, re-encode update ABC
    + loadTuneBookItem now checks for Mute Chords option and passes the item's URL to muteChordsPlayback if the option is on
    + injectInstrument: Minor cleanup & refactoring to replace confusing variable name

+ Session DB updates:
  - Session DB updated to 2025-03-31
  - Dan Jeremiah's No. 2 restored in tunes, duplicated name fixed
  - Minor fixes in ABC & Chords for Sets & Tunes
</details>

<details>
<summary>v.0.8.6: Encoder Upgrade (Session DB Update)</summary>

+ Session DB updates:
  - Session DB updated to 2025-03-26
  - Sets & Tunes from Mars added (v.2)
  - Minor tweaks to Sets & Tunes from Mars
</details>

<details>
<summary>v.0.8.5: Encoder Upgrade (Add & Apply Session Survey Data)</summary>

+ Project updates:
  - ABC Encoder: Session Survey Data in .tsv format can now be added in Encoder Settings
  - ABC Encoder: ABC Sort now modifies output with available Session Survey Data
  - ABC Encoder: When applied, Sort adds or removes Set Leaders according to Session Survey Data

+ HTML updates
  - Main App (index.html):
    + Changed nav container enveloping h1 title to div to comply with the standard
    + Meta tags updated
  - ABC Encoder (abc-encoder.html):
    + Add Session Survey Data button added to Encoder Settings popover
    + Meta tags updated

+ CSS updates:
  - App Styles (nss-styles.css):
    + nss-btn-plus styles added

+ JavaScript updates
  - App Launcher module (scripts-ns-sessions.js)
    + Add Session Survey button handled
    + Import parseSessionSurveyData added
  - ABC Encoder module (scripts-abc-encoder.js):
    + sessionSurveyData array added as global variable
    + saveAbcEncoderOutput now passes Sort output to applySessionSurveyResults if sessionSurveyData is not empty
    + parseSessionSurveyData*: Read .tsv file via File Reader API and pass data to fillSurveyDataArray if it passes validation
    + fillSurveyDataArray*: Process raw Session Survey Data, push an array of headers and an array of responses to sessionSurveyData array
    + applySessionSurveyResults*: Modify abcContent with Session Survey Data by adding or removing Set Leaders according to survey results

+ Session DB updates:
  - Session DB updated to 2025-03-23
  - Removed commenting from chords ("^) after ABC Tools update
  - Minor ABC tweaks
</details>
<details>
<summary>v.0.8.4: Encoder Upgrade (Chord Viewer Module Styles)</summary>

+ Project updates:
  - Chord Viewer: All Chord Viewer styles moved to separate stylesheet (second stage of migration)
  - Chord Viewer: Data attributes are now primarily used in scripts and styles instead of classes
  - Chord Viewer icons file added to assets folder

+ HTML updates 
  - Main App (index.html):
    + Data attributes added to Chord Viewer Popover
    + Chord Viewer Popover elements are now split between the following categories:
      - data-popover for top level elements / sections
      - data-chords for chord elements
      - data-controls for interactable elements
      - data-ui for non-interactable elements / icons

+ CSS updates:
  - Chord Viewer module (styles-chord-viewer.css)
    + Chord Viewer styles now primarily rely on data attributes
    + Utility classes grid-center, flex-center, flex-between and wrapper-container added

+ JavaScript updates
  - Chord Viewer module (scripts-chord-viewer.js):
    + loadChordsToPopover, handleChordViewerClick and variables linking to Chord Viewer elements now all primarily use data attributes
    + normalizeAbcChordOrder function added for fixing cases of bad ABC chord input before calculations

+ Session DB updates:
  - Session DB updated to 2025-03-22
</details>
<details>
<summary>v.0.8.3: Encoder Upgrade (Chord Viewer Module Migration)</summary>

+ Project updates:
  - Chord Viewer: All Chord Viewer scripts moved to separate module (first stage of migration)
  - Chord Viewer: All Chord Viewer styles moved to separate stylesheet (first stage of migration)
  - Chord Viewer: Three functions are now export functions for initializing Chord Viewer elements, opening Chord Viewer popover and generating Chordbook JSON
  - ABC Encoder: Chord Viewer scripts moved to separate module, import makeAbcChordBook added
  - Launcher: Chord Viewer scripts moved to separate module, imports initChordViewer and openChordViewer added

+ HTML updates 
  - Main App (index.html):
    + data-action attributes added to interactable Chord Viewer elements
    + Chord Viewer stylesheet linked

+ CSS updates:
  - App Styles (nss-styles.css):
    + Full screen popover styles moved to Chord Viewer stylesheet, some shared classes remain
  - Chord Viewer module (styles-chord-viewer.css)
    + Separate styles for Chord Viewer elements added, shared classes to be migrated

+ JavaScript updates
  - Chord Viewer module (scripts-chord-viewer.js):
    + Variables for Chord Viewer elements renamed using chordViewer* template
    + All variables are now defined at the start of the file
    + openChordViewer*: New export handler function showing Chord Viewer popover, loading Slider settings and Chords from ABC using data passed from main app
    + initChordViewer*: New export function initializing Chord Viewer Popover
    + handleChordViewerClick*: New function handling clicks on interactable Chord Viewer elements
    + normalizeAbc*: New handler function calling cleanup ABC functions during Chord extraction
  - App Launcher module (scripts-ns-sessions.js)
    + initChordViewer and openChordViewer are now imported from Chord Viewer module
    + openSettingsMenu now calls openChordViewer, passing current setChords and tuneChords arrays
    + initChordViewer is now called on DOMContentLoaded
    + appButtonHandler now returns if element has data-action attribute to handle Chord Viewer buttons separately
  - ABC Encoder module (scripts-abc-encoder.js):
    + makeAbcChordBook functions are now imported from Chord Viewer module

+ Session DB updates:
  - Session DB updated to 2025-03-21
  - Galtee Hunt Set updated
  - Leitrim Fancy Set updated
  - Minor ABC title tweaks
    + appButtonHandler now returns if element has data-action attribute to handle Chord Viewer buttons separately
  - ABC Encoder module (scripts-abc-encoder.js):
    + makeAbcChordBook functions are now imported from Chord Viewer module

+ Session DB updates:
  - Session DB updated to 2025-03-21
  - Galtee Hunt Set updated
  - Leitrim Fancy Set updated
  - Minor ABC title tweaks
</details>
<details>
<summary>v.0.8.2: Encoder Upgrade (Session DB Update)</summary>

+ Session DB updates:
  - Session DB updated to 2025-03-17
  - Sets & Tunes from Alexey added (v.1)
  - Sets & Tunes from Sophie added (v.1)
  - Sets & Tunes from Oleg added (v.1)
</details>
<details>
<summary>v.0.8.1: Encoder Upgrade (Session DB Update)</summary>

+ Session DB updates:
  - Session DB updated to 2025-03-09
  - Chords from Oleg added to 25 sets (& Anton ed. arr.)
</details>
<details>
<summary>v.0.8.0: Encoder Upgrade (Refactor, Automation & Metadata Fetching)</summary>

+ Project updates:
  - ABC Encoder: New upgraded processing of import ABC fixing Sort-via-Encode issues
  - ABC Encoder: Sort will now optionally fetch select metadata from The Session API
  - ABC Encoder: Sort now supports fully automated conversion of The Session sets
  - p-limit and p-throttle by Sindre Sorhus added to project to limit API request rates

+ HTML updates:
  - ABC Encoder (abc-encoder.html):
    + Added new Encoder settings option enabling Sort to fetch metadata from The Session

+ JavaScript updates ('*' indicates new function or variable):
  - ABC Encoder module (scripts-abc-encoder.js):
    + saveAbcEncoderOutput: Refactored to correctly handle Sort-via-Encode and async operations
    + saveAbcEncoderOutput: Now returns an array containing abcEncoderOutput and abcEncoderTunesOutput
    + saveAbcEncoderOutput: Optionally fetches metadata from The Session via preProcessAbcMetadata
    + saveAbcEncoderOutput: Check for localStorage variable abcSortFetchesTsoMetaData* added
    + preProcessAbcMetadata*: Fetches metadata from The Session, replaces or adds Z: field with data 
    + fetchTsoMetadata*: Handles The Session API fetch requests for sets and settings metadata
    + throttleTsoRequests*: Throttles promises using p+throttle if number of requests is 50 or more
    + sortFilterAbc: Added removal of duplicate ABC fields if all fields of the kind are identical
    + addCustomAbcFields: Now correctly adds first Set subtitle
    + getEncodedAbc: Updated to handle async metadata fetching
    + getDecodedAbc: Now supports both N.S.S.S. and Michael Eskin's style of JSON keys naming
    + validateAbcFile: Now correctly validates JSON files encoded either by N.S.S.S. or ABC Tools
    + exportPlainTuneList: Fallback placeholder values added for cases of missing data
    + replaceDuplicateAbcFields*: Removes all but first repeating fields in ABC Sets, skips Medleys
    + Sort utility functions areAllArrValsTheSame, reduceArrToSlashSeparatedList added

+ Session DB updates:
  - Session DB updated to 2025-03-08
  - Sets & Tunes from Anton added (v.2)
  - Minor automated ABC tweaks
</details>
</details>
<details>
  <summary>v.0.7: Generate Chordbook</summary>

<details>
<summary>v.0.7.7: Responsive Chordbook (Syncopation Handling & ABC Cleanup)</summary>

+ Project updates:
  - Chords Viewer: Proper handling of ABC bars with syncopated chord arrangements
  - ABC Encoder: Input ABC now undergoes deep clean-up before Chordbook generation
  - ABC Encoder: Sort now removes duplicate Sets and Tunes by using a Map of unique primary titles; items added at the bottom of the file are treated as newest
  - Launcher & Encoder: Default settings are now loaded and logged from settings objects

+ HTML updates (abc-encoder.html):
  - Normalize ABC part endings option added to Encoder settings
  - Encoder buttons reordered, Sort is now the top button

+ JavaScript updates:
  - App Launcher module (scripts-ns-sessions.js)
    + initLocalStorage function added to initialize new localStorage items
    + initSettingsFromObject added to initialize options in localStorage using settings objects
    + printLocalStorageSettings added to log current settings, default and modified
  - ABC Encoder & Chords Viewer module (scripts-abc-encoder.js)
    + countBeatsInsertChords now handles syncopation by rounding the irregular number of beats in a fragment down (to a minimum of 1)
    + countBeatsInsertChords now inserts '–' in place of a missing first chord-beat
    + getCompleteAbcChordBar tweaked to handle missing first beat in a bar, such bars are now passed to countBeatsInsertChords
    + makeAbcChordBook now passes ABC to several cleanup functions to make sure no text in inline fields, comments and decorations ends up being counted as notes
      - removeAbcHeadersAndCommands: removes all header fields and inline commands and decorations
      - convertAbcIntervalsToSingleNotes: strips all the intervals / chords down to a single note
      - normalizeAbcTriplets: converts `(3ABC` triplets to `A/B/C` 
    + addCustomAbcFields now passes ABC to processPartEndings to standardise the formatting of identifiable part endings to `||` if localStorage option abcSortNormalizesAbcPartEndings is 1
    + processPartEndings also converts `::` to `:||\n|:`
    + sortFilterAbc and makeTunesFromSets now create a Map of unique primary title & ABC pairs to remove duplicate Sets or Tunes
    + makeStringTitleCase refactored to integrate toSortFriendlyTitle and prioritise title exceptions 
  - ABC Tunebook module (scripts-abc-tools.js)
    + abcTunebookDefaults settings object added
    + initToolsOptions renamed to initTunebookOptions and now initialises settings via initSettingsFromObject

+ Session DB updates:
  - Session DB updated to 2025-03-03
  - Sets & Tunes from Andrey added (v.1)
  - Sets & Tunes from André added (v.1)
  - Sets & Tunes from Vova added (v.1)
  - Stick Across the Hob Set added (Oliushka)
</details>
<details>
<summary>v.0.7.6: Responsive Chordbook (Smart Chord-Beats Recovery)</summary>

+ Project updates:
  - ABC Encoder: Chords extractor now detects and fills in the missing chords in incomplete bars
  - ABC Encoder: Chords autocomplete now supports bars with 3 out of 4 chords in duple-time tunes and 2 out of 3 chords in triple-time tunes in addition to 1 out of N chords in all tunes
  - Chords Viewer: Single chords in G (Em) format are no longer cloned but sliced and spread over the bar [G (Em) (Em)] to avoid clutter

+ HTML updates:
  - Classes added for Chords Popover theme buttons

+ CSS updates:
  - Hover & focus styles for Chords Popover buttons tweaked

+ JavaScript updates:
  - Chords Popover scripts:
    + Chord-beat count and recovery algorithm implemented (scripts-abc-encoder.js)
    + countBeatsInsertChords recovers missing chord-beats by counting notes against beats and inserting the sufficient number of chords
    + Note counting algorithm takes both note multipliers (numbers not preceded by /) and note divisors (/, //... or /Num) into the equation
    + getCompleteAbcChordBar refactored, getChordsFromTune updated to support the new algorithm
  - Theme and localStorage variable tweaks in main App scripts (scripts-ns-sessions.js)

+ Session DB updates:
  - Session DB updated to 2025-02-28
  - Chords from Oleg added to six sets
  - Petranu-Valse and Trip to Skye set chords fixed
</details>
<details>
<summary>v.0.7.5: Responsive Chordbook (Responsive Chords Popover & Launcher)</summary>

+ Project updates:
  - Launcher, Encoder, Playalong: Responsive app layout separate from Tunebook
  - Tunebook: Fullscreen Chords Popover reworked with responsive grid layout
  - Tunebook: Chords Popover Slider proportionally adjusts Chords text scale
  - Tunebook: Tunes and Chords toggle buttons remember user settings, more options
  - Tunebook: Footer close button now enables manual mode for less cluttered Tunebook
  - ABC Encoder: ABC Sort organises Chordbook data depending on number of beats
  - ABC Encoder: Fixes and additions for better styling of titles and chords
  - App and Tools scripts reworked to enable new control elements and responsive design
  - Accessibility: App tabbing, focusing and elements receiving aria-hidden revisited
  - New Icons added

+ HTML updates:
  - Laucher, ABC Encoder and Tunebook headers refactored to separate responsive layout from fixed Tunebook
  - Viewport settings now applied programmatically via meta tag content attribute on section swap
  - Fullscreen Popover completed with additional control elements

+ CSS updates:
  - Styles refactored: Global and local variables added for themes and dynamically adjusted settings
  - Container queries added for more responsive menus (app header, Launcher buttons, Playalong subtitles)
  - Media queries refactored: Cleanup after responsive design added & additional breakpoints
  - Fullscreen Chords Popover styles tested and implemented

+ JavaScript updates:
  - Chords Popover scripts: 
    + Chords text generator: loadChordsToPopover rewritten, now uses Chords JSON to create a responsive grid
    + Slider & Chords grid init: initPopoverSliders initialises values for Chords grid adjustable by Slider
    + Slider: appChordSliderHandler handle Chord Popover Slider events with smart scaling, adjusting font size, line height, line width and max width proportional to the vertical slider setting
    + Reset Slider Settings and show / hide slider control buttons added
    + Dark / Light colour theme and Theme switch button added
  - Main app scripts refactored (scripts-ns-sessions.js):
    + launchTuneBook and section swap functions updated with tweaks and autofocusing
    + initTunebookRadioBtns implemented for selection and storing of Full Screen Button setting (Open tune item in new page / Open chords in Chords Popover)
    + ariaHideMe and ariaShowMe functions added, functions updated
    + showRedOutlineWarning test function added for simple element error indication
    + Closing Tunebook's footer will now switch it to manual mode, swapping Tunebook switch buttons with Return to Launch Screen button
  - ABC Sort scripts updated with new Chordbook generation logic, title styling tweaks:
    + getCompleteAbcChordBar now accounts for triple / duple meter, groups duple meter bars with over 2 chords in two groups 
    + makeStringTitleCase accounts for [suffixes] in headers included in exceptions
  - ABC tools scripts updated with more options and to account for Launcher's responsive design:
    + User settings for Full Screen View button behavior and disabling auto-reload of Tunebook items added (localStorage variables: abcToolsFullScreenBtnShowsChords, abcToolsAllowTuneAutoReload)

+ Accessibility updates: 
  - A11y: App elements now automatically receive focus on section swap as previous section is hidden
  - A11y: Aria-hidden attribute is now applied to elements or blocks being hidden, removed as they are shown

+ Session DB updates:
  - Session DB updated to 2025-02-25
  - Chords added to Galtee Rangers Set to test both duple- and triple-time tunes in Chords Popover
  - Minor ABC tweaks
</details>
<details>
<summary>v.0.7.4: Generate Chordbook (Chords Popover Basic)</summary>

+ Project updates:
  - Basic implementation of fullscreen Chords Popover with tabulation
  - ABC Encoder now exports tab-separated chord strings within Chords JSONs

+ JavaScript updates:
  - ABC Encoder functions getChordsFromTune and getCompleteAbcChordBar now add tabs instead of spaces and properly indent Part subtitles (scripts-abc-encoder.js)
  - Temporary placeholder Chords JSON and trigger functions added to scripts-ns-sessions.js

+ CSS updates:
  - Basic nss-fullscreen-popover styles added and tweaked
  - Popover output container now uses white-space: pre-wrap

+ Session DB updates:
  - Session DB updated to 2025-02-19
</details>
<details>
<summary>v.0.7.3: Generate Chordbook (Bug Fixes, 3p Modules & Popover Polyfill)</summary>

+ Project updates:
  - ABC Encoder scripts refactored
  - Popover Polyfill by Oddbird added to project to enable older browser support
  - Third-party helper scripts have been moved to modules/scripts-3p
  - Test scripts have been moved to modules/scripts-tests
  - Work-in-progress solution for Safari not hiding filtered options

+ JavaScript updates:
  - Main ABC Encoder handler function refactored (scripts-abc-encoder.js)
  - saveAbcEncoderOutput: parseAbcFromFile split into two handler functions, main handler function now accepts abcContent, fileName and taskType as arguments
  - saveAbcEncoderOutput: Thorough commentary added to main handler function
  - getEncodedAbc now passes optionally sorted ABC to saveAbcEncoderOutput
  - downloadAbcFile and validateAbcFile tweaked for better output file naming and validation
  - Temporary solution added to appDropDownHandler for Safari not hiding options in dropdown menus, filtered options are now also disabled
  - LZString script moved from ABC Tools scripts to a separate module (scripts-abc-tools.js > scripts-3p/lz-string)
  - Popover Polyfill warning added to initialisation scripts (scripts-ns-sessions.js)

+ HTML updates:
  - Changed entry point module for abc-encoder.html to be scripts-ns-sessions.js
  - Popover Polyfill module popover.min.js added to index.html and abc-encoder.html

+ CSS updates:
  - Popover Polyfill fallback @supports block added to styles to avoid flashing of hidden elements on page load

+ Session DB updates:
  - Session DB updated to 2025-02-19
</details>
<details>
<summary>v.0.7.2: Generate Chordbook (Popovers For Options & Chords)</summary>

+ Project updates:
  - Launcher: Menu Popover with App Options checkboxes added with styles and scripts
  - ABC Encoder: Menu Popover with Encoder Settings checkboxes added with styles and scripts
  - Tunebook: Full Screen Popover for viewing Chords from Sets or Tunes separately added with basic styles
  - App Options update: Global variables can now be directly modified via Options and Encoder Settings menus
  - Tunebook: Tabs & MIDI options tweaked and expanded in wake of ABC Tools update, Default options has been split into ABC Tools Default and Piano options
  - New Icons added

+ JavaScript updates:
  - Scripts for updating Global variables in Local Storage via App Options and Encoder Settings Menus added
  - openSettingsMenu, appButtonHandler, initAppCheckboxes updated with Popover scripts (scripts-ns-sessions.js)
  - initToolsOptions updated with new Global variables (scripts-abc-tools.js)
  - loadTuneBookItem, loadTabsMidiOptions and injectInstrument updated with fixes, now both ABC Tools Default option and Piano + Notes option are available (scripts-abc-tools.js)
  - addCustomAbcFields fix for ABC body titles processing added (scripts-abc-encoder.js)

+ HTML updates:
  - Two Popover types, App Options and Full Screen Popover added to index.html (id: nss-popover-options, nss-fullscreen-popover)
  - Encoder Settings Popover added to abc-encoder.html (id: nss-popover-options)

+ CSS updates:
  - Options Popover styles added
  - Options Popover checkbox styles added
  - @media breakpoints for Popover added
  - Fullscreen Popover basic styles added

+ Session DB updates:
  - Session DB updated to 2025-02-18
</details>
<details>
<summary>v.0.7.1: Generate Chordbook (Chordbook Tweaks & Naming Update)</summary>

+ Project updates:
  - Naming convention update: All JSONs now use camelCase in object key names for consistency
  - ABC Tools scripts reorganised and updated with new naming convention
  - ABC Encoder: ABC Sort now splits generated Chords after every 4 bars excluding voltas
  - ABC Encoder: ABC Sort now correctly formats secondary tune types and titles in Sets
  - App Options update: Settings defaults are now initialised on app load and stored locally

+ JavaScript updates:
  - JSON object key names updated in scripts-abc-encoder.js, scripts-abc-tools.js and scripts-ns-sessions.js
  - addCustomAbcFields tweaked and refactored, ABC body titles processing now handled by formatAbcBodyTitles
  - formatAbcBodyTitles makes secondary R: field text Proper Case and subtitle T: field text Title Case
  - openSettingsMenu logs Tunes and Sets Chords output in test mode (scripts-ns-sessions.js)
  - initEncoderSettings and initAbcTools now initialise Global variables and store them to localStorage

+ Session DB updates:
  - Session DB updated to 2025-02-17
  - Sets and Tunes JSON objects now use key names "name", "leaders", "type", "url"
  - Chords JSONs now use key names "title", "chords" for Tune object and "setTitle", "tuneChords" for Set object
  - tunesets.json renamed to sets.json
</details>
<details>
<summary>v.0.7.0: Generate Chordbook</summary>

+ Project updates:
  - ABC Encoder: ABC Sort now generates Chords JSONs for Tunes and Sets
  - ABC Encoder: New Convert functions extract data from ABC _"chords"_, fill in chords for missing beats
  - ABC Encoder: Global settings variables are now in localStorage, to be editable in Encoder Options
  - ABC Encoder: ABC Sort now correctly identifies ABC Rhythm based on tune type provided in title via "[]"
  - Tunebook: Tunes / Chords toggle buttons implemented, Chords to be opened in Popover dialog window
  - README: Version History entries wrapped with HTML details / summary
  - New Icons added

+ HTML updates:
  - Tunebook: Footer updated with radio buttons switching between Tunes and Chords in Full Screen View
  - ABC Encoder page bottom elements changed to Options and Return to Launch Screen buttons

+ CSS updates:
  - Radio button styles added for input:is([name="nss-radio-view"]) and its label
  - Radio button label on-click style changes currently implemented fully in CSS
  - Options button and Launch button styles added for ABC Encoder elements (nss-option-btn, nss-launcher-link)

+ JavaScript updates:
  - Chords extraction and formatting functions added to scripts-abc-encoder.js (makeAbcChordBook, getChordsFromTune, getCompleteAbcChordBar)
  - getChordsFromTune extracts chords from each ABC item and converts them into a plaintext list with part numbers, bar lines and optional volta numbers
  - makeAbcChordBook exports JSON array of objects with chords organised depending on ABC Type (Set or Tune)
  - getCompleteAbcChordBar fills chord bars with the minimum number of chords depending on beats per bar (NB: ambiguous bars with two chords in triple-meter tunes are currently left untouched)
  - Tunebook's Full Screen View button now changes behavior depending on fullScreenSetting value, opening either tunes or chords (scripts-abc-tools.js)
  - setChords, tuneChords and corresponding data links added to (scripts-ns-sessions.js)
  - Options button function added, Launch button behavior tweaked for ABC Encoder (scripts-ns-sessions.js)
  - ABC Parse & Sort updated with chord export functions (parseAbcFromFile, downloadAbcFile, getSortedAbc)
  - addCustomAbcFields now checks for "[]" in the title to get R: field value if missing from Tune (Medleys)
  - New global settings variable added for switching on Chordbook export (abcSortExportsChordsFromTunes)

+ Session DB updates:
  - Session DB updated to 2025-02-17
  - Test Chords JSONs added (chords-sets.json, chords-tunes.json)
</details>
</details>
<details>
  <summary>v.0.6: Convert Sets to Tunes</summary>

<details>
<summary>v.0.6.6: Convert Sets to Tunes (Testing Medley Splitting)</summary>

+ Project updates:
  - ABC and ABC Encoder Tests converted to LF for consistency
  - Medley test added

+ Tests updates:
  - New test added for checking if ABC Sort correctly adds R: field values to Tunes when splitting a Set
  - N.S.S.S. Medley added for testing (abcImportMedleyNsssSet)

+ Session DB updates:
  - Session DB updated to 2025-02-15
</details>
<details>
<summary>v.0.6.5: Convert Sets to Tunes (Fixes & DB Update)</summary>

+ Project updates:
  - ABC Encoder: Fixes and improvements for ABC field value handler functions
  - Session DB updated with tweaks discovered during testing

+ JavaScript updates:
  - processAbcCCS and processAbcZ array checks fixed (scripts-abc-encoder.js)
  - S: field values can now be additionally subdivided by "+" to save up space, with value before "+" copied to each separate Tune's field

+ Session DB updates:
  - Session DB updated to 2025-02-12
  - Formatting of multiple value C: C: S: and Z: fields standartised
</details>
<details>
<summary>v.0.6.4: Convert Sets to Tunes (Correct ABC Field Splitting)</summary>

+ Project updates:
  - ABC Encoder: ABC Sort now passes Z: and C: C: S: field values for processing when splitting Sets into Tunes
  - ABC Encoder: Multiple value ABC fields listing composers, sources and transcription authors or editors are now correctly split between Tunes
  - ESLint added to project for extra tweaks in development

+ JavaScript updates:
  - addCustomAbcFields updated with abcZ and abcCCS processing logic under Sets to Tunes (scripts-abc-encoder.js)
  - New ABC field value handler functions added (getValueByAbcIndex, processAbcCCS, processAbcZ)
  - processAbcCCS and processAbcZ return a string with values based on Tune's index in a Set or a placeholder string
  - Minor tweaks and refactoring in ABC Encoder, Launcher and ABC Tools scripts after ESLint installed

+ Tests updates:
  - Minor fixes in expected test output ABCs
</details>
<details>
<summary>v.0.6.3: Convert Sets to Tunes (Testing ABC Field Splitting)</summary>

+ Project updates:
  - Tests: Additional tests for handling of custom ABC fields set up in Vitest

+ Tests updates:
  - New tests added for checking if ABC Sort correctly splits custom C: C: S: and Z: field values of a Set between several Tunes
  - Variations of N.S.S.S. Sets of Tunes added for testing (abcImportProcessedNsssSet, abcImportMultiComposerNsssSet, abcImportMultiZNsssSet, abcImportMultiZAndComposerNsssSet)
</details>
<details>
<summary>v.0.6.2: Convert Sets to Tunes (Setting up Tests)</summary>

+ Project updates:
  - ABC Encoder: Fine-tuning ABC Sort scripts with help of unit tests
  - ABC Encoder: Title processing tweaks for ABC Title and Subtitles
  - Tests: Basic tests for TSO Import ABC conversion set up in Bun

+ JavaScript updates:
  - processAbcTitle updated, now adds Title Prefix and "Set" at the end of Primary ABC Title for Sets
  - processAbcSubtitles now handles ABC Subtitles (titles of 2nd+ Tunes in a Set)
  - Tune Title formatting functions added (makeTuneTypeSingular, makeTuneTypePlural, toSortFriendlyTitle, processAbcSubtitles)

+ Tests updates:
  - ABC Encoder tests file created (scripts-abc-encoder.test.js)
  - Sample TSO Set of Tunes added for testing (abcImportRawTsoSet)
  - Tests checking how ABC Sort handles addition of custom fields and Sets to Tunes conversion added
</details>
<details>
<summary>v.0.6.1: Convert Sets to Tunes (Set to Tunes Tweaks)</summary>

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
</details>
<details>
<summary>v.0.6.0: Convert Sets to Tunes</summary>

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
</details>
</details>
<details>
  <summary>v.0.5: Save & Restore Tunes</summary>

<details>
<summary>v.0.5.5: Session DB Update</summary>

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
</details>
<details>
<summary>v.0.5.4: Session DB Update</summary>

+ Session DB updates:
  - Session DB updated to 2025-01-28
  - Sets & Tunes from Tania added (v.1)
  - Minor fixes in Mars and Tania Sets & Tunes
</details>
<details>
<summary>v.0.5.3: Session DB Update</summary>

+ Session DB updates:
  - Session DB updated to 2025-01-26
  - Sets & Tunes from Mars added (v.1)
</details>
<details>
<summary>v.0.5.2: Session DB Update</summary>

+ Session DB updates:
  - Session DB updated to 2025-01-25
</details>
<details>
<summary>v.0.5.1: Save & Restore Tunes (Save Last Set & Last Tune)</summary>

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
</details>
<details>
<summary>v.0.5.0: Save & Restore Tunes</summary>

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
</details>
</details>
<details>
  <summary>v.0.4: Tunebook Filter Options</summary>

<details>
<summary>v.0.4.4: Filter Options (Tune Load Tweaks)</summary>

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
</details>
<details>
<summary>v.0.4.3: Filter Options (Session DB Update)</summary>

+ Session DB updates:
  - Session DB updated to 2025-01-20
  - Tempos (Q:) standardised
  - ABC fixes & tweaks
</details>
<details>
<summary>v.0.4.2: Filter Options (Session DB Update)</summary>

+ Session DB updates:
  - Session DB updated to 2025-01-18
  - Four draft sets of various tune types added for Filter Options testing
</details>
<details>
<summary>v.0.4.1: Filter Options (Menu Fixes)</summary>

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
</details>
<details>
<summary>v.0.4.0: Filter Options (Initial commit)</summary>

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
</details>
</details>
<details>
  <summary>v.0.3: ABC Encoder</summary>

<details>
<summary>v.0.3.2: ABC Encoder (Encoder tweaks)</summary>

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
</details>
<details>
<summary>v.0.3.1: ABC Encoder (Encoder scripts)</summary>

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
</details>
<details>
<summary>v.0.3.0: ABC Encoder (Initial commit)</summary>

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
  - MIDI instructions removed from encoded data files, to be injected dynamically (injectInstrument)</details>
</details>
<details>
  <summary>v.0.2: Play Along Page</summary>

<details>
<summary>v.0.2.3: Session DB Update</summary>

+ Session DB updates:
  - Session DB updated to 2025-01-12
  - Spaces added between ABCs
  - Titles updated to restore "unsafe" characters
</details>
<details>
<summary>v.0.2.2: Play Along Page (Styles updated)</summary>

+ HTML updates:
  - Playalong page: 
    - Links wrapped in container divs
    - Links are now display: block and contain overlay div, title text and image

+ CSS updates:
  - Gradient added to h1 and buttons
  - Playalong page:
    - Outline gradient added via div with abs positioning & negative margins
    - Link hover styles updated
</details>
<details>
<summary>v.0.2.1: Play Along Page (Basic HTML)</summary>

+ Project updates:
  - Playalong page: Thumbnails updated

+ HTML updates:
  - Playalong page: Basic HTML added

+ CSS updates:
  - Playalong page: Basic styles added
</details>
<details>
<summary>v.0.2.0: Play Along Page (Initial commit)</summary>

+ Project updates:
  - Playalong thumbnails added</details></details>

<details>
  <summary>v.0.1: Initial App Outline</summary>

<details>
<summary>v.0.1.1: Session DB Update</summary>

+ Session DB updates:
  - Session DB updated to 2024-12-22
  - Naming format changed for C: / S: fields
  - Naming format standardised for C: Set Leaders field
  - Z: [Transcription By] and N: [Link to the Set] fields added
</details>
<details>
<summary>v.0.1.0: Initial App Version </summary>

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
</details>
<details>
<summary>v.0.0.2: Tunebook Outline</summary>

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
</details>
<details>
<summary>v.0.0.1: Initial Commit</summary>

+ Initial commit of raw export website file from Michael Eskin's ABC Transcription Tools.</details></details>