const VerifierContract = artifacts.require("Verifier");
const GardenManagerContract = artifacts.require("GardenManager");
const AdminManagerContract = artifacts.require("AdminManager");
const AdminsAddresses=["0x9d9fFD857c0B1908C961D2FB7E5a4fc5871FFCE1","0xC8f56f654eB18560718B4012497122CC9A9E898f"];
const MinApprovals=2;
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
