
var ht_helpers = function ()
{
    function getSiblings(node)
    {
        var nodes = node.parentNode.children;
        var total = 0;
        var position = 0;

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] && nodes[i].tagName == node.tagName) {
                total++;
                if (nodes[i] == node)
                    position = total;
            }
        }

        return {'total': total, 'position': position};
    }

    return {

        NODE: function NODE(_node)
        {
            _node = ( _node ) ? _node : {};

            var n = {};

            n.parent = _node.parentNode;
            n.tag = _node.tagName.toLowerCase();
            n.id = _node.id;
            n.classes = (function () {
                var classes = [];
                _node.classList.forEach(
                    function (e, i) {
                        classes.push(e);
                    }
                );
                return classes.join('.');
            })();

            function getSelector(elem) {
                var selector = elem.tag;
                selector += (elem.id) ? '#' + elem.id : '';
                selector += (elem.classes) ? '.' + n.classes : '';

                return selector;
            }

            n.selector = getSelector(n);

            n.length = document.querySelectorAll(n.selector).length;

            function getPath(xpath_format)
            {

                var parents = [];
                var curr = '';

                if (xpath_format)
                    curr = _node;
                else
                    curr = _node.parentNode;

                while (curr && curr.tagName) {

                    if (xpath_format) {
                        var siblings = getSiblings(curr);
                        var id = ((siblings.total - 1) >= 1) ? '[' + siblings.position + ']' : '';

                        parents.push(curr.tagName.toLowerCase() + id);
                    }
                    else
                        parents.push(NODE(curr).tag);

                    curr = curr.parentNode;
                }

                parents = parents.reverse();

                if (xpath_format)
                    return parents.join('/');
                else
                    return parents.join('>');

            }

            n.parents = getPath() || '_parents_';

            n.xpath = getPath(true) || '_xpath_';

            n.display = function (joiner) {
                joiner = joiner || ',';
                console.log(
                    [
                        'NODE display:', n.selector, n.length,
                        'Parents: ' + n.parents,
                        'XPath: ' + n.xpath,
                        ''
                    ].join(joiner)
                );
            };

            return n;

        },

        TOAST: function TOAST(what)
        {
            var TOASTER = document.getElementById('ht-toaster');
            var toast = document.createElement('DIV');
            var toastInner =  document.createElement('DIV');
            var fadeOut = 2;
            var expiration = 3;

            if (!TOASTER) {
                TOASTER = document.createElement('DIV');
                TOASTER.id = 'ht-toaster';
                document.body.appendChild(TOASTER);
            }

            toast.id = 'ht-toast-' + (new Date()).getTime();
            toast.className = 'ht-toast';
            toast.onclick = function(){ TOASTER.removeChild(toast); };

            toastInner.className = 'ht-toast-inner';

            if ( 'string' == typeof what )
            {
                toastInner.innerHTML = what;
            }
            else
            {
                if ('object' == typeof what) {
                    if (what.class)       toastInner.classList.add(what.class);
                    if (what.html)        toastInner.innerHTML = what.html;
                    if (what.expiration)  expiration = what.expiration;
                }
            }

            toast.appendChild(toastInner);
            TOASTER.appendChild(toast);

            if ( !isNaN( expiration ) && expiration > 1 )
            {
                var count = expiration * 1000; // s to ms
                fadeOut = fadeOut / expiration  * 1000; // s to ms

                var counter = document.createElement( 'SPAN' );
                counter.id = toast.id+'-counter';
                toast.appendChild(counter);

                var toast_interval = setInterval(
                    function () {
                        count = count - 10;
                        counter.textContent = count;
                        if (count == 0) {
                            clearInterval(toast_interval);
                            TOASTER.removeChild(toast);
                        }
                        else if (count == fadeOut) { // on fadeOut limit
                            //var percent = count / fadeOut;
                            //toast.style.opacity = percent;
                            toast.classList.add( 'ht-toast--animate-out' );
                        }
                    },
                    10
                );
                /*var toast_timeout = setTimeout(
                    function () {
                        count = count - 1;
                        counter.textContent = count;
                        if (count == 0) {
                            clearInterval(toast_timeout);
                            TOASTER.removeChild(toast);
                        }
                        else if (count == fadeOut) { // on fadeOut limit
                        }
                    },
                    1
                )*/
            }
        }
    }
};

window.onload = function () {
    var script = document.createElement( "script" );
    script.innerHTML = ht_helpers().TOAST.toString();
    document.body.appendChild( script );
};
