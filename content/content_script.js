
function localStoragePush( newObj )
{
	if ( !newObj ) return;

	var curr_val = localStorage.getItem('htHelper_pending') || "[]";
	curr_val = JSON.parse( curr_val );
	curr_val.push( newObj );
	curr_val = JSON.stringify( curr_val );
	localStorage.setItem( 'htHelper_pending', curr_val );
}

var NODE = ht_helpers().NODE;
var TOAST = ht_helpers().TOAST;

function clickListener(_ev)
{
    if ( _ev.button !== 2 && !_ev.target.classList.contains('toast-single') )
    {
        _ev.preventDefault();
        _ev.stopPropagation();

        var target = _ev.target;
        var target_details = NODE(target);
        console.log('target_details', target_details);
        TOAST( target_details.selector );

        localStoragePush(target_details.xpath);

        sendToPanel(
            {
                'request'   : panelRequirements.localStorage.OVERWRITE,
                'data'      : localStorage.getItem('htHelper_pending')
            }
        );
    }
}

var contextMenuElem;

function contextmenuListener(_ev)
{
    if ( _ev.button == 2 )
    {
        contextMenuElem = _ev.target;
    }
}

function content_document_add_listener()
{
    document.addEventListener( 'click', clickListener );
    document.addEventListener( 'contextmenu', contextmenuListener );
    document.body.classList.add('ht-click-listener');
}

function content_document_remove_listener()
{
    document.removeEventListener( 'click', clickListener );
    document.removeEventListener( 'contextmenu', contextmenuListener );
    document.body.classList.remove('ht-click-listener');
}
