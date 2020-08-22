This is a collection of utility functions and some immediate parsing
functions. Not sure that these should be in their own module or anything, but
we do create one for testing purposes. 

    const has = _"has";
    const convertToMap = _"convert to map";

    const makeLineCounter = _"count newlines" 
    
    const makeScanners = _"scanning";

    module.exports = {has, makeLineCounter, convertToMap, makeScanners};

[litpro/utilities.js](# "save:")

## Has

A simple function that shortens the checking of a key. It also returns false
if it is not an object. 

    function has (obj, key) {
        return (typeof obj === 'object') && 
            Object.prototype.hasOwnProperty.call(obj, key);
    }


## Count Newlines

The idea here is to pass in a string and get a function that will, when given
a number, will give the line and column number and index. It is a live pointer that
increments or (decrements) to the given position, tracking the newlines
appropriately. This is most efficiently used by monotonically changing the
index, but it should be okay to go up or down as one sees fit.  

If an index points to a newline, we return the next line and column of 1. Also
pointer goes to the next one so it is never on a newline when the next call
happens.

We also have a boolean parameter which if true, will report before the newline
instead of after in those cases that pertain to it. 

Newlines are intermediate steps. When we are going up, we increment upper when
we reach the newline and when we go past the newline, we increment linenum.
When we are going down, we decrement 

    function (str) {
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

If pointer starts above i, we go down and decrement. The only snag is if we
end on a newline, then we do not want to decrement since it is when we move
past it that it goes down. 

            while (pointer > i) {
                pointer -= 1;
                if (lower !== upper) {
                    upper -= 1;
                }
                if (str[pointer] === '\n') {
                    lower = upper - 1;
                } 
            }
            
Pointer should be equal to i at this point.

If upper and lower are different, then they should differ by 1. We
want to report the end of the lower line. That is, we consider the newline as
part of the previous line. This also allows us to do slices that will use the
newline position but exclude the newline. 

If newline === 1, then we are at the start and the column is the index plus
one. Otherwise, we count down to the previous newline to get the column
number. 

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


## Scanning

These functions all are replicating the string functions but with the idea of
skipping over enclosed content, unless those are escaped. 

This generates these functions. Some rely on others. 

    function scanning (moreDelimiters ={}) {

        const conreg = (/a/).constructor; //for detecting regex.
    

        let delimiterCatalog;
        _"delimiters"

        const descend = _"descend";
        const getMatch = _"get match";
        const makeReplacer = _"make replacer";
        const indexOf = _"index of";
        const lastIndexOf = _"last index of";
        const match = _"match";
        const replace = _"replace";
        const allIndexOf = _"all indexes";
        const matchAll = _"match All";
        const replaceAll = _"replace All";
        const split = _"split";
        const chunk = _"chunk";
        const chunkAll = _"chunk all";
        const splitAll = _"split all";
    

        return {indexOf, lastIndexOf, match, replace, descend, 
            getMatch, makeReplacer,
            allIndexOf, matchAll, replaceAll,
            split, chunk, chunkAll, splitAll,  
            walker:descend, delimiterCatalog};
    }

### Descend

This walks the string looking for delimiters. It has no intrinsic behavior;
these get passed in as an argument. Other functions should call this, having
prepped everything they compare about. Will assume types are fine other than
having default functions. 

Function top decides on behavior at the top level. The inner function
determines behavior within the descent into delimiters (say wanting to match
inside of it). Both have the
convention that a null return value means to continue through the processing
of looking for delimiters. If it returns something less than 1, then we return
from the function (termination of the whole process). Otherwise, it should
return a positive integer that gets added to i and we continue the loop. There
is also the pop function which is behavior for dealing with the ending of a
delimiter, say for chunking up the delimited expressions. 

Any data that is being created should be done within the functions as closures
to the calling functions. The functions are called in this fashion: terminator
is called to see if it should end (null does not) with the return from descent
being an array of the position and whatever terminator outputs; inner is
called after no delimiter is found (it can be used to track the characters or
advance over stuff, whatever as its return value if not null will affect the
flow); inner is similar to top except it happens in the delimiters; push is
called when a delimiter is found with call of str, start, left, right; pop is
called when a delimiter is finished with a call of str, positions, delimiter,
and other delimiters in the level; end is called if we reach the end of the
string.


    function descend ({ 
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

        _":prep terminator" 

        if (!Array.isArray(delimiters) ) {
            throw "delimiters should be presented in the form `[key, obj]`";
        }

Now we proceed to do the processing. 

        const n = str.length;
        let insides = []; // pop/push of delimiters
        const originalDelimiters = delimiters;

        for (let i = start; i < n; i += 1) {
            let substr = str.slice(i);
            
            {
            const control = first(substr, i, str);
            _":flow" 
            }

            _":check for terminator"
            _":check for delimiter" 
            
            if (delim) {
                let lead = delim[1].lead;
                _":check for escaping"  
            }

            if (!delim) {
                const control = last(substr, i, str);
                _":flow"
                continue;
            }
            
            { //delimiter has been found, not escape
            
                _":descend into delimiters"
                

It is possible that we did not empty out the delimiters. So we have problems
and this is an attempt to report it. Insides first element is the starting
delimiter and the second entry is the i that started it. 

                if ( insides.length ) {
                    throw `ending delimiters not found:  [${insides.join(',')}] not found in:\n  ${str.slice(insides[0][2])}`;
                }

            }

        }
        end(n); 
        return n; //not found 
    }


[flow]()

This has the basic result of the functions being able to advance the loop
(return a number greater than 1), return out of the function (return a number
less than 1), or continue with the loop (non-number return, generally null). 

    if (typeof control === 'number') {
        if (control < 1) {
            end(i);
            return i;
        } else {
            i += control-1; // the loop is going to add 1
            continue;
        }
    }



[check for delimiter]()

delimiters is an array of `[leftdelim, object details]`

    let delim = delimiters.find( arr => {
        const left = arr[0];
        return ( left === substr.slice(0, left.length) );
    });


[check for escaping]()

There is a leftDelim. Now we check for escaping. The escape could be an empty
string, meaning there is no escaping.  

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

[descend into delimiters]()

This is where the interesting stuff is. We have a left delimiter which tells
us to look for the right delimiter. We may have different behavior in descent
land so we use the function inner for that behavior. We then have a function
for popping out of the delimiter (for chunking). 

    let [left, right] = delim;
    insides.push([left, right, i]);
    push(str, i, left, right);  // no effect on anything
    i += left.length;
    let current = insides[0];
    let cdl = right.end.length;
    _":update delimiters"
    while (insides.length && (i < n) ) {
        let substr = str.slice(i);
        
        {
        const control = innerFirst(substr, i, str, current, insides); 
        _":flow| sub control-1, control"  //not a for loop here so need +1
        }

        _":ending delimiter"

        _":check for delimiter"
        
        if (delim) {
            let lead = delim[1].lead;
            _":check for escaping"
        }

        if (!delim) {
            let control = innerLast(substr, i, str, current, insides); 
            _":flow | sub control-1, control"
            i+=1; 
            continue;
        }

Next delimiter has been found. We need to update current, left, right, and
push it on to the insides. We also need to modify the delimiters being looked
at. 

        [left, right] = delim;
        current = [left, right, i]; 
        insides.push(current);
        push(str, i, left, right);
        i += left.length;
        cdl = right.end.length;
        _":update delimiters"

    }
    
[update delimiters]()

    if (right.delimiters) {
        delimiters = delimiterCatalog[right.delimiters];
    }

[ending delimiter]()

Here we deal with the ending delimiter. 

        if (substr.slice(0, cdl) === right.end) { //end delimiter found
            let rightFound = true;
            let escape = right.escape;
            _":check for escaping | sub lead, escape, delim, rightFound"
           
            if (rightFound) {
                insides.pop();
                let leftPos = current[2];
                let positions = [leftPos, leftPos+left.length, i, i +cdl]

                pop(str, positions, current, insides);
                
Note insides should have the current inside of it. So don't pop!

                if (insides.length !== 0) {
                    current = insides[insides.length-1];
                    [left, right] = current; 
                    _":update delimiters"
                } else {
                    delimiters = originalDelimiters;  
                }

                i += cdl;
                if (insides.length === 0) { i -= 1;} // for loop increments
                continue;
            }
        }

[prep terminator]()

This 

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

[check for terminator]()

This is just like the match length; just different names and break condition.
Terminators are looked for only on the top level. 

    {
        const t = terminator(substr, i, str);
        if (t) {
            end(i);
            return i;
        }
    }

### Get Match

We want to be able to create functions from strings and regexes that will be
appropriate in the control flows. 

This converts strings and regexs to functions that return the matched value if
found; null if not. 


    function (value ) {
        let vtype = typeof value;
        if (vtype === 'function') {
            return value;
        }
        if (vtype === 'string') {
            _":string"
        } else if ( (vtype === 'object') && (value.constructor === conreg) ) {
            _":regex"
        } else {
            throw `Value must be string, function, or regex: ${value}`;
        }
    }

[string]() 

Strings are designed for exact matches. 

    let vl = value.length;
    return (str) => {
        if (str.slice(0,vl) === value) {
            return [value];
        } else {
            return null;
        }
    };

[regex]()

Returns a matching value. Ignores groupings, basically. Ensures it only checks
at the beginning of a string.

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
    


### Common Search

The code is almost the same each instance except for INITIAL and MATCH 

    function (input, args) {
        const INITIAL = args[0] ?? -1;
        const MATCH = args[1] ?? 'ret = i;\n return -1;';
        const DESCEND = args[2] ??  'descend({ str, ...args });';


    return `function (str, searchValue, args = {} ) {
        searchValue = getMatch(searchValue);
        let ret = ${INITIAL};
        const flow = function (substr, i, str) {
            const match = searchValue(substr, i, str);
            if (match) {
                ${MATCH}
            } else {
                return null;
            }
        }
        if (args.last === true) {
            args.last = flow;
        } else {
            args.first = args.first || flow;
        } 
        ${DESCEND}
        return ret;
    }`;

    }

[commonsearch](# "define:")


### Index Of

This takes in a str, searchValue, and args that can alter the behavior of the
descend function. The searchValue can be a string, a regex, or a function that
returns the match of interest (match as done by exec). 

To make searchValue irrelevant, pass in a function in `first` that will control
the flow. If a match could be mistaken for a delimiter and one wants to choose
the delimiter path instead, pass in last=true to have the match checked after
delimiter checking. A terminator can also be used to stop before the end of
the string if no match is found before that. It can be a string, regex, or a
function that returns truthy for a match. 

    _"|commonsearch"

[ret]()

This records the index and then sends -1 which is the break signal. 

    ret = i;
    return -1;

[descend]()


    descend({ str, ...args });


### Last Index Of

This goes through the whole string until it ends. The last successful match
index is what is reported. If "endIndex" is passed into args, then no matching
allowed after start. 

Because of endIndex, this is sufficiently different to not bother with sub

    function (str, searchValue, args = {}) {
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
    }

### Match 

This is like indexOf except it returns the match as if it was a regex: an
array where the first element is the matched string and the rest are
subgroups. The array also has index of the location where the match starts. 


    _"|commonsearch null, _':ret', _':lastIndex' "
    

[ret]() 

We return a match array. 

    ret = match;
    match.index = i;
    match.input = str;
    return -1; //breaks further search

[lastIndex]()

Match returns an array and so we can attach the lastIndex to it. 

    let lastIndex = descend({str, ...args});
    ret.lastIndex = lastIndex;

### Replace

This takes in a search value and a replacement string or function. It
functions similar to the index ones, but replaces the string. Its return is an
array with the new string as the first element and the index i that points to
the first character after the replacement string (or -1 if end of string).
This allows for replaceAll (and maybe other uses) to continue processing after
the first replacement.

The replacment string or function should function identically to the replace
string action. 


    function (str, searchValue, replaceValue,  args = {} ) {
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
    }

### Make Replacer

This takes in a replacement string or replacement function and returns a
function that will do the replacement when given the string, the match, and
the match index. We use the same semantics as javascript's replacement
parameters and function calls

    function (rv) {  //rv is replaceValue
        const trv = typeof rv;
        if (trv === 'string') {
            return (str, match, i) => {
                let replaceStr = '';
                _":make replacement str"
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
    }


[make replacement str]()

We want to implement the replacement algorithm of string replacement values in
js replacement. Namely dollar signs are special. 

    let j = rv.indexOf('$');
    if (j === -1) {
        replaceStr = rv;
    } else {
        while ( (j !== -1) && (rv) ) {
            replaceStr += rv.slice(0, j);
            rv = rv.slice(j);
            let m;
            if ( (m = rv.match(/\$([0-9][0-9]?)/)) ) {

The if here allows for the form 0# to be interpreted as #. This is that if one
wants to replace $3 and have, say, a 4 following that, one can by doing $03.
Otherwise, it would be interpreted as replacing 34. 

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



### All indexes

This finds all possible index matches, including overlapping matches. It
always returns an array, possible empty. 

    _"|commonsearch [], _':ret' "

[ret]()

We push the indices on our return array. If we want to find all possible matches
then we pass in all=true in args and here we return 1 to just advance by 1
character at a time. Otherwise, we skip over the match. 

If the matched substring is length 0, then this will end the search. Not sure
if that's a good thing or not. It's kind of weird matching with no match, but
at least no infinite loop here. 


    ret.push(i);
    return (args.all) ? 1 : match[0].length; 
     
### Match All

This returns all matches as an array of match objects from match. (not like
the global match of regex)

By default, this returns  matches that do not overlap. Pass in all=true to get
every possible match. 

    _"|commonsearch [], _':ret', _'match:lastIndex' "

[ret]() 

    ret.push(match);
    match.index = i;
    match.input = str;
    return (args.all) ? 1 : match[0].length;



### Replace All

This replaces all matches (no overlaps!) with the replacement string, skipping
over delimited quantities. 

    function (str, search, replace, args) {
        const matches = matchAll(str, search, args);
        if (matches.length === 0) {
            return str;
        }
        let freplace = replace;
        if (typeof replace === 'string') {
            freplace = (...args) => {
                _":make string replacer"
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
    }

[make string replacer]()

    let match = args.slice(0, -2);
    let [i, str] = args.slice(-2);
    let rv = replace;
    let replaceStr = ''; 
    _"make replacer:make replacement str" 
    return replaceStr; 

### Split

This will split a str at a top-level based on the  separator (string,
function, regex, same as search values in others). 

We get a match all and then we slice the string up accordingly based on those
matches. If the optional argument  

If the args object has `include: true`, then it will include the separators in
between. 


    function split (str, separator, args = {}) {
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
    }



### Chunk

This is just chunkAll with a depth of 1. 

    function (str, args={}) {
        return chunkAll(str, {depth:1, ...args}); 
    }

### Chunk All 

This breaks a given string into its top level pieces in terms of the
delimiters returning an array with strings being the non-delimited parts and
the delimited stuff being an array with three elements: left delimiter,
middle (which may also be broken up), and right delimiter.

We will use the pop and push functions in descend. These indicate when we hit
delimiters. We will generate the return array as we go along. We will have a
reverse ordered chain of arrays to put stuff in. 

Depth stops the breaking up of the sublevels. 


    function (str, args={}) {
        _"common chunk | sub CHAR,echo('') "
    }

### Common Chunk

This is the common code for chunk all and split all. We mainly needed to have
different function arguments and the inclusion of first/innerFirst
(last/innnerLast)

        const maxDepth = args.depth ?? +Infinity;  
        let depth = 0; 
        let last = args.start || 0;
        let ret = [];
        let chain = [ret];
        let cur = ret;

        args.push = _":push";
        args.pop = _":pop";
        args.end = _":end";
        CHAR

        let lastIndex = descend({str, ...args});
        ret.lastIndex = lastIndex;

        return ret;


[push]()

We add in the slice to the left of the left, create a new array with left
delimiter and a new array to represent. The second item of that array is a new
array to get the contents; this becomes the current.

We do two shifts so that as we pop out, we can put in the right delimiter. 

    (str, i , left, right) => {
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
    }

[pop]()

Positions is of the form [start left, end left, start right, end right]. So we
can slice from the last to the start of right to get the remainder of that
bit. Then we slice from start right to end right to get right which we put on
the higher level than the middle array. 

    (str, positions, current, insides) => {
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
    }


[end]() 

    (i) => {
        cur.push(str.slice(last,i));  
    }

### Split All

This will split everything up and chunk everything though a depth can be
provided that stops delving farther. The main difference between chunkAll and
splitAll is a little action on the processing of the 

    function (str, separator, args={}) {
        _"common chunk | sub CHAR, _':character check'"
    }


[character check]()

    separator = getMatch(separator);
    let outer = (args.last === true) ? 'last' : 'first';
    let inner = (args.last === true) ? 'innerLast' : 'innerFirst';
    args[outer] = _":outer";
    args[inner] = _":inner";

[outer]() 

Matching means we have found a separator. So we slice from the last position
to the start of the match to get the previous text. We then add the match and
move last. 

    (substr, i, str) => {
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
    }

[inner]() 

This is the same as outer except we only do this when depth is not past max
depth.

    _":outer | sub //DEPTH, echo('if (depth > maxDepth) {return null;}') "
 


### Walker

This is like chunk and chunkAll, but we have a function that executes when
there would be an array push. This allows us to do stuff as we descend, if we
wish. 

This is just the descend function. Here might be a good place to record stuff
on using it. 

## Convert to map

This converts objects into array maps: `{key:value}` becomes `[key, value]`
with it sorted by key length by default or by a custom passed in sort. 

    function (obj, sort = (a,b) => b.length - a.length ) {

        if (typeof obj !== 'object') {
            throw "not convertable to an array map: " + (typeof obj);
        }
        if (Array.isArray(obj) ) {
            return obj;
        } 

        return Object.keys(obj).
            sort(sort).
            map( key => [key, obj[key]] );
    }

## Delimiters


Each beginning delimiter comes with an object whose keys can determine what
happens next: 

* confirm. This is a function that confirms the lead delimiter is a delimiter.
  Maybe it can be escaped, maybe there is a regex that should be applied. If
  it returns a falsy value, then it is not a delimiter. If it returns
  something else, it could be passed along? 
* delimiters. This is an object of delimiters that shall be used. 
* end. This is the ending symbol. 
* escape. This is a function that functions similar to the confirm but for the
  ending delimiter. 

We supply the object as a default object on the function itself to access it
internally. 

    {
        const common =  _":common";
        const javascript = _":javascript";
        const litproTop = _":litpro top level";
        const litpro = _":litpro";
        _":litpro variants | sub QQ, qq, 0000, 0022"
        _":litpro variants | sub QQ, q, 0000, 0027"
        _":litpro variants | sub QQ, bt, 0000, 0061"
        const litpar = _":literate parentheses"


        delimiterCatalog = {none: {}, common, javascript, 
            litproTop, litpro, litproqq, litproq, litprobt,
            litpar,
            ...moreDelimiters
        };


We actually want these objects to be array-maps `[key, val]` ordered by size
of key. 

        
        Object.keys(delimiterCatalog).forEach( lang => {
            delimiterCatalog[lang] = convertToMap( delimiterCatalog[lang]);
        } );
    }


[javascript]()

    { 
        ...common,
        '//': {
            end: '\n', 
            delimiters : 'none'
        }, 
        '/*' : {
            end: '*/', 
            delimiters : 'none'
        }
    }


[common]()

    { 
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
    }

[litpro top level]()

We chunk over underscore-quote combinations. But then on sub-levels we go on
in deep. 

    {
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
    }

[litpro]()

The quotes need to be excluded for the corresponding litpro if
that is what we are in. Thus, we take the litpro as a template and then modify
as needed. The parentheticals need to take delimiters of  `litpro` as the
subvairants delete a quote character.  


    {
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
    }



[litpro variants]()

We take a copy of the litpro descenders. We delete the quote character 

    const litproQQ = { ...litpro};
    delete litproQQ['\u0000'];

[literate parentheses]() 

The idea here is that we want to grab parenthetical expressions that can have
lots of subexpressions, but the top level is just parentheses. This is useful
in parsing the top level transforms and directives. 

    { 
        '(' : {
            end: ')',
            delimiters: 'litpro'
        }
    }

## Tests

This is where we setup tests for this thing. 
    
    function (input) {
        return `const tap = require('tap'); 
    const myutils = require('../index.js'); 

    const main =  async function () {
        ${input}
    };

    main();`; 
    }


[utiltest](# "define:")


[utilities/tests/](# "cd: save")

### Test Has

Has is a simple function to detect if an object has a property. Optional
chaining probably reduces the need for this. 

    tap.test('has', async(t) => {
        t.ok(myutils.has({a:5}, 'a'));
        t.notOk( myutils.has({a:5}, 'b'));
    });

[has.js](# "save: | utiltest")
    
### Test Descend

This is a test to make sure the basic descend works. 

    tap.test('f=descend', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];
        s.descend({
            str : 'This',
            last : (a) => {subs.push(a); return 2;}
        });
        t.equal(subs.join(''),'Thisis', 'skipping by 2');

        {
        let a = [];
        let ret = s.descend({
            str : 'This(5)',
            terminator : 's',
            last : (c) => {a.push(c[0]); return null;}
        });
        t.equals(ret, 3, 'return value');
        t.equal(a.join(''), 'Thi', 'checking terminating');
        }

        {
        let a = [];
        s.descend({
            str : 'This(5)ab',
            last : (c) => {a.push(c[0]); return null;}
        });
        t.equal(a.join(''), 'Thisab', 'skipping over delimiter');
        }

        {
        let a = [];
        let last = 0;
        let plevel = 0;
        let str = 'i(5+2*[new]+3)+9';
        s.descend({
            str, 
            push : (str, start, left) => {
                a.push(str.slice(last, start) );
                last = start+left.length;
                plevel += 1;
                return null;
            },
            pop : (str, positions) => {
                a.push(str.slice(last, positions[2]));
                last = positions[3];
                plevel -= 1;
                return null;
            },
            end : () => {
                a.push(str.slice(last));
                return null;
            }
        });
        t.equal(a.join(','), 'i,5+2*,new,+3,+9', 'segments');
        }
        
    });

[descent.js](# "save: | utiltest")


### Index Of Test

IndexOf takes a search string and tries to find the search value not inside a
parenthetical, etc. 

    tap.test('f=indexOf', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.indexOf('c(ob)ool', 'o');
        t.equals(a, 5, 'str'); }

        { a = s.indexOf('c(ob)ool', /^[aeiou][^aeiou]/);
        t.equals(a, 6, 'reg'); }

        { a = s.indexOf('c(ob)ool', /[aeiou][^aeiou]/);
        t.equals(a, 6, 'reg not start'); }

        {a = s.indexOf('c(ob)oolioo', (str, i) => {
            if ( (str.slice(0,2) === 'oo') && (i> 7) ) {
                return ['oo'];
            } else {
                return null;
            }
        });
        t.equals(a, 9, 'function index trial'); }

        { a = s.indexOf('c(ob)ool', 'a');
        t.equals(a, -1, 'no match'); }

        { a = s.indexOf('c(ob)oolioo', 'i', {terminator:'l'});
        t.equals(a, -1, 'no match terminated'); }

        { a = s.indexOf('c(ob)oolioo', 'i', {terminator:'i'});
        t.equals(a, 8, 'match checked before terminator'); }

        { a = s.indexOf('c(ob)oolioo', 'i', {terminator:'i', last:true});
        t.equals(a, -1, 'match checked after terminator so no match'); }

        { a = s.indexOf('c(o[b{0}](o)o)ool', 'o');
        t.equals(a, 14, 'many nested brackets'); }

        { a = s.indexOf('ooo', 'oo' );
        t.equals(a, 0, 'simple match'); }

        { a = s.indexOf('ooo', 'oo', {start:1} );
        t.equals(a, 1, 'starting later'); }

        { a = s.indexOf('ooo', 'oo', {start:2} );
        t.equals(a,-1, 'no match due to starting to far in'); }
    });

[indexof.js](# "save: | utiltest") 


### Last Index Of Test

Index of 

    tap.test('f=lastIndexOf', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.lastIndexOf('c(ob)oo(o)l', 'o');
        t.equals(a, 6, 'last index'); }

        { a = s.lastIndexOf('c(ob)oo(o)l', 'o', {lastIndex: 5} );
        t.equals(a, 5, 'last index with cutoff'); }

    });

[lastindexof.js](# "save: | utiltest") 


### Match Test

Index of 

    tap.test('f=match', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.match('c(ob)oo(o)lio', /(i)o/);
        t.equals(a[0], 'io', 'match substring');
        t.equals(a[1], 'i', 'match group');
        t.equals(a.index, 11, 'index');
        t.equals(a.input, 'c(ob)oo(o)lio', 'input');
        t.equals(a.lastIndex, 11, 'add last index');
        }


    });

[match.js](# "save: | utiltest") 

### Replace Test

    tap.test('f=replace', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.replace('c(ob)oo(o)lio', /(i)o/, 'o,$1t');
        t.equals(a, 'c(ob)oo(o)lo,it', 'replace using first group');
        }


    });

[replace.js](# "save: | utiltest") 


### allIndexOf Test

    tap.test('f=allIndexOf', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.allIndexOf('c(ob)oo(o)lio', 'o');
          t.equals(a.join(','), '5,6,12', '3 o outside of par');
        }


    });

[allindexof.js](# "save: | utiltest") 


### matchAll Test

    tap.test('f=matchAll', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.matchAll('c(ob)oo(o)lio', /(o)/);
        t.equals(a.length, 3, '3 o outside of par');
        t.equals([a[0].index, a[1].index, a[2].index].join(','), '5,6,12', 'check index');
        t.equals(a[0][0]+a[1][0]+a[2][0], 'ooo', 'main match');
        t.equals(a[0][1]+a[1][1]+a[2][1], 'ooo', 'main match');
        }


    });

[matchall.js](# "save: | utiltest") 


### replaceAll Test

    tap.test('f=replaceAll', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.replaceAll('c(ob)oio(o)lio', /(i)o/, 'o,$1t');
        t.equals(a, 'c(ob)oo,it(o)lo,it', 'flip i and o add t');
        }


    });

[replaceall.js](# "save: | utiltest") 


### split Test

    tap.test('f=split', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.split('c(o,b)o,o,f(o),lio', ',');
        t.equals(a.join('~'),  'c(o,b)o~o~f(o)~lio', 'split comma string');
        }

        { a = s.split('c(o,b)o,o,f(o),lio', /\,/);
        t.equals(a.join('~'),  'c(o,b)o~o~f(o)~lio', 'split comma reg');
        }

        { a = s.split('c(o,b)o,o.f(o),lio', /^(\,|\.)/);
        t.equals(a.join('~'),  'c(o,b)o~o~f(o)~lio', 'split comma period reg');
        }

        { a = s.split('c(o|b)o|o:=>f(o)|lio', /^(\||\:\=\>)/);
        t.equals(a.join('~'),  'c(o|b)o~o~f(o)~lio', 'split pipe arrow');
        }

        { a = s.split('c(o|b)o|o:=>f(o[:=>])|lio', /^(\||\:\=\>)/, {include:true});
        t.equals(a.join('~'),  'c(o|b)o~|~o~:=>~f(o[:=>])~|~lio', 'split pipe arrow include');
        }

        { a = s.split('c(o\n|b)o|o:=>f(o[:=>])\na|lio', /^(\||\:\=\>)/, 
            {include:true, terminator:'\n' });
        t.equals(a.join('~'),  'c(o\n|b)o~|~o~:=>~f(o[:=>])\na|lio', 'split pipe arrow include terminator');
        }

        { f = (substr) => {
            if (substr[0] !== '\n') {
                return null;
            } else {
                if (substr.match(/\n[ \t]*(\||\:\=\>)/)) {
                    return null;
                } else {
                    return true;
                }
            }

         };
        a = s.split('c(o\n|b)o\n  |o:=>f(o[:=>])\na|lio', /^(\||\:\=\>)/, 
            {include:true, terminator:f });
        t.equals(a.join('~'),  'c(o\n|b)o\n  ~|~o~:=>~f(o[:=>])\na|lio', 'split pipe arrow include terminator function');
        }

    });

[split.js](# "save: | utiltest") 


### chunk Test

    tap.test('f=chunk', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.chunk('c(ob)oo(o)lio');
        t.equals(JSON.stringify(a), 
            '["c",["(",["ob"],")"],"oo",["(",["o"],")"],"lio"]', 'two depth 1');
        }
        { a = s.chunk('c(o[3]b)oo([{o}])lio');
        t.equals(JSON.stringify(a), 
            '["c",["(",["o[3]b"],")"],"oo",["(",["[{o}]"],")"],"lio"]', 'depth 3');
        }


 
    });

[chunk.js](# "save: | utiltest") 


## chunkAll Test

    tap.test('f=chunkAll', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.chunkAll('c(ob)oo(o)lio');
        t.equals(JSON.stringify(a), 
            '["c",["(",["ob"],")"],"oo",["(",["o"],")"],"lio"]', 'two depth 1');
        }
       { a = s.chunkAll('c(o[3]b)oo([{o}])lio');
        t.equals(JSON.stringify(a), 
            '["c",["(",["o",["[",["3"],"]"],"b"],")"],"oo",["(",["",["[",["",["{",["o"],"}"],""],"]"],""],")"],"lio"]', 'depth 3');
        }
    });

[chunkall.js](# "save: | utiltest") 

## splitAll Test

    tap.test('f=splitAll', async (t) => {
        const s = myutils.makeScanners();
        let subs = [];

        { a = s.splitAll('c(o+b)o+o(o)lio', '+');
        t.equals(JSON.stringify(a), 
            '["c",["(",["o","+","b"],")"],"o","+","o",["(",["o"],")"],"lio"]', 'two depth 1');
        t.equals(a[1].start, 1, '1');
        t.equals(a[1].end, 5, '5');
        t.equals(a[5].start, 9, '9');
        t.equals(a[5].end, 11, '11');
        }

       { a = s.splitAll('c(o[3]b)oo([{o+o}])lio', /\+/);
        t.equals(JSON.stringify(a), 
            '["c",["(",["o",["[",["3"],"]"],"b"],")"],"oo",["(",["",["[",["",["{",["o","+","o"],"}"],""],"]"],""],")"],"lio"]', 'op found deeper');
        }

       { a = s.splitAll('c(o[3]b)oo([{o+o}])lio', /\+/, {depth:1});
        t.equals(JSON.stringify(a),
            '["c",["(",["o[3]b"],")"],"oo",["(",["[{o+o}]"],")"],"lio"]', 'deeper op ignored');
        }

        {a = s.splitAll('dude(a,,b)', ',', {include:true});
        t.equals(JSON.stringify(a), '["dude",["(",["a",",","",",","b"],")"],""]', 'split commas with nothing in between');
        }

        {a = s.splitAll('dude ; fail', ',', {terminator:';'});
        t.equals(JSON.stringify(a), '["dude "]', 'getting full terminator');
        }

        {a = s.splitAll('s dude ; fail', ',', {start:2, terminator:';'});
        t.equals(JSON.stringify(a), '["dude "]', 'getting full terminator');
        }
    });

[splitall.js](# "save: | utiltest") 


### Line counter

    tap.test('f=newlineCounter', async (t) => {
        const mlc = myutils.makeLineCounter;
        const j = (arr) => JSON.stringify(arr);
        { 
            let lc = mlc('ab\ncd\nefg\n');
            a = lc(3);
            t.equals(j(a), '[2,1,3]', '3-c');
            a = lc(7);
            t.equals(j(a), '[3,2,7]', '7-f');
            a = lc(9);
            t.equals(j(a), '[3,4,9]', '9new');
            a = lc(9);
            t.equals(j(a), '[3,4,9]', '9again');
            a = lc(0);
            t.equals(j(a), '[1,1,0]', '0');
            a = lc(20);
            t.equals(j(a), '[4,1,10]', 'beyond string length');
            a = lc(-1);
            t.equals(j(a), '[1,1,0]', 'negative number');
            a = lc(2);
            t.equals(j(a), '[1,3,2]', 'first newline');
            a = lc(1);
            t.equals(j(a), '[1,2,1]', '1-b');
            a = lc(3);
            t.equals(j(a), '[2,1,3]', '3-c');
            a = lc(2);
            t.equals(j(a), '[1,3,2]', 'newline 2');
            a = lc(5);
            t.equals(j(a), '[2,3,5]', 'newline 5');
            a = lc(5);
            t.equals(j(a), '[2,3,5]', 'newline 5');
            a = lc(9);
            t.equals(j(a), '[3,4,9]', 'newline 9');
        }
    
        { 
            let lc = mlc('ab\n\ncd\ne');
            a = lc(2);
            a = lc(6);
            t.equals(j(a), '[3,3,6]', 'pre newline 6');
        }



    });

[linecounter.js](# "save: | utiltest") 

### Test Runner

Since tap (and eslint) choke on the new ?? operator, we have a script runner.
It will abort on failures

    #!/bin/bash
    set -e 

    node tests/descent.js
    node tests/indexof.js
    node tests/lastindexof.js
    node tests/match.js
    node tests/replace.js
    node tests/allindexof.js
    node tests/matchall.js
    node tests/replaceall.js
    node tests/split.js
    node tests/chunkall.js
    node tests/splitall.js

[../runtests](# "save:")

