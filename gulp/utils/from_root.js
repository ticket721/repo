const path = require('path');

module.exports = {
    from_root: function from_root(file) {
        return path.join(__dirname, '../../', file);
    }
};

