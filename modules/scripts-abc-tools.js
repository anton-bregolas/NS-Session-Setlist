import { checkTuneBookSetting, tuneSets, tuneList, filterOptions, resetTuneBookMenus, initCustomDropDownMenus } from "./scripts-ns-sessions.js"; // Import N.S.S.S. custom elements and tune JSONs from NS Sessions DB 

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// lz-string by Pieroxy (LZ-based compression algorithm)
// Copyright (c) 2013 Pieroxy pieroxy@pieroxy.net https://github.com/pieroxy/lz-string
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Updated to lz-string.min version 1.5.0
// export var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);
export var LZString=function(){var r=String.fromCharCode,o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",e={};function t(r,o){if(!e[r]){e[r]={};for(var n=0;n<r.length;n++)e[r][r.charAt(n)]=n}return e[r][o]}var i={compressToBase64:function(r){if(null==r)return"";var n=i._compress(r,6,function(r){return o.charAt(r)});switch(n.length%4){default:case 0:return n;case 1:return n+"===";case 2:return n+"==";case 3:return n+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(n){return t(o,r.charAt(n))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(r){return null==r?"":""==r?null:i._decompress(r.length,16384,function(o){return r.charCodeAt(o)-32})},compressToUint8Array:function(r){for(var o=i.compress(r),n=new Uint8Array(2*o.length),e=0,t=o.length;e<t;e++){var s=o.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null==o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;e<t;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(r){return null==r?"":i._compress(r,6,function(r){return n.charAt(r)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(o){return t(n,r.charAt(o))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(r,o,n){if(null==r)return"";var e,t,i,s={},u={},a="",p="",c="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<r.length;i+=1)if(a=r.charAt(i),Object.prototype.hasOwnProperty.call(s,a)||(s[a]=f++,u[a]=!0),p=c+a,Object.prototype.hasOwnProperty.call(s,p))c=p;else{if(Object.prototype.hasOwnProperty.call(u,c)){if(c.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(t=c.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;e<h;e++)m=m<<1|t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=c.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[c]}else for(t=s[c],e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;0==--l&&(l=Math.pow(2,h),h++),s[p]=f++,c=String(a)}if(""!==c){if(Object.prototype.hasOwnProperty.call(u,c)){if(c.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(t=c.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;e<h;e++)m=m<<1|t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=c.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[c]}else for(t=s[c],e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;0==--l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==o-1){d.push(n(m));break}v++}return d.join("")},decompress:function(r){return null==r?"":""==r?null:i._decompress(r.length,32768,function(o){return r.charCodeAt(o)})},_decompress:function(o,n,e){var t,i,s,u,a,p,c,l=[],f=4,h=4,d=3,m="",v=[],g={val:e(0),position:n,index:1};for(t=0;t<3;t+=1)l[t]=t;for(s=0,a=Math.pow(2,2),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;switch(s){case 0:for(s=0,a=Math.pow(2,8),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;c=r(s);break;case 1:for(s=0,a=Math.pow(2,16),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;c=r(s);break;case 2:return""}for(l[3]=c,i=c,v.push(c);;){if(g.index>o)return"";for(s=0,a=Math.pow(2,d),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;switch(c=s){case 0:for(s=0,a=Math.pow(2,8),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;l[h++]=r(s),c=h-1,f--;break;case 1:for(s=0,a=Math.pow(2,16),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;l[h++]=r(s),c=h-1,f--;break;case 2:return v.join("")}if(0==f&&(f=Math.pow(2,d),d++),l[c])m=l[c];else{if(c!==h)return null;m=i+i.charAt(0)}v.push(m),l[h++]=i+m.charAt(0),i=m,0==--f&&(f=Math.pow(2,d),d++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module?module.exports=LZString:"undefined"!=typeof angular&&null!=angular&&angular.module("LZString",[]).factory("LZString",function(){return LZString});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website Scripts (Modified)
// Created with ABC Tools Player Website Generator: https://github.com/seisiuneer/abctools/blob/main/website_generator.js
// Script Generation Date in ABC Transcription Tools: 2024-12-04
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website: Global Variables
////////////////////////////////////////////////////////////

let tunes = [];

// Set this to false to disable state persistence
var gAllowStatePersistence = false;

// Set this to false to disable changing instruments when switching tablature
var gAllowInstrumentChanges = true;

var tabStyle = "noten";

var isBanjo = false;
var isFlute = false;
var isDulcimer = false;

var isUPipes = false;
var isMelodeon = false;
var isSolfege = false;

var lastURL = "";

/////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website: OG Page Elements
////////////////////////////////////////////////////////////

export const tuneFrame = document.querySelector('#tuneFrame');
export const tuneSelector = document.querySelector('#tuneSelector');
// export const displayOptions = document.getElementById('displayOptions');

/////////////////////////////////////////////////////////////////
// Michael Eskin's Export Tunebook Website: OG Scripts (Tweaked)
////////////////////////////////////////////////////////////////

// Initialize ABC Transcription Tools, add event listeners to Tunebook elements

export function initAbcTools() {

    // Select Session DB JSON to open in ABC Tools

    tunes = checkTuneBookSetting() === 0? tuneSets : tuneList;

    // Populate the selector with options from JSON

    document.getElementById('fullscreenbutton').addEventListener('click', function() {
        if (lastURL != ""){
          window.open(lastURL, '_blank');
        }
    });

    if (tunes.length > 1){

        // Reset dropdown menu settings and open first tune in the collection
        resetTuneBookMenus();

        // Populate Tunebook menu with Sets or Tunes
        populateTuneSelector();

        // Initialize custom N.S.S.S. elements
        populateFilterOptions(sortFilterOptions());
        initCustomDropDownMenus();

        // Update iframe src when an option is selected
        tuneSelector.addEventListener('change', () => {

            // Load a new Set or Tune into the Tuneframe
            loadTuneBookItem(tunes);

            // Save last tune
            if (gAllowStatePersistence){

                if (window.localStorage){

                    localStorage.lastTuneName_GKUCFRH = tuneSelector.options[tuneSelector.selectedIndex].text;

                    var theLastTuneTab = document.getElementById('displayOptions').value;
                    localStorage.lastTab_GKUCFRH = theLastTuneTab;

                }

            }

        });

    } else {

        tuneSelector.style.display="none";

        setTimeout(function(){

            // Load the first Set or Tune into the Tuneframe

            loadTuneBookItem(tunes, 0);

        },250);
    }

    const displayOptions = document.getElementById('displayOptions');

    displayOptions.addEventListener('change', () => {

        // var origTabStyle = tabStyle;

        if (displayOptions.value == "-1"){
            return;
        }

        isBanjo = false;
        isFlute = false;
        isDulcimer = false;
        isUPipes = false;
        isMelodeon = false;
        isSolfege = false;

        switch (displayOptions.value){
            case "0": // Standard notation + piano voice
                  tabStyle = "noten";
                  break;
            case "1": // Note names + concertina voice
                  tabStyle = "notenames";
                  break;
            case "12": // Note names + solfa voice
                  isSolfege = true;
                  tabStyle = "notenames";
                  break;
            case "2": // Whistle voice + tabs
                tabStyle = "whistle";
                break;
            case "3": // Irish flute voice + tabs
                isFlute = true;
                tabStyle = "whistle";
                break;
            case "4": // GDAD Bouzouki voice + tabs
                tabStyle = "gdad";
                break;
            case "5": // EADGBE Guitar voice + tabs
                tabStyle = "guitare";
                break;
            case "6": // DADGAD Guitar voice + tabs
                tabStyle = "guitard";
                break;
            case "7": // Mandolin voice + tabs
                tabStyle = "mandolin";
                break;
            case "8": // Tenor banjo voice + tabs
                isBanjo = true;
                tabStyle = "mandolin";
                break;
            case "9": // Hammered dulcimer voice only
                  isDulcimer = true;

            case "10": // Uilleann pipes voice only
                  isUPipes = true;

            case "11": // Melodeon voice only
                  isMelodeon = true;

            default:
                  tabStyle = "noten";
                  break;
        }

        var theURL;
        
        if (tunes.length > 1 && tuneSelector.value !== ""){

            theURL = tuneSelector.value;
        }
        else {
            theURL = tunes[0].URL;
        }

        if (theURL == "")return;

        theURL = theURL.replace(/&format=([^&]+)/g,"&format="+tabStyle);

        if (gAllowInstrumentChanges){
            
            theURL = injectInstrument(theURL);
        }

        tuneFrame.src = theURL;
        lastURL = theURL;
          // Save last tune
          if (gAllowStatePersistence){

              if (window.localStorage){

                  if (tunes.length > 1){
                      localStorage.lastTuneName_GKUCFRH = tuneSelector.options[tuneSelector.selectedIndex].text;
                  }

                  var theLastTuneTab = document.getElementById('displayOptions').value;
                  localStorage.lastTab_GKUCFRH = theLastTuneTab;
              }

          }

    });

    function setSelectedTuneByName(optionText) {
        var gotMatch = false;
        for (let i = 0; i < tuneSelector.options.length; i++) {
            if (tuneSelector.options[i].text === optionText) {
                tuneSelector.selectedIndex = i;
                gotMatch = true;
                break;
            }
        }
        if (gotMatch){
            tuneSelector.dispatchEvent(new Event('change'));
        }
    }

    // Resize the iframe on window resize
    window.addEventListener('resize', resizeIframe);

    // Initial call to ensure it fits when the page loads
    resizeIframe();

    // Restore state
    if (gAllowStatePersistence){

      if (window.localStorage){

          setTimeout(function(){

            var theLastTuneTab = localStorage.lastTab_GKUCFRH;
            if (theLastTuneTab && (theLastTuneTab != "")){
                var elem = document.getElementById('displayOptions');
                elem.value = theLastTuneTab;
                elem.dispatchEvent(new Event('change'));
            }

            if (tunes.length > 1){

                var theLastTuneName = localStorage.lastTuneName_GKUCFRH;
                if (theLastTuneName && (theLastTuneName != "")){
                    setSelectedTuneByName(theLastTuneName);
                }

            }

          },250);
      }
    }
}

// Load a Set or a Tune into the Tuneframe

export function loadTuneBookItem(currentTuneBook, itemNumber) {

    var theURL = itemNumber >= 0? currentTuneBook[itemNumber].URL : tuneSelector.value;

    if (theURL == "") return;

    theURL = theURL.replace(/&format=([^&]+)/g,"&format="+tabStyle);

    if (gAllowInstrumentChanges){
      theURL = injectInstrument(theURL);
    }

    tuneFrame.src = theURL;
    lastURL = theURL;
}

// Decompress the tune LZW, replace the instrument and volumes

function extractLZWParameter(url) {
    // Use a regular expression to find the part starting with &lzw= followed by any characters until the next &
    const match = url.match(/lzw=([^&]*)/);

    // If a match is found, return the part after &lzw=
    return match ? match[0] : null;
}

/////////////////////////////////////////////////////////////////
// Customized, New and Exported Tunebook Functions for N.S.S.S.
////////////////////////////////////////////////////////////////

// Inject custom MIDI settings into ABC by modifying a default template string

function injectInstrument(theURL){

    let originalAbcInLZW = extractLZWParameter(theURL);

    originalAbcInLZW = originalAbcInLZW.replace("lzw=","");

    let abcInLZW = LZString.decompressFromEncodedURIComponent(originalAbcInLZW);

    let injectMidiString = `%abcjs_soundfont fluid\n%%MIDI program 0\n%%MIDI bassprog 0\n%%MIDI chordprog 0\n%%MIDI bassvol 64\n%%MIDI chordvol 64`;

    // Inject a template MIDI string into the ABC if no MIDI instructions found

    if (!abcInLZW.includes("%abcjs_soundfont")) {

        abcInLZW = abcInLZW.replace(`K:`, `${injectMidiString}\nK:`);

    } else {

        abcInLZW.replace(/(%abcjs_soundfont)[\s\S]*?(K:)/gm, `${injectMidiString}\nK:`)
    }
    
    // Update the decompressed ABC with the new MIDI settings

    switch (tabStyle){
        case "mandolin":
            if (isBanjo){
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 105");
            }
            else{
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 141");
            }
            break;
        case "gdad":
            abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 140");
            break;
        case "guitare":
        case "guitard":
            abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 24\n%%MIDI transpose -12");
            break;
        case "whistle":
            if (isFlute){
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 73");
            }
            else{
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 78");
            }
            abcInLZW = abcInLZW.replace("%%MIDI bassvol 64","%%MIDI bassvol 64");
            abcInLZW = abcInLZW.replace("%%MIDI chordvol 64","%%MIDI chordvol 64");
            break;
        case "notenames":
            if (isSolfege){
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 136");
                break;
            } 
            abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 133");
            break;
        case "noten":
            if (isDulcimer){
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 15");
            }
            else if (isUPipes) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 129");
            }
            else if (isMelodeon) {
                abcInLZW = abcInLZW.replace("%%MIDI program 0","%%MIDI program 135");     
            }
            else{
                return theURL;
            }
            break;
    }

    var newLZWparam = "lzw="+LZString.compressToEncodedURIComponent(abcInLZW);

    originalAbcInLZW = "lzw="+originalAbcInLZW;

    theURL = theURL.replace(originalAbcInLZW,newLZWparam);

    return theURL;
}

// Populate tune dropdown menu with options

export function populateTuneSelector() {

    tunes = checkTuneBookSetting() === 0? tuneSets : tuneList;

    tunes.forEach(tune => {
        const option = document.createElement('option');
        option.value = tune.URL;
        option.textContent = tune.Name;
        option.dataset.tunetype = tune.Type;
        option.dataset.leaders = tune.Leaders;
        tuneSelector.appendChild(option);
    });
}

// Populate filter dropdown menu with options

export function populateFilterOptions(filters) {

    filters.forEach(filterList => {

        if (filterList.id) {

            const filterHeader = document.createElement('option');

            if (filterList.id === "tuneTypes") {
                
                filterHeader.value = 1;
                filterHeader.textContent = "👉 Tune Type 👈";
                filterOptions.appendChild(filterHeader);
            }

            if (filterList.id === "setLeaders") {
                
                filterHeader.value = 2;
                filterHeader.textContent = "👉 Set Leader 👈";
                filterOptions.appendChild(filterHeader);
            }
        }

        filterList.list?.forEach(filter => {

            const filterOption = document.createElement('option');
            filterOption.value = filter;
            filterOption.textContent = `🎻 ${filter}`;
            filterOptions.appendChild(filterOption);
        });
    });
}

// Gather and sort custom metadata found in tunes array

export function sortFilterOptions() {

    const allTuneTypes = {"id": "tuneTypes", "list": []};
    const allTuneLeaders = {"id": "setLeaders", "list": []};

    tunes.forEach(tune => {

        const tuneType = tune.Type;
        const tuneLeaders = tune.Leaders;

        if (tuneType && !allTuneTypes.list.includes(tuneType)) {

            allTuneTypes.list.push(tuneType);
        }

        if (tuneLeaders) {

            tuneLeaders.split(', ').forEach(tuneLeader => {

                if(!allTuneLeaders.list.includes(tuneLeader)) {

                    allTuneLeaders.list.push(tuneLeader);
                }
            });
        }
    });

    allTuneTypes.list.sort();
    allTuneLeaders.list.sort();

    return [allTuneTypes, allTuneLeaders];
}

// Calculate sizes of Tunebook section elements

function getElementsTotalHeight() {

    const ids = ['title', 'subtitle', 'displayOptions', 'footer'];

    let totalHeight = 0;

    ids.forEach(id => {

        const element = document.getElementById(id);

        if (element && (element.textContent.trim() !== "")) {

            const elementHeight = element.offsetHeight;
            const computedStyle = window.getComputedStyle(element);

            // Include margins
            const marginTop = parseFloat(computedStyle.marginTop);
            const marginBottom = parseFloat(computedStyle.marginBottom);
            totalHeight += elementHeight + marginTop + marginBottom + 1;
        }
    });
    return totalHeight+5;
}

// Resize the embedded ABC Tools iframe

export function resizeIframe() {

    tuneFrame.style.width = (window.innerWidth-3) + 'px';
    var otherElementsHeight = getElementsTotalHeight();
    tuneFrame.style.height = (window.innerHeight-otherElementsHeight) + 'px';
}