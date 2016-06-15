
//Handle request from devtools
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (message) {
        //Request a tab for sending needed information
        chrome.tabs.query({
            "status": "complete",
            "currentWindow": true//,
            //"url": "http://www.google.co.in/"
        }, function (tabs) {

            for (tab in tabs) {
                //Sending Message to content scripts
                chrome.tabs.sendMessage(tabs[tab].id, message);
            }
        });

    });
    //Posting back to Devtools
    chrome.extension.onMessage.addListener(function (message, sender) {
        port.postMessage(message);
    });
});






/*
// Will try to insert as script every object set in array
function executeScripts(tabId, injectDetailsArray)
{
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback();   // execute outermost function
}



// Working when no popup is defined at manifest.json
//chrome.browserAction.onClicked.addListener(function (tab) {
chrome.pageAction.onClicked.addListener(
  function (tab)
  {
    executeScripts(null, [
        { code: "alert('executeScript0.js');" },
        { file: "executeScript.js" },
        { file: "executeScript2.js" }
    ]);
  }
);
*/
