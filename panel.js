
var panelConsole    = document.getElementById( 'console' );
var panelList       = document.getElementById( 'stored-xpath-list' );
var button_flush    = document.getElementById( 'xpaths-flush' );
var button_save     = document.getElementById( 'xpaths-save' );

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


function document_add_listeners()
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
        }
    );
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
    CONSOLE.log( 'message recieved from panel: ' + ( ('string' == typeof message)? message : JSON.stringify(message) ) );

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
            switch( typeof message.callback )
            {
                case 'string':
                    console.log('eval callback function');
                    eval(message.callback);
                    break;

                case 'function':
                    console.log('call callback function');
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

    // with callback
    sendToContent(
        {
            'callback': 'if (confirm("callback try?")) sendToPanel({ request: "PanelConsole_LOG", data: "callback callback" })'
        }
    );

    // as requirement
	if( !pending_msg._data.length )
        sendToContent(
            { request: contentRequirements.localStorage.SEND }
        );

	pending_msg.refresh();
    document_add_listeners();
};

