////////////////////////////////////////////////////////////////////////
// Novi Sad Session App Preload Scripts
// https://github.com/anton-bregolas/
// MIT License
// (c) Anton Zille 2024-2025
////////////////////////////////////////////////////////////////////////

// Calculate current visual viewport size of the device

const viewPortW = window.visualViewport? Math.floor(window.visualViewport.width) : window.innerWidth;
const viewPortH = window.visualViewport? Math.floor(window.visualViewport.height) : window.innerHeight;

// Get HTML font-size value based on current viewport size

export function adjustHtmlFontSize(viewPortW, viewPortH) {

  if (document.body.dataset.mode === "desktop") return "100%";

  let newFontSize = 100;

  // Calculate font size for tablets and mobile devices in portrait mode

  if ((viewPortH > 768 && viewPortW < 1080) || (viewPortW <= 480 && viewPortW >= 360)) {

    const maxViewPort = 1080;
    const minViewPort = 360;
    const maxFontSize = 100;
    const minFontSize = 70;

    newFontSize = maxFontSize - (maxViewPort - viewPortW) * (maxFontSize - minFontSize) / (maxViewPort - minViewPort);
  }

  // Calculate font size for medium-sized mobile devices in landscape mode  

  if (viewPortH <= 768 && viewPortW > 480) {

    const maxViewPort = 768;
    const minViewPort = 420;
    const maxFontSize = 85;
    const minFontSize = 75;

    newFontSize = maxFontSize - (maxViewPort - viewPortH) * (maxFontSize - minFontSize) / (maxViewPort - minViewPort);
  }

  // Calculate font size for small screen devices in portrait mode

  if (viewPortW < 360) {

    const maxFontSize = 60;

    newFontSize = maxFontSize - (360 - viewPortW) * 0.125;
  }

  // Return font-size value (%)

  const newFontSizePercent = `${newFontSize.toFixed(2)}%`;

  return newFontSizePercent;
}

// Initialize app mode based on viewport width

function initAppMode() {

  if (viewPortW < 880 || viewPortH <= 768) {

    document.body.dataset.mode = "mobile";

  } else {

    document.body.dataset.mode = "desktop";
  }
}

// Set initial app mode

initAppMode();

// Set HTML font-size value (%) for small and medium-sized screens

if (viewPortW < 880 || viewPortH <= 768) {

  document.documentElement.style.fontSize = adjustHtmlFontSize(viewPortW, viewPortH);
}