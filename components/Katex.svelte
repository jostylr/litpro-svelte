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
