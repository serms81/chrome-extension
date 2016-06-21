
var panelConsole    = document.getElementById( 'console' );
var panelList       = document.getElementById( 'stored-xpath-list' );
var panelDemosWrap  = document.getElementById( 'demo-launchers' );
var button_flush    = document.getElementById( 'xpaths-flush' );
var button_save     = document.getElementById( 'xpaths-save' );
var button_enable_catcher  = document.getElementById( 'catcher-toggle' );

var port;

var pending_msg = {

  'store': function(data)
  {
  	data = data || JSON.stringify(pending_msg._data);
    localStorage.setItem('htHelper_pending',data);
  },

  'restore': function()
  {
    pending_msg._data = JSON.parse(localStorage.getItem('htHelper_pending')) || [];
  },

  'flush': function()
  {
    pending_msg._data = [];
    pending_msg.store();
  },

  'refresh': function()
  {
	pending_msg.restore();
	pending_msg._data.forEach(
        function(msg,i)
        {
            LIST.write( msg );
        }
    );
  },

  _data: []

};


var CONSOLE = {

    log: function(what)
    {
        what = ( 'object' == typeof what )? JSON.stringify( what ) : what;
        panelConsole.innerHTML += '<p class="console-line">&gt; '+what+'</p>';

        panelConsole.scrollTop = panelConsole.scrollHeight;
    },

    clear: function()
    {
        while (panelConsole.firstChild) {
            panelConsole.removeChild( panelConsole.firstChild );
        }
        panelConsole.innerHTML = '';
    }

};


var LIST = {

    write: function(what)
    {
        // TODO remove
        what = ( 'object' == typeof what )? JSON.stringify( what ) : what;

        if ( 'string' == typeof what )
        {
            panelList.innerHTML += '<li>'+what+'</li>';
        }
        else if ( 'object' == typeof what )
        {
            // TODO develop
            JSON.stringify( what );
        }

        document.getElementById( 'dt-panel' ).scrollTop = document.getElementById( 'dt-panel' ).scrollHeight;
    },

    flush: function()
    {
        while (panelList.firstChild) {
            panelList.removeChild( panelList.firstChild );
        }
        panelList.innerHTML = '';
    }

};


function display_flush()
{
    LIST.flush();
    pending_msg.flush();
    sendToContent(
        {
            'request'   : contentRequirements.localStorage.OVERWRITE,
            'data'      : localStorage.getItem( 'htHelper_pending' )
        }
    )
}


function display_refresh()
{
    LIST.flush();
    pending_msg.refresh();
}

function catcher_enable()
{
    button_enable_catcher.classList.remove( 'catcher-disabled' );
    button_enable_catcher.textContent = 'Press to disable catcher';
    sendToContent( { 'callback': 'alert("catcher-enabled"); content_document_add_listener();' } );
}

function catcher_disable()
{
    button_enable_catcher.classList.add( 'catcher-disabled' );
    button_enable_catcher.textContent = 'Press to enable catcher';
    sendToContent( { 'callback': 'alert("catcher-disabled"); content_document_remove_listener();' } );
}



/****************************************************************************************************/
/****************************************************************************************************/



function panel_document_add_listeners()
{
    button_flush.addEventListener(
        'click',
        function(e)
        {
            display_flush();
        }
    );
    button_save.addEventListener(
        'click',
        function(e)
        {
            sendToContent(
                {
                    'request' : contentRequirements.localStorage.OVERWRITE,
                    'data'    : localStorage.getItem('htHelper_pending')
                }
            )
        }
    );
    button_enable_catcher.addEventListener(
        'click',
        function(e)
        {
            if ( button_enable_catcher.classList.contains( 'catcher-disabled' ) )
            {
                catcher_enable();
            }
            else
            {
                catcher_disable();
            }
        }
    );
}

function panel_document_add_demo_launchers()
{
    var launchers = [
        {
            description: 'sendToContent an string message',
            onclick: function()
            {
                // as single message
                sendToContent(
                    "Check listening tab URL"
                )
            }
        },
        {
            description: 'sendToContent a question to answer',
            onclick: function()
            {
                // as question (will return an answer)
                sendToContent(
                    {
                        'question': 'Are you ok?'
                    }
                )
            }
        },
        {
            description: 'sendToContent a question to answer (2)',
            onclick: function()
            {
                // callback set
                sendToContent(
                    {
                        'question' : 'What is the time there?',
                    }
                )
            }
        },
        {
            description: 'sendToContent a callback (panel>content>panel)',
            onclick: function()
            {
                // callback set
                sendToContent(
                    {
                        'callback': 'if (confirm("Callback try? Pay attention to consoles.")) sendToPanel({ request: "PanelConsole_LOG", data: "callback of callback" })'
                    }
                )
            }
        }
    ];
    for( var launcher in launchers )
    {
        var button = document.createElement('DIV');
        button.className = 'action-button';
        button.id = 'demo-launcher-' + launcher;
        button.textContent = 'Demo ' + launcher;
        button.onclick = launchers[ launcher ].onclick;
        button.setAttribute('title', launchers[ launcher ].description);
        panelDemosWrap.appendChild( button );
    }
}



/****************************************************************************************************/
/****************************************************************************************************/



function inspected_window_context_eval( what )
{
    chrome.devtools.inspectedWindow.eval( what );
}


function content_script_context_eval( what )
{
    chrome.devtools.inspectedWindow.eval( what, { useContentScriptContext: true } );
}


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


var panelResponser = ( function()
{
    return {

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

    }
})();


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
            else {
                CONSOLE.log('content request not defined: "' + message.request + '"');
            }
        }

        if ( message.callback )
        {
            CONSOLE.log( typeof message.callback + ' message.callback recieved' );

            switch( typeof message.callback )
            {
                case 'string':
                    CONSOLE.log('eval callback string');
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
                    CONSOLE.log('call callback function');
                    message.callback();
                    break;
            }
        }
    }
}


window.onload = function()
{
	//Created a port with background page for continous message communication
	port = chrome.extension.connect( { 'name': "Devtools Port" } );

	//Hanlde response when recieved from background page
	port.onMessage.addListener( listenFromContent );

	//Posting message to background page

    // as request (will trigger a response at content_script)
	if( !pending_msg._data.length )
        sendToContent(
            { request: contentRequirements.localStorage.SEND }
        );

	pending_msg.refresh();
    panel_document_add_listeners();
    panel_document_add_demo_launchers();
};
