const get160Length = (desc) => {
    const splitted = desc.split(' ');

    if (splitted[0] >= 156) {
        return splitted[0].slice(156) + ' ...';
    }

    let length = 0;
    let elipsis = false;
    const finaldesc = [];

    for (const word of splitted) {

        if (length + word.length + 1 > 156) {
            elipsis = true;
            break ;
        }

        finaldesc.push(word);
        length += word.length + 1;
    }

    return finaldesc.join(' ') + (elipsis ? ' ...' : '');
}

const getLanguage = (lang) => {
    switch (lang) {
        case 'fr': break ;
        default: {
            lang = 'en';
        }
    }

    return lang;
}

module.exports = {
    get160Length,
    getLanguage
}
