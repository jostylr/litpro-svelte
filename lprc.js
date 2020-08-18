const psv = require('./litpro/psv.js');
const twcss = require('./litpro/twcss.js');
const katex = require('./litpro/katex.js');


module.exports = function(Folder, args) {

    try {
    console.error("hello lprc");
    

    Folder.commands.psv = psv;
    Folder.commands.psv._label = "psv";
    Folder.sync("twcss", twcss);
    Folder.sync("katex",  katex);
    } catch (e) {
        console.log(e);
    }
};
