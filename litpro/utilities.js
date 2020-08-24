const has = function has (obj, key) {
    return (typeof obj === 'object') && 
        Object.prototype.hasOwnProperty.call(obj, key);
};
const convertToMap = function (obj, sort = (a,b) => b.length - a.length ) {

    if (typeof obj !== 'object') {
        throw "not convertable to an array map: " + (typeof obj);
    }
    if (Array.isArray(obj) ) {
        return obj;
    } 

    return Object.keys(obj).
        sort(sort).
        map( key => [key, obj[key]] );
};

const makeLineCounter = function (str) {
    let n = str.length;
    let pointer = 0;
    let lower = 1; // 1 based
    let upper = 1;
    return function lineCounter (i) {
        if (i > n) { 
            i = n;
        } 
        if ( i < 0 ) {
            i = 0;
        }

        while (pointer < i) {
            pointer += 1;
            if (upper !== lower) {
                lower += 1;
            }
            if (str[pointer] === '\n') {
                upper = lower + 1;
            } 
        }
        while (pointer > i) {
            pointer -= 1;
            if (lower !== upper) {
                upper -= 1;
            }
            if (str[pointer] === '\n') {
                lower = upper - 1;
            } 
        }
        if (lower === 1) {
            return [1, i+1, i];
        }

        let j = 1;
        while (( str[pointer-j] !== '\n') && (pointer - j > 0) ) {
            j += 1;
        }
        return [lower, j, pointer];
    };
} 

const makeScanners = function scanning (moreDelimiters ={}) {

    const conreg = (/a/).constructor; //for detecting regex.


    let delimiterCatalog;
    {
        const common =  { 
            '"' : {
                end: '"', 
                escape: '\\', 
                delimiters : 'none'
            },
            '`' : {
                end: '`', 
                escape: '\\', 
                delimiters : 'none'
            },
            "'" : {
                end: "'", 
                escape: '\\', 
                delimiters : 'none'
            },
            '[' : {
                end: ']' 
            },
            '{' : {
                end: '}' 
            },
            '(' : {
                end: ')' 
            }
        };
        const javascript = { 
            ...common,
            '//': {
                end: '\n', 
                delimiters : 'none'
            }, 
            '/*' : {
                end: '*/', 
                delimiters : 'none'
            }
        };
        const litproTop = {
            '\u005f"' : {
                lead: '\\',
                escape: '\\',
                end : '"',
                delimiters: 'litproqq'
            },
            '\u005f`' : {
                lead: '\\',
                escape: '\\',
                end : '`',
                delimiters: 'litprobt'
            },
            "\u005f'" : {
                lead: '\\',
                escape: '\\',
                end : "'",
                delimiters: 'litproq'
            }
        };
        const litpro = {
            '\u005f"' : {
                lead: '\\',
                escape: '\\',
                end : '"',
                delimiters: 'litproqq'
            },
            '\u005f`' : {
                lead: '\\',
                escape: '\\',
                end : '`',
                delimiters: 'litprobt'
            },
            "\u005f'" : {
                lead: '\\',
                escape: '\\',
                end : "'",
                delimiters: 'litproq'
            },
            ...common, 
            '[' : {
                end: ']', 
                delimiters: 'litpro'
            },
            '{' : {
                end: '}', 
                delimiters: 'litpro'
            },
            '(' : {
                end: ')',
                delimiters: 'litpro'
            }
        };
        const litproqq = { ...litpro};
        delete litproqq['\u0022'];
        const litproq = { ...litpro};
        delete litproq['\u0027'];
        const litprobt = { ...litpro};
        delete litprobt['\u0061'];
        const litpar = { 
            '(' : {
                end: ')',
                delimiters: 'litpro'
            }
        }
    
    
        delimiterCatalog = {none: {}, common, javascript, 
            litproTop, litpro, litproqq, litproq, litprobt,
            litpar,
            ...moreDelimiters
        };
        Object.keys(delimiterCatalog).forEach( lang => {
            delimiterCatalog[lang] = convertToMap( delimiterCatalog[lang]);
        } );
    }

    const descend = function descend ({ 
        str = '', 
        start = 0, 
        delimiters = 'common', 
        first = () => null,
        terminator = () => null,
        last = () => null, 
        innerFirst = () => null,
        innerLast = () => null,
        push = () => null, 
        pop = () => null, 
        end = () => null
    } = {}) {
    
        if (typeof delimiters === 'string') {
            delimiters = delimiterCatalog[delimiters];
        }
    
        {
            const ttype = typeof terminator;
            if (ttype !== 'function') {
                const origTerminator = terminator;
                if (ttype === 'string') {
                    const tlength = origTerminator.length;
                    terminator = (substr) => {
                        return substr.slice(0,tlength) === origTerminator;
                    };
                } else if (
                    (ttype === 'object') && 
                    (origTerminator.constructor === conreg) 
                ) { 
                    origTerminator = (substr) => {
                        return terminator.test(substr);
                    };
                } else {
                    throw `Unknown terminator value: should be string, function, regex: ${ttype}`;
                }
            }
        } 
    
        if (!Array.isArray(delimiters) ) {
            throw "delimiters should be presented in the form `[key, obj]`";
        }
        const n = str.length;
        let insides = []; // pop/push of delimiters
        const originalDelimiters = delimiters;
    
        for (let i = start; i < n; i += 1) {
            let substr = str.slice(i);
            
            {
            const control = first(substr, i, str);
            if (typeof control === 'number') {
                if (control < 1) {
                    end(i);
                    return i;
                } else {
                    i += control-1; // the loop is going to add 1
                    continue;
                }
            } 
            }
    
            {
                const t = terminator(substr, i, str);
                if (t) {
                    end(i);
                    return i;
                }
            }
            let delim = delimiters.find( arr => {
                const left = arr[0];
                return ( left === substr.slice(0, left.length) );
            }); 
            
            if (delim) {
                let lead = delim[1].lead;
                if (lead) {
                    if (str[i-1] === lead) {
                        let esci = 1;
                        while (str[i - esci - 1] === lead) {
                            esci += 1;
                        }
                        if (esci % 2 === 1) {
                            delim = false; //odd number of escapes leave an escape so no delim
                        }
                    }
                }  
            }
    
            if (!delim) {
                const control = last(substr, i, str);
                if (typeof control === 'number') {
                    if (control < 1) {
                        end(i);
                        return i;
                    } else {
                        i += control-1; // the loop is going to add 1
                        continue;
                    }
                }
                continue;
            }
            
            { //delimiter has been found, not escape
            
                let [left, right] = delim;
                insides.push([left, right, i]);
                push(str, i, left, right);  // no effect on anything
                i += left.length;
                let current = insides[0];
                let cdl = right.end.length;
                if (right.delimiters) {
                    delimiters = delimiterCatalog[right.delimiters];
                }
                while (insides.length && (i < n) ) {
                    let substr = str.slice(i);
                    
                    {
                    const control = innerFirst(substr, i, str, current, insides); 
                    if (typeof control === 'number') {
                        if (control < 1) {
                            end(i);
                            return i;
                        } else {
                            i += control; // the loop is going to add 1
                            continue;
                        }
                    }  //not a for loop here so need +1
                    }
                
                        if (substr.slice(0, cdl) === right.end) { //end delimiter found
                            let rightFound = true;
                            let escape = right.escape;
                            if (escape) {
                                if (str[i-1] === escape) {
                                    let esci = 1;
                                    while (str[i - esci - 1] === escape) {
                                        esci += 1;
                                    }
                                    if (esci % 2 === 1) {
                                        rightFound = false; //odd number of escapes leave an escape so no rightFound
                                    }
                                }
                            }
                           
                            if (rightFound) {
                                insides.pop();
                                let leftPos = current[2];
                                let positions = [leftPos, leftPos+left.length, i, i +cdl]
                    
                                pop(str, positions, current, insides);
                                if (insides.length !== 0) {
                                    current = insides[insides.length-1];
                                    [left, right] = current; 
                                    if (right.delimiters) {
                                        delimiters = delimiterCatalog[right.delimiters];
                                    }
                                } else {
                                    delimiters = originalDelimiters;  
                                }
                    
                                i += cdl;
                                if (insides.length === 0) { i -= 1;} // for loop increments
                                continue;
                            }
                        }
                
                    let delim = delimiters.find( arr => {
                        const left = arr[0];
                        return ( left === substr.slice(0, left.length) );
                    });
                    
                    if (delim) {
                        let lead = delim[1].lead;
                        if (lead) {
                            if (str[i-1] === lead) {
                                let esci = 1;
                                while (str[i - esci - 1] === lead) {
                                    esci += 1;
                                }
                                if (esci % 2 === 1) {
                                    delim = false; //odd number of escapes leave an escape so no delim
                                }
                            }
                        }
                    }
                
                    if (!delim) {
                        let control = innerLast(substr, i, str, current, insides); 
                        if (typeof control === 'number') {
                            if (control < 1) {
                                end(i);
                                return i;
                            } else {
                                i += control; // the loop is going to add 1
                                continue;
                            }
                        }
                        i+=1; 
                        continue;
                    }
                    [left, right] = delim;
                    current = [left, right, i]; 
                    insides.push(current);
                    push(str, i, left, right);
                    i += left.length;
                    cdl = right.end.length;
                    if (right.delimiters) {
                        delimiters = delimiterCatalog[right.delimiters];
                    }
                
                }
                if ( insides.length ) {
                    throw `ending delimiters not found:  [${insides.join(',')}] not found in:\n  ${str.slice(insides[0][2])}`;
                }
    
            }
    
        }
        end(n); 
        return n; //not found 
    };
    const getMatch = function (value ) {
        let vtype = typeof value;
        if (vtype === 'function') {
            return value;
        }
        if (vtype === 'string') {
            let vl = value.length;
            return (str) => {
                if (str.slice(0,vl) === value) {
                    return [value];
                } else {
                    return null;
                }
            };
        } else if ( (vtype === 'object') && (value.constructor === conreg) ) {
            let regstr = value.toString();
            if (regstr[1] !== '^') {
                const lastInd = regstr.lastIndexOf('/');
                const flags = regstr.slice(lastInd+1); 
                value = RegExp('^' + regstr.slice(1, lastInd), flags);
            } 
            return (str) => {
                if (value.lastIndex) { value.lastIndex = 0;} // make sure starts at 0
                let match = value.exec(str);
                return (match ? match : null);
            };
        } else {
            throw `Value must be string, function, or regex: ${value}`;
        }
    };
    const makeReplacer = function (rv) {  //rv is replaceValue
        const trv = typeof rv;
        if (trv === 'string') {
            return (str, match, i) => {
                let replaceStr = '';
                let j = rv.indexOf('$');
                if (j === -1) {
                    replaceStr = rv;
                } else {
                    while ( (j !== -1) && (rv) ) {
                        replaceStr += rv.slice(0, j);
                        rv = rv.slice(j);
                        let m;
                        if ( (m = rv.match(/\$([0-9][0-9]?)/)) ) {
                            if (m[1][0] === '0') { m[1] = m[1][1]};  
                            replaceStr += match[m[1]];
                            rv = rv.slice(m[0].length);
                        } else {
                            if (rv[1] === '$') {
                                replaceStr += '$'; 
                            } else if (rv[1] === '&') {
                                replaceStr += match[0];
                            } else if (rv[1] === '`') {
                                replaceStr += str.slice(0, i);
                            } else if (rv[1] === "'") {
                                replaceStr += str.slice(i+match[0].length);
                            }
                            rv = rv.slice(2);
                        }
                
                        j = rv.indexOf('$');
                    }
                    replaceStr += rv;
                }
                return str.slice(0,i) + replaceStr + str.slice(i+match[0].length); 
            };
        } else if (trv === 'function') {
            return (str, match, i) => {
                const replaceStr = rv(...match, i, str);
                return str.slice(0,i) + replaceStr + str.slice(i+match[0].length); 
            };
        } else {
            throw `replaceValue should be a string or a function`;
        }
    };
    const indexOf = function (str, searchValue, args = {} ) {
        searchValue = getMatch(searchValue);
        let ret = -1;
        const flow = function (substr, i, str) {
            const match = searchValue(substr, i, str);
            if (match) {
                ret = i;
     return -1;
            } else {
                return null;
            }
        }
        if (args.last === true) {
            args.last = flow;
        } else {
            args.first = args.first || flow;
        } 
        descend({ str, ...args });
        return ret;
    };
    const lastIndexOf = function (str, searchValue, args = {}) {
        searchValue = getMatch(searchValue);
        let lastIndex = args.lastIndex ?? +Infinity;
        let ret = -1;
        const flow = function (substr, i, str) {
            if (i > lastIndex) {
                return -1; //matches that start after endInd not allowed
            }
            const match = searchValue(substr, i, str);
            if ( match ) {
                ret = i;
                return 1; //goes to the next character, may match within match
            } else {
                return null;
            }
        }
        if (args.last === true) {
            args.last = flow;
        } else {
            args.first = args.first || flow;
        } 
        descend({ str, ...args });
        return ret;
    };
    const match = function (str, searchValue, args = {} ) {
        searchValue = getMatch(searchValue);
        let ret = null;
        const flow = function (substr, i, str) {
            const match = searchValue(substr, i, str);
            if (match) {
                ret = match;
    match.index = i;
    match.input = str;
    return -1; //breaks further search
            } else {
                return null;
            }
        }
        if (args.last === true) {
            args.last = flow;
        } else {
            args.first = args.first || flow;
        } 
        let lastIndex = descend({str, ...args});
    ret.lastIndex = lastIndex;
        return ret;
    };
    const replace = function (str, searchValue, replaceValue,  args = {} ) {
        searchValue = getMatch(searchValue);
        replaceValue = makeReplacer(replaceValue);
        let ret = null;
        const flow = function (substr, i, str) {
            const match = searchValue(substr, i, str);
            if (match) {
                ret = replaceValue(str, match, i);
                return -1; //breaks further search
            } else {
                return null;
            }
        }
        if (args.last === true) {
            args.last = flow;
        } else {
            args.first = args.first || flow;
        } 
        descend({ str, ...args });
        return ret;
    };
    const allIndexOf = function (str, searchValue, args = {} ) {
        searchValue = getMatch(searchValue);
        let ret = [];
        const flow = function (substr, i, str) {
            const match = searchValue(substr, i, str);
            if (match) {
                ret.push(i);
    return (args.all) ? 1 : match[0].length; 
            } else {
                return null;
            }
        }
        if (args.last === true) {
            args.last = flow;
        } else {
            args.first = args.first || flow;
        } 
        descend({ str, ...args });
        return ret;
    };
    const matchAll = function (str, searchValue, args = {} ) {
        searchValue = getMatch(searchValue);
        let ret = [];
        const flow = function (substr, i, str) {
            const match = searchValue(substr, i, str);
            if (match) {
                ret.push(match);
    match.index = i;
    match.input = str;
    return (args.all) ? 1 : match[0].length;
            } else {
                return null;
            }
        }
        if (args.last === true) {
            args.last = flow;
        } else {
            args.first = args.first || flow;
        } 
        let lastIndex = descend({str, ...args});
    ret.lastIndex = lastIndex;
        return ret;
    };
    const replaceAll = function (str, search, replace, args) {
        const matches = matchAll(str, search, args);
        if (matches.length === 0) {
            return str;
        }
        let freplace = replace;
        if (typeof replace === 'string') {
            freplace = (...args) => {
                let match = args.slice(0, -2);
                let [i, str] = args.slice(-2);
                let rv = replace;
                let replaceStr = ''; 
                let j = rv.indexOf('$');
                if (j === -1) {
                    replaceStr = rv;
                } else {
                    while ( (j !== -1) && (rv) ) {
                        replaceStr += rv.slice(0, j);
                        rv = rv.slice(j);
                        let m;
                        if ( (m = rv.match(/\$([0-9][0-9]?)/)) ) {
                            if (m[1][0] === '0') { m[1] = m[1][1]};  
                            replaceStr += match[m[1]];
                            rv = rv.slice(m[0].length);
                        } else {
                            if (rv[1] === '$') {
                                replaceStr += '$'; 
                            } else if (rv[1] === '&') {
                                replaceStr += match[0];
                            } else if (rv[1] === '`') {
                                replaceStr += str.slice(0, i);
                            } else if (rv[1] === "'") {
                                replaceStr += str.slice(i+match[0].length);
                            }
                            rv = rv.slice(2);
                        }
                
                        j = rv.indexOf('$');
                    }
                    replaceStr += rv;
                } 
                return replaceStr; 
            }
        }
        let newStr = '';
        let last = 0;
        while (matches.length) {
            let match = matches.shift();
            newStr += str.slice(last, match.index);
            newStr += freplace(...match, match.index, str);
            last = match.index + match[0].length;
        }
        newStr += str.slice(last);
        return newStr;
    };
    const split = function split (str, separator, args = {}) {
        const matches = matchAll(str, separator, args);
        if (matches.length == 0) {
            return [str];
        }
        let ret = [];
        ret.lastIndex = matches.lastIndex;
        let last = 0;
        while (matches.length) {
            let match = matches.shift();
            ret.push(str.slice(last, match.index));
            if (args.include) {
                ret.push(match[0]);
            }
            last = match.index + match[0].length;
        }
        ret.push(str.slice(last));
        return ret;
    };
    const chunk = function (str, args={}) {
        return chunkAll(str, {depth:1, ...args}); 
    };
    const chunkAll = function (str, args={}) {
            const maxDepth = args.depth ?? +Infinity;  
            let depth = 0; 
            let last = args.start || 0;
            let ret = [];
            let chain = [ret];
            let cur = ret;
        
            args.push = (str, i , left, right) => {
                depth += 1;
                if (depth <= maxDepth ) {
                    cur.push(str.slice(last, i));
                    let lower = [left, []];
                    lower.start = i;
                    cur.push(lower);
                    chain.unshift(lower);
                    cur = lower[1];
                    chain.unshift(cur);
                    last = i + left.length;
                }
            };
            args.pop = (str, positions, current, insides) => {
                if (depth <= maxDepth) {
                    cur.push(str.slice(last, positions[2]));
                    chain.shift(); // removes middle
                    chain[0].push(str.slice(positions[2], positions[3]) );
                    chain[0].end = positions[3]-1;
                    chain.shift();
                    cur = chain[0];
                    last = positions[3];
                }
                depth -= 1;
            };
            args.end = (i) => {
                cur.push(str.slice(last,i));  
            };
            
        
            let lastIndex = descend({str, ...args});
            ret.lastIndex = lastIndex;
        
            return ret;
    };
    const splitAll = function (str, separator, args={}) {
            const maxDepth = args.depth ?? +Infinity;  
            let depth = 0; 
            let last = args.start || 0;
            let ret = [];
            let chain = [ret];
            let cur = ret;
        
            args.push = (str, i , left, right) => {
                depth += 1;
                if (depth <= maxDepth ) {
                    cur.push(str.slice(last, i));
                    let lower = [left, []];
                    lower.start = i;
                    cur.push(lower);
                    chain.unshift(lower);
                    cur = lower[1];
                    chain.unshift(cur);
                    last = i + left.length;
                }
            };
            args.pop = (str, positions, current, insides) => {
                if (depth <= maxDepth) {
                    cur.push(str.slice(last, positions[2]));
                    chain.shift(); // removes middle
                    chain[0].push(str.slice(positions[2], positions[3]) );
                    chain[0].end = positions[3]-1;
                    chain.shift();
                    cur = chain[0];
                    last = positions[3];
                }
                depth -= 1;
            };
            args.end = (i) => {
                cur.push(str.slice(last,i));  
            };
            separator = getMatch(separator);
            let outer = (args.last === true) ? 'last' : 'first';
            let inner = (args.last === true) ? 'innerLast' : 'innerFirst';
            args[outer] = (substr, i, str) => {
                //DEPTH
                let match = separator(substr, i, str, depth);
                if (match) {
                   cur.push(str.slice(last, i));
                   cur.push(match[0]);
                   last = i+match[0].length;
                   return match[0].length;
                } else {
                    return null;
                }
            };
            args[inner] = (substr, i, str) => {
                if (depth > maxDepth) {return null;}
                let match = separator(substr, i, str, depth);
                if (match) {
                   cur.push(str.slice(last, i));
                   cur.push(match[0]);
                   last = i+match[0].length;
                   return match[0].length;
                } else {
                    return null;
                }
            };
        
            let lastIndex = descend({str, ...args});
            ret.lastIndex = lastIndex;
        
            return ret;
    };


    return {indexOf, lastIndexOf, match, replace, descend, 
        getMatch, makeReplacer,
        allIndexOf, matchAll, replaceAll,
        split, chunk, chunkAll, splitAll,  
        walker:descend, delimiterCatalog};
};

module.exports = {has, makeLineCounter, convertToMap, makeScanners};
