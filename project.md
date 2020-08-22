# Svelte and Literate Programming

This is a project for having some helper functions for the way I like to write
HTML while using Svelte. 

## Motivations

I like how svelte manages a lot of the actual interactions and scoping, etc.
But I don't like html syntax and I need constraints on css. Also math stuff. 

So this is a set of helper functions to allow me to do that. 

Primarily I use Sapper to generate static pages. Shouldn't matter all that
much, but that's my perspective. At least for now. 



## Source files

Here is the setup 

* [katex](katex.md "load:")  This saves katex.svelte, a component to put in
  the sapper components. 
* [psv](psv.md "load:") This converts pug-like syntax into html
* [twcss](twcss.md "load:") This does a tailwindcss inspired conversion of css
  properties. 
* [template](template.md "load:") This saves a template for having katex and
  jsxgraph as well the jsxgraph component Jxg.  
* [utilities](utilities.md "load:") Need some scanning, splitting stuff

## LPRC

This sets up an lprc that does a variety of svelte related pre-processing
stuff such as a pug-lite syntax, tailwindcss-esque, and Katex, JSXGraph
compoonents. 


    try { 
       
    const psv = require('./litpro/psv.js');
    const twcss = require('./litpro/twcss.js');
    const katex = require('./litpro/katex.js');

    console.log(typeof psv, typeof twcss, typeof katex);

    module.exports = function(Folder, args) {
        Folder.commands.psv = psv;
        Folder.commands.psv._label = "psv";
        Folder.sync("twcss", twcss);
        Folder.sync("katex",  katex);
    };

    console.log("done loading lprc");

    } catch (e) {
        console.log(e);
    }


[lprc.js](# "save:")


### Copy example

The example.md file in the main directory is a live example to use. But we
want to make sure the build directory gets a copy. So we do a copy command for
it. 

[copy example](# "exec: cp example.md build/example.md")


##  Distributor

So various files need to go places. This does not translate the template file
as it might be good not to overwrite that one. But the others should not be a
problem. This should be run from a copy of the build directory which is in a
subdirectory of the main litpro directory and already has a litpro directory
and a sapper directory. These will blindly copy over the files, except for
lprc.js and template.html (goes to sapper/src)

    #! /bin/bash

    cp litpro/* ../litpro/
    cp components/* ../sapper/src/components/
   

[updater](# "save:")

### all

This copies all the files. 

    #! /bin/bash

    cp litpro/* ../litpro/
    cp components/* ../sapper/src/components/
    cp lprc.js ../
    cp template.html ../sapper/src/

    
[all](# "save:")

## Gitignore


    litpro/
    build/
    sapper/
    lprc.js

[../.gitignore](# "save:")

## Build gitignore  (build is a separate git branch for pulling)

    .checksum

[.gitignore](# "save:")


