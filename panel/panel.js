
var panelConsole    = document.getElementById( 'console' );
var panelList       = document.getElementById( 'stored-xpath-list' );
var panelDemosWrap  = document.getElementById( 'demo-launchers' );
var button_flush    = document.getElementById( 'xpaths-flush' );
var button_save     = document.getElementById( 'xpaths-save' );
var button_enable_catcher  = document.getElementById( 'catcher-toggle' );

var MESSAGES = {

  'store': function(data)
  {
  	data = data || JSON.stringify(MESSAGES._data);
    localStorage.setItem('htHelper_pending',data);
  },

  'restore': function()
  {
    MESSAGES._data = JSON.parse(localStorage.getItem('htHelper_pending')) || [];
  },

  'flush': function()
  {
    MESSAGES._data = [];
    MESSAGES.store();
  },

  'refresh': function()
  {
	MESSAGES.restore();
	MESSAGES._data.forEach(
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
    MESSAGES.flush();
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
    MESSAGES.refresh();
}

function catcher_enable()
{
    button_enable_catcher.classList.remove( 'catcher-disabled' );
    button_enable_catcher.textContent = 'Press to disable catcher';
    sendToContent( { 'callback': 'content_document_add_listener();' } );
}

function catcher_disable()
{
    button_enable_catcher.classList.add( 'catcher-disabled' );
    button_enable_catcher.textContent = 'Press to enable catcher';
    sendToContent( { 'callback': 'content_document_remove_listener();' } );
}

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



// INIT
function panel_init()
{
    var CETP_init_result = CETP_init();

    if ( CETP_init_result )
    {
        //Posting message to background page
        // as request (will trigger a response at content_script)
        if( !MESSAGES._data.length )
            sendToContent(
                { request: contentRequirements.localStorage.SEND }
            );

        MESSAGES.refresh();
        panel_document_add_listeners();
        panel_document_add_demo_launchers();
    }
    else
    {
        panelConsole.innerHTML = "Unable to start CETP.";
    }
};

panel_init();
