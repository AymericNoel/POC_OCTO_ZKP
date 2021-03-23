const AdminManager = artifacts.require("AdminManager");
const ContractAdmins=["",""];
const MinApprovals=3;
const VerifierContract=""
const P2PContact=""

// constructor parameter : address[] _contractAdmins,uint _minApprovals, address _verifierContract, string _contactP2P)
module.exports = function (deployer) {
  deployer.deploy(AdminManager,ContractAdmins,MinApprovals, VerifierContract, P2PContact);
};
