<script>

import {onMount} from 'svelte'

export let options = {};
export let id;
export let f;
export let width = '500px';
export let height = '500px';

options = { 
    showCopyright:false,
    showNavigation:false,
    axis: true,
    ...options};

onMount( () => {
    if (!window.JXG) {
        window.addEventListener('DOMContentLoaded', (event) => {
            let b = window.JXG.JSXGraph.initBoard(id, options);
            f(b); // sends b to the parent 
        });
    } else {
        let b = window.JXG.JSXGraph.initBoard(id, options);
        f(b); // sends b to the parent 
   }
});

</script>

<div {id} style="{`width:${width}; height:${height}`}"></div>
