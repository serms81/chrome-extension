// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function changeColor(e) {
  chrome.tabs.executeScript(
    null,
    {
      code: "document.body.style.backgroundColor='" + e.target.id + "'"
    }
  );
  window.close();
}

function goToOptions(e) {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
}

document.addEventListener('DOMContentLoaded', function () {

  var divs = document.querySelectorAll('div.color-selector');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', changeColor);
  }

  var go_to_options = document.querySelector('#go-to-options');
  go_to_options.addEventListener('click', goToOptions);

});
