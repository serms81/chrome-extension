
var the_panel;
var the_panel_window = window;
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

}


function display_at_panel(msg){

  var isString = ('string' == typeof msg);
  var isObject = ('object' == typeof msg);
  var hasCntxt = (isObject && msg.context);

  if(msg.message)
  {  
      if(isString)
      {
          document.getElementById("console").innerHTML += '<p>'+msg+'</p>';
      }
      else if(isObject && !hasCntxt)
      {
          document.getElementById("console").innerHTML += '<p>'+msg.message+'</p>';
      }
      else if(isObject && hasCntxt)
      {
        if ( 'event.click' == msg.context )
          document.getElementById("stored-xpath-list").innerHTML += '<li>'+msg.message+'</li>';
        else
          document.getElementById("console").innerHTML += '<p>'+msg.message+'</p>';
      }
  }
  else if (msg.request)
  {
		document.getElementById("console").innerHTML += '<p>Request:'+msg.request+'</p>';
  }

}

function display_flush() {

    pending_msg.flush();
    document.getElementById("console").innerHTML = '';
    document.getElementById("stored-xpath-list").innerHTML = '';

}

function saveLast(){

 	port.postMessage( {
 		'question'	 : 'Are you ok?',
 		//'callback'	: function(arg){alert(arg);},
 		'callback'   : '(function(){localStorage.setItem("htHelper_pending",'+JSON.stringify(pending_msg._data)+');})()'
 	} );

}

function flush_button_add_listener(){

  document.getElementById('xpaths-flush').addEventListener('click',function(e){
  	display_flush();
  });

}

window.onload = function(){

	//Created a port with background page for continous message communication
	port = chrome.extension.connect({
	  name: "Devtools Port"
	});

	//Hanlde response when recieved from background page
	port.onMessage.addListener(

	  function (msg) {

	  	var message = msg;

	  	if (message.request == 'Save this at localStorage')
	  	{
	  		display_flush();
	  		pending_msg.refresh(message.callback);
			//	localStorage.setItem('htHelper_pending',message.callback);
	  	};

		if ( 'object' == typeof message && message.callback)// && 'function' == typeof message.callback)
		{
			console.log( typeof message.callback, message.callback );


			if ( 'string' == typeof message.callback ){
				console.log('eval function');
				eval(message.callback);
			}
		};

    	pending_msg._data.push(msg);
    	display_at_panel(msg);

		if(pending_msg._data.length > 1)
		{

		    port.postMessage( {
		 		'question'	 : 'Save this at localStorage',
		 		'callback'   : JSON.stringify(pending_msg._data)
		 	} );
		
		};
	  }

	);

	//Posting message to background page
	port.postMessage("Check listening tab URL");

	if( !pending_msg._data.length )
		port.postMessage("Can you send me your localStorage, please?");

 	port.postMessage( {
 		'question'	 : 'Are you ok?',
 		'callback'   : 'UI.createDIVs()'
 	} );


	pending_msg.refresh();
    flush_button_add_listener();
};
