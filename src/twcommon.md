
This is a function that creates the common tw css properties. 


    function twcssCommon  () {



        let breaks = { //mobi default
            'SM' : '@media (min-width: 640px)',
            'MD' : '@media (min-width: 768px)',
            'LG' : '@media (min-width: 1024px)',
            'XL' : '@media (min-width: 1280px)'
        };


        _"statics"

        _"spacing"

        _"borders"

        _"colors"
    
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



## Statics

These are just single probabilities that are useful to have a single term for. 

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
            flexvert : 'display:flex; flex-direction:column',
            flexinline : 'display:inline-flex',
            grid : 'display:grid',
            gridinline : 'display:inline-grid',
        };




## Spacing

Spacing is used in padding, margin


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

    let spaces = _":making space | split-merge";




[making space]() 

So here is a little quick bit of spacing stuff that then gets assembled into a
proper form


    p padding
    m margin
    ---
    x left right 
    y top bottom
    l left
    r right
    t top
    b bottom
    a 
    ---
    gap gap
    gapx column-gap
    gapy row-gap
    ---
    ...spacing

    
## Split merge

This is defined for the spacing, but maybe we can do a general thing. The
setup is that the first section is the leader that then gets paired with the
second section. The third section is a stand-alone section. And the fourth
section is what gets put into each of the objects. 


    function (text) {
        let [leaders, followers, alone, insert] = text.split('\n---\n').
            map( el => el.trim() ).
            map( (el, ind) => {
                if (ind === 3) { return el; } // insert is what it is
                return el.split('\n').
                    map( el => el.trim() ).
                    filter( el => el).
                    map( el => el.split(' '))
            });
        let retarr = [];

        leaders.forEach( ([abrlead, leadprop]) => {
            followers.forEach( ([abr, ...propnames]) => {
                let propname;
                if (propnames.length === 0) {
                    propname = `"${leadprop}:"`; 
                } else if (propnames.length === 1) {
                    propname = `"${leadprop}-${propnames[0]}:"`;
                } else {
                    propnames = propnames.map( (n) => leadprop+'-'+n );
                    propname = '["' + propnames.join(':","') + ':"]';
                }
                retarr.push(`${abrlead}${abr} : {\n '' : ${propname},\n ${insert} \n}`);
            });
        });


        
        alone.forEach( ([abr, ...propnames]) => {
            let propname;
            if (propnames.length === 1) {
                propname = '"' + propnames[0] + ':"';
            } else {
                propname = "['" + propnames.join(":',") + ':]';
            }
            retarr.push(`${abr} : {\n '' : ${propname},\n ${insert} \n}`);
        });

        let ret = '{\n' + retarr.join(',\n') + '}';
        //console.log(ret);

        return ret;
    }


[split-merge](# "define:")

## Borders

We have border radii and border width

    let radii = {_":radii"};
    let widths = {_":widths"};

    let borderRadii = _":border radii | split-merge";
    let borderWidths = _":border widths | split-merge";

[radii]()

    zr : 0,
    sm : '.125rem',
    nm : '.25rem',
    md : '.375rem',
    lg : '0.5rem',
    fl : '9999px'

   

[widths]()

    0 : '0',
    1 : '1px',
    2 : '2px',
    4 : '4px',
    8 : '8px'

[border radii]()

    br border
    ---
    l top-left-radius bottom-left-radius
    r top-right-radius bottom-right-radius
    t top-left-radius bottom-left-radius
    b bottom-left-radius bottom-right-radius
    tl top-left-radius
    tr top-right-radius
    bl bottom-left-radius
    br bottomr-right-radius
    a 
    ---

    ---
    ...radii

[border widths]()

    bw border
    ---
    x left-width right-width 
    y top-width bottom-width
    l left-width
    r right-width
    t top-width
    b bottom-width
    a width
    ---

    ---
    ...widths



## Colors

This is taken from tailwind ui colors. 



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



