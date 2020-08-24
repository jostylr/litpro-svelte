const {has, makeLineCounter, convertToMap, makeScanners} = require('./utilities.js');

const s = makeScanners();

let common = twcssCommon();

let breakReg = /^([A-Z]{2,})/;

module.exports = function twcss (input, args) {

    let twcss;
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

    let chunks;
    chunks = input.split('}');
    chunks.pop(); // meaningless last bit after last bracket
    chunks = chunks.map( (chunk) => {
            let two = chunk.split('{'). //}
                map(el=> el.trim());
            return two; 
        }); 

    let replaced;
    replaced = chunks.
        map( ([sel, propstr]) => {
            //console.log(sel, propstr, s.split(propstr, ';'));
            let props = s.split(propstr, ';').
                map(prop => prop.trim()).
                filter( el => el).
                map( (prop) => {
                    if (prop.slice(0,2) === '--') {
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
                                        join(';\n    ');
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
                        return breaks;
                    } else if ( prop.includes (':') ) {
                        return prop; // normal prop so ignore
                    } else {
                        let ddInd = prop.indexOf('--');
                        if (ddInd !== -1 ) {
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
                            return breaks;
                        } else {
                            return twReplace(prop, twcss);
                        }
                    }
                });
           return [sel, props];
        });

    let text = '';
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
                    let body = breaksObj[key].join(';\n    ');
                    if (!body) {return;}
                    text += '\n' + twReplace( key, twcss) + ' {\n ' ;
                    text +=  selector + ' {\n    ' + body + ';\n }';
                    text += '\n}';
                } else {
                    let body = breaksObj[''].join(';\n    ');
                    if (!body) {return;}
                    text += '\n' + selector + ' {\n    ' + body + ';\n}'; 
                }
        });
    
    });

    return text;
};

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
        if (!prop) {
            return value;
        } else if (typeof prop === 'string') {
            return prop  + value;
        } else if (typeof prop === 'function') {
            return prop(value);
        } else if (Array.isArray(prop) ) {
            return prop.join(value + ';\n    ') + value;
        } else {
            return prop[value] ?? '';
        }
    } else {
        console.log('property not found: ' + twprop);
        return '';
    }
}

function twcssCommon  () {



    let breaks = { //mobi default
        'SM' : '@media (min-width: 640px)',
        'MD' : '@media (min-width: 768px)',
        'LG' : '@media (min-width: 1024px)',
        'XL' : '@media (min-width: 1280px)'
    };


        let statics = {
            static : 'position: static',
            fixed : "position: fixed",	
            absolute : "position: absolute",
            relative : "position: relative",	
            sticky : "position: sticky",
            delete : 'display:none',
            hide: 'visibility: hidden',
            block : 'display:block',
            inline : 'display:inline',
            inblock : 'display:inline-block',
            flex: 'display:flex',
            flexinline : 'display:inline-flex',
            grid : 'display:grid',
            gridinline : 'display:inline-grid',
        };

    let spacing =  {
      px: '1px',
      '0': '0',
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '32': '8rem',
      '40': '10rem',
      '48': '12rem',
      '56': '14rem',
      '64': '16rem'
    };
    
    let spaces = {
    px : {
     '' : ["padding-left:","padding-right:"],
     ...spacing 
    },
    py : {
     '' : ["padding-top:","padding-bottom:"],
     ...spacing 
    },
    pl : {
     '' : "padding-left:",
     ...spacing 
    },
    pr : {
     '' : "padding-right:",
     ...spacing 
    },
    pt : {
     '' : "padding-top:",
     ...spacing 
    },
    pb : {
     '' : "padding-bottom:",
     ...spacing 
    },
    pa : {
     '' : "padding:",
     ...spacing 
    },
    mx : {
     '' : ["margin-left:","margin-right:"],
     ...spacing 
    },
    my : {
     '' : ["margin-top:","margin-bottom:"],
     ...spacing 
    },
    ml : {
     '' : "margin-left:",
     ...spacing 
    },
    mr : {
     '' : "margin-right:",
     ...spacing 
    },
    mt : {
     '' : "margin-top:",
     ...spacing 
    },
    mb : {
     '' : "margin-bottom:",
     ...spacing 
    },
    ma : {
     '' : "margin:",
     ...spacing 
    },
    gap : {
     '' : "gap:",
     ...spacing 
    },
    gapx : {
     '' : "column-gap:",
     ...spacing 
    },
    gapy : {
     '' : "row-gap:",
     ...spacing 
    }};

    let radii = {zr : 0,
    sm : '.125rem',
    nm : '.25rem',
    md : '.375rem',
    lg : '0.5rem',
    fl : '9999px'};
    let widths = {0 : '0',
    1 : '1px',
    2 : '2px',
    4 : '4px',
    8 : '8px'};
    
    let borderRadii = {
    brl : {
     '' : ["border-top-left-radius:","border-bottom-left-radius:"],
     ...radii 
    },
    brr : {
     '' : ["border-top-right-radius:","border-bottom-right-radius:"],
     ...radii 
    },
    brt : {
     '' : ["border-top-left-radius:","border-bottom-left-radius:"],
     ...radii 
    },
    brb : {
     '' : ["border-bottom-left-radius:","border-bottom-right-radius:"],
     ...radii 
    },
    brtl : {
     '' : "border-top-left-radius:",
     ...radii 
    },
    brtr : {
     '' : "border-top-right-radius:",
     ...radii 
    },
    brbl : {
     '' : "border-bottom-left-radius:",
     ...radii 
    },
    brbr : {
     '' : "border-bottomr-right-radius:",
     ...radii 
    },
    bra : {
     '' : "border:",
     ...radii 
    }};
    let borderWidths = {
    bwx : {
     '' : ["border-left-width:","border-right-width:"],
     ...widths 
    },
    bwy : {
     '' : ["border-top-width:","border-bottom-width:"],
     ...widths 
    },
    bwl : {
     '' : "border-left-width:",
     ...widths 
    },
    bwr : {
     '' : "border-right-width:",
     ...widths 
    },
    bwt : {
     '' : "border-top-width:",
     ...widths 
    },
    bwb : {
     '' : "border-bottom-width:",
     ...widths 
    },
    bwa : {
     '' : "border-width:",
     ...widths 
    }};

    let palette =  {
      transparent: 'transparent',
      white: '#fffffuuf',
      black: '#000000',
      gray: {
        '0': '#f9fafb',
        '1': '#f4f5f7',
        '2': '#e5e7eb',
        '3': '#d2d6dc',
        '4': '#9fa6b2',
        '5': '#6b7280',
        '6': '#4b5563',
        '7': '#374151',
        '8': '#252f3f',
        '9': '#161eu2e',
      },
      'cool-gray': {
        '0': '#f8fafc',
        '1': '#f1f5f9',
        '2': '#e2e8f0',
        '3': '#cfd8e3',
        '4': '#97a6ba',
        '5': '#64748b',
        '6': '#475569',
        '7': '#364152',
        '8': '#27303f',
        '9': '#1a202e',
      },
      red: {
        '0': '#fdf2f2',
        '1': '#fde8e8',
        '2': '#fbd5d5',
        '3': '#f8b4b4',
        '4': '#f98080',
        '5': '#f05252',
        '6': '#e02424',
        '7': '#c81e1e',
        '8': '#9b1c1c',
        '9': '#771d1d',
      },
      orange: {
        '0': '#fff8f1',
        '1': '#feecdc',
        '2': '#fcd9bd',
        '3': '#fdba8c',
        '4': '#ff8a4c',
        '5': '#ff5a1f',
        '6': '#d03801',
        '7': '#b43403',
        '8': '#8a2c0d',
        '9': '#73230d',
      },
      yellow: {
        '0': '#fdfdea',
        '1': '#fdf6b2',
        '2': '#fce96a',
        '3': '#faca15',
        '4': '#e3a008',
        '5': '#c27803',
        '6': '#9f580a',
        '7': '#8e4b10',
        '8': '#723b13',
        '9': '#633112',
      },
      green: {
        '0': '#f3faf7',
        '1': '#def7ec',
        '2': '#bcf0da',
        '3': '#84e1bc',
        '4': '#31c48d',
        '5': '#0e9f6e',
        '6': '#057a55',
        '7': '#046c4e',
        '8': '#03543f',
        '9': '#014737',
      },
      teal: {
        '0': '#edfafa',
        '1': '#d5f5f6',
        '2': '#afecef',
        '3': '#7edce2',
        '4': '#16bdca',
        '5': '#0694a2',
        '6': '#047481',
        '7': '#036672',
        '8': '#05505c',
        '9': '#014451',
      },
      blue: {
        '0': '#ebf5ff',
        '1': '#e1effe',
        '2': '#c3ddfd',
        '3': '#a4cafe',
        '4': '#76a9fa',
        '5': '#3f83f8',
        '6': '#1c64f2',
        '7': '#1a56db',
        '8': '#1e429f',
        '9': '#233876',
      },
      indigo: {
        '0': '#f0f5ff',
        '1': '#e5edff',
        '2': '#cddbfe',
        '3': '#b4c6fc',
        '4': '#8da2fb',
        '5': '#6875f5',
        '6': '#5850ec',
        '7': '#5145cd',
        '8': '#42389d',
        '9': '#362f78',
      },
      purple: {
        '0': '#f6f5ff',
        '1': '#edebfe',
        '2': '#dcd7fe',
        '3': '#cabffd',
        '4': '#ac94fa',
        '5': '#9061f9',
        '6': '#7e3af2',
        '7': '#6c2bd9',
        '8': '#5521b5',
        '9': '#4a1d96',
      },
      pink: {
        '0': '#fdf2f8',
        '1': '#fce8f3',
        '2': '#fad1e8',
        '3': '#f8b4d9',
        '4': '#f17eb8',
        '5': '#e74694',
        '6': '#d61f69',
        '7': '#bf125d',
        '8': '#99154b',
        '9': '#751a3d',
      },
    }
    
    let colortypes = {
        bg : {
         '' : 'background-color:',
         ...palette
        },
        liner : {
            '' : 'border-color:',
         ...palette
        },
        text : {
            '' : 'color:',
         ...palette
        }
    };

    let common = {
        ...colortypes,
        ...breaks,
        ...statics,
        ...spaces,
        ...borderRadii,
        ...borderWidths
    };
    
    return common;
}
