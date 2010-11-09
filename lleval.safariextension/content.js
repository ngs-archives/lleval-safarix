////////////////////////////////////////////////////////
/**
 * @class Template
 */
function Template(template) {
    this.template = template.toString();
}

Template.prototype = {
    evaluate : function(object) {
        var ret = this.template;
        for(var i in object) {
            ret = ret.replace(new RegExp("\\[%\\s+"+i+"\\s+%\\]","g"),object[i]);
        }
        return ret;
    },
    toString : function() {
        return this.template;
    }
}

////////////////////////////////////////////////////////
/**
 * @constant
 */
const
    LANGS  = "pl p6 awk bas bf c el lsp scm grass hs io js lazy lua m4 ml php py py3 rb rb19 ps tcl".split(" "),
    TITLES = "Perl 5|Perl 6 (rakudo)|awk|BASIC (bwbasic)|Brainf.ck|C|Emacs Lisp|Common Lisp (ecl)|Scheme (gauche)|Grass|Haskell (runhugs)|IO|JavaScript (spidermonkey)|Lazy K|Lua|m4|OCaml|PHP|Python 2.X|Python 3.X|Ruby 1.8.X|Ruby 1.9.X|PostScript (ghostscript)|Tcl||".split("|"),
    APIURL = "http://api.dan.co.jp/lleval.cgi";
    
////////////////////////////////////////////////////////
/**
 * Templates
 */
const RESULT_TEMPLATE = new Template(
'<html>'+
    '<head>'+
        '<meta http-equiv="content-type" content="text/html; charset=utf-8" />'+
        '<title>[% title %]</title>'+
        '<link rel="stylesheet" type="text/css" href="[% baseURI %]result.css" />'+
        '<link rel="stylesheet" type="text/css" href="[% baseURI %]prettify/prettify.css" />'+
        '<script type="text/javascript" src="[% baseURI %]prettify/prettify.js"></script>'+
    '</head>'+
    '<body onload="prettyPrint()">'+
        '<div id="content">'+
            '<h1>[% title %]</h1>'+
            '<table>[% content %]</table>'+
            '<hr />'+
            '<p>Powered by <a href="http://colabv6.dan.co.jp/lleval.html">lleval</a> / <a href="https://github.com/ngs/lleval-safarix">lleval-safarix</a></p>'+
        '</div>'+
    '</body>'+
'</html>');

const RESULT_TR_TEMPLATE = new Template('<tr><th>[% th %]</th><td><pre class="[% c %]">[% td %]</pre></td>');

////////////////////////////////////////////////////////
/**
 * Event handlers
 */
function handleContextMenu(event) {
    function addItem(l,t) {
        event.contextMenu.appendContextMenuItem("evalCode-"+l, "eval selected code - "+t);
    }
    addItem("auto","Use of #!");
    
    for(var i in LANGS) {
        if(safari.extension.settings.getItem(LANGS[i]))
            addItem(LANGS[i],TITLES[i]);
    }
}

function handleCommand(event) {
    if(!event.command) return;
    var m = event.command.match(/^evalCode-(.+)$/);
    if(m&&m[1]) {
        evalCode(m[1],event.userInfo);
    }
}

function handleEvalResult(res) {
    var keys = "lang status stderr stdout syscalls time source".split(" ");
    var content = [];
    for(var i in keys) {
        var key = keys[i], value = res[key];
        content.push(
            RESULT_TR_TEMPLATE.evaluate({
                th : key,
                td : value,
                c  : key=="source"?"prettyprint lang-"+res.lang:"plain"
            })
        );
    }
    html = RESULT_TEMPLATE.evaluate({
        title   : "lleval result",
        baseURI : safari.extension.baseURI,
        content : content.join("")
    });
    var newTab = safari.application.activeBrowserWindow.openTab();
    newTab.url = "data:text/html;charset=utf-8,"+ encodeURIComponent(html) +"";
}

function handleChangeSettings(event) {
    // Currently, nothing to do
}

////////////////////////////////////////////////////////

function evalCode(l,c) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4){
            var res;
            try {
                res = JSON.parse(xhr.responseText);
                res.source = c;
            } catch(e) {}
            if(res)
                handleEvalResult(res);
            else
                alert("lleval: Request fail.");
        }
    }
    xhr.open('GET',APIURL + "?l="+l+"&s="+encodeURIComponent(c),true)
    xhr.send(null);
}
