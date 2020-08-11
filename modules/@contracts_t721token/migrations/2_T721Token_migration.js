const T721Token = artifacts.require('T721Token');
const config = require('../truffle-config');

const ZADDRESS = '0x0000000000000000000000000000000000000000';

// const hasArtifact = (name) => {
//     return (config && config.artifacts
//         && config.artifacts[name]);
// };
//
// const getArtifact = (name) => {
//     return config.artifacts[name];
// }

module.exports = async function(deployer) {

    await deployer.deploy(T721Token);

};

