NS Session Setlist
========================================================================================

NS Session Tunebook by Anton Zille & Novi Sad Trad Sessions:

https://github.com/anton-bregolas | https://t.me/irish_sessions_ns

ABC Transcription Tools by Michael Eskin:

https://github.com/seisiuneer/abctools | https://michaeleskin.com/abc

## Version History

v.0.2.0: Play Along Page

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