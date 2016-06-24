
// Chrome Extension Transfer Protocol

// Devtools panel side





var port;


function sendToContent( params_obj )
{
    port.postMessage( params_obj )
}


const contentRequirements = { // contentResponser available orders

    "localStorage": {
        "SEND"      : "ContentLocalStorage_SEND",
        "OVERWRITE" : "ContentLocalStorage_OVERWRITE"
    },

    "console": {
        "LOG"       : "ContentConsole_LOG"
    }

};


var panelResponser = {

    "PanelItemsList_WRITE": function( what )
    {
        LIST.write( what );
    },

    "PanelLocalStorage_SEND": function ()
    {
        sendToContent(
            {
                'request': contentRequirements.localStorage.OVERWRITE,
                'data': JSON.stringify(pending_msg._data)
            }
        );
    },

    "PanelLocalStorage_OVERWRITE": function ( data )
    {
        localStorage.setItem( 'htHelper_pending', data );
        CONSOLE.log( 'PanelLocalStorage_OVERWRITE with: ' + data );
        display_refresh();
    },

    "PanelConsole_LOG": function( what )
    {
        CONSOLE.log( what );
    }

};


function listenFromContent( message, sender )
{
    CONSOLE.log( 'message recieved from content: ' + ( ('string' == typeof message)? message : JSON.stringify(message) ) );

    if ( 'object' == typeof message )
    {

        if ( message.request )
        {
            if ( 'function' == typeof panelResponser[ message.request ] ) {
                //Send needed information to background page
                if ( message.data )
                    panelResponser[ message.request ]( message.data );
                else
                    panelResponser[ message.request ]();
            }
            /*else {
                CONSOLE.log('content request not defined: "' + message.request + '"');
            }*/
        }

        if ( message.callback )
        {
            switch( typeof message.callback )
            {
                case 'string':
                    try {
                        if ( message.callback.indexOf('sendToPanel') == 0 )
                            content_script_context_eval( message.callback );
                        else
                            inspected_window_context_eval(message.callback);
                    } catch(e) {
                        CONSOLE.log( 'eval callback string catch: ' + e.message )
                    }
                    break;

                case 'function':
                    message.callback();
                    break;
            }
        }
    }
}


function CETP_init()
{
    var success = false;

    try {

        //Created a port with background page for continous message communication
        port = chrome.extension.connect({'name': "Devtools Port"});

        //Hanlde response when recieved from background page
        port.onMessage.addListener(listenFromContent);

        success = true;

    }catch (e){

        console.log( 'CETP panel side init error: ' + e.message );

    }

    return success;

}


function inspected_window_context_eval( what )
{
    chrome.devtools.inspectedWindow.eval( what );
}


function content_script_context_eval( what )
{
    chrome.devtools.inspectedWindow.eval( what, { useContentScriptContext: true } );
}
