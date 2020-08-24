# litpro-svelte

This is a literate-programming setup that is intended to work with svelte a little better. 

Really, this is designed mostly with sapper in mind (exporting to a static
site form is my mo). 

Specifically, it does:

* Latex math display using Katex
* Shorthand element tagging using indents like pugjs
* Some shorthand css properties like TailwindCSS does (but not as classes)


## Katex

Command: katex

Required for usage:  katex.svelte,  katex files in main html

Using $ $  and $$ $$, we can write latex expressions in between in a
  text. This, when piped through the command katex, will translate this into a
  form that the Katex.svelte component can work. You need to import
  Katex.svelte for that to work. It is designed to have the Katex support
  files in the main html file. 


## Pug-lite

Command: psv  
[psv short for pug-svelte]. 

Requires nothing else, direct substitution. 


Pug-lite. I like the idea of writing a tag and using indents, as well as `#`
  for id and `.` for classes. The rest of the pug syntax is dropped as it is
  largely not needed in the context of svelte which does its own kind of
  markup. For a tag to be recognized as such, use a `.` even if it there is no
  class. If the first word does have a period or hash, then it is assumed to
  be plain text. Multiple periods or hashes in a row will be reduced by one as
  a way of escaping (only relevant after the first word). Any other attributes
  for the element can be written as usual directly after the class hash stuff.
  Hash id should be in order. 


`element#id.class1.class2  att="whatever" {svelte}"`

If element is missing, then it becomes a div if there is a hash and a span if
just a class. 

If a line needs to extend to the next line for attributes or whatever, then a
vertical bar should be the last character. 

Indents are used for nesting. 


## Tailwindish

Command: twcss

Requires nothing else, it directly writes down the css syntax. 

This is inspired by TailwindCSS, taking from it the idea of some restricted
uses and shorthand notations. It differs quite a bit, in particular, not using
classes. Given that svelte has the styles scoped to the element, using the
structure of the component seems fine. 

Spacing commands are p for padding, m for margin, with x,y,l,r,t,b,a following
them standing for left+right, top+bottom, left, right, top, bottom, and all.
There is also gp, gapx, gapy for gap, column-gap, row-gap. The spacing is then
of the form px 0-6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64. 

For colors, we use numbers 0-9 for severity (except black, white which is just
one color and also transparent).  Colors are gray, cool-gray, red, orange,
yellow, green, teal, blue, indigo, purple, pink.  From tailwind. 

The color types can be used with bg (background-color), liner (border-color), and
text (color) 

We have single static words just for a little briefer: 

        static : 'position: static',
        fixed : "position: fixed",	
        absolute : "position: absolute",
        relative : "position: relative",	
        sticky : "position: sticky".
        delete : 'display:none',
        hide: 'visibility: hidden',
        block : 'display:block',
        inline : 'display:inline',
        inblock : 'display:inline-block',
        flex: 'display:flex',
        flexinline : 'display:inline-flex',
        grid : 'display:grid',
        gridinline : 'display:inline-grid',

We also have border radius (br: brb, brt, brl, brr, bra) and border width (bw:
bwx, bwy, bwt, bwl, bwr, bwb, bwa). The widths have width 0, 1, 2, 4, 8
(straight px) while the radii have  zr, sm, nm, md, lg, fl  for zero, small,
normal, medium, large, full). 
    


## JSXGraph

No Command.

Requires Jsxgraph.svelte

There is no translation layer here, but this produces the svelte-component for
having it. Properties of width and height on the element. 


