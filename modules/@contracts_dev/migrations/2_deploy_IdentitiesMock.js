const IdentitiesMock = artifacts.require("IdentitiesMock");

module.exports = function(deployer) {
  deployer.deploy(IdentitiesMock);
};
