
## Katex Com


Defines a katex function for consumption into a svelte Katex component. Use
single dollar signs for inline math, double dollar signs for block math, and
backslash dollar sign for an actual dollar sign. 

    (text) => {
        text = text.replace(/\\\$/g, '&#36;');
        
        text = text.replace(/\$\$([^$]*)\$\$/g, (m, mtext, offset, whole) => {
                let ktds = mtext.
                    replace(/"/g, "''").
                    replace(/\\/g, '!@');
                let katex = '<Katex str="{"' + ktds + '"}" block={true} />';
                return katex;
            });

        text = text.replace(/\$([^$]*)\$/g, (m, mtext, offset, whole) => {
                let ktds = mtext.
                    replace(/"/g, "''");
                let katex = '<Katex str="{"' + ktds + '"}"/>';
                return katex;
            });

        return text;
    }

[litpro/katex.js](# "save:")

## Katex Svelte 

This waits for katex to be loaded from main before rendering. The component
expects `!@` for anything escaped with backslashes; it replaces it before
rendering. Needed that as to many escapes along the way! But the katex command
handles all that. It also will replace the html dollar sign with an actual
dollar sign in the latex if it had been escaped. 


    <script>

    import {onMount} from 'svelte'

    export let str = '';
    export let block = false;
    let mathel;

    let katex = {render:() => {}};

    $: str = str.
        replace(/\!\@/g, '\\').
        replace(/\&\#36\;/g, '\\$');
    $: katex.render(str, mathel, {displayMode:block, throwOnError:false});


    onMount( () => {
        if (!window.katex) {
            window.addEventListener('DOMContentLoaded', (event) => {
                katex =  window.katex;
                katex.render(str, mathel, {displayMode:block, throwOnError:false});
            });
        } else {
            katex =  window.katex;
            katex.render(str, mathel, {displayMode:block, throwOnError:false});
        }
    });

    
    </script>
     
    <span bind:this={mathel}></span>


[components/Katex.svelte](# "save:")



