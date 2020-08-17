# TWCSS 


This exports a little module 

    const {has, makeLineCounter, convertToMap, makeScanners} = require('./utilities.js');

    const s = makeScanners();
    
    let common = twcssCommon();
    
    let breakReg = /^([A-Z]{2,})/;

    module.exports = _"command";

    _"twcss replace"

    _"twcommon::"

[twcss.js](# "save:")

[twcommon](twcommon.md "load:")


## Command

This is tailwind inspired constraint for css. It is a very light weight
syntax where we write css as normal, but if we want to use a named property
in the tw style, we write it without using any colons. But we do use
semicolons. So if no colons, then we process it in the following way:
no double dashes, then we do straight up lookup and replacement in the
tailwind dictionary. If we have double dashes, then we want different
behavior based on different sizes. So we create the breakpoint stuff
programmatically and we split on commas after the double dashes to get
behavior. It will be in ascending use.  

The args could have a json object which contains new keys or overrides stuff. 


    function twcss (input, args) {

        let twcss;
        _":setup overwrite"

        let chunks;
        _":split the chunks" 

        let replaced;
        _":tailwindish replacement"

        let text = '';
        _":make breakpoints"

        return text;
    }




[split the chunks]() 

This is basically css. That means we can split on the end of curly brackets,
get the early part as being before the opening curly bracket, and then split
on semicolons (done later). It is also not nested so that's nice. 

    chunks = input.split('}');
    chunks.pop(); // meaningless last bit after last bracket
    chunks = chunks.map( (chunk) => {
            let two = chunk.split('{'). //}
                map(el=> el.trim());
            return two; 
        });

[tailwindish replacement]() 

First, we split on semicolons, but only on a top depth. We have in mind
allowing for `[grid;center]` as an option for a screen size breakpoint. That
is, multiple rules in a single mindset, that then gets dealt with elsewhere. 

After splitting on top-level semicolons, we do a variety of things: 

1. Check for leading double dash. If there is, then this indicates we have
   multiple breakpoints without a common prefix in tw. In this case, we split
   on commas on the top-level something which is not used in css (commas are
   used in parentheticals, but separating top-level stuuf is just done by
   spaces, not commas). Our commas indicate breakpoints namely,  mobi, small,
   med, lg, xl. These are min-widths so the first will work regardless.
   Adding to the complexity, we can either rely on positing (as given in the
   list above) or we can do Two letter cap code to indicate: SM, MD, LG, XL,
   TY (tiny, mobi). Position and the two letter code can work, but that's kind
   of messy. Best to use one or the other. This level can also have square
   brackets to have multiple properties bundled together. 
2. Next up is if it is a regular property. We can do a simple deduction based
   on colons. If there is a colon, then we move on. 
3. Next up is something which will have a series of dashes. At any point, it
   could be a double dash which then lead to a split into separate paths. All
   of this is tailwind syntax. prop-mod1-mod2-... leads to looking up the prop
   in the object, grabbing the entry under "=" as the leading term (or if the
   thing is a string, then it is just that (no mods). Once the = is grabbed,
   we then descend the mods until we get to a final value. If a prop needs
   more than one word, camelCase should be used. 

---
        
    replaced = chunks.
        map( ([sel, propstr]) => {
            //console.log(sel, propstr, s.split(propstr, ';'));
            let props = s.split(propstr, ';').
                map(prop => prop.trim()).
                map( (prop) => {
                    if (prop.slice(0,2) === '--') {
                        _":leading double dash"
                        return breaks;
                    } else if ( prop.includes (':') ) {
                        return prop; // normal prop so ignore
                    } else {
                        let ddInd = prop.indexOf('--');
                        if (ddInd !== -1 ) {
                            _":embedded double dash"
                            return breaks;
                        } else {
                            return twReplace(prop, twcss);
                        }
                    }
                });
           return [sel, props];
        });



[leading double dash]()

A leading double dash indicates that we have breakpoint considerations. These
are separated by commas. Within each comma, we use square brackets to indicate
when there are multiple properties for that breakpoint/selector at one
conceptual level. We also can have a leading double character toggle for
the breakpoints. 

BAD FORM: el is used in multiple times, overlapping definition.
    
    let breaks = s.split(prop.slice(2), ',').
        map( el => el.trim()).
        map( (el) => {
            let brek;
            if ( breakReg.test(el) ) {
                brek = el.slice(0,2);
                el = el.slice(2).trim();
            } else {
                brek = '';
           }
            
            let propstr;
            if (el[0] === '[') {
                el = el.slice(1, -1);
                propstr = el.split(';').
                    map( el => el.trim() ).
                    map( el => {
                        if (el.includes(':') ) {
                            return el;
                        } else {
                            return twReplace(el, twcss);
                        }
                    }).
                    join(';');
            } else {
                if (el.includes(':') ) {
                    propstr = el;
                } else {
                    propstr = twReplace(el, twcss);
                }
            }
            if (propstr.slice(-1) === ';') {
                propstr = propstr.slice(0, -1);
            } //make sure no ending semicolons for later joining

            return [brek, propstr];

    });


[embedded double dash]()

This is similar to the leading double dash, but easier in that it is just a
single tw prop being split into variants. 

    let beginning = prop.slice(0, ddInd);
    let ending = prop.slice(ddInd+2);
    let breaks = s.split(ending, ',').
        map( el => el.trim()).
        map( (el) => {
            let brek;
            if ( breakReg.test(el) ) {
                brek = el.slice(0,2);
                el = el.slice(2).trim();
            } else {
                brek = '';
           }
            
           let propstr = twReplace(beginning + '-' + el, twcss);

           return [brek, propstr];
    });



[make breakpoints]() 

The second element is now either a string of proper props or is an array that
contains the final pieces to be strung together into different breakpoints. So
we need to media queries. If it is an array, then each element of the array is
itself a two element array of [break, props]. An empty string break refers to
the default break (mobi and up). 

For a given selector, we create a breaks object 

    replaced.forEach( ([selector, props]) => {
        let breaksObj = { '' : [] };
        props.forEach( (propOrBreaks) => {
            if (Array.isArray(propOrBreaks) ) {
                propOrBreaks.forEach( ([brek, props]) => {
                    if (!props) { return ; } 
                    if (!has(breaksObj, brek) ) {
                        breaksObj[brek] = [];
                    } 
                    breaksObj[brek].push(props);
                });
            } else if (propOrBreaks) {
                breaksObj[''].push(propOrBreaks);
            }
        });
        
        Object.keys(breaksObj).
            forEach( (key) => {
                if (key) {
                    let body = breaksObj[key].join(';');
                    if (!body) {return;}
                    text += twReplace( key, twcss) + '{' ;
                    text += selector + '{' + body + ';}';
                    text += '}';
                } else {
                    let body = breaksObj[''].join(';');
                    if (!body) {return;}
                    text += selector + '{' + body + ';}'; 
                }
        });

    });


[setup overwrite]()

We are constructing an array of lookups. It just seems easier. 

    twcss = args.map( (more) => {
        if (typeof more === "string") {
            try {
                more = JSON.parse(more);
            } catch (e) {
                console.log("Failed to understand more", e);
                more = {};
            }
        }
        return more;
    });
    twcss.unshift(common);

    


### Twcss Replace

This expects a single tw style property. It splits it on dashes and then goes
along the twcss array variable, looking at each object for the resolution. The
first word in a split is looking for a string under the '' empty key. 

We have two things we are looking for so we will go through the whole array
each time, overwriting as go along. 

    function twReplace (twprop, twcss) {
        if (!twprop) {
            console.log('empty');
            return ;
        } 
        let pieces = twprop.split('-');
        let first = pieces.shift();
        let last = pieces.pop();
        let value = '';
        let prop = '';
        let static = '';
        let n = twcss.length;
        for (let i = 0; i < n; i += 1) {
            let obj = twcss[i];
            if (obj[first]) {
                let cur = obj[first];
                if (typeof cur === 'string') {
                    static = cur;
                    continue;
                }
                if (cur['']) {
                    prop = cur[''];
                } 
                let success = pieces.every( (el) => {
                    if (cur[el]) {
                        cur = cur[el];
                        return true;
                    } else {
                        return false;
                    }
                });
                if (success) {
                    value = cur[last] || value;
                }   
            }
        }
        //console.log(twprop, 'static:'+ static + '.', prop, value);
        if (static) {
            return static;
        } else if (value) {

We allow various behaviors based on the type of thing prop is, the most
general being a function value which can do anything with the value; the other
forms (string, array, object lookup) are just conveniences. Probably really no
need for there to be an object lookup since this is one...

            if (!prop) {
                return value;
            } else if (typeof prop === 'string') {
                return prop  + value;
            } else if (typeof prop === 'function') {
                return prop(value);
            } else if (Array.isArray(prop) ) {
                return prop.join(value + ';') + value;
            } else {
                return prop[value] ?? '';
            }
        } else {
            console.log('property not found: ' + twprop);
            return '';
        }
    }



### Twcss example

    div {
        background-image: url;
        px--4,SM 6,MD 10;
        --margin:30px,MD margin:100px;
        --[margin-top:30px;margin-bottom:40px],
            MD [margin-top:50px; margin-bottom:70px],
            LG [margin-top:100px; margin-bottom:120px];

        py-3;
        text--SM gray-500,LG red-100;
    }


