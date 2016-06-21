
// global chrome
chrome.devtools.panels.create(
  'SDK Helper',
  'icons/icon-19.png',
  'panel/panel.html',
  function(panel){

    panel.onShown.addListener(
      function tmp(panel_window){
        panel.onShown.removeListener(tmp);
      }
    );

    /*panel.onHidden.addListener(
      function(){
      }
    );*/
  }
);
