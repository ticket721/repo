const path = require('path');
const fs = require('fs');

/**
 * Utility to recover the config in a synchronous manner
 * @returns {any}
 */
function get_config_sync() {

    try {
        const configPath = `${path.resolve('../../../', process.env.T721_CONFIG)}`;
        return JSON.parse(fs.readFileSync(configPath).toString());
    } catch (e) {
        console.log('Could not load config');
        console.log(e);
        process.exit(1);
    }

}

module.exports = get_config_sync;

