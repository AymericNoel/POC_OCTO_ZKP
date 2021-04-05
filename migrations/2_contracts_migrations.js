const VerifierContract = artifacts.require("Verifier");
const GardenManagerContract = artifacts.require("GardenManager");
const AdminManagerContract = artifacts.require("AdminManager");
const AdminsAddresses=["0xA8932F38d2f0e1d8b1903fb4546Df5c2499a0E1C","0xA8932F38d2f0e1d8b1903fb4546Df5c2499a0E1C"];
const MinApprovals=3;
const AdminContractP2PContact="admin@gmail.com";

module.exports = function (deployer) {
  deployer.deploy(VerifierContract).then(function () {
      return deployer.deploy(AdminManagerContract,AdminsAddresses,MinApprovals, VerifierContract.address, AdminContractP2PContact);
  }).then(function () {
    return deployer.deploy(GardenManagerContract,AdminManagerContract.address, VerifierContract.address);
  }).then(function () {
      return AdminManagerContract.deployed();
  }).then(function (adminManagerInstance) {
      return adminManagerInstance.addGardenManagerAddress(GardenManagerContract.address);
  });
};
