# First

This is an example litpro for using with lprc.js generated by the main project
to show the deployment of a sapper/svelte page. 

    _"xsvelte | psv xsvelte | katex"

[../sapper/src/routes/example.svelte](# "save: ")

# xSvelte

    script. type="js"
        \_":js"

    style.
        \_":css |twcss"

    HEAD.
        title.
            About
    h1.
        About this site
    #only.blue-gray var={lt} |
        more={more} {seven} type="check"
        \_":par|md"
        p.big-red
            _":par"
    p.blue-gray.big-red.dollars
       Mr.. Money likes $x^2$ over $$\frac{x}{x^2}$$ 

    h2.

        p.
            Cool with some text. 
        #
        {#each greetings as greet}
            Greet. {greet} /
        {/each}

    div.  /


    
       


[par]()

    This is the 'about' page. There's not much here. We can just write a lot
    of stuff and it is fine. Indentations are taken care of automatically. 

[js]()

    import Katex from '../components/Katex.svelte';
    import Greet from '../components/Greet.svelte';

    let great = 3;
    let lt = 4;
    let seven = 8;
    let more = 0;

    let greetings = ['hi', 'bye', 'see ya'];
    
[css]() 
    
    div {
        px--4,MD 6,LG10;
        py-3;
        --grid,SM [flex;align-items:center];
        text--XL gray-5,red-1;
        brt-sm;
        brb-lg;
    }

    .blue-gray {
        bg-gray-5;
        text-blue-8;
        liner-green-9;
    }

    .big-red {
        text-red-9;
        bg-red-0;
    }

    .dollars {
        text-yellow-9;
    }

## Greeting

This is a simple greet box. 


    script.
        \_":js"

    style.
        \_":css | twcss"

    p.
        {greet}

[../sapper/src/components/Greet.svelte](# "save: | psv greeting")


[js]()

    export let greet;


[css]()

    p {
        bg-blue-7;
        liner-red-2;
        bwa-4;
        bra-md;
        pa-10;
    }
