
// global chrome
chrome.devtools.panels.create(
  'Hooptap Helper',
  'icon-19.png',
  'panel.html',
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
