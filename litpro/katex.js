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
