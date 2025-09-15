const AgriManager = artifacts.require("AgriManager");

module.exports = function (deployer) {
  deployer.deploy(AgriManager);
};
