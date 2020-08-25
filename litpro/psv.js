module.exports = function psv (text, args, name) {

    let lines = text.split("\n");
    let ret = [];
    let elreg = /^(\s*)(\w*)(\#[^.\s]*)?((?:\.[^.\s]*)*)(.*)$/;
    let allspaces = /^\s*$/;
    let els = [];
    let indent = 0;
    let n = lines.length;
    let i;

    for (i = 0; i < n; i += 1) {
        let line = lines[i];
        if ( allspaces.test(line) ) {
            continue;
        }
        let [fullmatch, spaces, el, id, cls, rest] = line.match(elreg);
        let curindent = spaces.length;
        if (curindent <= indent) {
            let [clel, clindent, clspaces] = els.pop() ?? [];
            while (curindent <= clindent) {
                ret.push(`${clspaces}</${clel}>`);
                [clel, clindent, clspaces] = els.pop() ?? [];
            }
            if (clel) {
                els.push([clel, clindent, clspaces]);
            }
        } 
        indent = curindent;
        if (id && (id[1] === '#') ) {
            ret.push(line.replace('#', '')); //remove first #
        } else if (cls && (cls[1] === '.') ) {
            ret.push(line.replace('.', ''));
        } else if (id ||  cls) {
            let pieces = [];
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
            els.push([opel, curindent, spaces]);;
            if (id && (id.length > 1) ) {
                pieces.push(`id="${id.slice(1)}"`); 
            }
            if (cls && (cls.length > 1) ) {
                pieces.push(`class="${cls.slice(1).replace(/\./g, ' ')}"`);
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
                if (rest[rest.length-1] === '/') {
                    els.pop(); // no closing element here
                    indent = els[els.length-1][1] || 0;
                }
            }
            ret.push(`${spaces}<${pieces.join(' ')}>`);
        } else {
            ret.push(line);
        }

    }
    let curindent = 0; 
    let [clel, clindent, clspaces] = els.pop() ?? [];
    while (curindent <= clindent) {
        ret.push(`${clspaces}</${clel}>`);
        [clel, clindent, clspaces] = els.pop() ?? [];
    }
    if (clel) {
        els.push([clel, clindent, clspaces]);
    }

    let input = ret.join('\n');
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
            i = name.indexOf(":")+1;
            n = name.indexOf(":", i);
            if (n === -1) { n = name.indexOf(colon); }
            start = name.slice(i, n);
        }
        
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
    
        gcd.once("minor ready:" + file + ":" + stripped, function (text) {
            gcd.emit("text ready:" + name, text); 
        });
        doc.blockCompiling(input, file, stripped, start );
    }

};
