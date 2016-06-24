
// Chrome Extension Transfer Protocol

// Content Script side





// content to panel sender
function sendToPanel( params_obj )
{
    console.log( 'content sendToPanel fired! ', params_obj );
    chrome.extension.sendMessage( params_obj );
}

// panel side available responses
const panelRequirements = {

    "localStorage": {
        "SEND"      : "PanelLocalStorage_SEND",
        "OVERWRITE" : "PanelLocalStorage_OVERWRITE"
    },

    "itemsList": {
        "WRITE": "PanelItemsList_WRITE"
    },

    "console": {
        "LOG": "PanelConsole_LOG"
    }

};

// content side available orders
var contentResponser = ( function()
{
    return {

        'questionAnswers':
        {
            "Are you ok?":
                "Yes, I am.",
            "What is the time there?":
            "Here it's " + (new Date()).toTimeString()
        },

        'ContentLocalStorage_OVERWRITE': function( data )
        {
            localStorage.setItem( 'htHelper_pending', data );
            console.log( 'localStorage', localStorage );
        },

        'ContentLocalStorage_SEND': function()
        {
            sendToPanel(
                {
                    'request'   : panelRequirements.localStorage.OVERWRITE,
                    'data'      : localStorage.getItem('htHelper_pending')
                }
            );
        },

        "ContentConsole_LOG": function( what )
        {
            console.log( what );
        }

    }
})();

// content listening from panel
function listenFromPanel( message, sender )
{
    console.log( 'message recieved from panel: ' + ( ('string' == typeof message)? message : JSON.stringify(message) ) );

    if ( 'string' == typeof message )
    {
        if ( 'function' == typeof contentResponser[ message ] )
        {   //Send needed information to background page
            contentResponser[ message ]();
        }
        else
        {
            switch ( message ) {
                default:
                    alert( 'Message from devtools: ' + message );
                    break;
            }
        }
    }
    else if ( 'object' == typeof message )
    {
        if ( message.question )
        {
            var Answer = contentResponser.questionAnswers[ message.question ];

            if (Answer)
                alert( 'Panel question:\n' + message.question + '\nContent response:\n' + Answer );
        }

        if ( message.request)
        {
            if ( 'function' == typeof contentResponser[ message.request ] ) {
                //Send needed information to background page
                if ( message.data )
                    contentResponser[ message.request ]( message.data );
                else
                    contentResponser[ message.request ]();
            }
            else {
                console.log('devtools request not defined: "' + message.request + '"');
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

//Handler request from background page
chrome.extension.onMessage.addListener(	listenFromPanel );
