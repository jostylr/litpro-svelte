# Sapper

## Template


    <!doctype html>
    <html lang='en'>
    <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1.0'>
        <meta name='theme-color' content='#333333'>

Katex  global: katex

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js" integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4" crossorigin="anonymous"></script>
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/fonts/KaTeX_Main-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/fonts/KaTeX_Math-Italic.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/fonts/KaTeX_Size2-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/fonts/KaTeX_Size4-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous">




JSXGraph  global: JXG

        
        <script type="text/javascript" charset="UTF-8" defer
         src="https://cdnjs.cloudflare.com/ajax/libs/jsxgraph/1.1.0/jsxgraphcore.js"></script>
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/jsxgraph/1.1.0/jsxgraph.css" />


        %sapper.base%

        <link rel='stylesheet' href='global.css'>
        <link rel='manifest' href='manifest.json' crossorigin='use-credentials'>
        <link rel="icon" type="image/svg+xml" href="favicon.svg">
        <link rel="alternate icon" href="favicon.ico">

        <!-- Sapper generates a <style> tag containing critical CSS
             for the current page. CSS for the rest of the app is
             lazily loaded when it precaches secondary pages -->
        %sapper.styles%

        <!-- This contains the contents of the <svelte:head> component, if
             the current page has one -->
        %sapper.head%
    </head>
    <body>
        <!-- The application will be rendered inside this element,
             because `src/client.js` references it -->
        <div id='sapper'>%sapper.html%</div>

        <!-- Sapper creates a <script> tag containing `src/client.js`
             and anything else it needs to hydrate the app and
             initialise the router -->
        %sapper.scripts%
    </body>
    </html>

[template.html](# "save:")




## JXG

A couple of helpful bits:  https://www.intmath.com/cg3/jsxgraph-coding-summary.php


[components/Jxg.svelte](# "save:")

This creates a simple board for JSXGraph. To use, have something like `<Jxg
{options} id="..." {f} width, height optional />  The function f is how we
get to the board. It should be something like `let a; const f = (b) => a=b;`. 


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


 
