
function qs(selector){
    if(!selector)
        return null;
    else
        return document.querySelectorAll(selector);
};

var NODE = function (_node){

    _node = (_node)? _node : {};

    var n = {};

    n.tag     = _node.tagName.toLowerCase();
    n.id      = _node.id;
    n.classes = (function(){ var classes = []; _node.classList.forEach(function(e,i){ classes.push(e); }); return classes.join('.'); })();
    n.parent  = _node.parentNode;

    function getSelector(elem){

        var selector = elem.tag;
        selector += (elem.id)? '#'+elem.id : '' ;
        selector += (elem.classes)? '.' + n.classes : '' ;

        return selector;

    };

    n.selector = getSelector(n);

    var n_elements = document.querySelectorAll(n.selector);

    n.length = n_elements.length;

    function getSiblings(node) {
    	var nodes = node.parentNode.children;
    	var total = 0;
    	var position = 0;
    	var siblings = [];

    	for(var i = 0; i < nodes.length; i++) {
    		if(nodes[i] && nodes[i].tagName == node.tagName) {
    			total++;
    			if (nodes[i] == node)
    				position = total;
    		}
    	}

    	return { 'total': total, 'position': position };
    }

    function getPath(xpath_format){

        var parents = [];
        var curr = '';

        if(xpath_format)
            curr = _node;
        else
            curr = _node.parentNode;

        while(curr && curr.tagName){

            if(xpath_format){

	        	var siblings = getSiblings(curr);
	            var id = ((siblings.total - 1) >= 1) ? '[' + siblings.position + ']' : '';
	            //$(curr.parentNode).children(curr.tagName).index(curr) + 1;
	            //$(curr.parentNode).children(curr.tagName).length - 1;

                parents.push( curr.tagName.toLowerCase() + id );
            }
            else
                parents.push( NODE(curr).tag );

            curr = curr.parentNode;

        };

        parents = parents.reverse();

        if(xpath_format)
            return parents.join('/');
        else
            return parents.join('>');

    };

    n.parents = getPath()||'_parents_';

    n.xpath = getPath(true)||'_xpath_';

    n.display = function(joiner){
    	joiner = joiner || ',';
        console.log(
            ['NODE display:', n.selector, qs(n.selector).length,
             'Parents: ' + n.parents,
             'XPath: ' + n.xpath,
             ''].join(joiner)
        );
    };

    return n;

};




document.addEventListener('click', function(_ev){
	
	if(!_ev.target.classList.contains('dont-prevent')){
	    _ev.preventDefault();
	    _ev.stopPropagation();

	    var target             = _ev.target;
	    var target_details     = NODE(target);
        console.log('target_details',target_details);

		sendToPanel(
			{
                'request'	: 'PanelItemsList_WRITE',
                'data'	    : target_details.xpath
			}
		);
	}

});



/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/



function sendToPanel( params_obj )
{
    console.log( 'content sendToPanel fired! ', params_obj );
	chrome.extension.sendMessage( params_obj );
}

const panelRequirements = { // panelResponser available orders
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

function listenFromPanel( message, sender )
{
    console.log( 'message recieved from panel', message );

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
				alert(message.question + ' --- ' + Answer);
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