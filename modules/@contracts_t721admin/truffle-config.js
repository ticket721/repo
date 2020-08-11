
// Initial Configuration
const config = {
    compilers: {
        solc: {
            version: "0.5.15",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
            }
        },
    },
    plugins: ["solidity-coverage"],
    mocha: {
        useColors: true
    }
};

try {
    const outter_config = require('../../contracts/prism');
    module.exports = {
        ...config,
        ...outter_config,
        plugins: [
            ...config.plugins,
            ...(outter_config.plugins || [])
        ]
    };
} catch (e) {
    console.log('Prism loading failed. No worries, default configuration is used !');
    module.exports = {
        ...config,
        networks: {
            local: {
                host: 'localhost',
                port: 8545,
                network_id: 2702
            }
        }
    };
}

