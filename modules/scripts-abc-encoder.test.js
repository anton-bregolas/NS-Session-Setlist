import { sortFilterAbc } from "./scripts-abc-encoder";
import { describe, it, expect } from "vitest";

const abcImportRawTsoSet = `X: 1
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

const abcImportProcessedNsssSet = `X: 1
T: SLIDES: Brosna Set
T: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; The Session
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
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e|
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`;

const abcImportMultiComposerNsssSet = `X: 1
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

const abcImportMultiZNsssSet = `X: 1
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

const abcImportMultiZAndComposerNsssSet = `X: 1
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

describe("ABC Sort function on valid ABC input", () => {

it("Correctly splits multiple Z: and C: C: S: values between tunes when converting an N.S.S.S. Set into Tunes", () => {

expect(sortFilterAbc(abcImportMultiZAndComposerNsssSet)[1]).toEqual([`X: 1
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

it("Correctly splits multiple Z: values between tunes when converting an N.S.S.S. Set into Tunes", () => {

expect(sortFilterAbc(abcImportMultiZNsssSet)[1]).toEqual([
`X: 1
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

it("Correctly splits multiple C: C: S: values between tunes when converting an N.S.S.S. Set into Tunes", () => {

expect(sortFilterAbc(abcImportMultiComposerNsssSet)[1]).toEqual([
`X: 1
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

it("returns an array of Tunes converted from an N.S.S.S. Set with custom ABC fields added to each tune", () => {

expect(sortFilterAbc(abcImportProcessedNsssSet)[1]).toEqual([
`X: 1
T: SLIDE: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; The Session
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
Z: Anton Zille ed.; The Session
N: https://thesession.org/members/26966/sets/92423
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2G GFG|
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e|
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`]
)});

it("does not modify correctly ordered custom ABC fields of an N.S.S.S Set", () => {

expect(sortFilterAbc(abcImportProcessedNsssSet)[0][0]).toMatch(
`X: 1
T: SLIDES: Brosna Set
T: Brosna No. 1
C: C: Trad.; S: Denis Murphy & Julia Clifford
C: Set Leaders: Tania, Anton, Sophie
Z: Anton Zille ed.; The Session
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
A2e e2d BAB d3|1 BAB d2e B2A A2G:|2 BAB d2e B2A A2e|
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G2A|1 BAB d2e B2A ABd:|2 BAB d2e B2A A2G||`
)});

it("returns an array of Tunes converted from Sets with ABC fields added to each", () => {

expect(sortFilterAbc(abcImportRawTsoSet)[1]).toEqual([
`X: 1
T: SLIDE: Brosna
C: C: Trad.; S: Various
C: Set Leaders: 
Z: [Unedited]; The Session
N: 
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:|
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:|`,
`X: 2
T: SLIDE: O'Keeffe's
C: C: Trad.; S: Various
C: Set Leaders: 
Z: [Unedited]; The Session
N: 
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:|
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:|`]
)});

it("adds ABC fields with default values to raw TSO Sets import", () => {

expect(sortFilterAbc(abcImportRawTsoSet)[0][0]).toMatch(
`X: 1
T: SLIDES: Brosna, O'Keeffe's Set
C: C: Trad.; S: Various
C: Set Leaders: 
Z: [Unedited]; The Session
N: 
R: Slide
M: 12/8
L: 1/8
Q: 3/8=130
K: Gmaj
|:D2G G2A BAB d2B|A2D FED A2D FED|
G2G G2A BAB d2B|A2D FED G3 G3:|
|:g2f efg f2e d2B|c2B A2B c2d e2f|
g2f efg f2e d2B|c2A FED G3 G3:|
T: O'Keeffe's
R: Slide
M: 12/8
L: 1/8
K: Ador
|:A2e e2d BAB d2B|A2e e2d B2A GAB|
A2e e2d BAB d3|BAB d2e B2A A3:|
|:e2a a2b a2g e2d|efg a2b a2g e2f|
g3 gfe dBA G3|BAB d2e B2A A3:|`
)});
});