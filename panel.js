
var port;

var pending_msg = {

  'store': function(data) {
  	data = data || JSON.stringify(pending_msg._data);
    localStorage.setItem('htHelper_pending',data);
  },
  'restore': function(){
    pending_msg._data = JSON.parse(localStorage.getItem('htHelper_pending')) || [];
  },
  'flush': function(){
    pending_msg._data = [];
    pending_msg.store();
  },
  'refresh': function(what){
	if (what) localStorage.setItem('htHelper_pending',what);
	pending_msg.restore();
	pending_msg._data.forEach(function(msg,i){ display_at_panel(msg); });
  },
  _data: []

};

var panelConsole = document.getElementById("console");
var panelList = document.getElementById("stored-xpath-list");

var CONSOLE = {

    log: function(what)
    {
        what = ( 'object' == typeof what )? JSON.stringify( what ) : what;
        panelConsole.innerHTML += '<p>'+what+'</p>';
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

    refresh_from_localstorage: function()
    {
        display_flush();
        pending_msg.refresh(message.data);
    },

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

/*function display_at_panel(msg)
{
  var isString = ('string' == typeof msg);
  var isObject = ('object' == typeof msg);
  var hasCntxt = (isObject && msg.context);

  if(msg.message)
  {
      if(isString)
      {
          //document.getElementById("console").innerHTML += '<p>'+msg+'</p>';
      }
      else if(isObject && !hasCntxt)
      {
          //document.getElementById("console").innerHTML += '<p>'+msg.message+'</p>';
      }
      else if(isObject && hasCntxt)
      {
        if ( 'event.click' == msg.context )
          //document.getElementById("stored-xpath-list").innerHTML += '<li>'+msg.message+'</li>';
        else
          //document.getElementById("console").innerHTML += '<p>'+msg.message+'</p>';
      }
  }
  else if (msg.request)
  {
		CONSOLE.log( 'Request:'+msg.request );
  }
}*/

function display_flush()
{
    pending_msg.flush();
    CONSOLE.clear();
    LIST.flush();
}

function flush_button_add_listener()
{
  document.getElementById( 'xpaths-flush' ).addEventListener(
      'click',
      function(e)
      {
        display_flush();
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
            LIST.write( what )
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
            LIST.refresh_from_localstorage();
        },

        "PanelConsole_LOG"       : function( what )
        {
            CONSOLE.log( what );
        }

    }
})();

function listenFromContent( message, sender )
{
    CONSOLE.log('message recieved from content', message);

    if ( 'object' == typeof message )
    {
        if ( message.request )
        {
            if ( message.request ==  'Save this at localStorage' )
            {
                //	localStorage.setItem('htHelper_pending',message.callback);
            }
        }

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

window.onload = function(){

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

    // as requirement
	if( !pending_msg._data.length )
        sendToContent(
            { request: contentRequirements.localStorage.SEND }
        );

	pending_msg.refresh();
    flush_button_add_listener();
};
