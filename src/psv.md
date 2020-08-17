## PSV

This takes a small subset of pug syntax and converts it into a svelte
component. After doing the initial pass, it will then do another compile run
for any sub pieces that are to be compiled afterwards. This helps ease a lot
of potential conflicts. 

We use indentation to denote contained stuff. If the first bit of a line has
optional non-space followed by a single period or hash, then we assume this is an
element. All caps leads to a svelte: replacement. More than one period (or
hash)  at the
beginning leads to this just being text and reducing the number by 1.

A string of non-space stuff separated by periods will be converted into a
class attribute. Hash converts into id. Any other attributes can just be typed
out as usual on the line, including svelte stuff. A | at the end of a line
means the attribute continues. 

    module.exports = function psv (text, args, name) {

        let lines = text.split("\n");
        let ret = [];
        let elreg = /^(\s*)(\w*)(\#[^.\s]*)?((?:\.[^.\s]*)*)(.*)$/;
        let els = [];
        let indent = 0;

Ret will contain lines to concatenate at the end for returning. els will
contain the nesting structure of elements. It will have the element name only
as that is all we need to close a tag and the indent level. 

We will loop over the lines figuring out everything we need to figure out. We
use an actual loop because of continued lines, we may want to manually skip
over some stuff. 
        
        let n = lines.length;
        let i;
        for (i = 0; i < n; i += 1) {
            let line = lines[i];
            let [fullmatch, spaces, el, id, cls, rest] = line.match(elreg);
            let curindent = spaces.length;
            if (curindent <= indent) {
                _":close tag"
                indent = curindent;
            } 
            _":new line"
        }
        let curindent = 0; 
        _":close tag"
    
        let input = ret.join('\n');
        _":compile"

    };


[litpro/psv.js](# "save:")

[new line]()


We denote something being en element by having a period or hash as part of the
heading. So optional word stuff followed by either hash or period leads to
element. Also caps denote svelte: directive.  We start by having an escape
from if we want text that has the first # or '.' not be indicative of an element. 
    
    if (id && (id[1] === '#') ) {
        ret.push(line.replace('#', '')); //remove first #
    } else if (cls && (cls[1] === '.') ) {
        ret.push(line.replace('.', ''));
    } else if (id ||  cls) {
        let pieces = [];
        _":determine opening element";
        if (id && (id.length > 1) ) {
            pieces.push(`id="${id.slice(1)}"`); 
        }
        if (cls && (cls.length > 1) ) {
            pieces.push(`class="${cls.slice(1).replace('.', ' ')}"`);
        }
        rest = rest.trim();
        while ( (rest[rest.length-1] === '|') && (i < (n-1) ) ) {
            rest = rest.slice(0,-1);
            pieces.push(rest);
            i += 1;
            rest = lines[i].trim();
        }
        if (rest) {
            pieces.push(rest);
        }
        ret.push(`${spaces}<${pieces.join(' ')}>`);
    } else {
        ret.push(line);
    }

[determine opening element]()

We have four possibilities:  all uppercase so svelte directive, something else
then just element, no leading word then if id, we use a div, if class, we use
a span. 

    let opel;
    if (el) {
        if (el === el.toUpperCase() ) {
            opel =  'sevelte:' + el.toLowerCase() ;
        } else {
            opel = el;
        }
    } else if (id) {
        opel = 'div';
    } else {
        opel = 'span';
    }
    pieces.push(opel);
    els.push([opel, curindent, spaces]);


[close tag]()

cl for closing. We keep closing until the indent is done. 

    let [clel, clindent, clspaces] = els.pop() ?? [];
    while (curindent <= clindent) {
        ret.push(`${clspaces}</${clel}>`);
        [clel, clindent, clspaces] = els.pop() ?? [];
    }
    if (clel) {
        els.push([clel, clindent, clspaces]);
    }
    

[compile]()

This should compile the pugged text again to deal with escaped bits that are
not to be pugged. 

This is an exact copy of the compile command so it should just work, I
think. 

    {
        let doc = this;
        let gcd = doc.gcd;
        let file = doc.file;
        let colon = doc.colon.v;
        let i, n, start ;

        let stripped = name.slice(name.indexOf(":")+1) + colon + "c";

        if (args[0]) {
            start = args[0].toLowerCase();
        } else {
            _":mainblock name"
        }
        
        console.log(input);
        console.log(name, args, start);

        _":minors"

        gcd.once("minor ready:" + file + ":" + stripped, function (text) {
            gcd.emit("text ready:" + name, text); 
        });
        doc.blockCompiling(input, file, stripped, start );
    }

[mainblock name]()

This gets the mainblock name if first argument does not give it.

    i = name.indexOf(":")+1;
    n = name.indexOf(":", i);
    if (n === -1) { n = name.indexOf(colon); }
    start = name.slice(i, n);

[minors]()

If there are additional arguments, we can use those arguments to create the minor blocks and store values in them. The arguments alternate between name and value, allowing the value to be whatever.

Reusing i,n. Want to jump by 2, start at 1 as 0 is the compile name.

    n = args.length;
    for (i = 1; i < n; i += 2) {
        if (args[i] && (typeof args[i] === "string") ) {
            if (typeof args[i+1] === "undefined") {
                doc.store(start + doc.colon.v + args[i].toLowerCase(), '');
            } else {
                doc.store(start + doc.colon.v + args[i].toLowerCase(), args[i+1]);
            }
        }
    }



