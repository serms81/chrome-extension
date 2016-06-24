
// Chrome Extension Transfer Protocol

// Content Script side





var port;

// When devtools panel initialized,
// this can send messages to devtools panel.
var sendToPanel = function ( message, sender )
{
    port.postMessage( message );
};

var sendToContent = function ( message )
{
    //Request a tab for sending needed information
    chrome.tabs.query(
        {
            "status"        : "complete",
            "currentWindow" : true//,
            //"url": "http://www.google.co.in/"
        },
        function ( tabs )
        {
            for ( var tab in tabs ) {
                //Sending Message to content scripts
                chrome.tabs.sendMessage( tabs[tab].id, message );
            }
        }
    );
};


//Handle request from devtools panel
chrome.extension.onConnect.addListener(
    function ( _port )
    {
        port = _port;

        port.onMessage.addListener( sendToContent );

        //Posting back to Devtools
        chrome.extension.onMessage.addListener( sendToPanel );
    }
);
