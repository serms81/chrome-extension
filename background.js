
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



/****************************************************************************************************/
/****************************************************************************************************/

/*
// as single message
sendToContent(
    "Check listening tab URL"
);

// as question (will return an answer)
sendToContent(
    {
        'question' : 'Are you ok?'
    }
);

// callback set
sendToContent(
    {
        'question' : 'What is the time there?',
        'callback': 'if (confirm("callback try?")) sendToPanel({ request: "PanelConsole_LOG", data: "callback of callback" })'
    }
);
*/
/*
// Creates extension contextMenu items
( function createContextMenus()
{
    // contextMenu items: parameters Enum helpers
    var ENUM = {};
    ENUM.ContextType = {
        "all":"all",
        "page":"page",
        "frame":"frame",
        "selection":"selection",
        "link":"link",
        "editable":"editable",
        "image":"image",
        "video":"video",
        "audio":"audio",
        "launcher":"launcher",
        "browser_action":"browser_action",
        "page_action":"page_action"
    };
    ENUM.ItemType = {
        "normal":"normal",
        "checkbox":"checkbox",
        "radio":"radio",
        "separator":"separator"
    };

    // contextMenu items: parameter collection
    var contextMenuItems = {
        0: {
            //parentId integer OR string
            'title': 'Alert 0',
            'enabled': true,
            'type': ENUM.ItemType.normal,
            //checked boolean
            'contexts': [
                ENUM.ContextType.all
            ],
            'onclick': function()
            {
                alert( 0 );
            }
        },
        1: {
            //parentId integer OR string
            'title': 'inspected_window_context_eval',
            'enabled': true,
            'type': ENUM.ItemType.normal,
            //checked boolean
            'contexts': [
                ENUM.ContextType.all
            ],
            'onclick': function()
            {
                sendToPanel(
                    {
                        request : 'PanelConsole_LOG',
                        data    : 'PanelConsole_LOG from contextMenu 1',
                        callback: 'alert("Alert 2 onclick");'
                        // because of callback is a string not calling a sendToPanel content script functionality
                        // this callback will run at inspected_window_context,
                        // so content script will be unavailable
                    }
                );
            }
        },
        2: {
            //parentId integer OR string
            'title': 'content_script_context_eval',
            'enabled': true,
            'type': ENUM.ItemType.normal,
            //checked boolean
            'contexts': [
                ENUM.ContextType.all
            ],
            'onclick': function()
            {
                sendToPanel(
                    {
                        request : 'PanelConsole_LOG',
                        data    : 'PanelConsole_LOG from contextMenu 2',
                        callback: "sendToPanel("+ JSON.stringify({ request: 'PanelConsole_LOG', data: 'PanelConsole_LOG from contextMenu 3' }) + ");"
                        // because of callback is a string calling a sendToPanel content script functionality
                        // this callback will run at content_script_context,
                        // so content script will be available
                    }
                );
            }
        }
    };

    // contextMenu items: listeners will be extracted to its own collection
    var contextMenuListeners = {};
    for(var i in contextMenuItems)
    {
        contextMenuItems[i].id = chrome.i18n.getMessage('@@extension_id') + i;
        contextMenuListeners[ contextMenuItems[i].id ] = contextMenuItems[i].onclick;
        delete contextMenuItems[i].onclick;

        chrome.contextMenus.create( contextMenuItems[i] );
    }

    // contextMenu items: add click listener
    chrome.contextMenus.onClicked.addListener(
        function( info, tab )
        {
            return ( 'function' == typeof contextMenuListeners[ info.menuItemId ] )?
                contextMenuListeners[ info.menuItemId ]()
                : false;
        }
    );

})();
*/