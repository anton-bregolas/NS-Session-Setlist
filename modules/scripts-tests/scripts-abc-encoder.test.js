import { getSortedAbc, sortFilterAbc, getEncodedAbc, encodeTunesForAbcTools, abcEncoderDefaults } from '../scripts-abc-encoder.js';
import { initSettingsFromObject } from '../scripts-nss-app.js';
import { makeAbcChordBook } from '../scripts-chord-viewer.js';
import { describe, it, expect, test, vi, beforeAll } from "vitest";

// Set localStorage settings to default values before running tests

initSettingsFromObject(abcEncoderDefaults, true);

// Mock helper functions unrelated to test output

vi.mock('../scripts-nss-app.js', async () => {

    const appActual =
        await vi.importActual('../scripts-nss-app.js')

    return {
        ...appActual,
        displayNotification: vi.fn()
    }
});

// Define test ABC input data

const abcRawTsoSet = `X: 1
T: The Brosna, O'Keeffe's.
S: https://thesession.org/tunes/1414#setting1414
S: https://thesession.org/tunes/53#setting53
T: The Brosna
R: slide
M: 12/8
L: 1/8
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:|
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:|
T: O'Keeffe's
R: slide
M: 12/8
L: 1/8
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:|
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:|`;

const abcProcessedNsssSet = `X: 1
T: SLIDES: Brosna Set
T: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; X at The Session
N: https://thesession.org/members/26966/sets/92423
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
D2G G2A BAB d2B|1 A2D FED G2G GFE:|2 A2D FED G2G GBd:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|1 c2A F2A G2G GBd:|2 c2A F2A G2G GFE||
T: Dan O'Keeffe's / Danny Ab's
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2G GFG|
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`;

const abcUnmergedNsssSet = `X: 1
T: SLIDES: Brosna Set
T: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; X at The Session
N: https://thesession.org/members/26966/sets/92423
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
D2G G2A BAB d2B|1 A2D FED G2G GFE:|2 A2D FED G2G GBd:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|1 c2A F2A G2G GBd:|2 c2A F2A G2G GFE||
T: Dan O'Keeffe's / Danny Ab's
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2G GFG|
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`;

const abcMultiComposerNsssSet = `X: 1
T: WALTZES: Petranu-Valse Set
T: Petranu-Valse
C: C: Oliushka Tikhaia / Calum Stewart; S: ThZCh / Various
C: Set Leaders: Oliushka, Anton, Sophie
Z: Anton Zille ed.; Bregolas at The Session
N: https://thesession.org/members/26966/sets/95961
R: Waltz
M: 3/4
L: 1/8
Q: 1/4=144
K: Gmaj
D GA|:B2 BA B/c/d|A4 BA|G2 FG E2|D4 GA|
BA B B2 d|A3 g fg|eG ef e2|d3 c BA|
B2 BA B/c/d|A4 BA|G2 F G2 E|DC D2 GA|
BA B B2 d|A6|CD EG F2|1 G3 D GA:|2 G3 F ED||
C3 D EG|FE F2 D2|B3 A GF|GF EF DE|
C3 D EG|FE F2 D2|G3 A B2|d2 g2 fg|
eG ef ef|dF de de|cB cE cd|B3 A GA|
B2 BA B/c/d|A6|CD EG F2|G3 F ED|
C3 D EG|FE F2 D2|B3 D GA|cB AG FG|
C3 D EG|FE F2 D2|G3 A B2|d2 g2 fg|
ed eG ef|dc dF de|c_E cd c2|B3 A GA|
B2 BA B/c/d|A6|CD EG F2|G6||
T: Looking at a Rainbow / Looking at a Rainbow Through a Dirty Window
R: Waltz
K: Gmaj
D GA|:Bd AB GA|F2 FG FD|E6-|E3 DGA|
Bd AB GA|F2 FG FD|G6-|1 G3 DGA:|2 GA Bd gf||
|:e2 B2 gf|e2 c2 gf|ed ef ga|b2 ba gf|
e2 B2 gf|e2 c2 gf|ed ef ga|1 g4 gf:|2 g3||`;

const abcMultiZNsssSet = `X: 1
T: JIGS: Humours of Killarney Set
T: Humours of Killarney / Sheehan's / Cheer up Old Hag
C: C: Trad.; S: ThZCh; Paudie O'Connor & John O'Brien / Various / Méabh & Clíodhna Ní Bheaglaoich
C: Set Leaders: Oliushka, Anton
Z: Anton Zille ed.; Nigel Gatherer / JACKB / Bregolas at The Session
N: https://thesession.org/members/26966/sets/71901
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Gmaj
|:BGG G2 B|ded d2c|BAB GBd|e2f g2D|
GBd gfe|fdB cBA|BGE EDE|c3 B2A:||
|:BGE EDE|GED D2A|BGE EDE|c2d edc|
BGE EDE|GED DEF|G/A/BA GBA|G3 G2A:||
T: Connaughtman's Rambles
K: Dmaj
|:FAA dAA|BAB dAG|FAA dfe|dBB BAG|
FAA dAA|~B3 def|gfe f2e|1 dBB BAG:|2 dBB B2e||
|:fbb faf|fed ede|fbb faf|fed e2e|
fbb faf|fed def|gfe ~f2e|1 dBB Bde:|2 dBB BAG||
T: Donncha Lynch's / Donncha Ó Loinsigh's
K: Amaj
|:EAA cAA|BAB cAF|EAA cAA|B/c/dc BAF|
EAA cAA|BAB cAA|Bcd e2d|cAA A2F:||
|:E3 ECE|FAA FAA|Bcd e2d|cAA BAF|
~E3 ECE|FAA FAA|Bcd e2d|cAA A2F:||`;

const abcMultiZAndComposerNsssSet = `X: 1
T: REELS: Devanny's Goat Set
T: Devanny's Goat
C: C: Tommy Whelan (?) / Trad. / Trad.; S: Noel Hill / Noel Hill / Bothy Band
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; Moulouf / Kenny / Josh Kane The Session
N: https://thesession.org/members/26966/sets/92390
R: Reel
M: 4/4
L: 1/8
Q: 1/2=100
K: Dmaj
|:DFAB AFAB|d2 fe dBAF|DFAF BFAF|EGFD E3F|
AFAB AFAB|defe dBAf|efdB AF~F2|AFEG FD D2:||
|:faab afdf|a/b/a fd edBd|ABde fd~d2|edfd edBd|
ABde fd~d2|e/f/g fd edBd|ABdB AF~F2|AFEG FD D2:||
T: New Mown Meadows (Amix)
K: Amix
|:eA~A2 BABd|egfd edBd|eA~A2 BABd|dfed Bcdf|
eAAG A2 Bd|e/f/g fd edBd|~g3e ~f3e|dfed Bcdf||
|:a2 fa bafa|a/b/a fd edBd|~a2 fa baaf|dfed Bcdf|
a2 fa bafa|a/b/a fd edBd|~g3e ~f3e|dfed Bcdf:||
T: Rip the Calico
K: Dmaj
|:d2 dc defd|ed B/c/d egfe|~d3c defd|efdB ~A3B:||
|:dB~B2 gefd|ed B/c/d egfe|dB~B2 gefd|1 efdB ~A3B:|2 efdB ~A3e||
faaf gefd|ed B/c/d egfe|fa~a2 gefd|efdB ~A3e|
~a3f gefd|ed B/c/d egfe|fa~a2 bfaf|e2 ef g/f/e fe||`;

const abcMedleyNsssSet = `X: 1
T: MEDLEY: Road to Lisdoonvarna Set
T: Road to Lisdoonvarna [Slide]
C: C: Trad.; S: Various
C: Set Leaders: Olya, Andrey
Z: [Unedited]; birlibirdie / fidicen / NfldWhistler at The Session
N: https://thesession.org/members/26966/sets/92387
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Edor
E2B B2A B2c d2A|F2A ABA D2E FED|
E2B B2A B2c d3|cdc B2A B2E E3:||
e2f gfe d2B Bcd|c2A ABc d2B B3|
e2f gfe d2B Bcd|cdc B2A B2E E3:||
T: Swallowtail [Jig]
R: Jig
M: 6/8
K: Edor
|:GEE BEE|GEE BAG|FDD ADD|dcd AGF|
GEE BEE|GEG B2c|dcd AGF|GEE E3:||
|:Bcd e2f|e2f edB|Bcd e2f|edB d3|
Bcd e2f|e2f edB|dcd AGF|GEE E3:||
T: Tripping up the Stairs [Jig]
M: 6/8
K: Dmaj
|:FAA GBB|FAd fed|cBc ABc|dfe dAG|
FAA GBB|FAd fed|cBc ABc|1 dfe d2A:|2 dfe d2c||
|:dBB fBB|fgf fed|cAA eAA|efe edc|
dBB fBB|fgf fed|cBc ABc|1 dfe d2c:|2 dfe d2A||`;

const abcConcatNsssSet = `X: 1
T: JIG: Castle (Dmin)
C: C: Seán Ryan; S: Martin Hayes
C: Set Leaders: Oliushka, Anton
Z: Anton Zille ed.; Jeff Finkelstein at The Session
N: https://thesession.org/members/26966/sets/95962
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Ddor
|:fed edc|dcA GEC|DED AcA|GAc dcA|
f/g/af edc|dcA GEC|DED AcA|1 GEC D3:|2 GEC D2E||
|:FED ~d3|edc AGE|CEG cBc|CEG FED|
~F3 ~G3|AGA cde|dcA GEC|1 A,B,C D2E:|2 A,B,C D3||
T: JIG: Cliffs of Moher
C: C: Trad.; S: Various
C: Set Leaders: André, Sophie, Anton, Tania, Oliushka
Z: Anton Zille ed.; NfldWhistler at The Session
N: https://thesession.org/members/26966/sets/96712
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Ador
|:a3 bag|eaf ged|c2A BAG|EFG ABd|
eaa bag|eaf ged|c2A BAG|1 EFG A3:|2 EFG ABd||
|:e2e dBA|e/f/ge dBA|G2B dBA|GAB dBd|
[1 e3 dBA|e/f/ge dBA|GAB dBG|EFG ABd:|
[2 e2e dee|cee Bee|EFG BAG|EDB, A,3||
T: JIG: Connaughtman's Rambles
C: C: Trad.; S: ThZCh; Various
C: Set Leaders: Oliushka, Anton, Tania, Mars, André
Z: Anton Zille ed. arr., Oleg Naumov arr.; JACKB at The Session
N: https://thesession.org/members/26966/sets/71901
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Dmaj
|:"D"FAA dAA|BAB dAG|FAA dfe|"G"dBB "A"BAG|
"D"FAA dAA|"G"~B3 "A"def|"G (Bm)"gfe f2e|1 "A"dBB BAG:|2 "A"dBB B2e||
|:"Bm"fbb faf|"A"fed ede|"Bm"fbb faf|"G"fed "A"e2e|
"Bm"fbb faf|"A"fed def|"G"gfe ~f2e|1 "A"dBB Bde:|2 "A"dBB BAG||`;

const abcUnorderedConcatRawSet = `X: 1
T: Eily Keating's, Kitty Lyons'
% this is a header comment
A: Sliabh Luachra
B: Unpublished
C: Trad.
D: Timmy O'Connor: As it Was in Toureendarby (2013)
F: https://thesession.org/members/26966/sets/102463/abc
G: Accordion
H: Eily Keating plays concertina in the old style and calls both tunes in this set Kitty Lyons'
I: linebreak $
L: 1/8
M: 12/8
N: https://thesession.org/members/26966/sets/102463
N: https://scullysfest.bandcamp.com/album/as-it-was-in-toureendarby
O: Co. Cork
P: AABB
Q: 3/8=150
R: Slide
S: Timmy O'Connor of Toureendarby
S: Eily Keating, from Rockchapel in Co. Cork and formerly from Co. Limerick, is the source for these tunes
S: https://thesession.org/tunes/25507#setting53902
T: Eily Keating's
U: s = !slide!
V: Treble clef=treble name="Right hand"
V: Bass clef=bass name="Left hand"
W: Bandcamp: Timmy O'Connor – As it Was in Toureendarby
Z: Bregolas at The Session
%% this is a header directive
K: Dmix
% this is a comment after K: tag
[V: Treble]|:A2A- ABA G2E G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
|:d2(A A)BA B2A G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
[V: Bass]|:A2A- ABA G2E G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
|:d2(A A)BA B2A G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
T: Kitty Lyons'
% this is a header comment
A: Sliabh Luachra
B: Unpublished
D: Timmy O'Connor: As it Was in Toureendarby (2013)
F: https://thesession.org/members/26966/sets/102463/abc
G: Accordion
H: Eily Keating plays concertina in the old style and calls both tunes in this set Kitty Lyons'
I: linebreak $
L: 1/8
M: 12/8
N: https://thesession.org/members/26966/sets/102463
N: https://scullysfest.bandcamp.com/album/as-it-was-in-toureendarby
O: Co. Cork
P: AABB
Q: 3/8=150
R: Slide
S: Timmy O'Connor of Toureendarby
S: Eily Keating, from Rockchapel in Co. Cork and formerly from Co. Limerick, is the source for these tunes
S: https://thesession.org/tunes/13878#setting24929
U: s = !slide!
V: Treble clef=treble name="Right hand"
V: Bass clef=bass name="Left hand"
W: Bandcamp: Timmy O'Connor – As it Was in Toureendarby
Z: Smiley at The Session
%% this is a header directive
K: Dmaj
% this is a comment after K: tag
[V: Treble]|:d2A cBA F2E D2F|E2E- E2F G2A B2c|
d2A cBA F2E D2F|EDE F2E D3-D2A:|
|:B2B- BAB f3-f2d|e2e- efe d2c B2A|
B2B- BAB f3-f2d|e2e- efe d3-d2A:|
[V: Bass]|:d2A cBA F2E D2F|E2E- E2F G2A B2c|
d2A cBA F2E D2F|EDE F2E D3-D2A:|
|:B2B- BAB f3-f2d|e2e- efe d2c B2A|
B2B- BAB f3-f2d|e2e- efe d3-d2A:|`;

const abcTuneWithChords = `X: 1
T: WALTZ: Petranu Vals
C: C: Oliushka Tikhaia; S: ThZCh
C: Set Leaders: Oliushka, Anton, Sophie
Z: Oliushka Tikhaia ed., Anton Zille ed. arr.; Bregolas at The Session
N: https://thesession.org/members/26966/sets/95961
R: Waltz
M: 3/4
L: 1/8
Q: 1/4=144
K: Gmaj
D GA|:"G"B2 BA B/c/d|"D"A4 BA|"C"G2 FG E2|"D"D4 GA|
"G"BA B B2 d|"D"A3 g fg|"C"eG ef e2|"D"d3 c BA|
"G"B2 BA B/c/d|"D"A4 BA|"C"G2 F G2 E|"D"DC D2 GA|
"G"BA B B2 d|"D"A6|"C"CD EG "D"F2|1 "G"G3 D GA:|2 "G"G3 F ED||
"C"C3 D EG|"D"FE F2 D2|"Em"B3 A GF|"G"GF EF DE|
"C"C3 D EG|"D"FE F2 D2|"G"G3 A B2|"G"d2 "D/F#"g2 "D"fg|
"Em"eG ef ef|"D"dF de de|"C"cB cE cd|"G"B3 A GA|
"G"B2 BA B/c/d|"D"A6|"C"CD EG "D"F2|"G"G3 F ED|
"C"C3 D EG|"D"FE F2 D2|"Em"B3 D GA|"Em"cB AG FG|
"C"C3 D EG|"D"FE F2 D2|"Em"G3 A B2|"G"d2 g2 "D/F#"fg|
"Em"ed eG ef|"D"dc dF de|"Cm"c_E cd c2|"G"B3 A GA|
"G"B2 BA B/c/d|"D"A6|"C"CD EG "D"F2|"G"G4||`;

const abcSetWithChords = `X: 1
T: HORNPIPES: Callaghan's Set
T: Frisco
C: C: Trad.; S: Julia Clifford / Pádraig O'Keeffe
C: Set Leaders: Anton
Z: Anton Zille ed. arr.; Daemco / brailsford at The Session
N: https://thesession.org/members/26966/sets/94459
R: Hornpipe
M: 4/4
L: 1/8
Q: 1/2=82
K: Gmaj
e>d|:"G"(3BdB G>A B>de>f|(3gag f>g e>dB>A|"D"F>Ad>A F>Ad>A|F>Ad>B "D7"A2 e>d|
"G"(3BdB G>A (3Bcd e>f|(3gag f>g e>dB>A|"D"F>Ae>d B>GA>F|1 "G"G2 "D"G>F "G"G2 e>d:|2 "G"G2 "D"G>F "G"G2 e>f||
|:"Em"(3gag e>g "D"(3fgf d>f|"C"(3efe c>e "G"(3ded B>d|"C"c>BA>G F>GA>B|""(3Bcd e>d "D7"^c>de>f|
"G"g>ea>g "D"f>dg>f|"C"e>df>e "G (Bm7)"d>fe>d|"C"c>BA>G (3EFG A>B|1 "D7"(3c^cd e>f "G"g2 d2:|2 "D7"(3c^cd e>f "G"g2||
T: Callaghan's High
K: Gmaj
g>f|"C"(3efg f>g "D"e>AB>A|"G"G>AB>d "(D)"d>BG>E|"(G)"D>EG>A "Em"B>GB>d|"C"(3efg f>g "D"e>dB>d|
"Em"(3gag "(D)"f>g "(C)"e>dB>d|"C"(3efg f>a "(D)"g>fe>d|"G"(3BdB G>B "D"(3ABA F>A|"C"G2 "D"G>F "G"G2 B>d|
"Em"e>gf>g e>dB>A|"C"G>AB>e d>BG>E|"G"D>EG>A ~B3d|"C"(3efg f>g "D"e>dB>d|
"Em"(3gag "(D)"f>g "(C)"e>dB>d|"C"(3efg a>f "(D)"g>fe>d|"G"(3BdB G>B "D"(3ABA F>A|"C"G2 "D"G>F "G"G2 (3efg||
"D"a>fg>e d>eg>a|"Em"b>BB>A G2 f>g|"D"(3agf (3gfe d>eg>a|"Em"b2 e2 e3g|
"D"(3faf (3def "C"g>fe>g|"D"f>e (3def "C"g>fe>f|(3gab a>f g>fe>d|"D"B>AB>d "Em"e2 f>g|
"D"a>fg>e d>eg>a|"Em"b>BB>A G>ef>g|"D"(3agf (3gfe d>eg>a|"C"b2 e2 e3g|
"D"(3faf (3def "C"g>fe>g|"D"f>e (3def "C"g>fe>f|"(Em)"(3gab "(D)"(3agf "(C)"(3gfe (3fed|"D"B>de>f "C"g2||`;

///////////////////////////////////////////////////////
// [0] Test ABC Sort output
///////////////////////////////////////////////////////

describe("SORT OUTPUT", () => {

    beforeAll(() => {
        // Set Custom ABC mode ON
        localStorage.abcSortEnforcesCustomAbcFields = 1;
        // Skip deep editing of ABC fields
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 1;
        // Skip deep editing of ABC titles
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 1;
        // Allow merging of duplicate ABC fields
        localStorage.abcSortSkipsMergingDuplicateFields = 0;
    });

test("ABC SET > Returns sorted Source ABC, Tunes ABC, Set Chordbook and Tunes Chordbook", () => {
    
    const abcSetSortOutput = getSortedAbc(abcSetWithChords);

expect(abcSetSortOutput[0]).toEqual(
`X: 1
T: HORNPIPES: Callaghan's Set
T: Frisco
C: C: Trad.; S: Julia Clifford / Pádraig O'Keeffe
C: Set Leaders: Anton
Z: Anton Zille ed. arr.; Daemco / brailsford at The Session
N: https://thesession.org/members/26966/sets/94459
R: Hornpipe
M: 4/4
L: 1/8
Q: 1/2=82
K: Gmaj
e>d|:"G"(3BdB G>A B>de>f|(3gag f>g e>dB>A|"D"F>Ad>A F>Ad>A|F>Ad>B "D7"A2 e>d|
"G"(3BdB G>A (3Bcd e>f|(3gag f>g e>dB>A|"D"F>Ae>d B>GA>F|1 "G"G2 "D"G>F "G"G2 e>d:|2 "G"G2 "D"G>F "G"G2 e>f||
|:"Em"(3gag e>g "D"(3fgf d>f|"C"(3efe c>e "G"(3ded B>d|"C"c>BA>G F>GA>B|""(3Bcd e>d "D7"^c>de>f|
"G"g>ea>g "D"f>dg>f|"C"e>df>e "G (Bm7)"d>fe>d|"C"c>BA>G (3EFG A>B|1 "D7"(3c^cd e>f "G"g2 d2:|2 "D7"(3c^cd e>f "G"g2||
T: Callaghan's High
K: Gmaj
g>f|"C"(3efg f>g "D"e>AB>A|"G"G>AB>d "(D)"d>BG>E|"(G)"D>EG>A "Em"B>GB>d|"C"(3efg f>g "D"e>dB>d|
"Em"(3gag "(D)"f>g "(C)"e>dB>d|"C"(3efg f>a "(D)"g>fe>d|"G"(3BdB G>B "D"(3ABA F>A|"C"G2 "D"G>F "G"G2 B>d|
"Em"e>gf>g e>dB>A|"C"G>AB>e d>BG>E|"G"D>EG>A ~B3d|"C"(3efg f>g "D"e>dB>d|
"Em"(3gag "(D)"f>g "(C)"e>dB>d|"C"(3efg a>f "(D)"g>fe>d|"G"(3BdB G>B "D"(3ABA F>A|"C"G2 "D"G>F "G"G2 (3efg||
"D"a>fg>e d>eg>a|"Em"b>BB>A G2 f>g|"D"(3agf (3gfe d>eg>a|"Em"b2 e2 e3g|
"D"(3faf (3def "C"g>fe>g|"D"f>e (3def "C"g>fe>f|(3gab a>f g>fe>d|"D"B>AB>d "Em"e2 f>g|
"D"a>fg>e d>eg>a|"Em"b>BB>A G>ef>g|"D"(3agf (3gfe d>eg>a|"C"b2 e2 e3g|
"D"(3faf (3def "C"g>fe>g|"D"f>e (3def "C"g>fe>f|"(Em)"(3gab "(D)"(3agf "(C)"(3gfe (3fed|"D"B>de>f "C"g2||`
);

expect(abcSetSortOutput[1]).toEqual(
`X: 1
T: HORNPIPE: Callaghan's High
C: C: Trad.; S: Pádraig O'Keeffe
C: Set Leaders: Anton
Z: Anton Zille ed. arr.; brailsford at The Session
N: https://thesession.org/members/26966/sets/94459
R: Hornpipe
M: 4/4
L: 1/8
Q: 1/2=82
K: Gmaj
g>f|"C"(3efg f>g "D"e>AB>A|"G"G>AB>d "(D)"d>BG>E|"(G)"D>EG>A "Em"B>GB>d|"C"(3efg f>g "D"e>dB>d|
"Em"(3gag "(D)"f>g "(C)"e>dB>d|"C"(3efg f>a "(D)"g>fe>d|"G"(3BdB G>B "D"(3ABA F>A|"C"G2 "D"G>F "G"G2 B>d|
"Em"e>gf>g e>dB>A|"C"G>AB>e d>BG>E|"G"D>EG>A ~B3d|"C"(3efg f>g "D"e>dB>d|
"Em"(3gag "(D)"f>g "(C)"e>dB>d|"C"(3efg a>f "(D)"g>fe>d|"G"(3BdB G>B "D"(3ABA F>A|"C"G2 "D"G>F "G"G2 (3efg||
"D"a>fg>e d>eg>a|"Em"b>BB>A G2 f>g|"D"(3agf (3gfe d>eg>a|"Em"b2 e2 e3g|
"D"(3faf (3def "C"g>fe>g|"D"f>e (3def "C"g>fe>f|(3gab a>f g>fe>d|"D"B>AB>d "Em"e2 f>g|
"D"a>fg>e d>eg>a|"Em"b>BB>A G>ef>g|"D"(3agf (3gfe d>eg>a|"C"b2 e2 e3g|
"D"(3faf (3def "C"g>fe>g|"D"f>e (3def "C"g>fe>f|"(Em)"(3gab "(D)"(3agf "(C)"(3gfe (3fed|"D"B>de>f "C"g2||

X: 2
T: HORNPIPE: Frisco
C: C: Trad.; S: Julia Clifford
C: Set Leaders: Anton
Z: Anton Zille ed. arr.; Daemco at The Session
N: https://thesession.org/members/26966/sets/94459
R: Hornpipe
M: 4/4
L: 1/8
Q: 1/2=82
K: Gmaj
e>d|:"G"(3BdB G>A B>de>f|(3gag f>g e>dB>A|"D"F>Ad>A F>Ad>A|F>Ad>B "D7"A2 e>d|
"G"(3BdB G>A (3Bcd e>f|(3gag f>g e>dB>A|"D"F>Ae>d B>GA>F|1 "G"G2 "D"G>F "G"G2 e>d:|2 "G"G2 "D"G>F "G"G2 e>f||
|:"Em"(3gag e>g "D"(3fgf d>f|"C"(3efe c>e "G"(3ded B>d|"C"c>BA>G F>GA>B|""(3Bcd e>d "D7"^c>de>f|
"G"g>ea>g "D"f>dg>f|"C"e>df>e "G (Bm7)"d>fe>d|"C"c>BA>G (3EFG A>B|1 "D7"(3c^cd e>f "G"g2 d2:|2 "D7"(3c^cd e>f "G"g2||`
);

expect(abcSetSortOutput[2]).toEqual(
`[
  {
    "setTitle": "HORNPIPES: Callaghan's Set",
    "tuneChords": [
      {
        "title": "Frisco",
        "meter": "4/4",
        "chords": "PART 1:\\n|\\tG\\tG\\t|\\tG\\tG\\t|\\tD\\tD\\t|\\tD\\tD7\\t|\\n|\\tG\\tG\\t|\\tG\\tG\\t|\\tD\\tD\\t|1\\tG D\\tG G\\t|\\n|2\\tG D\\tG G\\t||\\n\\nPART 2:\\n|\\tEm\\tD\\t|\\tC\\tG\\t|\\tC\\tC\\t|\\tD7\\tD7\\t|\\n|\\tG\\tD\\t|\\tC\\tG (Bm7)\\t|\\tC\\tC\\t|1\\tD7\\tG\\t|\\n|2\\tD7\\tG\\t||"
      },
      {
        "title": "Callaghan's High",
        "meter": "4/4",
        "chords": "PART 1:\\n|\\tC\\tD\\t|\\tG\\t(D)\\t|\\t(G)\\tEm\\t|\\tC\\tD\\t|\\n|\\tEm (D)\\t(C) (C)\\t|\\tC\\t(D)\\t|\\tG\\tD\\t|\\tC D\\tG G\\t|\\n|\\tEm\\tEm\\t|\\tC\\tC\\t|\\tG\\tG\\t|\\tC\\tD\\t|\\n|\\tEm (D)\\t(C) (C)\\t|\\tC\\t(D)\\t|\\tG\\tD\\t|\\tC D\\tG G\\t||\\n\\nPART 2:\\n|\\tD\\tD\\t|\\tEm\\tEm\\t|\\tD\\tD\\t|\\tEm\\tEm\\t|\\n|\\tD\\tC\\t|\\tD\\tC\\t|\\tC\\tC\\t|\\tD\\tEm\\t|\\n|\\tD\\tD\\t|\\tEm\\tEm\\t|\\tD\\tD\\t|\\tC\\tC\\t|\\n|\\tD\\tC\\t|\\tD\\tC\\t|\\t(Em) (D)\\t(C) (C)\\t|\\tD\\tC\\t||"
      }
    ]
  }
]`
);

expect(abcSetSortOutput[3]).toEqual(
`[
  {
    "title": "HORNPIPE: Callaghan's High",
    "meter": "4/4",
    "chords": "PART 1:\\n|\\tC\\tD\\t|\\tG\\t(D)\\t|\\t(G)\\tEm\\t|\\tC\\tD\\t|\\n|\\tEm (D)\\t(C) (C)\\t|\\tC\\t(D)\\t|\\tG\\tD\\t|\\tC D\\tG G\\t|\\n|\\tEm\\tEm\\t|\\tC\\tC\\t|\\tG\\tG\\t|\\tC\\tD\\t|\\n|\\tEm (D)\\t(C) (C)\\t|\\tC\\t(D)\\t|\\tG\\tD\\t|\\tC D\\tG G\\t||\\n\\nPART 2:\\n|\\tD\\tD\\t|\\tEm\\tEm\\t|\\tD\\tD\\t|\\tEm\\tEm\\t|\\n|\\tD\\tC\\t|\\tD\\tC\\t|\\tC\\tC\\t|\\tD\\tEm\\t|\\n|\\tD\\tD\\t|\\tEm\\tEm\\t|\\tD\\tD\\t|\\tC\\tC\\t|\\n|\\tD\\tC\\t|\\tD\\tC\\t|\\t(Em) (D)\\t(C) (C)\\t|\\tD\\tC\\t||"
  },
  {
    "title": "HORNPIPE: Frisco",
    "meter": "4/4",
    "chords": "PART 1:\\n|\\tG\\tG\\t|\\tG\\tG\\t|\\tD\\tD\\t|\\tD\\tD7\\t|\\n|\\tG\\tG\\t|\\tG\\tG\\t|\\tD\\tD\\t|1\\tG D\\tG G\\t|\\n|2\\tG D\\tG G\\t||\\n\\nPART 2:\\n|\\tEm\\tD\\t|\\tC\\tG\\t|\\tC\\tC\\t|\\tD7\\tD7\\t|\\n|\\tG\\tD\\t|\\tC\\tG (Bm7)\\t|\\tC\\tC\\t|1\\tD7\\tG\\t|\\n|2\\tD7\\tG\\t||"
  }
]`
);

});

test("ABC TUNE > Returns sorted Source ABC and Chordbook", () => {

    const abcTuneSortOutput = getSortedAbc(abcTuneWithChords);

expect(abcTuneSortOutput[0]).toEqual(
`X: 1
T: WALTZ: Petranu Vals
C: C: Oliushka Tikhaia; S: ThZCh
C: Set Leaders: Oliushka, Anton, Sophie
Z: Oliushka Tikhaia ed., Anton Zille ed. arr.; Bregolas at The Session
N: https://thesession.org/members/26966/sets/95961
R: Waltz
M: 3/4
L: 1/8
Q: 1/4=144
K: Gmaj
D GA|:"G"B2 BA B/c/d|"D"A4 BA|"C"G2 FG E2|"D"D4 GA|
"G"BA B B2 d|"D"A3 g fg|"C"eG ef e2|"D"d3 c BA|
"G"B2 BA B/c/d|"D"A4 BA|"C"G2 F G2 E|"D"DC D2 GA|
"G"BA B B2 d|"D"A6|"C"CD EG "D"F2|1 "G"G3 D GA:|2 "G"G3 F ED||
"C"C3 D EG|"D"FE F2 D2|"Em"B3 A GF|"G"GF EF DE|
"C"C3 D EG|"D"FE F2 D2|"G"G3 A B2|"G"d2 "D/F#"g2 "D"fg|
"Em"eG ef ef|"D"dF de de|"C"cB cE cd|"G"B3 A GA|
"G"B2 BA B/c/d|"D"A6|"C"CD EG "D"F2|"G"G3 F ED|
"C"C3 D EG|"D"FE F2 D2|"Em"B3 D GA|"Em"cB AG FG|
"C"C3 D EG|"D"FE F2 D2|"Em"G3 A B2|"G"d2 g2 "D/F#"fg|
"Em"ed eG ef|"D"dc dF de|"Cm"c_E cd c2|"G"B3 A GA|
"G"B2 BA B/c/d|"D"A6|"C"CD EG "D"F2|"G"G4||`
);

expect(abcTuneSortOutput[1]).toEqual(``);

expect(abcTuneSortOutput[2]).toEqual(
`[
  {
    "title": "WALTZ: Petranu Vals",
    "meter": "3/4",
    "chords": "PART 1:\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tD\\t|1\\tG\\tG\\tG\\t|\\n|2\\tG\\tG\\tG\\t||\\n\\nPART 2:\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tEm\\tEm\\tEm\\t|\\tG\\tG\\tG\\t|\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tG\\tG\\tG\\t|\\tG\\tD/F#\\tD\\t|\\n|\\tEm\\tEm\\tEm\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tG\\tG\\tG\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tD\\t|\\tG\\tG\\tG\\t|\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tEm\\tEm\\tEm\\t|\\tEm\\tEm\\tEm\\t|\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tEm\\tEm\\tEm\\t|\\tG\\tG\\tD/F#\\t|\\n|\\tEm\\tEm\\tEm\\t|\\tD\\tD\\tD\\t|\\tCm\\tCm\\tCm\\t|\\tG\\tG\\tG\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tD\\t|\\tG\\tG\\tG\\t||"
  }
]`
);

expect(abcTuneSortOutput[3]).toEqual(``);

});

});

///////////////////////////////////////////////////////
//    [1] Test ABC Sort functions on valid ABC input
///////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
//    [1.1]
//    Custom ABC Header / Deep Edit / Merge Headers
//
//    SORT enforces custom N.S.S.S. ABC fields is ON
//    SORT skips editing headers if ABC ordered is OFF
//    SORT skips merging duplicate header fields is OFF
//////////////////////////////////////////////////////////////

describe("SORT [Custom ABC]", () => {

    beforeAll(() => {
        // Set Custom ABC mode ON
        localStorage.abcSortEnforcesCustomAbcFields = 1;
        // Allow deep editing of ABC fields
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 0;
        // Allow deep editing of ABC titles
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 0;
        // Allow merging of duplicate ABC fields
        localStorage.abcSortSkipsMergingDuplicateFields = 0;
    });

it("SET ORDERING > Adds custom N.S.S.S. field defaults to raw TSO Set, merges duplicate fields", () => {
expect(sortFilterAbc(abcRawTsoSet)[0][0]).toEqual(
`X: 1
T: SLIDES: Brosna Set
T: Brosna
C: C: Trad[?]; S: Various
C: Set Leaders: 
Z: [Unedited]; The Session
N: https://thesession.org/tunes/1414#setting1414
N: https://thesession.org/tunes/53#setting53
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:||
T: O'Keeffe's
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:||`
)});

it("SET ORDERING > Reorders & merges ABC fields in ABC Set (TSO to N.S.S.S.)", () => {
expect(sortFilterAbc(abcUnorderedConcatRawSet)[0][0]).toEqual(
`X: 1
T: SLIDES: Eily Keating's Set
T: Eily Keating's
C: C: Trad. [1]; S: Timmy O'Connor of Toureendarby
C: Set Leaders: 
Z: [1] Bregolas at The Session / [2] Smiley at The Session
N: https://thesession.org/members/26966/sets/102463
N: https://scullysfest.bandcamp.com/album/as-it-was-in-toureendarby
R: Slide
M: 12/8
L: 1/8
Q: 3/8=150
% this is a header comment
%% this is a header directive
K: Dmix
% this is a comment after K: tag
[V: Treble]|:A2A- ABA G2E G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
|:d2(A A)BA B2A G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
[V: Bass]|:A2A- ABA G2E G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
|:d2(A A)BA B2A G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
T: Kitty Lyons'
% this is a header comment
I: linebreak $
P: AABB
U: s = !slide!
V: Treble clef=treble name="Right hand"
V: Bass clef=bass name="Left hand"
%% this is a header directive
K: Dmaj
% this is a comment after K: tag
[V: Treble]|:d2A cBA F2E D2F|E2E- E2F G2A B2c|
d2A cBA F2E D2F|EDE F2E D3-D2A:||
|:B2B- BAB f3-f2d|e2e- efe d2c B2A|
B2B- BAB f3-f2d|e2e- efe d3-d2A:|
[V: Bass]|:d2A cBA F2E D2F|E2E- E2F G2A B2c|
d2A cBA F2E D2F|EDE F2E D3-D2A:||
|:B2B- BAB f3-f2d|e2e- efe d2c B2A|
B2B- BAB f3-f2d|e2e- efe d3-d2A:||`
)});

it("SET TO TUNES > Converts custom N.S.S.S. Medley to individual Tunes", () => {
expect(sortFilterAbc(abcMedleyNsssSet)[1]).toEqual(
[`X: 1
T: JIG: Swallowtail
C: C: Trad.; S: Various
C: Set Leaders: Olya, Andrey
Z: [Unedited]; fidicen at The Session
N: https://thesession.org/members/26966/sets/92387
R: Jig
M: 6/8
L: 1/8
Q: 3/8=130
K: Edor
|:GEE BEE|GEE BAG|FDD ADD|dcd AGF|
GEE BEE|GEG B2c|dcd AGF|GEE E3:||
|:Bcd e2f|e2f edB|Bcd e2f|edB d3|
Bcd e2f|e2f edB|dcd AGF|GEE E3:||`,
`X: 2
T: JIG: Tripping up the Stairs
C: C: Trad.; S: Various
C: Set Leaders: Olya, Andrey
Z: [Unedited]; NfldWhistler at The Session
N: https://thesession.org/members/26966/sets/92387
R: Jig
M: 6/8
L: 1/8
Q: 3/8=130
K: Dmaj
|:FAA GBB|FAd fed|cBc ABc|dfe dAG|
FAA GBB|FAd fed|cBc ABc|1 dfe d2A:|2 dfe d2c||
|:dBB fBB|fgf fed|cAA eAA|efe edc|
dBB fBB|fgf fed|cBc ABc|1 dfe d2c:|2 dfe d2A||`,
`X: 3
T: SLIDE: Road to Lisdoonvarna
C: C: Trad.; S: Various
C: Set Leaders: Olya, Andrey
Z: [Unedited]; birlibirdie at The Session
N: https://thesession.org/members/26966/sets/92387
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Edor
E2B B2A B2c d2A|F2A ABA D2E FED|
E2B B2A B2c d3|cdc B2A B2E E3:||
e2f gfe d2B Bcd|c2A ABc d2B B3|
e2f gfe d2B Bcd|cdc B2A B2E E3:||`]
)});

it("SET TO TUNES > Splits multiple Z: and C: C: S: values of N.S.S.S. Set between individual Tunes", () => {
expect(sortFilterAbc(abcMultiZAndComposerNsssSet)[1]).toEqual(
[`X: 1
T: REEL: Devanny's Goat
C: C: Tommy Whelan (?); S: Noel Hill
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; Moulouf at The Session
N: https://thesession.org/members/26966/sets/92390
R: Reel
M: 4/4
L: 1/8
Q: 1/2=100
K: Dmaj
|:DFAB AFAB|d2 fe dBAF|DFAF BFAF|EGFD E3F|
AFAB AFAB|defe dBAf|efdB AF~F2|AFEG FD D2:||
|:faab afdf|a/b/a fd edBd|ABde fd~d2|edfd edBd|
ABde fd~d2|e/f/g fd edBd|ABdB AF~F2|AFEG FD D2:||`,
`X: 2
T: REEL: New Mown Meadows (Amix)
C: C: Trad.; S: Noel Hill
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; Kenny at The Session
N: https://thesession.org/members/26966/sets/92390
R: Reel
M: 4/4
L: 1/8
Q: 1/2=100
K: Amix
|:eA~A2 BABd|egfd edBd|eA~A2 BABd|dfed Bcdf|
eAAG A2 Bd|e/f/g fd edBd|~g3e ~f3e|dfed Bcdf||
|:a2 fa bafa|a/b/a fd edBd|~a2 fa baaf|dfed Bcdf|
a2 fa bafa|a/b/a fd edBd|~g3e ~f3e|dfed Bcdf:||`,
`X: 3
T: REEL: Rip the Calico
C: C: Trad.; S: Bothy Band
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; Josh Kane The Session
N: https://thesession.org/members/26966/sets/92390
R: Reel
M: 4/4
L: 1/8
Q: 1/2=100
K: Dmaj
|:d2 dc defd|ed B/c/d egfe|~d3c defd|efdB ~A3B:||
|:dB~B2 gefd|ed B/c/d egfe|dB~B2 gefd|1 efdB ~A3B:|2 efdB ~A3e||
faaf gefd|ed B/c/d egfe|fa~a2 gefd|efdB ~A3e|
~a3f gefd|ed B/c/d egfe|fa~a2 bfaf|e2 ef g/f/e fe||`]
)});

it("SET TO TUNES > Splits Z: values between Tunes when converting N.S.S.S. Set into Tunes", () => {
expect(sortFilterAbc(abcMultiZNsssSet)[1]).toEqual(
[`X: 1
T: JIG: Connaughtman's Rambles
C: C: Trad.; S: Various
C: Set Leaders: Oliushka, Anton
Z: Anton Zille ed.; JACKB at The Session
N: https://thesession.org/members/26966/sets/71901
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Dmaj
|:FAA dAA|BAB dAG|FAA dfe|dBB BAG|
FAA dAA|~B3 def|gfe f2e|1 dBB BAG:|2 dBB B2e||
|:fbb faf|fed ede|fbb faf|fed e2e|
fbb faf|fed def|gfe ~f2e|1 dBB Bde:|2 dBB BAG||`,
`X: 2
T: JIG: Donncha Lynch's
T: Donncha Ó Loinsigh's
C: C: Trad.; S: Méabh & Clíodhna Ní Bheaglaoich
C: Set Leaders: Oliushka, Anton
Z: Anton Zille ed.; Bregolas at The Session
N: https://thesession.org/members/26966/sets/71901
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Amaj
|:EAA cAA|BAB cAF|EAA cAA|B/c/dc BAF|
EAA cAA|BAB cAA|Bcd e2d|cAA A2F:||
|:E3 ECE|FAA FAA|Bcd e2d|cAA BAF|
~E3 ECE|FAA FAA|Bcd e2d|cAA A2F:||`,
`X: 3
T: JIG: Humours of Killarney
T: Sheehan's / Cheer up Old Hag
C: C: Trad.; S: ThZCh; Paudie O'Connor & John O'Brien
C: Set Leaders: Oliushka, Anton
Z: Anton Zille ed.; Nigel Gatherer at The Session
N: https://thesession.org/members/26966/sets/71901
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Gmaj
|:BGG G2 B|ded d2c|BAB GBd|e2f g2D|
GBd gfe|fdB cBA|BGE EDE|c3 B2A:||
|:BGE EDE|GED D2A|BGE EDE|c2d edc|
BGE EDE|GED DEF|G/A/BA GBA|G3 G2A:||`]
)});

it("SET TO TUNES > Splits multiple C: C: S: values between Tunes when converting N.S.S.S. Set into Tunes", () => {
expect(sortFilterAbc(abcMultiComposerNsssSet)[1]).toEqual(
[`X: 1
T: WALTZ: Looking at a Rainbow
T: Looking at a Rainbow Through a Dirty Window
C: C: Calum Stewart; S: Various
C: Set Leaders: Oliushka, Anton, Sophie
Z: Anton Zille ed.; Bregolas at The Session
N: https://thesession.org/members/26966/sets/95961
R: Waltz
M: 3/4
L: 1/8
Q: 1/4=144
K: Gmaj
D GA|:Bd AB GA|F2 FG FD|E6-|E3 DGA|
Bd AB GA|F2 FG FD|G6-|1 G3 DGA:|2 GA Bd gf||
|:e2 B2 gf|e2 c2 gf|ed ef ga|b2 ba gf|
e2 B2 gf|e2 c2 gf|ed ef ga|1 g4 gf:|2 g3||`,
`X: 2
T: WALTZ: Petranu-Valse
C: C: Oliushka Tikhaia; S: ThZCh
C: Set Leaders: Oliushka, Anton, Sophie
Z: Anton Zille ed.; Bregolas at The Session
N: https://thesession.org/members/26966/sets/95961
R: Waltz
M: 3/4
L: 1/8
Q: 1/4=144
K: Gmaj
D GA|:B2 BA B/c/d|A4 BA|G2 FG E2|D4 GA|
BA B B2 d|A3 g fg|eG ef e2|d3 c BA|
B2 BA B/c/d|A4 BA|G2 F G2 E|DC D2 GA|
BA B B2 d|A6|CD EG F2|1 G3 D GA:|2 G3 F ED||
C3 D EG|FE F2 D2|B3 A GF|GF EF DE|
C3 D EG|FE F2 D2|G3 A B2|d2 g2 fg|
eG ef ef|dF de de|cB cE cd|B3 A GA|
B2 BA B/c/d|A6|CD EG F2|G3 F ED|
C3 D EG|FE F2 D2|B3 D GA|cB AG FG|
C3 D EG|FE F2 D2|G3 A B2|d2 g2 fg|
ed eG ef|dc dF de|c_E cd c2|B3 A GA|
B2 BA B/c/d|A6|CD EG F2|G6||`]
)});

it("SET TO TUNES > Converts raw TSO Set into array of Tunes with custom N.S.S.S. fields", () => {
expect(sortFilterAbc(abcRawTsoSet)[1]).toEqual(
[`X: 1
T: SLIDE: Brosna
C: C: Trad[?]; S: Various
C: Set Leaders: 
Z: [Unedited]; The Session
N: https://thesession.org/tunes/1414#setting1414
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:||`,
`X: 2
T: SLIDE: O'Keeffe's
C: C: Trad[?]; S: Various
C: Set Leaders: 
Z: [Unedited]; The Session
N: https://thesession.org/tunes/53#setting53
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:||`]
)});

it("SET TO TUNES > Converts custom N.S.S.S. Set into array of Tunes with custom fields", () => {
expect(sortFilterAbc(abcProcessedNsssSet)[1]).toEqual(
[`X: 1
T: SLIDE: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; X at The Session
N: https://thesession.org/members/26966/sets/92423
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
D2G G2A BAB d2B|1 A2D FED G2G GFE:|2 A2D FED G2G GBd:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|1 c2A F2A G2G GBd:|2 c2A F2A G2G GFE||`,
`X: 2
T: SLIDE: Dan O'Keeffe's
T: Danny Ab's
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; X at The Session
N: https://thesession.org/members/26966/sets/92423
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2G GFG|
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`]
)});

it("TUNES TO SET > Merges fields of concatenated N.S.S.S. Tunes", () => {
expect(sortFilterAbc(abcConcatNsssSet)[0][0]).toEqual(
`X: 1
T: JIGS: Castle Set
T: Castle (Dmin)
C: C: Seán Ryan / Trad. / Trad.; S: Martin Hayes / Various / ThZCh; Various
C: Set Leaders: See Notes
Z: [1] Anton Zille ed.; Jeff Finkelstein at The Session / [2] Anton Zille ed.; NfldWhistler at The Session / [3] Anton Zille ed. arr., Oleg Naumov arr.; JACKB at The Session
N: [1] https://thesession.org/members/26966/sets/95962
N: [2] https://thesession.org/members/26966/sets/96712
N: [3] https://thesession.org/members/26966/sets/71901
N: Set Leaders: [1] Oliushka, Anton
N: Set Leaders: [2] André, Sophie, Anton, Tania, Oliushka
N: Set Leaders: [3] Oliushka, Anton, Tania, Mars, André
R: Jig
M: 6/8
L: 1/8
Q: 3/8=116
K: Ddor
|:fed edc|dcA GEC|DED AcA|GAc dcA|
f/g/af edc|dcA GEC|DED AcA|1 GEC D3:|2 GEC D2E||
|:FED ~d3|edc AGE|CEG cBc|CEG FED|
~F3 ~G3|AGA cde|dcA GEC|1 A,B,C D2E:|2 A,B,C D3||
T: Cliffs of Moher
K: Ador
|:a3 bag|eaf ged|c2A BAG|EFG ABd|
eaa bag|eaf ged|c2A BAG|1 EFG A3:|2 EFG ABd||
|:e2e dBA|e/f/ge dBA|G2B dBA|GAB dBd|
[1 e3 dBA|e/f/ge dBA|GAB dBG|EFG ABd:|
[2 e2e dee|cee Bee|EFG BAG|EDB, A,3||
T: Connaughtman's Rambles
K: Dmaj
|:"D"FAA dAA|BAB dAG|FAA dfe|"G"dBB "A"BAG|
"D"FAA dAA|"G"~B3 "A"def|"G (Bm)"gfe f2e|1 "A"dBB BAG:|2 "A"dBB B2e||
|:"Bm"fbb faf|"A"fed ede|"Bm"fbb faf|"G"fed "A"e2e|
"Bm"fbb faf|"A"fed def|"G"gfe ~f2e|1 "A"dBB Bde:|2 "A"dBB BAG||`
)});

});

//////////////////////////////////////////////////////////////
//    [1.2]
//    Custom ABC Header / Shallow Edit / Merge Headers
//
//    SORT enforces custom N.S.S.S. ABC fields is ON
//    SORT skips editing headers if ABC ordered is ON
//    SORT skips merging duplicate header fields is OFF
//////////////////////////////////////////////////////////////

describe("SORT [Custom ABC]", () => {

    beforeAll(() => {
        // Set Custom ABC mode ON
        localStorage.abcSortEnforcesCustomAbcFields = 1;
        // Skip deep editing of ABC fields
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 1;
        // Skip deep editing of ABC titles
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 1;
        // Allow merging of duplicate ABC fields
        localStorage.abcSortSkipsMergingDuplicateFields = 0;
    });

it("SKIP DEEP EDIT > Does not deep edit header fields in correctly ordered N.S.S.S Set, merges duplicate fields", () => {
expect(sortFilterAbc(abcUnmergedNsssSet)[0][0]).toEqual(
`X: 1
T: SLIDES: Brosna Set
T: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; X at The Session
N: https://thesession.org/members/26966/sets/92423
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
D2G G2A BAB d2B|1 A2D FED G2G GFE:|2 A2D FED G2G GBd:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|1 c2A F2A G2G GBd:|2 c2A F2A G2G GFE||
T: Dan O'Keeffe's / Danny Ab's
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2G GFG|
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`
)});

});

//////////////////////////////////////////////////////////////
//    [1.3]
//    Custom ABC Header / Deep Edit / No Merged Headers
//
//    SORT enforces custom N.S.S.S. ABC fields is ON
//    SORT skips editing headers if ABC ordered is ON
//    SORT skips merging duplicate header fields is ON
//////////////////////////////////////////////////////////////

describe("SORT [Custom ABC]", () => {

    beforeAll(() => {
        // Set Custom ABC mode ON
        localStorage.abcSortEnforcesCustomAbcFields = 1;
        // Skip deep editing of ABC fields [no effect]
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 1;
        // Skip deep editing of ABC titles [no effect]
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 1;
        // Skip merging of duplicate ABC fields [= unordered]
        localStorage.abcSortSkipsMergingDuplicateFields = 1;
    });

it("SKIP MERGING > Does not merge header fields in N.S.S.S Set, deep edits unmerged set as unordered", () => {
expect(sortFilterAbc(abcUnmergedNsssSet)[0][0]).toEqual(
`X: 1
T: SLIDES: Brosna No. 1 Set
T: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; X at The Session
N: https://thesession.org/members/26966/sets/92423
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
D2G G2A BAB d2B|1 A2D FED G2G GFE:|2 A2D FED G2G GBd:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|1 c2A F2A G2G GBd:|2 c2A F2A G2G GFE||
T: Dan O'Keeffe's / Danny Ab's
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2G GFG|
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`
)});

});

//////////////////////////////////////////////////////////////
//    [1.4]
//    Standard ABC Header / Deep Edit / Merge Headers
//
//    SORT enforces custom N.S.S.S. ABC fields is OFF
//    SORT skips editing headers if ABC ordered is OFF
//    SORT skips merging duplicate header fields is OFF
//////////////////////////////////////////////////////////////

describe("SORT [Standard ABC]", () => {

    // Set Custom ABC mode OFF

    beforeAll(() => {
        // Set Custom ABC mode OFF
        localStorage.abcSortEnforcesCustomAbcFields = 0;
        // Allow deep editing of ABC fields
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 0;
        // Allow deep editing of ABC titles
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 0;
        // Allow merging of duplicate ABC fields
        localStorage.abcSortSkipsMergingDuplicateFields = 0;
    });

it("SET ORDERING > Formats and reorders fields in raw TSO Set, merges duplicate fields", () => {
expect(sortFilterAbc(abcRawTsoSet)[0][0]).toEqual(
`X: 1
T: SLIDES: Brosna Set
T: Brosna
S: https://thesession.org/tunes/1414#setting1414
S: https://thesession.org/tunes/53#setting53
R: Slide
M: 12/8
L: 1/8
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:||
T: O'Keeffe's
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:||`
)});

it("SET ORDERING > Reorders & merges [A-Z] ABC fields in ABC Set (Raw to Standard)", () => {
expect(sortFilterAbc(abcUnorderedConcatRawSet)[0][0]).toEqual(
`X: 1
T: SLIDES: Eily Keating's Set
T: Eily Keating's
C: Trad. [1]
S: Timmy O'Connor of Toureendarby
S: Eily Keating, from Rockchapel in Co. Cork and formerly from Co. Limerick, is the source for these tunes
S: [1] https://thesession.org/tunes/25507#setting53902
S: [2] https://thesession.org/tunes/13878#setting24929
Z: [1] Bregolas at The Session / [2] Smiley at The Session
N: https://thesession.org/members/26966/sets/102463
N: https://scullysfest.bandcamp.com/album/as-it-was-in-toureendarby
A: Sliabh Luachra
B: Unpublished
D: Timmy O'Connor: As it Was in Toureendarby (2013)
F: https://thesession.org/members/26966/sets/102463/abc
G: Accordion
H: Eily Keating plays concertina in the old style and calls both tunes in this set Kitty Lyons'
O: Co. Cork
W: Bandcamp: Timmy O'Connor – As it Was in Toureendarby
I: linebreak $
P: AABB
U: s = !slide!
V: Treble clef=treble name="Right hand"
V: Bass clef=bass name="Left hand"
R: Slide
M: 12/8
L: 1/8
Q: 3/8=150
% this is a header comment
%% this is a header directive
K: Dmix
% this is a comment after K: tag
[V: Treble]|:A2A- ABA G2E G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
|:d2(A A)BA B2A G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
[V: Bass]|:A2A- ABA G2E G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
|:d2(A A)BA B2A G2B|A2A- ABA G2E D3|
ABA ABA G2E G2B|ABA G2E D3- D3:||
T: Kitty Lyons'
% this is a header comment
I: linebreak $
P: AABB
U: s = !slide!
V: Treble clef=treble name="Right hand"
V: Bass clef=bass name="Left hand"
%% this is a header directive
K: Dmaj
% this is a comment after K: tag
[V: Treble]|:d2A cBA F2E D2F|E2E- E2F G2A B2c|
d2A cBA F2E D2F|EDE F2E D3-D2A:||
|:B2B- BAB f3-f2d|e2e- efe d2c B2A|
B2B- BAB f3-f2d|e2e- efe d3-d2A:|
[V: Bass]|:d2A cBA F2E D2F|E2E- E2F G2A B2c|
d2A cBA F2E D2F|EDE F2E D3-D2A:||
|:B2B- BAB f3-f2d|e2e- efe d2c B2A|
B2B- BAB f3-f2d|e2e- efe d3-d2A:||`
)});

it("SET TO TUNES > Converts raw TSO Set into array of Tunes with Standard fields", () => {
expect(sortFilterAbc(abcRawTsoSet)[1]).toEqual(
[`X: 1
T: SLIDE: Brosna
S: https://thesession.org/tunes/1414#setting1414
R: Slide
M: 12/8
L: 1/8
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:||`,
`X: 2
T: SLIDE: O'Keeffe's
S: https://thesession.org/tunes/53#setting53
R: Slide
M: 12/8
L: 1/8
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:||`]
)});

});

//////////////////////////////////////////////////////////////
//    [1.5]
//    Standard ABC Header / Shallow Edit / Merge Headers
//
//    SORT enforces custom N.S.S.S. ABC fields is OFF
//    SORT skips editing headers if ABC ordered is ON
//    SORT skips merging duplicate header fields is OFF
//////////////////////////////////////////////////////////////

describe("SORT [Standard ABC]", () => {

    beforeAll(() => {
        // Set Custom ABC mode OFF
        localStorage.abcSortEnforcesCustomAbcFields = 0;
        // Skip deep editing of ABC fields
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 1;
        // Skip deep editing of ABC titles
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 1;
        // Allow merging of duplicate ABC fields
        localStorage.abcSortSkipsMergingDuplicateFields = 0;
    });

it("SKIP DEEP EDIT > Skips deep editing of headers in raw TSO Sets, merges duplicate fields", () => {
expect(sortFilterAbc(abcRawTsoSet)[0][0]).toEqual(
`X: 1
T: The Brosna, O'Keeffe's Set
T: The Brosna
S: https://thesession.org/tunes/1414#setting1414
S: https://thesession.org/tunes/53#setting53
R: Slide
M: 12/8
L: 1/8
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:||
T: O'Keeffe's
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:||`
)});

});

//////////////////////////////////////////////////////////////
//    [1.6]
//    Standard ABC Header / Shallow Edit / No Merged Headers
//
//    SORT enforces custom N.S.S.S. ABC fields is OFF
//    SORT skips editing headers if ABC ordered is ON
//    SORT skips merging duplicate header fields is ON
//////////////////////////////////////////////////////////////

describe("SORT [Standard ABC]", () => {

    beforeAll(() => {
        // Set Custom ABC mode OFF
        localStorage.abcSortEnforcesCustomAbcFields = 0;
        // Skip deep editing of ABC fields
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 1;
        // Skip deep editing of ABC titles
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 1;
        // Allow merging of duplicate ABC fields
        localStorage.abcSortSkipsMergingDuplicateFields = 1;
    });

it("SKIP DEEP EDIT & MERGING > Skips deep editing and merging of headers in raw TSO Sets", () => {
expect(sortFilterAbc(abcRawTsoSet)[0][0]).toEqual(
`X: 1
T: The Brosna, O'Keeffe's Set
T: The Brosna
S: https://thesession.org/tunes/1414#setting1414
S: https://thesession.org/tunes/53#setting53
R: Slide
M: 12/8
L: 1/8
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:||
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:||
T: O'Keeffe's
R: Slide
M: 12/8
L: 1/8
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:||
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:||`
)});

});

///////////////////////////////////////////////////////
//    [2] Test ABC Encode functions on valid ABC input
///////////////////////////////////////////////////////

describe("ENCODE OUTPUT", () => {

    beforeAll(() => {
        localStorage.abcEncodeSortsTuneBook = 0;
        // Set Custom ABC mode ON
        localStorage.abcSortEnforcesCustomAbcFields = 1;
        // Skip deep editing of ABC fields
        localStorage.abcSortSkipsDeepEditForOrderedAbc = 1;
        // Skip deep editing of ABC titles
        localStorage.abcSortSkipsTitleEditForOrderedAbc = 1;
        // Allow merging of duplicate ABC fields
        localStorage.abcSortSkipsMergingDuplicateFields = 0;
    });

test("ABC SET > Returns encoded sets JSON", async () => {
    
    const abcSetEncodeOutput = await getEncodedAbc(abcSetWithChords, `set.abc`);

expect(abcSetEncodeOutput[0]).toEqual(
`[
  {
    "name": "HORNPIPES: Callaghan's Set",
    "subtitles": "Frisco; Callaghan's High",
    "leaders": "Anton",
    "type": "Hornpipes",
    "url": "https://michaeleskin.com/abctools/abctools.html?lzw=BoLgBAjAUAKuASB5ASgOQAoEl0FEDK4AwgIYA2pxA5gBbEB2A5AM5h4CmALrOAGIBOASyYBjAPZRCRcDD7EAJgDoA3K3AApAK6kBxMIW0AzA6L5ywAejDoAh3NkDKYRAwDSbNkbYTw7DmAAybPJsfEzgAIJ0HKJ0UABaEVExYHEC5GxgbIpgxHx8ymAAIsRsALZiFmAARvakTMamOX4w1BnsTEwCMVCo4NQcHAAOYebmHK1MbB1ddAomlOalZVUhTOYATABsAJybm+aTHGvbACwnAKzbUMgIJnSDAoNeALLgJ+YnUP7gEOYAHFAAIo-DYAXj+6ygLnAAHFSsQAFZQNgAPjkAB8QAAiGFYgAUAGYAEJyIlgGEo8JgIlo1EGdGEyhUMAGFGOVGkynorGFLE8SlySlgfnhQXhdEiwVknkAdix4XWmTR6KgOPxxNJ5KFhKJwjMdIZBKZjlZ7LRNPFPL5lI51JRMPCKJ46IgYDVMMVVopPDduI9SrkIHRnr9nt53t9OMVBpVmKxOFK6uNSscVsJBkoBjAgvpWMI6o8GWEKIyasJciydoxeaxxaJjphwvtjqJ3PVuv1aLdhTlAD1ixWUfTVbjKCXiGzu1jWXIx7n8xzWaXG3iiaUZQBKLE5jnc-N1htgQk4HiNlsu7tywnCfudrNqyiKuTrINhq8Em96pX30frdEquA9DICgaHoZgwHgBxqChWF4SROc9wLDMWUnK1UXCC1uT9SkaTMfFCi3KUKRwbk8RhLdChRHAKSpeNExpGFcMQwkPBNVDeQ5JjVQTJNmXwrdTTdPFCC3TjlRrFjkNZXR+KxOddzLDUyQpaVeUJDCqRFRD-S9J1I39Li6KxVFM0nMTLXzGiaQyIiqKwnkqJosAAD8iQJat80ktjUw481lW4xNGT4vECOnVDhNEvyPKQxwJ3vEKt3k8TcR1TUVKndT6ybCyoynCN3UVLz-1VXk4rHGySzHYhuR4qoUSJC1yUVU1uTUgkqCzRkDAqtgqpqxMqmjaMjRVNMCQMYhOvcjw3XzJLKFasKMnLGaayS+kgqqHIhzAJLq15C1cLdHi2GatlRtKodyuzSqUWqoy6oaoUKQ8c6xo6o8jW6m7eruxDBsyYaFpK9UJqmit7zmocTMWpdPoh2a5OhodSITLdNqE0LCQ+-ERKTb70yyRbcLpRHH3-IA&format=noten&ssp=10&name=HORNPIPES:_Callaghan's_Set"
  }
]`
);
});

test("ABC TUNE > Returns encoded tunes JSON", async () => {
    
    const abcSetEncodeOutput = await getEncodedAbc(abcTuneWithChords, `set.abc`);

expect(abcSetEncodeOutput[0]).toEqual(
`[
  {
    "name": "WALTZ: Petranu Vals",
    "subtitles": "",
    "leaders": "Oliushka, Anton, Sophie",
    "type": "Waltz",
    "url": "https://michaeleskin.com/abctools/abctools.html?lzw=BoLgBAjAUAKuDqBBAMjAWuACgUwC4CcBDAOwFcwA1QgGwGcoBhcJsAeWoEtTaALAa0JgYHPj0IdCAbjABlcDB5oGPRuBl4wybIQAm2fLXDsuvAQBowiYrgD2xCzJsAHHh2xQMbTt36Dho8UFsHQA6CytbYjA0DmpqbDBgkLBCfHwQ6QAhfGwAcxtqQloU3CEeBPVaWg47KAA5cB5cXCdDAHo23HLabCqa4hCbfFy2gFtsUYAjfVo2gCYANgBOBYW2ntxZpYBWFegAJQQaXAAvKABZcABmNoAWKGRwCDaADigARSe7gF4IW-uANLgADio0IACsoAARMDAxAAHxAACJgUjMnMwJlEJi2gBjNo6eFIqFIxC3TEIpEMFEYgBiwLAAFE5kSSVDyXD4VAUWjsZlMRjCcTSVcwLkwAAzXJE6nYBnYCWJFnCnSi3EUrk89EUnH4oUkskaqk0sC02EYxms4kMMBQjGc7morGYgVgfWkhYyqkwxkM4W0lkQMA84GimFwkDwjEh0VmxlQ+Ga6kMMNM4FW2mM00Yu1ExmjNGi7HA2lE1ElplmqGW7nJ1O+jNZgO25XlosCstInTRqFtWkAYiRuR7SKlmvzSLliUVCqtOjNejd2C9uP5uKzuKFTvbDq1GOdmTxBKtiE9xoYPr9JIDndDpqZCdrVPr6f9TZzyonmVTnKRE9XlgMvSSbPraaaNtmLZ5gWd58q2XYYsOwa9gOo7StyE7BIk8oSnO6rzkuMoFriAD6G46GAuLwd+liwgijpovufJHu6p5eheabIUiN4hrciZAA&format=noten&ssp=10&name=WALTZ:_Petranu_Vals"
  }
]`
);
});

});

///////////////////////////////////////////////////////
//    [3] Test Chord Viewer module functions
///////////////////////////////////////////////////////

describe("CHORD VIEWER", () => {

it("Extracts Chords from ABC Set", () => {
expect(makeAbcChordBook(abcSetWithChords)).toEqual(
`[
  {
    "setTitle": "HORNPIPES: Callaghan's Set",
    "tuneChords": [
      {
        "title": "Frisco",
        "meter": "4/4",
        "chords": "PART 1:\\n|\\tG\\tG\\t|\\tG\\tG\\t|\\tD\\tD\\t|\\tD\\tD7\\t|\\n|\\tG\\tG\\t|\\tG\\tG\\t|\\tD\\tD\\t|1\\tG D\\tG G\\t|\\n|2\\tG D\\tG G\\t||\\n\\nPART 2:\\n|\\tEm\\tD\\t|\\tC\\tG\\t|\\tC\\tC\\t|\\tD7\\tD7\\t|\\n|\\tG\\tD\\t|\\tC\\tG (Bm7)\\t|\\tC\\tC\\t|1\\tD7\\tG\\t|\\n|2\\tD7\\tG\\t||"
      },
      {
        "title": "Callaghan's High",
        "meter": "4/4",
        "chords": "PART 1:\\n|\\tC\\tD\\t|\\tG\\t(D)\\t|\\t(G)\\tEm\\t|\\tC\\tD\\t|\\n|\\tEm (D)\\t(C) (C)\\t|\\tC\\t(D)\\t|\\tG\\tD\\t|\\tC D\\tG G\\t|\\n|\\tEm\\tEm\\t|\\tC\\tC\\t|\\tG\\tG\\t|\\tC\\tD\\t|\\n|\\tEm (D)\\t(C) (C)\\t|\\tC\\t(D)\\t|\\tG\\tD\\t|\\tC D\\tG G\\t||\\n\\nPART 2:\\n|\\tD\\tD\\t|\\tEm\\tEm\\t|\\tD\\tD\\t|\\tEm\\tEm\\t|\\n|\\tD\\tC\\t|\\tD\\tC\\t|\\tC\\tC\\t|\\tD\\tEm\\t|\\n|\\tD\\tD\\t|\\tEm\\tEm\\t|\\tD\\tD\\t|\\tC\\tC\\t|\\n|\\tD\\tC\\t|\\tD\\tC\\t|\\t(Em) (D)\\t(C) (C)\\t|\\tD\\tC\\t||"
      }
    ]
  }
]`
)});

it("Extracts Chords from ABC Tune", () => {
expect(makeAbcChordBook(abcTuneWithChords)).toEqual(
`[
  {
    "title": "WALTZ: Petranu Vals",
    "meter": "3/4",
    "chords": "PART 1:\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tD\\t|1\\tG\\tG\\tG\\t|\\n|2\\tG\\tG\\tG\\t||\\n\\nPART 2:\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tEm\\tEm\\tEm\\t|\\tG\\tG\\tG\\t|\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tG\\tG\\tG\\t|\\tG\\tD/F#\\tD\\t|\\n|\\tEm\\tEm\\tEm\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tC\\t|\\tG\\tG\\tG\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tD\\t|\\tG\\tG\\tG\\t|\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tEm\\tEm\\tEm\\t|\\tEm\\tEm\\tEm\\t|\\n|\\tC\\tC\\tC\\t|\\tD\\tD\\tD\\t|\\tEm\\tEm\\tEm\\t|\\tG\\tG\\tD/F#\\t|\\n|\\tEm\\tEm\\tEm\\t|\\tD\\tD\\tD\\t|\\tCm\\tCm\\tCm\\t|\\tG\\tG\\tG\\t|\\n|\\tG\\tG\\tG\\t|\\tD\\tD\\tD\\t|\\tC\\tC\\tD\\t|\\tG\\tG\\tG\\t||"
  }
]`
)});

});