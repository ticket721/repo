const { join } = require('path');

const goroot = () => {

    const ret = __dirname;
    const dest = join(__dirname, '..', '..');

    process.chdir(dest);

    return ret;
};

const goback = (path) => {
    process.chdir(path);
};

module.exports = {
    goroot,
    goback,
};
