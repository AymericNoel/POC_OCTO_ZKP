const GardenManager = artifacts.require("GardenManager");
const AdminContract="";
const VerifierContract=""

// constructor parameter : address _adminContract, address _verifierContract
module.exports = function (deployer) {
  deployer.deploy(GardenManager,AdminContract, VerifierContract);
};
