///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ap-style-title-case v.2.0.0 by Zeke Sikelianos
// Convert a value to AP/APA title case
// GitHub Repo: https://github.com/words/ap-style-title-case/
// Copyright (c) 2016 Zeke Sikelianos https://github.com/zeke
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ap-style-title-case version 2.0.0 [customized for N.S.S.S. Tunebook]
// Original list of conjunctions and prepositions: "a an and at but by for in nor of on or so the to up yet"
//
// NB: AP Stylebook prescribes capitalizing all prepositions from 4 letters up in contrast to stylebooks used in academia (5+ or lowercase all)
// NB: AP Stylebook prescribes capitalizing "to" before infinitives but in most tune titles it is followed by a noun 
// NB: AP Stylebook prescribes capitalizing "as", "but", "to" when using them *as adverbs* (uppercase in all stylebooks)
// NB: AP Stylebook prescribes lowercasing "if" in contrast to MLA where all subordinating conjunctions are capitalized
//
// ADDED likely conjunctions "as" and "if" (rules vary) and prepositions "off", "out", "via" (lowercase in all stylebooks)
// ADDED dialectal SCOTTISH prepositions (an', o', o'ot, oot, ti' – to be used with apostrophe to avoid incorrect lowercasing of words)
// ADDED a select list of IRISH prepositions not likely to cause title conflicts (ag, ar, de, le, ins, na, sa, sna, um)
// ADDED a select list of FRENCH articles, conjunctions and prepositions to suit hybrid titles (à des du en et la les un une)
// ADDED a few IRISH / SCOTTISH GAELIC / FRENCH contraction which should never be capitalized ('l, 'm, 'n, 's)
// NB: IRISH conjunctions likely to cause incorrect English or proper name capitalization are to be handled separately (go, is, ní etc.)
// NB: IRISH prepositions likely to cause incorrect English or proper name capitalization are to be handled separately (do, i, ó etc.)
// NB: IRISH prepositional pronouns are currently excluded from the list (capitalization rules unclear)
// NB: FRENCH capitalization rules must be handled separately

var u="a an and as at but by for if in nor of off on or out so the to via up yet an' o' oot o'ot ti' ag ar de le ins na sa sna um à des du en et la les un une 'l 'm 'n 's",f=u.split(" ");function h(t,r){let s=r||{};if(!t)return"";let i=s.stopwords||f,p=s.keepSpaces,c=/(\s+|[-‑–—,:;!?()])/;return t.split(c).map((e,n,a)=>{if(n%2)return/\s+/.test(e)?p?e:" ":e;let o=e.toLowerCase();return n!==0&&n!==a.length-1&&i.includes(o)?o:l(e)}).join("")}function l(t){return t.charAt(0).toUpperCase()+t.slice(1)}export{h as apStyleTitleCase};