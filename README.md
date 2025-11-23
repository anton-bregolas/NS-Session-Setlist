NS Session Setlist
========================================================================================

The tunebook app of the Novi Sad Irish Traditional Music Session integrating Michael Eskin's ABC Transcription Tools. Contains Anton Zille's **ABC Encoder** for managing ABC collections and creating Session DB files, **Chord Viewer** module for viewing ABC chords and **List Viewer / Set Maker** module for listing Tunebook items and making new ABC Sets.

🎵 [**NS SESSION APP**](https://anton-bregolas.github.io/NS-Session-Setlist/) 🎻 [**ABC ENCODER**](https://anton-bregolas.github.io/NS-Session-Setlist/abc-encoder.html) 🎵

## ABC Modules & Libraries

Module Name | GitHub Repo | Help Link |
| --- | --- | --- |
| 👉 ☑️ <a href="https://anton-bregolas.github.io/NS-Session-Setlist" target="_blank">**NS Session App by Anton Zille**</a> | <a href="https://github.com/anton-bregolas/NS-Session-Setlist" target="_blank">NS-Session-Setlist</a> | [README](#ns-tunebook-app) |
| 👉 <a href="https://anton-bregolas.github.io/NS-Session-Setlist/abc-encoder.html" target="_blank">**ABC Encoder Module by Anton Zille**</a> | <a href="https://github.com/anton-bregolas/NS-Session-Setlist" target="_blank">NS-Session-Setlist</a> | [README](#abc-encoder-module) |
| 👉 **Chord Viewer Module by Anton Zille** | <a href="https://github.com/anton-bregolas/NS-Session-Setlist" target="_blank">NS-Session-Setlist</a> | [README](#chord-viewer-module) |
| 👉 **List Viewer / Set Maker by Anton Zille** | <a href="https://github.com/anton-bregolas/NS-Session-Setlist" target="_blank">NS-Session-Setlist</a> | [README](#list-viewer--set-maker) |
| 👉 <a href="https://michaeleskin.com/abc" target="_blank">**ABC Transcription Tools by Michael Eskin**</a> | <a href="https://github.com/seisiuneer/abctools" target="_blank">abctools</a> | <a href="https://michaeleskin.com/abctools/userguide.html" target="_blank">GUIDE</a> |
| 👉 <a href="https://abcjs.net/" target="_blank">**abcjs by Paul Rosen and Gregory Dyke**</a> | <a href="https://github.com/paulrosen/abcjs" target="_blank">abcjs</a> | <a href="https://paulrosen.github.io/abcjs" target="_blank">DOCS</a> |

## NS Session App

Novi Sad Session Setlist (N.S.S.S.) is a pilot tunebook.app project that explores ways of managing ABC music collections across multiple platforms in a simple, streamlined fashion. This is a single-page app that employs responsive design and progressive web app (PWA) functionality to ensure that an up-to-date version of the session tunes, sets and chords database is accessible from any modern device regardless of its screen size.

The app may be installed via a PWA-supporting browser to guarantee offline access to the Session Tunebook or simply used in a browser tab. Session DB files are cached when the Tunebook is first opened.

> [!IMPORTANT]
> The app employs some of the latest web dev features. Updating to a fresh version of your browser is advised for the smoothest experience.

### How to install as web app:

* [Android phones & tablets](https://web.dev/learn/pwa/installation#android_installation)
* [Windows / Linux / MacOS](https://web.dev/learn/pwa/installation#desktop_installation)
* [MacOS Sonoma or newer](https://support.apple.com/en-asia/104996)
* [iPhone & iPad](https://web.dev/learn/pwa/installation#ios_and_ipados_installation)

### How it works for app user:

Open **Setlist 🎶** or **Tunelist 🎵** from the **Launch section** of the app to access the **Tunebook section** and load the latest version of the Session DB. Once loaded, the session’s Sets, Tunes and Chordbook data can be accessed offline. By Default, Session DB is set to be updated weekly (hard-refresh the app to update manually).

![A screenshot of the Launch section of the app](/assets/screens/screenshot-launch-desktop.webp)

The **Quick Help ⇧** dialog with brief introduction to Tunebook controls opens up on first load. It can later be accessed in the **Help Guide ❔** menu of the app. Help Guide offers detailed descriptions for every element of the Tunebook interface (press `Shift + F1` or **Show Help** button in the **Tunebook Actions ☰** hamburger menu to view). For help with using ABC Transcription Tools, see Michael Eskin’s detailed <a href="https://michaeleskin.com/abctools/userguide.html" target="_blank">User Guide</a>.

![A screenshot of the Quick Help dialog menu of the app](/assets/screens/screenshot-tunebook-quick-help.webp)

The Tunebook interface is split between the **Header**, the **Footer** and the **ABC frame**. Header and Footer are fully keyboard-navigable. See list of [Tunebook Shortcuts](#tunebook-keyboard-shortcuts) for key combinations used in various app sections. See <a href="https://michaeleskin.com/abctools/userguide.html#playing_your_tunes" target="_blank">Playing Your Tunes</a> section of the ABC Transcription Tools User Guide for help with navigation within the ABC frame.

**Optional controls** are accessible via `Shift + Enter` for keyboard users, `Right-Click` for mouse users or `Long Touch` for touchscreen users.

![A screenshot of the Tunebook section of the app](/assets/screens/screenshot-tunebook-desktop.webp)

Use **Tunebook Header** elements to filter and select items, switch between **Setlist 🎶** and **Tunelist 🎵** and view the current item in the **Full Screen** mode. Optional controls open **List Viewer / Set Maker** (when used on Tune Selector button) and **Chord Viewer** (when used on Full Screen button).

Use **Tunebook Footer** for accessing shortcuts to various modules and features. Open **Tunebook Actions ☰** menu to view the list of available shortcuts (central button in **Mobile mode**, bottom-right button in **Desktop mode**  or `SHIFT + F2`).

![A screenshot of the Tunebook Actions menu of the app](/assets/screens/screenshot-tunebook-actions.webp)

Both **Mobile 📲** and **Desktop 🖥️** layouts adapt to the current screen size. Wider screen layouts include extra side buttons. Pick two **Fav Buttons** useful for your current layout using optional controls on left-of-center and right-of-center slots. Default layouts feature a pair of **Full Screen behavior** radio buttons that change the binding of the top-right **Full Screen View / 👁️** button.

![Examples of adaptive mobile layout of the Tunebook section of the app](/assets/screens/screenshot-tunebook-mobile.webp)

The app auto-chooses the optimal display mode when the Tunebook is opened and keeps this setting until it is reloaded. ABC Transcription Tools are loaded in view-only mode on devices with small-to-medium screen sizes. To manually change the layout use **Mobile Mode 📲** and **Desktop Mode 🖥️** buttons.

To override the default behavior and always load the Tunebook in the preferred layout, choose `Always open Tunebook in Mobile Mode` or `Always open Tunebook in Desktop Mode` in **App Options ⚙️**

![A screenshot of the Tunebook section of the app when viewed from a tablet device with Mobile Mode and Desktop Mode settings enabled](/assets/screens/screenshot-tunebook-tablet-modes.webp)

The **List Viewer** module brings up a searchable list of filtered Tunebook items. Press `SHIFT + F3` to open List Viewer from the Tunebook interface, press the same combination or `🔍` button to open the **Search / Filter** menu. Use the dialog slider to resize tiles, toggle between color schemes with the theme button. Press `SHIFT + F4`, click on the lower-left **Start** button or use optional controls on any list item to switch to the **Set Maker** mode.

![Examples of adaptive mobile layout of the List Viewer module of the app](/assets/screens/screenshot-list-viewer-mobile.webp)

The **Set Maker** mode offers to combine Tunebook items into new sets using custom ABC Encoder algorithms. Mergeable ABC fields are combined by default (disable in **App Options ⚙️**). The resulting sets are loaded in a new window in ABC Transcription Tools.

![Examples of adaptive mobile layout of the Set Maker module of the app](/assets/screens/screenshot-set-maker-mobile.webp)

The **Chord Viewer** module displays guitar chords from the current ABC in a separate dialog window. Use the dialog slider to scale contents, press the theme button to toggle between color schemes, press the **Show / Hide GUI** button to save more screen space. Chord Viewer remembers all the GUI adjustments made by the user.

![Examples of adaptive mobile layout of the Chord Viewer module of the app](/assets/screens/screenshot-chord-viewer-mobile.webp)

### Tunebook Keyboard Shortcuts

Active Section | Key Combination | Description |
| --- | --- | --- |
| **Tunebook / Full Screen** | `SHIFT + F4` | Focus on ABC Frame |
| **Tunebook / Full Screen** | `SHIFT + "↓"`,<br>`SHIFT + "→"` | Load the next Set / Tune |
| **Tunebook / Full Screen** | `SHIFT + "↑"`,<br>`SHIFT + "←"` | Load previous Set / Tune |
| **Tunebook Interface** | `SHIFT + F1` | Open Help Guide menu |
| **Tunebook Interface** | `SHIFT + F2` | Open Tunebook Actions |
| **Tunebook Interface** | `SHIFT + F3` | Open List Viewer / Set Maker |
| **Tunebook Interface** | `SHIFT + F11` | Open Full Screen mode |
| **Full Screen Mode** | `ESC`,<br>`SHIFT + F11` | Exit Full Screen mode |
| **Full Screen Mode** | `SHIFT + "+"` | Zoom In (Up to 100%) |
| **Full Screen Mode** | `SHIFT + "-"` | Zoom Out (Up to 50%) |
| **ABC Transcription Tools** | `F3` | Rewind playback to start |
| **ABC Transcription Tools** | `F4` | Open ABC player,<br>Start / Pause playback |
| **List Viewer / Set Maker** | `SHIFT + F3` | Open Search / Filter menu |
| **List Viewer / Set Maker** | `SHIFT + F4` | Start Set Maker / Return to List |

### Tunebook Options Overview

Option Name | Default Setting | Comments |
| --- | --- | --- |
| `Save & load last opened Set or Tune` | **ON** | Store last opened Tunebook item between sessions |
| `Always open Tunebook in Mobile Mode` | **OFF** | Enable persistent mobile mode ignoring viewport size |
| `Share links open ABC Tools instead of app` | **OFF** | Always generate share links to ABC Transcription Tools |
| `Full Screen opens ABC Tools in new window` | **OFF** | Full Screen button redirects to ABC Transcription Tools |
| `App: Show Tunebook report at launch` | **OFF** | Show version info and Session DB stats on Tunebook startup |
| `App: Allow loading #links on startup` | **ON** | Auto-open Tunebook section or item on startup |
| `Filters: Add random emojis to Set Leaders` | **ON** | Add randomized animal emoji avatars to custom filters |
| `MIDI: Allow changing playback instrument` | **ON** | If disabled, Tab & MIDI presets have no effect on playback |
| `MIDI: Always mute chords in playback` | **OFF** | Add instructions to mute chords when opening Tunebook items |
| `Tabs: Allow adding Tablature to notes` | **ON** | If disabled, Tab & MIDI presets do not add tabs to notation |
| `Tunes: Allow automatic Tunebook reload` | **ON** | Auto-load items every time new filter or section selected |
| `Tunes: Open List Viewer on selector click` | **OFF** | Replace the native browser Tune Selector menu with List Viewer |
| `Chord Viewer: Generate chords dynamically` | **OFF** | Extract chords directly from ABC or Tune Selector instead of Chordbook **[1]** |
| `Chord Viewer: Use bold font for chords` | **OFF** | Make chords and barlines more readable on small screens |
| `List Viewer: Always hide slider input GUI` | **OFF** | Do not show List Viewer slider |
| `List Viewer: Search through ABC subtitles ` | **OFF** | Look through all tune titles & subtitles when filtering the list |

> [!NOTE]
> **[1]** Chord Viewer falls back to the last item loaded to Tune Selector when used with embedded ABC Transcription Tools. For tunebooks printing ABC to a page of the same origin, it can extract chords directly from the text with dynamic mode enabled.

### Instructions for ABC DB curator:

1. Get an unsorted ABC collection file (.abc or .txt)
  <br>💡 Quick Setbook idea:
    * Pick settings of tunes on [**The Session**](https://thesession.org/tunes)
    * Make Sets (_Play This in a Set_)
    * Download Setbook ABC file from:<br>`https://thesession.org/members/<userId>/sets`
2. Open [**ABC Encoder**](#abc-encoder-module) and check [**Encoder Settings**](#encoder-settings-overview)⚙️
3. Click `SORT` and select unsorted ABC file
4. Check [**output files**](#input--output-defaults) saved to Download
5. Click `ENCODE` and select sorted ABC file
6. Check [**Session DB files**](#input--output-defaults) saved to Download
7. _Optional:_ Host your Session DB files online
8. _Optional:_ [**Fork this repository**](https://github.com/anton-bregolas/NS-Session-Setlist/fork)
9. _Optional:_ Customize forked Tunebook & PWA:
    * Replace Session DB files in `/abc`, `/abc-chords`, `/abc-encoded`
    * Update Session DB file paths in `modules`/`scripts-nss-app.js`
    * Edit app name & metadata in `index.html`, `abc-encoder.html`
    * Edit app section titles in `styles`/`styles-nss-app.css`
    * Replace app icons: `favicon.ico`, `favicon.svg`, `assets`/`icons`
    * Replace playalong content: `index.html`, `assets`/`images`
    * Replace app screenshots: `assets`/`screens`
    * Edit PWA installation details in `app.webmanifest`
    * Adjust service worker behavior & cached file list in `sw.js`
    * Replace app/DB versions, cache prefix in `version.js`, `sw.js`
    * Edit abcTunebookDefaults in `modules`/`scripts-abc-tools.js`
    * Edit abcEncoderDefaults in `modules`/`scripts-abc-encoder.js`
    * Replace subdomain name in `CNAME`
    * Deploy to GitHub Pages: _Settings_ / _Pages_
    * Your Session Tunebook app is ready to use!

### Notes for developers

The app retrieves Tunebook and Chordbook data by fetching Session DB files specified in `scripts-nss-app.js`. Database files can thus be updated independently of the app. Session DB files are generated by the [**ABC Encoder**](#abc-encoder-module) module.

File Path | Module Name | Description |
| --- | --- | --- |
| `index.html` | **NS Session App** | NS Session App HTML markup |
| `/modules/scripts-nss-app.js` | **NS Session App scripts** | Scripts handling Launcher, Tunebook and Playalong app sections |
| `/modules/scripts-abc-tools.js` | **Custom ABC Tools scripts** | Modified and refactored scripts from ABC Transcription Tools Export Tunebook Website |
| `/modules/scripts-emoji-manager.js` | **App Emoji Manager scripts** | Optional scripts for displaying randomized emojis in Tunebook |
| `/modules/scripts-preload-nssapp.js` | **App Preload scripts** | Scripts executed before common app scripts are loaded |
| `/styles/styles-nss-app.css` | **NS Session App styles** | Common NS Session App styles |
| `/assets/icons/icons.svg` | **NS Session App icons** | Common NS Session App icons (Default set: Bootstrap Icons) |

## ABC Encoder Module

<a href="https://anton-bregolas.github.io/NS-Session-Setlist/abc-encoder.html" target="_blank">**ABC Encoder**</a> is a set of tools for organizing ABC music collections and converting .abc data to encoded Session DB files. Encoder allows to automate mundane sorting and formatting tasks and streamline abc-to-abc or abc-to-db process. It employs opinionated ABC field merging and ordering for optimized display of the multi-header ABC Sets within abcjs-based software.

Clicking on an Encoder tool button brings up a file selection dialog. Use `SORT` for manipulating ABC contents and generating Chordbooks. Use `ENCODE` for converting ABCs into .json data files or plaintext tunelists with ABC Transcription Tools-compatible URLs. Use `DECODE` for converting .json data files back into ABC. See **Input / Output Defaults** for examples of output.

Use **Encoder Settings** ⚙️ to fine-tune `SORT` and `ENCODE` algorithms. Click **Show Advanced Options** to view the complete set of sorting options. Settings can be loaded, saved and restored to default using dialog buttons. **N.S.S.S. ABC Encoder** comes with custom presets for creating Session DB for NS Session Setlist.

> [!TIP]
> **Mass-export tip**: With `ENCODE automatically passes tunes to SORT` and `SORT exports Tunes ABC from Sets ABC` settings enabled you can use `ENCODE` button to output two pairs of .abc and .json files (Sets and Tunes) from a single ABC Sets file.
>
> With `SORT extracts chords from Tunebook` and `ENCODE exports plaintext Tunelist with links` settings additionally enabled you can export four types of output files at once (sorted ABC, encoded ABC, Chordbook, plaintext Tunelist).

### Encoder Settings Overview

Setting Name | Default Setting | Comments |
| --- | --- | --- |
| `ENCODE automatically passes tunes to SORT` | **OFF** | Output all Encode and Sort file types selected |
| `ENCODE exports plaintext Tunelist with links` | **OFF** | Output .txt Tunelist with links for each ABC file |
| `ENCODE output is for ABC Tools export website` | **OFF** | Output text string compatible with ABC Tools Export Website |
| `SORT enforces custom N.S.S.S. ABC fields` | **ON** | Use custom C: C: S: and C: Set Leaders: ABC fields, order ABC tags à la NS Session Setlist |
| `SORT exports Tunes ABC from Sets ABC` | **ON** | Output separate ABC of Tunes converted from Sets |
| `SORT extracts chords from Tunebook` | **ON** | Output Chordbook JSON for each ABC file |
| `SORT removes tunes with no K: (strict mode)` | **OFF** | Do not output tunes with missing or empty K: field |
| `SORT fetches metadata from The Session` | **OFF** | Add C: and Z: data using The Session links found in ABC |

### Encoder Advanced Settings Overview

Features adjustable via Advanced Settings include (`*` signifies default):

- **Arrange ABC tunes by:** `Name*` / `Name minus A-An-The` / `ABC Tag` / `Original order`
- **Format ABC titles as:** `Title Case*`, `Remove ALL CAPS`
- **Handle articles in ABC titles:** `Remove opening articles*`, `Remove trailing articles*` / `ABC Title, The`
- **Handle ABC titles in Irish:** `Attempt to fix ABC titles in Irish*`, `Remove opening An articles*`
- **Handle ABC Set titles:** `Add first tune name as Set Title*` / `Add slash-separated list as Set Title`
- **Handle ABC prefix & suffix:** `Add TYPE: prefix*` / `Add [Type] suffix`
- **Handle ABC body formatting:** `Normalize ABC part endings*`
- **Remove duplicate ABCs:** `By ABC Title*` / `By ABC content`
- **Remove extra line breaks in ABC:** `Wipe extra line breaks`, `Wipes text after line breaks`
- **Skip editing ABC headers if:** `Do not edit headers if ABC ordered*`, `Do not edit titles if ABC ordered*`, `Do not update fetched TSO metadata*`
- **Prevent default Encoder behavior:** `Do not merge duplicate header fields`

### Input / Output Defaults

- **Input file name:** `NS-Session-Sets.abc` / `sets.json`
- `SORT enforces custom N.S.S.S. ABC fields` setting enabled

Tool | Input | Output |
| --- | --- | --- |
| `SORT` with `extract chords` disabled | `*.abc` / `*.txt` | `NS-Session-Sets.abc`, `NS-Session-Tunes.abc` |
| `SORT` with `extract chords` enabled | `*.abc` / `*.txt` | `NS-Session-Sets.abc`, `NS-Session-Tunes.abc`, `chords-sets.json`, `chords-tunes.json` |
| `ENCODE` with no additional settings enabled | `*.abc` / `*.txt` | `sets.json`, `tunes.json` |
| `ENCODE` with `pass tunes to SORT` enabled | `*.abc` / `*.txt` | `NS-Session-Sets.abc`, `NS-Session-Tunes.abc`, `sets.json`, `tunes.json` |
| `ENCODE` with `export plaintext Tunelist` enabled | `*.abc` / `*.txt` | `Tunelist[SourceABC].txt`, `Tunelist[TunesABC].txt`, `sets.json`, `tunes.json` |
| `ENCODE` with `pass tunes to SORT` and `export plaintext Tunelist` enabled | `*.abc` / `*.txt` | `NS-Session-Sets.abc`, `NS-Session-Tunes.abc`, `Tunelist[SourceABC].txt`, `Tunelist[TunesABC].txt`, `sets.json`, `tunes.json` |
| `ENCODE` with `pass tunes to SORT` and `export plaintext Tunelist` on and `SORT extracts chords from Tunebook` enabled | `*.abc` / `*.txt` | `NS-Session-Sets.abc`, `NS-Session-Tunes.abc`, `Tunelist[SourceABC].txt`, `Tunelist[TunesABC].txt`, `chords-sets.json`, `chords-tunes.json`, `sets.json`, `tunes.json` |
| `DECODE` | `*.json` | `NS-Session-Sets.abc` |

### Output ABC Field Order

Given the fluidity and variability of the de-facto applied <a href="https://abcnotation.com/wiki/abc:standard:v2.1" target="_blank">**ABC Notation Standard**</a>, Encoder attempts to strike a balance between rigid-but-predictable and highly-permissive output. As such Encoder v.1.0 combines an array of customizable settings with a pre-determined order of ABC Fields. Strict order of fields serves both aesthetic and functional purposes and enables the custom ABC Field-merging algorithm that produces clean-looking ABC Sets.

> [!NOTE]
> ABC Field merging is ON by default and can be turned off in Encoder Settings.

ABC Field Tag | Description | Mergeable? |
| --- | --- | --- |
| `X:` | Reference Number | **NO** |
| `T:` | ABC Set / Tune Title | **YES [1]** **[C]** |
| `C:` | **†** Composer | **YES** **[C]** |
| `C: C: S:` | **‡** Composer / Source | **YES [2]** |
| `C: Set Leaders:` | **‡** Set Leaders | **YES [2]** |
| `S:` | **†** Source | **YES** **[C]** |
| `Z:` | Transcription | **YES** **[C]** |
| `N:` | Notes | **YES** **[C]** |
| `A-W:` | Other Info Fields **[3]** | **YES** **[C]** |
| `IPUV:` | Instructions **[3]** | **NO** |
| `R:` | Rhythm | **YES** **[R]** |
| `M:` | Meter | **YES** **[R]** |
| `L:` | Note Length | **YES** **[R]** |
| `Q:` | Tempo | **YES** **[R]** |
| `K:` | Key | **NO** |

**[C]** Concatenated to slash-separated strings in primary header / Links take new line<br>
**[R]** Removed from secondary headers if duplicate / Stays put in header if unique<br>
**†** Standard fields with `SORT enforces custom N.S.S.S. ABC fields` setting **disabled**<br>
**‡** Custom field with `SORT enforces custom N.S.S.S. ABC fields` setting **enabled**<br>
**[1]** Handled separately by ABC Set title & subtitle-merging logic<br>
**[2]** Custom N.S.S.S. fields handled by additional field-merging logic<br>
**[3]** Additional Information / Instruction Fields:

Info Field Tag | Description | Mergeable? |
| --- | --- | --- |
| `A:` | Area | **YES** **[C]** |
| `B:` | Book | **YES** **[C]** |
| `D:` | Discography | **YES** **[C]** |
| `F:` | File URL | **YES** **[C]** |
| `G:` | Group | **YES** **[C]** |
| `H:` | History | **YES** **[C]** |
| `O:` | Origin | **YES** **[C]** |
| `W:` | Words (After ABC) | **YES** **[C]** |
| `I:` | Instruction | **NO** |
| `P:` | Parts | **NO** |
| `U:` | User Defined | **NO** |
| `V:` | Voice | **NO** |

### Note on Header Comments

> [!WARNING]
> Encoder aims to achieve clean ABC display in abcjs-based software by modifying the source ABC code and making output compact and unified. It does not account for alternative custom commands and solutions that may be added to ABC headers.
>
> Encoder v.1.0 stacks any abcjs-supported comments found in the header (lines starting with `%` and `"`) before the K: field. Any header lines that invalidate the abcjs output would also invalidate the current ABC Set / Tune in Encoder output.

### Notes for developers

File Path | Module Name | Description |
| --- | --- | --- |
| `abc-encoder.html` | **ABC Encoder** | ABC Encoder HTML markup |
| `/modules/scripts-abc-encoder.js` | **ABC Encoder scripts** | Scripts for ABC Encoder's Sort, Encode and Decode tools |
| `/styles/styles-nss-app.css` | **ABC Encoder styles** | Styles for ABC Encoder contents and UI |
| `/assets/icons/icons.svg` | **ABC Encoder icons** | Icons for ABC Encoder UI (Default set: Bootstrap Icons) |

### Required imports

Import Name | Import Description | Details |
| --- | --- | --- |
| `apStyleTitleCase` | Convert string to AP Title Case | Required for formatting ABC titles |
| `LZString` | LZ-based compression algorithm | Required for compressing and decompressing ABC strings |
| `pThrottle` | Throttle promise-returning functions | Required for throttling API requests to The Session |
| `makeAbcChordBook` | Generate Chordbook from ABC data | Required for creating Chordbook JSON with Encoder's Sort tool. Imported from `scripts-chord-viewer.js` |
| `localStorageOk`, `fetchData`, `initSettingsFromObject`, `initAppCheckBoxes`, `displayWarningEffect`, `displayNotification` | Shared NS Session App scripts | Required for initializing localStorage items, fetching data and displaying notifications. Imported from `scripts-nss-app.js` |

## Chord Viewer Module

### Notes for developers

File Path | Module Name | Description |
| --- | --- | --- |
| `index.html <dialog id="chord-viewer">` | **Chord Viewer Dialog** | Chord Viewer Dialog HTML markup |
| `/modules/scripts-chord-viewer.js` | **Chord Viewer scripts** | Scripts for extracting chords from ABC, generating Chordbook and displaying Chord Viewer Dialog |
| `/styles/styles-chord-viewer.css` | **Chord Viewer styles** | Styles for Chord Viewer Dialog contents and UI |
| `/assets/icons/icons-chord-viewer.svg` | **Chord Viewer icons** | Icons for Chord Viewer Dialog UI (Default set: Bootstrap Icons) |

### Required imports

See comments in `scripts-chord-viewer.js` for more details.

Import Name | Import Description | Details |
| --- | --- | --- |
| `LZString` | LZ-based compression algorithm | Required for decompressing ABC encoded by LZString |
| `storageAvailable` | Detect if localStorage is available | Required for localStorage checks (replaceable by custom logic) |
| `getLastTunebookUrl` | Get last URL loaded into ABC Tools | Required for extracting ABC in Chordbook Mode (replaceable by custom logic). Imported from `scripts-abc-tools.js` by default |
| `displayWarningEffect`, `displayNotification` | Custom scripts for user notifications | Replaceable by placeholder functions or custom logic. Imported from `scripts-nss-app.js` by default |

## List Viewer / Set Maker

### Notes for developers

File Path | Module Name | Description |
| --- | --- | --- |
| `index.html <dialog id="list-viewer">` | **List Viewer Dialog** | List Viewer Dialog HTML markup |
| `/modules/scripts-list-viewer.js` | **List Viewer scripts** | Description |
| `/styles/styles-chord-viewer.css` | **List Viewer styles** | Description |
| `/assets/icons/icons.svg` | **List Viewer icons** | Icons for List Viewer Dialog UI (Default set: Bootstrap Icons) |

### Required imports

See comments in `scripts-list-viewer.js` for more details.

Import Name | Import Description | Details |
| --- | --- | --- |
| `LZString` | LZ-based compression algorithm | Required for decompressing ABC encoded by LZString |
| `storageAvailable` | Detect if localStorage is available | Required for localStorage checks (replaceable by custom logic) |
| `makeTunesFromSets`, `sortFilterAbc` | Custom scripts for making ABC Sets | Required for creating ABC Sets and generating Set URLs. Imported from `scripts-abc-encoder.js` by default |

## Version History

<details>
  <summary><b>Beta version updates (v.1.1+)</b></summary>

**v1.1.19: Fix Long CCS Fields**

+ ABC Encoder module updates:
  - Fix Encoder logic for splitting C: C: S: fields longer than 100 chars
  - Add "Common Source + " pattern recognition for long C: C: S: field splitting logic

**v1.1.18: Fix Focus on Viewer Close**

+ App / Chord Viewer / List Viewer updates:
  - Fix app not finding first visible focus element on viewer close

**v1.1.17: Session DB Update**

+ Session DB Updates:
  - Update to version 2025.11.19.1
  - Add chords for Ash Grove Set, Boys on the Hilltop Set, Lucy Farr's Set, Moyard Set

**v1.1.16: Session DB Update**

+ Session DB Updates:
  - Update to version 2025.11.12.1
  - Add chords for Imelda Roland's Set

**v1.1.15: Add Fallback Fonts**

+ App updates:
  - Add Fira Sans as main fallback font
  - Add more fallback fonts to declarations
  - Fix inconsistent btn-x font display, replace with icon
  - Icons updated

+ PWA updates:
  - Add fallback font to cached files

**v1.1.14: Session DB Update**

+ Session DB updates:
  - Update to version 2025.10.10.1
  - Add Samhain Finale Medley Set (& Anton ed. arr.)
  - Add chords to Empty Wallet Waltz & more tunes
  - Fix long C: C: S: lines with new split to S: Encoder logic (automated)

**v1.1.13: Fix TSO Metadata Updating**

+ ABC Encoder module updates:
  - Add C: C: S: field splitting for S: values longer than 100 chars (data moved to S: field)
  - Fix C: C: S: / C: + S: fields processing with more robust fallbacks
  - Add Skip updating TSO metadata option to Encoder settings (on by default)

**v1.1.12: Session DB Update**

+ Session DB updates:
  - Update to version 2025.10.01.1
  - 9 sets from Anton added + arr., 1 set from Oliushka tweaked
  - Ballydesmond & Lad O'Beirne's sets renamed to avoid duplication

**v1.1.11: Fix Encoder Edge Cases**

+ ABC Encoder module updates:
  - Fix Sort skipping title formatting in Deep Edit Mode
  - Fix cases of C: C: S: not being filled from TSO metadata
  - Fix S: data loss from C: C: S: if other S: fields present
  - Add more robust checks for abcCCS and Session Survey

**v1.1.10: Update README, CSS & SW Tweaks**

+ PWA updates:
  - Update HTML cache retrieving logic

+ Tunebook updates:
  - Add CSS variables for all page titles

+ README updates:
  - Add How to install as web app
  - Add Instructions for ABC DB curator
  - Minor README tweaks

**v1.1.9: Fix PWA offline refresh**

+ PWA updates:
  - Add explicit navigate instructions to prevent "offline" app screen on hard refresh

**v1.1.8: Fix Styles in iOS Safari**

+ Tunebook updates:
  - Swap dvh for svh for iOS browsers styles only
  - Disable filter for Safari popover button styles (buggy in Safari / Safari for iOS)
  - TO DO: Test incorrect page scaling on Safari minimize/maximize
  - Full Screen mode Zoom In / Out limits expanded for Desktop mode

**v1.1.7: Session DB Update**

+ Session DB updates:
  - Update to version 2025.09.18.1
  - Chords from Oleg added to 10 sets (& Anton ed. arr.)

**v1.1.6: Add GoatCounter**

+ App updates:
  - Add GoatCounter, a privacy-oriented analytics tool for basic visitor stats

**v1.1.5: Add Browser-Specific Tweaks**

+ App updates:
  - Add getBrowserId function returning generalized browser & platform info string
  - Add data-browser attribute derived from user agent hints to body on page load
  - NB: Use for edge cases when feature checks are impossible (Safari bugs etc.)

+ Tunebook updates:
  - Refactor & rename checkIfSafariBrowser => checkIfSafariLikeBrowser
  - Refactor & rename checkIfIosSafariBrowser => checkIfIosBrowser
  - Add iOS-specific styles for fullscreen GUI

**v1.1.4: Fix Playalong Links**

+ App updates:
  - Add YouTube links to live notation videos for Playalong items
  - Remove Soundslice links from Playalong items

**v1.1.3: Tweak Caching & Touch Events**

+ PWA updates:
  - Add app icons to cached resources in SW
  - Add app id to webmanifest (matches start_url)
  - Remove deprecated icon types & metadata
  - Remove additional cached busting queries

+ App updates:
  - Change Service Worker registration path to "/sw.js"
  - Add recommended { passive: true } option to touch events
  - Add touch-action: pan-x pan-y to body (accidental double-tap zooming prevention test)

**v1.1.2: Fix Service Worker for FF**

+ PWA updates:
  - Remove exports / imports for sw.js: Firefox does not support { type: 'module' } service workers
  - Add APP_VERSION to sw.js, add sw.js update to local auto-update-version scripts

**v1.1.1: Fix Subtitles Search & DB**

+ List Viewer updates:
  - Fix missing dataset reference for loading subtitles data into tiles

+ App updates:
  - Fix init script for Tunebook-only element not used in ABC Encoder

+ Session DB updates:
  - Revert missing Cuas set, fix Petranu Vals set

**v1.1.0: Progressive Web App**

+ PWA updates:
  - Add `app.webmanifest`
  - Add app icons `/assets/icons/`
  - Add app screenshots `/assets/screens`
  - Add Service Worker scripts `sw.js`
  - Add sw.js registration & logging
  - Set up Service Worker cached files list
  - Set up Service Worker cache versioning (ns-app-cache-110)
  - Set Service Worker expiration / reload time limit (7 days)

+ Tunebook updates:
  - Add subtitles handling to ABC Tools scripts
  - Add listViewerSearchSubTitles to Tunebook options (default: 0)
  - Add tuneBookAlwaysUseDesktopMode to Tunebook options (default: 0)
  - Add ABC frame focus label button to aid keyboard navigation
  - Add ABC frame focus label handling scripts toggleAbcFocusLabel, initAbcFrameLabel
  - Add ABC frame focus label tab-through triggers handling to keyboard handler
  - Update names in HTML, scripts & styles: helpDialog -> quickHelpDialog
  - Update persistent mode handling (Mobile and Desktop)
  - Add keyboard shortcuts handling:
    * `SHIFT + F2` Open Tunebook Actions
    * `SHIFT + F2`, `ESC` Close Tunebook Actions
    * `SHIFT + F3` Open List Viewer / Set Maker
    * `SHIFT + F4` Focus on ABC Frame
    * `SHIFT + F11`, `ESC` Fulls Screen: Exit Full Screen mode
    * `SHIFT + "+"` Fulls Screen: Zoom In
    * `SHIFT + "-"` Fulls Screen: Zoom Out
    * `SHIFT + "↓"`, `SHIFT + "→"` Load next Set / Tune
    * `SHIFT + "↑"`, `SHIFT + "←"` Load previous Set / Tune

+ ABC Encoder updates:
  - Add ABC Subtitles handling to Encode (New Session DB JSON format)
  - Add subtitles key/value pairs to `sets.json` and `tunes.json`

+ List Viewer updates:
  - Add ABC Subtitles data to tiles
  - Add ABC Subtitles Search / Filter handling
  - Fix starting search index for Typeahead
  - Add keyboard shortcuts handling:
    * `SHIFT + F3` Open Search / Filter menu
    * `SHIFT + F4` Start Set Maker / Return to List

+ Chord Viewer updates:
  - Fix Show / Hide GUI button opacity in focused state

+ README updates:
  - Add Tunebook manual
  - Add keyboard shortcuts
  - Add app screenshots
  - Update short descriptions
</details>

<details>
  <summary><b>Alpha version updates (v.1.0+)</b></summary>

**v1.0.51: Update README & Versioning**

+ App updates:
  - Use 1.0.x instead of 1.0.0.x for alpha version numbers
  - Revert Session DB links to main

+ README updates:
  - Add Readme entries for v1.0.0-v1.0.51

**v1.0.50: Add Help Guide Descripts**

+ Tunebook updates:
  - Update Quick Help / Help Guide classes for more clarity
  - Refactor Help Guide text element, split title & description
  - Add missing data-load attributes to Tunebook UI elements
  - Update helpGuidePopoverHandler handler function
  - Add addHelpGuideDescription handler function
  - Add Help Guide Descriptions for all Tunebook UI elements

**v1.0.49: Add Safari Fallbacks**

+ List Viewer module updates:
+ Chord Viewer module updates:
  - Add detect Safari logic to dialog init script
  - Add data-browser="safari" attribute to dialog
  - Add Safari fallback styles for Slider

**v1.0.48: Fix Safari Tunebook Nav**
+ Tunebook Updates:
  - Add isSafari check to switchTuneBookItem to fix arrow navigation

+ App updates:
  - Fix Popover Polyfill not being applied to Tunebook Action Popup: Add fallbacks for :popover-open
  - Fix filters stretching Tunes Selector in Safari: Fixed width for viewport width < 880px

+ README updates:
  - Fix markdown

**v1.0.47: Fix Browser CSS Bugs**

+ App updates:
  - Fix Popover Polyfill not being applied to Tunebook Action Popup: Add fallbacks for :popover-open
  - Fix filters stretching Tunes Selector in Safari: Fixed width for viewport width > 880px
  - Fix FOUC in Firefox on app load: Add dummy <head> script workaround to make sure CSS is fully applied

**v1.0.46: Update App README**

+ README updates:
  - Add Tunebook Options Overview to App Readme
+ App updates:
  - Add missing notifications for enabled/disabled Tunebook Options
+ Tunebook updates:
  - Add listViewerHideSliderGui to abcTunebookDefaults

**v1.0.45: Add Encoder README**

+ README updates:
  - Update README intro
  - Add ABC Modules & Libraries section
  - Add Readme sections for App, Encoder, CVW and LVW
  - Add developer notes for App, Encoder, CVW and LVW
  - Add App Readme Intro
  - Add ABC Encoder Readme:
    * Intro
    * Encoder Settings Overview
    * Encoder Advanced Settings Overview
    * Input / Output Defaults
    * Output ABC Field Order
    * Note on Header Comments

**v1.0.44: Add Encoder Merge Check**

+ ABC Encoder updates:
  - Add Merging Fields Disabled check to ABC Sort post-processing
  - RMLQ header fields will now remain unchanged if skip merging is on
  - Replace Tunes.abc button with GitHub Readme button in Encoder UI

**v1.0.43: Add Show Help on 1st Load**

+ Tunebook updates:
  - Add Show Quick Help on first Tunebook load
  - Add List Viewer: Always hide slider input GUI checkbox to Tunebook Options
+ List Viewer module updates:
  - Update hide slider input GUI logic
  - Update imports and utility functions, move getFirstCurrentlyDisplayedElem to module
+ Chord Viewer module updates:
  - Update imports and utility functions, move getFirstCurrentlyDisplayedElem to module

**v1.0.42: Fix Safari iOS Help bug**

+ Tunebook updates:
  - Add iOS Safari checker function
  - Add disable / enable Tunebook selectors functions
  - Add disable Tunebook selectors on Help Guide Popover open
  - Add reenable Tunebook selectors on Help Guide Popover close

**v1.0.41: Session DB Update**

+ Session DB Updates:
  - Update to version 2025.08.27.1
  - Empty Wallet waltz added, Petranu Vals tweaked

**v1.0.40: Update Tune DB Links**

+ Tunebook updates:
  - Change Tune DB links from /main/ to /test/

**v1.0.39: Fix LVW Arrow Navigation**

+ List Viewer module updates:
  - Refactor lastSelectedIndex storage & recall with data-index
  - Update toggleSetMakerSelection, assign data-index values to lastSelectedIndex
  - Add getLastSelectedIndex to update last selected index on deselect
  - Refactor Arrows / Home / End navigation in handleTilesKeyboardNavigation
  - Refactor Shift + Click navigation in handleTilesShiftClick
  - Refactor Ctrl + Shift + A logic in handleListViewerKeyPress
  - Refactor arrow navigation in selectTilesWithShiftArrow and focusOnNextTile
  - Update handleListViewerClick, handleTilesMouseEvents, handleTilesListBoxFocusIn
  - Add selectAllTiles, deselectAllTiles, selectTilesToListStart, selectTilesToListEnd as separate functions
  - Add focusOnBtnX and focusOnModeSwitchBtn as separate functions, update quitListViewer
  - Rearrange List Viewer function categories

**v1.0.38: Add Search Filter Input**

+ List Viewer module updates:
  - Add Search button to LVW footer
  - Add Search Filter input GUI to LVW header
  - Remove Show or hide GUI button from footer (TO DO)
  - Add Search Filter input GUI styles
  - Fix Odd / Even tiles styles with of :not
  - Add List Viewer Search Input handler (handleSearchFilterInput)
  - Add Process search / type-ahead string handler (normalize case, apostrophies, diacritics)
  - Update initListViewer handler with input event listener
  - Add Filter Tiles / Clear Tiles handlers
  - Add Show / Hide / Toggle Search Input handlers
  - Update LVW click and keyboard event handlers
  - Update LVW tiles focusin and navigation handlers (TO DO)
  - Update Quit List Viewer / Reset Set Maker handlers
  - Add LVW keyboard navigation:
    + Ctrl + Shift + F to toggle search input
    + Ctrl + Shift + A to select all tiles in Set Maker mode
    + Enter refreshes filtered tiles if search input in focus
    + Type-ahead searches for normalized keys with Shift allowed

**v1.0.37: Fix Init Fav Buttons**

+ Tunebook updates:
  - Fix initTunebookFavBtns resetting both favs to radio on reload

**v1.0.36: Add Safari Filter Logic**

+ Tunebook update:
  - Fix disabled Tune Selector options appearing in dropdown list in Safari browser
  - Add repopulateTuneSelector function for clearing and creating Tune Selector options
  - Add checkIfSafariBrowser checker function
  - Update filterTuneBook with Safari fallback logic
  - Update resetTuneBookMenus with Safari fallback logic

**v1.0.35: Responsive Help Defaults**

+ Tunebook updates:
  - Add default Help Guide instructions via pseudo-elements
  - Add data-text attribute, update helpGuidePopoverHandler
  - Add support block styles to Tunebook selectors for browsers with customizable select (Chrome)

**v1.0.34: Add Help Menu Navigation**

+ Tunebook updates:
  - Add Show Quick Help mini button to Help Guide (mobile viewports)
  - Add Show Help Guide Popover button to Quick Help Dialog, update button handler
  - Add GitHub README button to Help Guide Popover, update Help Popover handler
  - Refactor Quick Help Dialog grid, position Open Help Guide / Close Quick Help buttons

**v1.0.33: Add Help Guide Popover**

+ Tunebook updates:
  - Add Help Guide Popover linking to Quick Help Dialog
  - Add Help Guide Popover handler & status checker
  - Add basic Help Guide functionality (display item title attr)
  - Add Show Quick Help button to open Help Dialog from popover
  - Add data-tunebook attribute for checking Tunebook open state
+ List Viewer updates:
  - Fix focus shift after long press from List view
+ App updates:
  - Fix hash routing init

**v1.0.32: Add Set Maker Long Touch**

+ List Viewer module updates:
  - Add separate startSetMaker handler
  - Add touch event handler for touchstart / touchend / touchmove
  - Add contextmenu events to LVW mouse events handler
  - Add Long Press event handling to LVW: Star Set Maker on Long Touch / Right-Click / Shift + Click
+ Tunebook updates:
  - Change full screen GUI breakpoint for Help Dialog to 480px
  - Tweak Help Dialog descriptions

**v1.0.31: Add Help Dialog Menu**

+ Tunebook updates:
  - Add Help Dialog HTML and arrow icons
  - Add Help Dialog CSS with breakpoints and mobile / desktop mode adjustments
  - Add Help Dialog handlers openHelpDialog & showHelpDescription
  - Add Help Dialog open and close events to button handler
  - Add Help Dialog init function initHelpDialog, load on DOMContentLoaded
  - Add Help Dialog Tunebook-specific shortcut Shift + F1
  - Add Full Screen Mode Tunebook-specific shortcut Shift + F11
  - Add Open Chord Viewer with Shift + Enter / Right-Click / Long Touch on Full Screen Button
  - Add focus on Exit Full Screen Mode button on successful fullscreen event
  - Add prevent select on button elements

**v1.0.30: Fix Action Menu Taborder**

+ Tunebook updates:
  - Fix Tunebook Actions trigger button styles for desktop mode
  - Fix tabbing order in Tunebook Actions menu for all modes
  - Add experimental CSS feature reading-flow to Actions container for supported browsers
  - Add experimental CSS feature reading-order to Actions items for supported browsers

**v1.0.29: Add LVW Dropdown Override**

+ Tunebook updates:
  - Add List Viewer overrides Tune Selector dropdown to Tunebook options
  - Add mousedown / mouseup overrides to mouse handlers (only when LVW option selected)
  - Add Open LVW with Shift + Enter / Right-Click / Long Touch on Tune Selector
  - Add Hide / Show Fav button containers when switching between radio items and Fav buttons
  - Fix Footer Fav buttons touch area for smaller viewports

**v1.0.28: Add Fav Btn Right Click**

+ Tunebook update:
  - Add contextmenu event handling to open Fav button picker with right mouse click

**v1.0.27: Fix Fav Btn Keyboard Nav**

+ App updates:
  - Add contextmenu event handling to mouse events handler

+ Tunebook updates:
  - Refactor Long Press for keyboard: Shift + Enter replaces long press
  - Add prevent contextmenu events on Long Press buttons
  - Add Footer grid adjustments for small mobile viewports

**v1.0.26: Fix Fav Btn Mobile Styles**

+ Tunebook updates:
  - Fix disappearing Launch Screen Fav button on mobile viewports
  - Add enlarged small mobile viewport size for Fav button icons / text

**v1.0.25: Add Restore Fav Btns**

+ Tunebook updates:
  - Add save Fav button data to localStorage to button handler
  - Add Fav button init handler initTunebookFavBtns
  - Fix Footer padding-right

**v1.0.24: Add Switch Fav Btn**

+ Tunebook updates:
  - Add Footer Fav button switch handler switchTuneBookFavBtn
  - Add Fav picker mode click override to button handler
  - Refactor Footer central container to grid
  - Add styles for Footer Fav buttons

**v1.0.23: Add Long Press handling**

+ Project updates:
  - Add Long Press functionality

+ App updates:
  - Add radio input event handler
  - Add mouse, touch and keyboard event handlers
  - Handle mousedown, mouseup, mousemove, touchstart, touchend, touchmove, keydown, keyup

+ Tunebook updates:
  - Add Long Press timeout global variable: longPressTimeoutId
  - Add Long Press handlers: appSetLongPressTimeout, appClearLongPressTimeout
  - Add activateLongPressFavBtn handler and update mouse / touch / keyboard event handlers
  - Add focusOnActivePopoverElem utility function
  - Rename Footer container classes
  - Update radio buttons, add Fav btn container
  - Add Long Press data attributes to Fav buttons

**v1.0.22: Refactor Tunebook Actions**

+ Tunebook updates:
  - Refactor Tunebook Actions Popup menu buttons
  - Merge Actions buttons with wrapper divs for larger focus area
  - Add more Actions buttons for Pick Fav buttons mode
  - Add mode data attr to Actions Popup, "open" by default
  - Add "pick-fav-left" / "pick-fav-right" mode styles
  - Actions menu now adjusts depending on Tunebook mode and popup mode

**v1.0.21: Fix LVW & CVW navigation**

+ List Viewer module:
  - Refactor creation of reusable iterative tiles arrays
  - Fill tileItemsArr and tileTitlesArr separately, reuse tileItemsArr
  - Fix Shift + <key> navigation in Set Maker, improve selection logic

+ Chord Viewer module:
  - Enlarge default slider width

**v1.0.20: Add Create New Set to LVW**

+ List Viewer module:
  - Add createTuneSetUrl function for creating New Set from tile items
  - Create Set button now opens New Set URL in ABC Tools
  - Import ABC Encoder functions for Tune <> Set conversions

**v1.0.19: LVW em Listbox refactor**

+ List Viewer module:
  - Refactor List Viewer to use em units and independent root font-size
  - Refactor List Viewer tiles as ul / li with role="option"
  - Refactor footer section, add status div and Create Set button
  - Add keyboard navigation in line with ARIA Authoring Practices Guide (APG)
  - Add type-ahead search for List Viewer options in line with APG
  - Add breakpoints for mobile devices with font coefficients
  - Add container queries to header and footer for mobile viewports

+ Tunebook & Launcher:
  - Add timeout for status notifications to avoid clash with refocusing

**v1.0.18: Chord Viewer em refactor**

+ Chord Viewer module:
  - Fix triplet bug, add additional ABC cleanup step (accidentals, decorations) to Chord Viewer scripts
  - Refactor Chord Viewer to use em units and independent root font-size
  - Refactor dynamically created CVW elements with font-size to use containers
  - Remove getRootFontSizeModifier from scripts, handled by CSS
  - Chord Viewer now scales fonts and ui elements independently from app
  - Add breakpoints for mobile devices with font coefficients
  - Add more adjustable CSS variables with consistent naming to CVW stylesheet

+ List Viewer module:
  - Fix "need 2+ items" warning entering Set Maker mode
  - Rename CSS variables for more consistency

**v1.0.17: Session DB Update**

+ Session DB Updates:
  - Update to version 2025.07.16.1
  - Fix Chordbook triplet bug handled in Chord Viewer update

**v1.0.16: Add Set Maker counters**

+ List Viewer / Set Maker module:
  - Add counter & outline to selected items in Set Maker mode
  - Add Set Maker data-attr to List Viewer for switching header styles
  - Add styles to counter spans for dark & light modes
  - Add recalc function to renumber counters on deselect
  - Expand reset Set Maker function to include changes

**v1.0.15: Add Set Maker GUI to LVW**

+ List Viewer module:
  - Add List Viewer / Set Maker slider for adjusting tiles height
  - Add custom styles to slider as progressive enhancement
  - Add Set Maker / Return to List Viewer buttons
  - Add basic Set Maker start, select and reset functions
  - Add List Viewer status messages with setTimeout counter
  - Refactor List Viewer GUI structure for better tab order
+ Icons:
  - Renamed setlist / tunes icons for clarity
  - Reverted Chord Viewer icons to original names for consistency

**v1.0.14: Store Viewer theme/font preferences**

+ Chord & List Viewer modules:
  - Add Chord Viewer font weight setting to App Options
  - Store color theme preference in localStorage
  - Restore preferred color theme on app load
  - Auto-apply preferred browser color theme on first load

**v1.0.13: Add emoji filter option**

+ App updates:
  - Added `Filters: Add random emojis to Set Leaders` option to App Options
  - Option enabled by default. If disabled, a neutral person avatar is displayed instead

**v1.0.12: Session DB Update**

+ Session DB Updates:
  - Updated to version 2025.07.09.2
  - Chords from Oleg added to 10 more sets

**v1.0.11: Add Emoji Manager module**

- App updates:
  - Emoji Manager module added

+ Tunebook updates:
  - Set Leaders emoji generation randomized via `getSupportedAnimalEmojis`
  - TO DO: Get N unique emojis for Set Leaders and insert after options are filled to prevent duplicates

**v1.0.10: Fix Tunebook focus issues**

+ Tunebook updates:
  - Fixed & improved Chord & List Viewer on exit focus logic
  - Fixed select dropdown menu jerking in Chrome
  - TO DO: Reverted select text-align to center, Chromium browsers to be fixed programmatically

**v1.0.9: Session DB Update**

+ Project Updates:
  - Chord Viewer bars now clip content overflowing to the right

+ Session DB Updates:
  - Updated to version 2025.07.07.1
  - Chordbook updated with new style of repeating chords display

**v1.0.8: Fix CVW alt chord display**

+ Chord Viewer & List Viewer updates:
  - Chord Viewer now displays repeating `"G (Em)" as | G (Em)  / |`
  - Alt. chords are now auto-separated by thin space
  - Chord bars are now allowed to overflow between beats to fit long chords

**v1.0.7: Fix Viewers focus on exit**

+ Tunebook updates:
  - New logic for elements receiving focus on exiting Chord & List Viewer
  - Scripts checks for currently displayed elements with specific data-attr
  - Full Screen Button is now a fallback focus element with unique data-attr
  - Added second argument to `displayWarningEffect` as fallback element

**v1.0.6: Fix Viewer Modules GUI**

+ Chord Viewer & List Viewer updates:
  - Removed redundant data-controls attr from buttons
  - Added missing :focus-visible button outlines
  - Fixed non-interactable sections from tabbing order
  - Added dashed outline for Chord Viewer slider

**v1.0.5: Fix Restore Sort by Tag**

+ ABC Encoder module updates:
  - Encoder's Sort by ABC Tag input field now defaults to ''

+ App updates:
  - Version numbers will now exclude dots after 'v'
  - Cosmetic markup & description changes

**v1.0.4: Session DB Update**

+ Session DB Updates:
  - Updated to version 2025.07.04.1
  - Fixed composer & minor tweak in Cuas polkas set

**v1.0.3: Version File Added**

+ App updates:
  - `APP_VERSION` & `DB_VERSION` moved to version.js, imported to app scripts
  - Version values to be used in automation scripts

**v1.0.2: Update CNAME**

**v1.0.1: ABC Encoder Refactored**

+ ABC Encoder module updates:
  - Testing Save & Restore Encoder settings
  - Testing Add Session Survey Data tweaks

+ Session DB updates:
  - Cuas Polkas added to Session DB

+ App updates:
  - Test Favicons added

**v1.0.0: ABC Encoder Refactored**

+ ABC Encoder module updates:
  - Testing updated ABC Encoder logic with and without N.S.S.S. standard enforced
  - Testing extended Encoder Advanced Settings
  - Testing Reset settings to defaults

+ Session DB updates:
  - Session DB updated to 2025-07-01
  - Testing refactored ABC Encoder output
  - Added ABC tweaks, adjusted sets to new Medley logic
</details>
</details>

<details>
  <summary><b>Pre-alpha updates (v.0.1+)</b></summary>

<details>
  <summary><b>v.0.9: UI/UX Upgrade</b></summary>

<details>
<summary>v.0.9.9: Routing, Tunebook Nav & List Viewer</summary>

+ Project updates:
  - Launcher: Hash & query param routing implemented for Launcher, Tunebook and Playalong
  - Launcher: Advanced Options button and additional App Options added
  - Launcher: New improved hover and focus look of App UI elements (TO DO: Animations)
  - Tunebook: Link sharing implemented for Tunebook items and filters
  - Tunebook: Tunebook Actions popup implemented for Desktop and Mobile mode
  - Tunebook: Tunebook Actions grid adjusts to Tunebook mode (Desktop, Compact, Mobile)
  - Tunebook: Header refactored to include List Viewer & Share Link buttons
  - Tunebook: Footer refactored to include Tunebook Actions hamburger button
  - Tunebook: Compact mode GUI refactored, Tunebook Actions button now appears in header
  - Tunebook: Full Screen always opens ABC Tools in new window option implemented
  - Tunebook: New notifications added, tab navigation and accessibility improvements
  - List Viewer: New module for displaying and opening Tunebook items via a tile grid dialog
  - List Viewer: Responsive desktop and mobile styles implemented, dark & light themes added
  - ABC Encoder: Improved metadata pre-processing for The Session links
  - ABC Encoder: Encoder now tests connection to The Session before making requests (fail fast)
  - Chord Viewer: Fixed incorrect handling of ABC triplets & fractions, normalization logic tweaked
  - Launcher, Encoder, Chord Viewer: CSS fix to prevent background jump on scroll
  - Icons updated

+ HTML updates:
  - Main App (index.html)
    + Advanced Options button and subgroup added to Tunebook Options
    + Tunebook Actions popup updated with new grid layout and buttons
    + Tunebook header & footer structure changed to reflect new layout
    + List Viewer dialog and button added, Share Link button added
    + Data attributes updated to ensure unique module-specific names
    + Additional Popover & Dialog markup tweaks, minor a11y tweaks
    
  - ABC Encoder (abc-encoder.html)
    + TO DO: Advanced Options button and subgroup in Encoder Settings
    + Back to Launch Screen link fixed

+ CSS updates:
  - App Styles (nss-styles.css)
    + Tunebook header refactored with more responsive layout and new buttons
    + New breakpoints added for more flexible Tunebook header & footer layout
    + Tunebook Actions popup refactored with responsive grid layout
    + Tunebook Actions popup layout now transforms depending on Tunebook mode
    + New buttons styled (Share Link, List Viewer, Advanced Options)
    + New look for app buttons with filter: drop-shadow, hover & focus tweaks
    + TO DO: Transitions for App UI elements
  - List Viewer Styles (styles-list-viewer.css)
    + Styles for List Viewer dialog, responsive tile grid and controls added
  - Chord Viewer Styles (styles-chord-viewer.css)
    + Minor consistency tweaks

+ JavaScript updates:
  - App Launcher module (scripts-ns-sessions.js)
    + appRouter*, appRouterOnLoad*: Main handler functions for hash navigation / query param routing added
    + createQueryString*, sanitizeQueryParam*: New functions for query param handling
    + getShareLink*, copyTextToClipboard*: New functions for share links handling
    + detectCyrillicRusChars*, convertCyrillicToTranslit*: New utility functions for transliterating link text 
    + launchTuneBook, switchAppSection, refreshTuneBook: Refactored to support query params and List Viewer
    + appButtonHandler: Refactored for new button types, share links, Advanced Options, and List Viewer
    + displayNotification, displayWarningEffect: Adjusted timeouts, improved focus handling
    + appCheckBoxHandler*: New function for checkbox handling
    + openSettingsMenu: Added support for List Viewer
    + List Viewer imports and initialization added

  - Chord Viewer module (scripts-chord-viewer.js)
    + normalizeAbcFractions*: ABC fraction normalization logic moved to separate new function
    + countBeatsInsertChords: Improved handling of ABC fractions
    + normalizeAbcTriplets: Improved triplet normalization
    + normalizeAbc: Now calls normalizeAbcFractions
    + initChordViewer: Updated event handling for dialog
    + loadChordsToDialog*, initDialogSlider*: Renamed from loadChordsToPopover and initPopoverSlider
    + openChordViewer: Updated to use loadChordsToDialog and initDialogSlider 
    + handleChordViewerClick: Refactored to use data-cvw-action and updated action handling

  - ABC Encoder module (scripts-abc-encoder.js)
    + preProcessAbcMetadata: Fail-fast connection checks added before promises are fired
    + preProcessAbcMetadata: Improved metadata pre-processing, info & warning messages added
    + saveAbcEncoderOutput: Improved notification and file naming for chords export
    + addEncoderInfoMsg*, addEncoderWarningMsg*: New variables for notification state

  - ABC Tunebook module (scripts-abc-tools.js)
    + loadFromQueryString*, setSelectedTuneByQuery*, setFilterByQuery*: New functions for query param navigation handling
    + initAbcTools: Now accepts itemQuery param and supports query-based loading
    + loadTuneBookItem: Now accepts passedUrl param
    + abcTunebookDefaults: Added abcToolsFullScreenOpensNewWindow and reordered options
    + handleFullScreenButton: Now supports Full Screen opens ABC Tools in new window option
    + restoreTuneBookDisplayOptions*: Renamed from restoreTuneBookOptions
    + Minor improvements to error handling, focus, notifications
    
  - List Viewer module (scripts-list-viewer.js)
    + Main handler functions openListViewer*, initListViewer*, loadTuneTiles*, handleListViewerClick* added
    + Utility functions added

+ Session DB updates:
  - Session DB updated to 2025-05-17
  - Chords from Oleg added to 11 sets (& Anton ed. arr.)
</details>

<details>
<summary>v.0.9.8: UI/UX Upgrade (Better Navigation & Refactoring)</summary>

+ Project updates:
  - Tunebook: Navigation buttons now respect filter settings with boundary checks supported
  - Tunebook: Full Screen mode Zoom controls, exit button and GUI switcher implemented
  - Tunebook: Zoom and GUI switcher settings are now remembered between sessions and auto-restored
  - Tunebook: Zoom behavior now varies between Desktop (CSS Zoom) and Mobile (Tune Frame width) modes
  - Tunebook: Dynamic Selector labels reimplemented with new set and clear logic for title emoji labels
  - Tunebook: Fixed Tabs & MIDI bug that forced Setlist item to load with auto-restore mode turned off 
  - Chord Viewer: Refactored as Dialog element to replace Popover issues on touch screens
  - Chord Viewer: Now opens in full screen as modal dialog, making background elements inert
  - Chord Viewer: Additional GUI improvements introduced
  - Launcher: New event listeners added, first stage of event delegation refactoring
  - Launcher, Tunebook, Encoder: Robust Local Storage availability checks added via storage-available.js module

+ HTML updates:
  - Main App (index.html)
    + Full Screen GUI controls added to ABC Tools embed container
    + Full Screen Button dataset load changed to "fullscreen-view"
    + Flex layout classes added for more transparent structure
    + Chord Viewer element converted from popover to dialog
    + Chord Viewer GUI elements reordered for better UX
  - ABC Encoder (abc-encoder.html)
    + Flex layout classes added for more transparent structure

+ CSS updates:
  - App Styles (styles-nss-app.css)
  - App Styles (styles-nss-app.css)
    + Full Screen GUI styles added with dynamic :fullscreen display
    + Zoom button styles added with CSS-drawn shapes in place of icons
    + Tunebook header and footer heights added as CSS variables
    + Flex wrappers reorganized, new subtypes introduced
    + Focus styles improved for better accessibility
    + Viewport units changed from svw/svh to dvw/dvh (experimental)
  - Chord Viewer module (styles-chord-viewer.css)
    + Naming updates after popover to dialog refactoring
    + Close Chord Viewer button is now position: fixed
    + GUI controls z-index added as fix for Safari
    + Styles partly reorganized with repetition removed
    + Viewport units changed from svw/svh to dvw/dvh (experimental)
  
+ JavaScript updates:
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + handleFullScreenChange: This and other Full Screen handlers now have separate Desktop & Mobile logic
    + zoomTuneBookItem*: Handle Zoom controls in Full Screen (depending on Desktop or Mobile mode)
    + toggleFullScreenGui*: Handle GUI visibility in Full Screen
    + exitFullScreenMode*: Handle exit from Full Screen
    + handleSelectorLabels*: Refactored with clearer more efficient structure (* moved from Tunebook module)
    + handleSelectorLabels*: New paramaters "setone" and "clearone" introduced with respective if blocks
    + handleSelectorLabels calls tweaked, parentSelector (not id) now passed as parameter
    + setMobileSelectorStyles, removeMobileSelectorStyles* moved from Tunebook module
    + appDropDownHandler: Refactored with new selector label handling logic, new event type checks added
    + appDropDownHandler: Now resets selector labels on 'mousedown', 'keydown' and 'touchstart' events
    + appDropDownHandler: Now clears selector labels on 'blur', 'keyup' and 'touchend' events
    + initCustomDropDownMenus: Now adds listeners for 'mousedown', 'keydown', 'touchstart', 'touchend', 'keyup', 'blur' events to each Tunebook selector
    + switchTuneBookItem: Improved navigation and boundary checks logic with disabled options skipped
    + switchTuneBookType: Now focuses on last Tunebook opened button after Launch Screen is pressed
    + localStorageOk*: Returns true if localStorage is available by calling storage-available.js
    + lastTuneBookOpened*: Global variable added as fallback for localStorage variable
    + localStorage operations now wrapped by localStorageOk() checks
    + localStorage unavailable warnings added to console and UI notifications
    + initAppSettings*: Initializes all app settings, runs initial localStorage check
    + ariaHideMe, ariaShowMe: Now return immediately if the element is inert
    + appWindowClickHandler*: New event delegation handler function added (TO DO)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + loadTabsMidiOptions: Missing checkTuneBookSetting() check added for loading item from correct list with auto-restore functionality disabled
    + loadTuneBookItem(tunes, 0) calls replaced with explicit selectedIndex setting and dispatchEvent calls
    + Now imports handleSelectorLabels from App Launcher module
    + handleSelectorLabels calls tweaked, parentSelector (not id) now passed as parameter
    + localStorage operations now wrapped by localStorageOk() checks
  - Chord Viewer module (scripts-chord-viewer.js)
    + openChordViewer: Modal Dialog replaces Popover API implementation
    + initChordViewer: Updated with Dialog event handling logic
    + handleChordViewerClick: Updated for Dialog controls
    + handleChordViewerClick: Toggle GUI events limited to Chord Viewer element
    + handleChordViewerClick: Close Chord Viewer button now remains visible after GUI toggling
    + Now imports storage-available.js module for better localStorage checks
    + isLocalStorageOk*: New utility function for checking localStorage availability
    + localStorage operations now wrapped by localStorageOk() checks
    + ariaHideMe, ariaShowMe: Now return immediately if the element is inert
    + getRootFontSizeModifier: Improved logic for calculating font size modifier
    
+ Session DB updates:
  - Session DB updated to 2025-05-05
  - Minor ABC tweaks
</details>

<details>
<summary>v.0.9.7: UI/UX Upgrade (Preload Scripts & Chord Viewer Tweaks)</summary>

+ Project updates:
  - Preload Scripts: Module added, app will now initiate root font-size setting before CSS loads
  - Launcher: Root font-size setting functions refactored, calculations moved to Preload Scripts
  - Tunebook: Now exports lastURL value for use in external modules
  - Chord Viewer: Now gets ABC Title in all modes and extracts it from lastURL if other methods are not available
  - Chord Viewer: Now accounts for modified root font size and adjusts chords font-size accordingly

+ HTML updates
  - Main App (index.html):
    + Added Preload Scripts module to <head>
  - ABC Encoder (abc-encoder.html):
    + Added Preload Scripts module to <head>

+ CSS updates:
  - App Styles (styles-nss-app.css):
  - App Styles (styles-nss-app.css):
    + Full screen popover width and height changed to vw and vh for testing (reverted to svw)
  - Chord Viewer module (styles-chord-viewer.css)
    + Chord Viewer popover width and height changed to vw and vh for testing (reverted to svw)
    + Added z-index value to control buttons to fix Safari bug

+ JavaScript updates
  - Preload Scripts module (scripts-preload-nssapp.js) 
    + Preload HTML font-size value calculated by adjustHtmlFontSize for small and medium-sized screens
    + adjustHtmlFontSize*: Get HTML font-size value based on current viewport size (moved from App Launcher module)
  - Chord Viewer module (scripts-chord-viewer.js):
    + openChordViewer: Now gets currentAbcTitle in all Dynamic and Chordbook Mode scenarios
    + openChordViewer: Now extracts currentAbcTitle from lastUrl if Tune selector value is empty
    + appChordSliderHandler: Now modifies chords font-size using getRootFontSizeModifier value
    + initPopoverSlider: Now modifies initial chords font-size using getRootFontSizeModifier value
    + getLastTunebookUrl* import function from ABC Tools & Tunebook module added
    + getLastTunebookUrl* import function from ABC Tools & Tunebook module added
    + getRootFontSizeModifier*: Gets root font-size modifier for chord display calculations
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + initWindowEvents: Font-size initialization moved to Preload Scripts module
    + appWindowResizeHandler: HTML font-size value calculations moved to Preload Scripts module
    + appWindowResizeHandler: Now sets and clears root font-size via setProperty and removeProperty methods
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + getLastTunebookUrl*: Export function added getting lastURL value for use in Chord Viewer
    + handleSelectorLabels: Now sets and clears CSS styles via setProperty and removeProperty methods
</details>

<details>
<summary>v.0.9.6: UI/UX Upgrade (Responsive Viewport-Based Scaling)</summary>

+ Project updates:
  - Launcher: App will now auto-scale fonts and menus based on viewport size of mobile devices
  - Launcher: App will now auto-switch to Desktop or Mobile mode on launch based on viewport size
  - Tunebook: Fully responsive design for all common viewport ranges including narrow mobile screens
  - Tunebook: Launching Tunebook in Desktop mode on narrow viewports now auto-sets fixed viewport size
  - Tunebook: Switching to Desktop mode on narrow viewports now automatically sets fixed viewport size
  - Tunebook: ABC Full Screen mode reworked using Fullscreen API with fallback to open tunes in new window
  - Tunebook: ABC Tools responsive iframe scaling now fully handled by CSS instead of JS
  - Chord Viewer: Toggle slider button now shows or hides all GUI elements and main title
  - Chord Viewer: Styles tweaked to fix mobile viewport issues

+ HTML updates:
  - Main App (index.html)
    + Body element now uses data-mode="desktop" by default
    + Full Screen opens ABC radio button now checked by default
    + Follow NS Sessions link moved to launch screen footer
    + ABC Tools iframe tabindex set to -1 to prevent focus
    + Chord Viewer elements tweaked

+ CSS updates:
  - App Styles (styles-nss-app.css)
  - App Styles (styles-nss-app.css)
    + Responsive ABC Tools iframe styles added, fixed width replaced with 100svw
    + Responsive @media breakpoints reworked, font-size scaling offloaded to JS
    + Follow NS Sessions link styles adjusted for launch screen footer
    + Arrow buttons redesigned using CSS triangles
    + Button text color explicitly defined for .nss-btn-text to fix Safari display issue
  - Chord Viewer module (styles-chord-viewer.css)
    + Tweaked --chords-min-bar-width and main title width to fix mobile display issues
  
+ JavaScript updates:
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + appWindowResizeHandler*: New handler function adjusts HTML font size depending on viewport size
    + launchTuneBook: Now applies fixed viewport width if desktop mode is on and current viewport is narrower than ABC Tools embed
    + initTunebookMode: Now checks viewport width before applying mobile mode
    + initWindowEvents*: Initializes viewport size handlers and window event listeners
    + initWindowEvents*: App will now listen to resize window events in all menus
    + initWindowEvents*: App will now listen to beforeunload events to reset fixed viewport mode on exit
    + initFullScreenEvents*: Adds Fullscreen API event listeners if supported by browser
    + handleFullScreenChange*: Handle enter and exit events from Fullscreen API (* moved from Tunebook module)
    + handleFullScreenChange*: Restore Tunebook compact mode on exit from Fullscreen API
    + checkIfTunebookOpen*: Return true if Tunebook menu elements are currently displayed
    + checkIfMobileMode: Now checks body data-mode attribute instead of using global flag
    + switchTunebookMode: Now displays info notifications when switching modes
    + displayNotification: Success message timeout increased to 5 seconds
    + isTuneBookInitialized: Variable renamed from tuneBookInitialized
    + Global flags removed: isMobileTunebookModeOn, doesTuneBookNeedResize
    + Fixed viewport size for resetViewportWidth() reset from 1080 to 870
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + ABC Tools iframe resize functions removed, now handled by CSS
    + Window resize event listeners removed, now handled by App Launcher
    + handleFullScreenButton: Now uses Fullscreen API with fallback to new window
    + openInAbcTools*: Opening last tune link in new window moved to separate reusable function
    + getViewportWidth*: Return current visual viewport width using Visual Viewport API or innerWidth value fallback
    + getViewportHeight*: Return current visual viewport height using Visual Viewport API or innerHeight value fallback
    + handleSelectorLabels: Now uses getViewportWidth instead of innerWidth
    + abcToolsFullScreenBtnShowsChords local storage variable default value changed to 0
  - Chord Viewer module (scripts-chord-viewer.js):
    + handleChordViewerClick: Now disables and hides all other GUI elements
    + chordViewerGui*: Global variable added for all data-controls elements
</details>

<details>
<summary>v.0.9.5: UI/UX Upgrade (Tunebook Mobile Mode Fixed)</summary>

+ Project updates:
  - Tunebook: User-selectable Mobile Mode implemented using new ABC Tools no-UI share link parameter
  - Tunebook: Mobile Mode styles implemented for breakpoints between 860 and 480 (TO DO: 360 and smaller)
  - Tunebook: Settings option and manual switch between Desktop and Mobile versions added (appears at 860)
  - Tunebook: Currently uses fixed viewport for mobile devices; fully available for testing in browsers
  - Tunebook: Mobile design includes enlarged selectors and simplified footer / Full Screen Button controls
  - Tunebook: Experimental JS-enabled design of selectors under 768 with enlarged header option fonts
  - Tunebook: Navigation buttons added for Desktop and Mobile for quick switching between Sets or Tunes
  - Tunebook: New ClaviZouki MIDI option for playback of ABCs with chords (Bouzouki + Clavinet)
  - Launcher: Persistent Mobile Mode setting added, persistent Compact Mode setting drafted
  - Icons tweaked

+ HTML updates:
  - Main App (index.html)
    + Select elements are now enveloped in wrappers
    + Desktop tune navigation buttons added to Tunebook header
    + Mobile tune navigation buttons added to iframe container
    + Mode Switcher buttons added to Tunebook footer
    + More data attributes added for JS & CSS
    + ClaviZouki option added to displayOptions
    + "Always open Tunebook in Mobile Mode" checkbox added with default state unchecked
    + "Always open Tunebook in Compact Mode" checkbox drafted with default state unchecked

+ CSS updates:
  - App Styles (styles-nss-app.css)
  - App Styles (styles-nss-app.css)
    + Mobile Mode Styles implemented with multiple breakpoints
    + Breakpoints 860, 768, 668 and 480 added (360 pending)
    + Mobile Switch button and large transparent selectors kick in at 860
    + Compact selectors kick in at 768, html scale and footer are reduced at 480
    + `body[data-mode="mobile"]` styles added
    + Tunebook `h1` content swap reworked
    + `h1` swap for mobile version implemented via `attr(data-type)`
    + fullScreenButton reworked, now has mobile version with an eye
    + fullScreenButton radio controls now have mobile version 
    + Select elements reworked with responsive wrappers
    + Tunebook selectors now change depending on viewport
    + Gradient border for selectors with transparent background implemented via `mask` on pseudo-element (tablet viewports)
    + Gradient border for selectors with filled white background implemented via background-image on pseudo-element (desktop and smaller mobile viewports)
    + Tunebook Mode control buttons added (viewports <= 860)
    + Arrow navigation buttons added
  
+ JavaScript updates:
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + initTunebookMode*: Initializes current Tunebook Mode via localStorage variable tuneBookAlwaysUseMobileMode
    + isManualTunebookModeOn, isMobileTunebookModeOn, doesTuneBookNeedResize global variables added (all false by default)
    + checkIfMobileMode*: Return up-to-date isMobileTunebookModeOn value
    + switchTunebookMode*: Sets data-mode attribute on the body and isMobileTunebookModeOn flag depending on the switcher pressed
    + switchTuneBookItem*: Navigates between Tunebook items, loops back to first or last Set or Tune
    + appButtonHandler: Mode Togglers (data-controls) and Tune Switchers (nss-arrow-btn) button types added
    + appDropDownHandler now accounts for event type and dispatches events for selector label updating
    + initAppCheckboxes now handles Always Use Mobile Mode checkbox behavior
    + updateTuneBookTitles now sets data-type attribute for CSS controls, redundant data-title change removed 
    + refreshTuneBook updated with isSoftRefresh flag and check (for cases where only item reload is needed)
    + handleSelectorLabels imported, calls added to account for Mobile Mode changes to Tunebook selectors
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + handleFullScreenButton*: Now handles fullScreenButton clicks
    + handleResizeWindow*: Handler function for changing window size added
    + handleSelectorLabels*: Experimental handler function for changing appearance of Tunebook Selector Headers
    + handleSelectorLabels: Adds or removes label attribute for Header option
    + handleSelectorLabels: Resizes Selector font depending on Header / item selected
    + handleSelectorLabels: init, resize and select actionTypes handled
    + removeMobileSelectorStyles, setMobileSelectorStyles helper functions added
    + loadTuneBookItem: Now handles &noui links in Mobile Mode
    + loadTabsMidiOptions: ClaviZouki option added with Bouzouki + Clavinet MIDI patch
    + injectInstrument: ClaviZouki settings added
    + injectInstrument: %abcjs_soundfont replaced with %soundfont in line with the latest ABC Tools specs
    + tuneBookAlwaysUseMobileMode and tuneBookAlwaysUseCompactMode localStorage variables added to Tunebook settings

+ Session DB updates:
  - Session DB updated to 2025-04-18
  - Chords for Callaghan's HP Set added
  - Minor tweaks in chords & ABCs
</details>

<details>
<summary>v.0.9.4: Session DB Update</summary>

+ Session DB updates:
  - Session DB updated to 2025-04-15
  - Chords from Oleg added to 6 sets (& Anton ed. arr.)
  - Minor tweaks in chords & ABCs
</details>

<details>
<summary>v.0.9.3: UI/UX Upgrade (Session DB Update)</summary>
  
+ JavaScript updates:
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + Tune Selector optgroup label tweaked

+ Session DB updates:
  - Session DB updated to 2025-04-11
  - Chords from Oleg added to 9 sets (& Anton ed. arr.)
</details>

<details>
<summary>v.0.9.2: UI/UX Upgrade (Tunebook Filter Groups)</summary>

+ Project updates:
  - Tunebook: Filters and Tune Selector items are now organized using option groups
  - Launcher, Tunebook: Tune Selector population and filtering functions refactored to support option groups
  
+ JavaScript updates:
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + populateFilterOptions: Filters are now grouped using optgroups with non-selectable headers
    + populateTuneSelector: Sets and Tunes are now grouped using optgroups
    + populateTuneSelector: An optgroup is created for each Tune Type when tuneSelector is populated
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + appDropDownHandler: Refactored to handle both optgroups and separate options simultaneously
    + appDropDownHandler: Tune Type filters now hide and show optgroups in tuneSelector as well as options
    + appDropDownHandler: Set Leader filters now hide and disable those optgroups where no active tunes are present after filtering
    + resetTuneBookMenus, resetTuneBookFilters refactored to handle optgroups
    + appButtonHandler: Now explains user compact Tunebook Mode controls in notification
  - ABC Encoder module (scripts-abc-encoder.js)
    + addCustomAbcFields: Tweaked the default mazurka tempo

+ Session DB updates:
  - Session DB updated to 2025-04-10
  - Ash Grove Set tweaked (Now a Medley)
</details>

<details>
<summary>v.0.9.1: UI/UX Upgrade (Popup Notifications)</summary>

+ Project updates:
  - Launcher: Popup notifications styled and expanded
  - Launcher: Notification types now include success, warning, error, status and report
  - Launcher, Tunebook, ABC Encoder: Notification messages customized for all types
  - Tunebook: Can now optionally display status report at launch listing Session DB version and Tunebook size
  - Chord Viewer: Tweaked messaging for Chordbook Mode

+ HTML updates:
  - Main App (index.html)
    + "Tunes: Show Tunebook report at launch" checkbox added with default state unchecked

+ CSS updates:
  - App Styles (styles-nss-app.css)
  - App Styles (styles-nss-app.css)
    + Notification Popup styles tweaked and expanded
    + --notification-color variables added
  
+ JavaScript updates:
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + APP_VERSION and notificationTimeoutId global variables added
    + displayNotification: Now keeps track of last Timeout and checks for open Popup Popover
    + tuneDataFetch: Now sends an optional user notification with Session DB version and Tunebook size info
    + fetchData: Now notifies user of fetch errors separating known network errors from other errors
    + appDropDownHandler: Status type notifications added for Tunebook Filters
    + appDropDownHandler: Tune Selector now automatically comes into focus on Filter selection
  - ABC Encoder module (scripts-abc-encoder.js)
    + Notification messages added, types tweaked
    + preProcessAbcMetadata: Tweaked Z: field data copying to keep pre-existing non-N.S.S.S. specific strings
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + tuneBookShowStatusReport* localStorage variable added for optional Session DB version & status report
  - Chord Viewer module (scripts-chord-viewer.js)
    + openChordViewer: Fixed empty Tune Selector warning notification in Chordbook Mode

+ Session DB updates:
  - Session DB updated to 2025-04-09
</details>

<details>
<summary>v.0.9.0: UI/UX Upgrade (Chordbook Refactor & Notification Popup)</summary>

+ Project updates:
  - Chord Viewer: Chord extraction sequence refactored to support skipped bars and direct ABC input
  - Chord Viewer: Now checks if an ABC input element is available on the page in Dynamic Chords Mode
  - Chord Viewer: Now remembers last chord used in previous bar, uses it to fill in missing chord-beats
  - Chord Viewer: Now passes more flags (final bar, volta) down the extraction sequence for accurate filtering
  - Chord Viewer: Now accounts for Note Length value for accurate calculations
  - Chord Viewer: Now warns user if no chords found in ABC or Chordbook, suggests using Dynamic Mode if DB missing
  - Launcher: Notification Popup Popover added with function styling popup banner according to message type
  - Launcher: Now warns user of network error and when ABC Tools are loading for the first time
  - ABC Encoder: Now warns user about parsing and validation errors, TO DO: general status messages
  - ABC Encoder: Now notifies user about Session Survey Data status and styles add button when filled

+ HTML updates:
  - Main App & ABC Encoder (index.html, abc-encoder.html)
    + Notification Popup Popover added
    + Data-state added for Encoder's Add Session Survey Data button

+ CSS updates:
  - App Styles (styles-nss-app.css)
  - App Styles (styles-nss-app.css)
    + Notification Popup popover styles added
    + Notification Popup classes styling the popover added
    + Global Popover styles tweaked to reduce specificity
    + Plus button with data-state attribute styles added
  - Chord Viewer module (styles-chord-viewer.css)
    + Popover style tweaked to account for background-image

+ JavaScript updates:
  - Chord Viewer module (scripts-chord-viewer.js)
    + openChordViewer: Refactored algorithm checks for ABC input in Dynamic Mode before checking for existing Tune Selector value with LZW-compressed ABC; this input can only be accessed for same-origin requests - script falls back to Tune Selector for cross-origin requests with ABC Tools embedded in iframe on a third-party site
    + makeAbcChordBook: Now passes Note Length down the Chord Extraction sequence
    + getChordsFromTune: Now passes lastChord, isFinalBar, abcNoteLength to getCompleteAbcChordBar and expects an array
    + getChordsFromTune: Refactored filtering of incomplete bars - bars with no chords can now be filled by countBeatsInsertChords which also calculates whether a bar should be discarded as incomplete by returning null
    + getChordsFromTune: Now stores lastChord for calculations in the next bar
    + getCompleteAbcChordBar: Refactored, now returns an array with chords-data and lastChord
    + getCompleteAbcChordBar: Now passes bars with chords skipped as well as bars with incomplete and oversaturated chord-beats to countBeatsInsertChords
    + countBeatsInsertChords: Refactored, now handles empty bars and counts the number of eighth notes per bar to accurately filter out anacruses and other incomplete bars (expected eight notes number: 0.5*N or fewer)
    + countBeatsInsertChords: Now fills empty bars and missing first chord-beats with lastChord
    + countBeatsInsertChords: Now accounts for final bars and voltas that may contain less notes than expected
    + countBeatsInsertChords: Now accounts for non-standard Note Length in calculations
    + countBeatsInsertChords: Now returns null for invalid bars or an array with chord-data and lastChord
    + displayNotification import function added with messages for Chordbook warnings and errors
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + displayNotification*: Notification Popup handler function prefilling message text, changing popover style-class and launching popover; automatically hides messages with low priority after timeout
    + displayNotification messages added for Tunebook launch warnings and errors
    + appButtonHandler updated to include Notification Popup
  - ABC Encoder module (scripts-abc-encoder.js)
    + parseSessionSurveyData now changes data-state attribute of Add Session Survey Data button
    + displayNotification import function added with messages for Encoder warnings and errors

+ Session DB updates:
  - Session DB updated to 2025-04-08
</details>
</details>
<details>
  <summary><b>v.0.8: Encoder Upgrade</b></summary>

<details>
<summary>v.0.8.9: Session DB Update (Session Survey Applied)</summary>

+ Project updates:
  - Tunebook: Session Survey Data applied to DB, Set Leaders updated

+ Session DB updates:
  - Session DB updated to 2025-04-04
  - DB sorted & encoded with loaded Session Survey Data
  - Set Leaders metadata updated in ABC Sets & Tunes
</details>

<details>
<summary>v.0.8.8: Encoder Upgrade (Dynamic Chords Mode)</summary>

+ Project updates:
  - Launcher: Dynamic Chords checkbox added to Tunebook Options
  - Chord Viewer: Generates chords directly from ABC if Dynamic Chords option is on

+ HTML updates:
  - Main App (index.html)
    + "Chord Viewer: Generate chords dynamically" checkbox added with default state unchecked
  
+ JavaScript updates:
  - Chord Viewer module (scripts-chord-viewer.js)
    + openChordViewer function refactored to account for dynamic chords extraction
    + openChordViewer now retrieves ABC from tuneSelector value, decodes it and passes an ABC string to extractChordsFromAbc if chordViewerAllowDynamicChords is 1
    + openChordViewer now sets setChords and tuneChords depending on extractChordsFromAbc output if chordViewerAllowDynamicChords is 1
    + extractChordsFromAbc*: Validates abcContent, passes it to makeAbcChordBook then getValidChordsArray, returns chordsArray or empty array
    + validateAbcChordsContent*: Checks if ABC contents X: field and valid chords
    + getValidChordsArray*: Safely parses Chordbook and returns Chords Array or false if it doesn't pass validation
    + LZString import added for dynamic chord extraction from ABC
  - App Launcher module & ABC Encoder module (scripts-nss-app.js, scripts-abc-encoder.js)
  - App Launcher module & ABC Encoder module (scripts-nss-app.js, scripts-abc-encoder.js)
    + showRedOutlineWarning renamed to displayWarningEffect
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + abcToolsAllowDynamicChords* localStorage variable added

+ Session DB updates:
  - Session DB updated to 2025-04-02
  - Minor fixes in ABC & Chords for Sets & Tunes
</details>

<details>
<summary>v.0.8.7: Encoder Upgrade (Mute Chords & DB Fixes)</summary>

+ Project updates:
  - Launcher: Mute Chords checkbox added to Tunebook Options
  - Tunebook: Adds override for MIDI Bass & Chords if Mute Chords option is on

+ HTML updates:
  - Main App (index.html)
    + "MIDI: Always mute chords in playback" checkbox added with default state unchecked
  
+ JavaScript updates:
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
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

+ HTML updates:
  - Main App (index.html)
    + Changed nav container enveloping h1 title to div to comply with the standard
    + Meta tags updated
  - ABC Encoder (abc-encoder.html)
    + Add Session Survey Data button added to Encoder Settings popover
    + Meta tags updated

+ CSS updates:
  - App Styles (styles-nss-app.css)
  - App Styles (styles-nss-app.css)
    + nss-btn-plus styles added

+ JavaScript updates:
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + Add Session Survey button handled
    + Import parseSessionSurveyData added
  - ABC Encoder module (scripts-abc-encoder.js)
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

+ HTML updates:
  - Main App (index.html)
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

+ JavaScript updates:
  - Chord Viewer module (scripts-chord-viewer.js)
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

+ HTML updates:
  - Main App (index.html)
    + data-action attributes added to interactable Chord Viewer elements
    + Chord Viewer stylesheet linked

+ CSS updates:
  - App Styles (styles-nss-app.css)
  - App Styles (styles-nss-app.css)
    + Full screen popover styles moved to Chord Viewer stylesheet, some shared classes remain
  - Chord Viewer module (styles-chord-viewer.css)
    + Separate styles for Chord Viewer elements added, shared classes to be migrated

+ JavaScript updates:
  - Chord Viewer module (scripts-chord-viewer.js)
    + Variables for Chord Viewer elements renamed using chordViewer* template
    + All variables are now defined at the start of the file
    + openChordViewer*: New export handler function showing Chord Viewer popover, loading Slider settings and Chords from ABC using data passed from main app
    + initChordViewer*: New export function initializing Chord Viewer Popover
    + handleChordViewerClick*: New function handling clicks on interactable Chord Viewer elements
    + normalizeAbc*: New handler function calling cleanup ABC functions during Chord extraction
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
    + initChordViewer and openChordViewer are now imported from Chord Viewer module
    + openSettingsMenu now calls openChordViewer, passing current setChords and tuneChords arrays
    + initChordViewer is now called on DOMContentLoaded
    + appButtonHandler now returns if element has data-action attribute to handle Chord Viewer buttons separately
  - ABC Encoder module (scripts-abc-encoder.js)
    + makeAbcChordBook functions are now imported from Chord Viewer module

+ Session DB updates:
  - Session DB updated to 2025-03-21
  - Galtee Hunt Set updated
  - Leitrim Fancy Set updated
  - Minor ABC title tweaks
    + appButtonHandler now returns if element has data-action attribute to handle Chord Viewer buttons separately
  - ABC Encoder module (scripts-abc-encoder.js)
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
  - ABC Encoder (abc-encoder.html)
    + Added new Encoder settings option enabling Sort to fetch metadata from The Session

+ JavaScript updates ('*' indicates new function or variable)
  - ABC Encoder module (scripts-abc-encoder.js)
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
  <summary><b>v.0.7: Generate Chordbook</b></summary>

<details>
<summary>v.0.7.7: Responsive Chordbook (Syncopation Handling & ABC Cleanup)</summary>

+ Project updates:
  - Chords Viewer: Proper handling of ABC bars with syncopated chord arrangements
  - ABC Encoder: Input ABC now undergoes deep clean-up before Chordbook generation
  - ABC Encoder: Sort now removes duplicate Sets and Tunes by using a Map of unique primary titles; items added at the bottom of the file are treated as newest
  - Launcher & Encoder: Default settings are now loaded and logged from settings objects

+ HTML updates (abc-encoder.html)
  - Normalize ABC part endings option added to Encoder settings
  - Encoder buttons reordered, Sort is now the top button

+ JavaScript updates:
  - App Launcher module (scripts-nss-app.js)
  - App Launcher module (scripts-nss-app.js)
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
    + addCustomAbcFields now passes ABC to processPartEndings to standardize the formatting of identifiable part endings to `||` if localStorage option abcSortNormalizesAbcPartEndings is 1
    + processPartEndings also converts `::` to `:||\n|:`
    + sortFilterAbc and makeTunesFromSets now create a Map of unique primary title & ABC pairs to remove duplicate Sets or Tunes
    + makeStringTitleCase refactored to integrate toSortFriendlyTitle and prioritize title exceptions 
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
  - ABC Tools & Tunebook module (scripts-abc-tools.js)
    + abcTunebookDefaults settings object added
    + initToolsOptions renamed to initTunebookOptions and now initializes settings via initSettingsFromObject

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
  - Theme and localStorage variable tweaks in main App scripts (scripts-nss-app.js)
  - Theme and localStorage variable tweaks in main App scripts (scripts-nss-app.js)

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
  - ABC Encoder: ABC Sort organizes Chordbook data depending on number of beats
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
    + Slider & Chords grid init: initPopoverSliders initializes values for Chords grid adjustable by Slider
    + Slider: appChordSliderHandler handle Chord Popover Slider events with smart scaling, adjusting font size, line height, line width and max width proportional to the vertical slider setting
    + Reset Slider Settings and show / hide slider control buttons added
    + Dark / Light colour theme and Theme switch button added
  - Main app scripts refactored (scripts-nss-app.js)
  - Main app scripts refactored (scripts-nss-app.js)
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
  - Temporary placeholder Chords JSON and trigger functions added to scripts-nss-app.js
  - Temporary placeholder Chords JSON and trigger functions added to scripts-nss-app.js

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
  - Popover Polyfill warning added to initialisation scripts (scripts-nss-app.js)
  - Popover Polyfill warning added to initialisation scripts (scripts-nss-app.js)

+ HTML updates:
  - Changed entry point module for abc-encoder.html to be scripts-nss-app.js
  - Changed entry point module for abc-encoder.html to be scripts-nss-app.js
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
  - openSettingsMenu, appButtonHandler, initAppCheckboxes updated with Popover scripts (scripts-nss-app.js)
  - openSettingsMenu, appButtonHandler, initAppCheckboxes updated with Popover scripts (scripts-nss-app.js)
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
  - ABC Tools scripts reorganized and updated with new naming convention
  - ABC Encoder: ABC Sort now splits generated Chords after every 4 bars excluding voltas
  - ABC Encoder: ABC Sort now correctly formats secondary tune types and titles in Sets
  - App Options update: Settings defaults are now initialized on app load and stored locally

+ JavaScript updates:
  - JSON object key names updated in scripts-abc-encoder.js, scripts-abc-tools.js and scripts-nss-app.js
  - JSON object key names updated in scripts-abc-encoder.js, scripts-abc-tools.js and scripts-nss-app.js
  - addCustomAbcFields tweaked and refactored, ABC body titles processing now handled by formatAbcBodyTitles
  - formatAbcBodyTitles makes secondary R: field text Proper Case and subtitle T: field text Title Case
  - openSettingsMenu logs Tunes and Sets Chords output in test mode (scripts-nss-app.js)
  - openSettingsMenu logs Tunes and Sets Chords output in test mode (scripts-nss-app.js)
  - initEncoderSettings and initAbcTools now initialize Global variables and store them to localStorage

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
  - makeAbcChordBook exports JSON array of objects with chords organized depending on ABC Type (Set or Tune)
  - getCompleteAbcChordBar fills chord bars with the minimum number of chords depending on beats per bar (NB: ambiguous bars with two chords in triple-meter tunes are currently left untouched)
  - Tunebook's Full Screen View button now changes behavior depending on fullScreenSetting value, opening either tunes or chords (scripts-abc-tools.js)
  - setChords, tuneChords and corresponding data links added to (scripts-nss-app.js)
  - Options button function added, Launch button behavior tweaked for ABC Encoder (scripts-nss-app.js)
  - setChords, tuneChords and corresponding data links added to (scripts-nss-app.js)
  - Options button function added, Launch button behavior tweaked for ABC Encoder (scripts-nss-app.js)
  - ABC Parse & Sort updated with chord export functions (parseAbcFromFile, downloadAbcFile, getSortedAbc)
  - addCustomAbcFields now checks for "[]" in the title to get R: field value if missing from Tune (Medleys)
  - New global settings variable added for switching on Chordbook export (abcSortExportsChordsFromTunes)

+ Session DB updates:
  - Session DB updated to 2025-02-17
  - Test Chords JSONs added (chords-sets.json, chords-tunes.json)
</details>
</details>
<details>
  <summary><b>v.0.6: Convert Sets to Tunes</b></summary>

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
  - Formatting of multiple value C: C: S: and Z: fields standartized
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
  <summary><b>v.0.5: Save & Restore Tunes</b></summary>

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
  - refreshTuneBook updated with loading last saved Set or Tune; load callback removed from resetTuneBookMenus (scripts-nss-app.js)
  - refreshTuneBook updated with loading last saved Set or Tune; load callback removed from resetTuneBookMenus (scripts-nss-app.js)
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
  - Tweaked scripts updating tuneBookSetting and tuneBookLastOpened variables (scripts-nss-app.js)
  - Tweaked scripts updating tuneBookSetting and tuneBookLastOpened variables (scripts-nss-app.js)

+ CSS updates:
  - Removed superfluous highlight of buttons and links for mobile taps (-webkit-tap-highlight-color)

+ Session DB updates:
  - Session DB updated to 2025-01-22
  - ABC fixes & tweaks
  - Soundslice links added
</details>
</details>
<details>
  <summary><b>v.0.4: Tunebook Filter Options</b></summary>

<details>
<summary>v.0.4.4: Filter Options (Tune Load Tweaks)</summary>

+ Project updates:
  - Tunebook now loads the first Set or Tune item into ABC Tools on launch or section switch

+ JavaScript updates:
  - initAbcTools further tweaked in scripts-abc-tools.js
  - loadTuneBookItem(currentTuneBook, itemNumber) script moved into separate export function
  - resetTuneBookMenus in scripts-nss-app.js now loads first Tunebook item
  - resetTuneBookMenus in scripts-nss-app.js now loads first Tunebook item

+ Session DB updates:
  - Session DB updated to 2025-01-21
  - Sources added to new tunes & sets
  - ABC fixes & tweaks
</details>
<details>
<summary>v.0.4.3: Filter Options (Session DB Update)</summary>

+ Session DB updates:
  - Session DB updated to 2025-01-20
  - Tempos (Q:) standardized
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
  - Dropdown menu handler functions (appDropDownHandler, initCustomDropDownMenus) added to scripts-nss-app.js
  - Dropdown menu handler functions (appDropDownHandler, initCustomDropDownMenus) added to scripts-nss-app.js
  - Filter Options population and sorting functions (populateFilterOptions, sortFilterOptions) added to scripts-abc-encoder.js
  - Tunebook cleanup functions (refreshTuneBook, resetTuneBookMenus, resetTuneBookFilters) added to scripts-nss-app.js
  - Tunebook cleanup functions (refreshTuneBook, resetTuneBookMenus, resetTuneBookFilters) added to scripts-nss-app.js
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
  <summary><b>v.0.3: ABC Encoder</b></summary>

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
  - Order of R: -> M: -> L: -> Q -> K standardized
</details>
<details>
<summary>v.0.3.0: ABC Encoder (Initial commit)</summary>

+ Project updates:
	- ABC Encoder:
		- N.S.S.S. tools page (abc-encoder.html) added with ABC Encoder / ABC Decoder / ABC Sort tools 
		- ABC Encoder scripts (scripts-abc-encoder.js) added to project: Sort and Decoder functional, Encoder in development
		- ABC Encoder styles based on Launch Screen styles, additional styles merged into styles-nss-app.css
		- ABC Encoder styles based on Launch Screen styles, additional styles merged into styles-nss-app.css
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
	- ABC Encoder styles added, some refactoring done in styles-nss-app.css
	- ABC Encoder styles added, some refactoring done in styles-nss-app.css
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
  <summary><b>v.0.2: Play Along Page</b></summary>

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
  <summary><b>v.0.1: Initial App Outline</b></summary>

<details>
<summary>v.0.1.1: Session DB Update</summary>

+ Session DB updates:
  - Session DB updated to 2024-12-22
  - Naming format changed for C: / S: fields
  - Naming format standardized for C: Set Leaders field
  - Z: [Transcription By] and N: [Link to the Set] fields added
</details>
<details>
<summary>v.0.1.0: Initial App Version </summary>

+ Project updates:
  - Project structure reorganized to suit transition to Progressive Web App (PWA)
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
  - App scripts moved to scripts-nss-app.js
  - App scripts moved to scripts-nss-app.js
  - Michael Eskin's original scripts moved to scripts-abc-tools.js
  - App now fetches up-to-date Session DB data from the project's GitHub page
  - App scripts organized in subgroups: App Launchers, Switchers, Checkers / Updaters, Fetchers / Data Handlers, Event Handlers, Event Listeners

+ CSS updates:
  - Classes standardized and compartmentalized (exceptions made for some legacy selectors)
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

+ Initial commit of raw export website file from Michael Eskin's ABC Transcription Tools.
</details></details>
</details>