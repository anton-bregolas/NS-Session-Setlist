import { sortFilterAbc } from "./scripts-abc-encoder";
import { describe, it, expect } from "bun:test";

// const abcX = /^X:[\s]*[\d]*[\s]/;
// const abcSortPrimaryOutputFirstAbc = (abcImport) => sortFilterAbc(abcImport)[0][0].replace(abcX, '')

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

describe("ABC Sort function on valid ABC input", () => {

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

it("returns an array of Tunes converted from Sets with ABC fields added to each", () => {

expect(sortFilterAbc(abcImportRawTsoSet)[1]).toEqual([`X: 1
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

// it("", () => {

// expect(sortFilterAbc()).toMatch(

// )});

});