const GardenManager = artifacts.require("GardenManager");
const AdminContract="0xA8932F38d2f0e1d8b1903fb4546Df5c2499a0E1C";
const VerifierContract="0xA8932F38d2f0e1d8b1903fb4546Df5c2499a0E1C"

// constructor parameter : address _adminContract, address _verifierContract)
module.exports = function (deployer) {
  deployer.deploy(GardenManager,AdminContract, VerifierContract);
};
