const AdminManager = artifacts.require("AdminManager");
const ContractAdmins=["0xA8932F38d2f0e1d8b1903fb4546Df5c2499a0E1C","0xA8932F38d2f0e1d8b1903fb4546Df5c2499a0E1C"];
const MinApprovals=3;
const VerifierContract="0xA8932F38d2f0e1d8b1903fb4546Df5c2499a0E1C"
const P2PContact="dsf"

// constructor parameter : address[] _contractAdmins,uint _minApprovals, address _verifierContract, string _contactP2P)
module.exports = function (deployer) {
  deployer.deploy(AdminManager,ContractAdmins,MinApprovals, VerifierContract, P2PContact);
};