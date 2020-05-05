function path_processor(path) {

    const injectorRegex = /\{\{([^)]+?)\}\}/;

    let match;
    while ((match = injectorRegex.exec(path)) !== null) {
        const totalLength = match[0].length;
        const value = process.env[match[1]];

        if (value === undefined) {
            throw new Error(`Cannot inject ${match[1]} from env into path => undefined`);
        }

        path = `${path.slice(0, match.index)}${value}${path.slice(match.index + totalLength)}`;
    }

    return path;
}

module.exports = {
    path_processor,
};
