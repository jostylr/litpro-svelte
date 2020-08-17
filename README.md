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


## JSXGraph

No Command.

Requires Jsxgraph.svelte

There is no translation layer here, but this produces the svelte-component for
having it. Properties of width and height on the element. 






A few helpers for using svelte with literate-programming (puglite, tailwindishness, katex)
