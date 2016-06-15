
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

		chrome.extension.sendMessage(
			{
				'message'	: target_details.xpath,
				'type'		: 'NODE',
				'context'	: 'event.click'
			}
		);
	}

});


var UI = (function(){

	return {

		save_at_localStorage: function(what){

			localStorage.setItem('htHelper_pending',what);

		},

		sendLocalStorage: function(){

			chrome.extension.sendMessage(
		    	{
		    		'request': 'Save this at localStorage',
		    		'callback': localStorage.getItem('htHelper_pending')
		    	}
		    );

		},

		sendBodyClassName: function () {

			console.log("function sendBodyClassName", NODE(document.body));
		    chrome.extension.sendMessage(
		    	{
		    		'message': 'document.body.className' + document.body.className,
		    		'context': 'question.answer'
		    	}
		    );
			alert("document.body.className" + document.body.className);
		},

		createDIVs: function() {
			var div = document.createElement('DIV');
			div.className += " fixed-to-bottom dont-prevent";
			div.textContent = "DIV.fixed-to-bottom";
			document.body.appendChild(div);

			//div.addEventListener('click', function(e){
			//	alert( chrome.i18n.getMessage("@@extension_id") + ' && ' + chrome.i18n.getMessage("@@ui_locale") );
			//});


			var div2 = div.cloneNode(true);
			div2.className += " div2";
			div2.textContent += ".div2";
			document.body.appendChild(div2);

			div2.addEventListener('click', function(e){
				alert( chrome.i18n.getMessage("options_Save") );
			});
		}
	}

})();


//Handler request from background page
chrome.extension.onMessage.addListener(function (message, sender) {
    //Send needed information to background page

    var Answer = false;

	if ( 'string' == typeof message ){
		switch (message) {
			case 'Can you send me your localStorage, please?':
				alert(message);
				UI.sendLocalStorage();
				alert('Check if sent to DevTools');
				break;
			default:
				alert(message);
				break;
		}
	}

	if ( 'object' == typeof message && message.question){

		switch (message.question) {
			case 'Are you ok?':
				Answer = 'Yes, I am.';
				break;
			default:
				Answer = false;
				break;
		}

		if (false !== Answer)
			message.question += ' --- ' + Answer;

		alert(message.question);
	}

	if ( 'object' == typeof message && message.callback)// && 'function' == typeof message.callback)
	{
		console.log( typeof message.callback, message.callback );
		if (message.question == 'Save this at localStorage')
			localStorage.setItem('htHelper_pending',message.callback);
		else if ( 'string' == typeof message.callback ){
			console.log('eval function');
			eval(message.callback);
		}
	};

});


/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/


var contentResponser = (function(){

	function sendToPanel( params_obj )
	{
		chrome.extension.sendMessage( params_obj );
	};

	return {

		'Overwrite_ContentLocalStorage': function( params )
		{
			localStorage.setItem( 'htHelper_pending', params );
		},

		'Send_ContentLocalStorage': function( params )
		{
			sendToPanel(
		    	{
		    		'request': 'Save this at panel localStorage',
		    		'callback': localStorage.getItem('htHelper_pending')
		    	}
		    );
		}

	};

})();




//Handler request from background page
if(false) chrome.extension.onMessage.addListener( function ( message, sender ) {

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
					alert(message);
					break;
			}
		}
	}
	else if ( 'object' == typeof message )
	{
		if ( message.question )
		{
    		var Answer = false;
		
			switch ( message.question )
			{
				case 'Are you ok?':
					Answer = 'Yes, I am.';
					break;
				default:
					Answer = false;
					break;
			}
	
			if (Answer)
				console.log(message.question + ' --- ' + Answer);
		};

		if ( message.request && 'function' == typeof contentResponser[ message.request ] )
		{
			//Send needed information to background page
			if ( message.data )
				contentResponser[ message.request ]( message.data );
			else
				contentResponser[ message.request ]();
		}
		else
		{
			console.log( 'devtools request not defined "' + message.request + '"' );
		};

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
		};

	};

});