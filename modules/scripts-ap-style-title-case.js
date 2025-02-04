///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ap-style-title-case by Zeke Sikelianos:
// Convert a value to AP/APA title case 
// GitHub Repo: https://github.com/words/ap-style-title-case/
// Copyright (c) 2016 Zeke Sikelianos https://github.com/zeke
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ap-style-title-case version 2.0.0
var u="a an and at but by for in nor of on or so the to up yet",f=u.split(" ");function h(t,r){let s=r||{};if(!t)return"";let i=s.stopwords||f,p=s.keepSpaces,c=/(\s+|[-‑–—,:;!?()])/;return t.split(c).map((e,n,a)=>{if(n%2)return/\s+/.test(e)?p?e:" ":e;let o=e.toLowerCase();return n!==0&&n!==a.length-1&&i.includes(o)?o:l(e)}).join("")}function l(t){return t.charAt(0).toUpperCase()+t.slice(1)}export{h as apStyleTitleCase};