// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./GardenManager.sol";
import "./Verifier.sol";

contract AdminManager{

    //import area
    Verifier VerifierContract;
    GardenManager GManager;

    //admin area
    mapping (address=>bool) ContractAdmins; 
    address private deployer;
    string public ContactP2P;

    //proposal area
    struct Proposal{
        uint32 gardenIndex;
        uint[2] secretHash;
        address[] acceptProposal;
        address[] rejectProposal;
        bool isOpen;
    }
    mapping (uint32=>Proposal) Proposals;
    uint public MinApprovals;
   
    constructor (address[] memory _contractAdmins,uint _minApprovals, address _verifierContract, string memory _contactP2P) public {
        for (uint256 index = 0; index < _contractAdmins.length; index++) {
            ContractAdmins[_contractAdmins[index]]==true;
        }
        MinApprovals=_minApprovals;
        deployer= msg.sender;
        VerifierContract = Verifier(_verifierContract);
        ContactP2P = _contactP2P;
    }

    modifier OnlyAdmin(){
        require(ContractAdmins[msg.sender], "Only administrators should call");
        _;
    }
    modifier OnlyValidProposal(uint32 _gardenIndex){
        require(Proposals[_gardenIndex].isOpen, "Proposal should be open.");   
        _;   
    }
    modifier OnlyDeployer(){
        require(msg.sender==deployer);
        _;
    }

    function AddGardenManagerAddress(address _address) public OnlyDeployer(){
        GManager = GardenManager(_address);
    }

    function ModifyVerifierContractAddress(address _verifierContract) public OnlyDeployer(){
        VerifierContract = Verifier(_verifierContract);
        GManager.ModifyVerifierContract(_verifierContract);
    }

    function AddGarden(uint32 _gardenIndex, uint[2] memory _secret) public{
        require(msg.sender== address(GManager));
        Proposal storage proposal = Proposals[_gardenIndex];
        proposal.gardenIndex=_gardenIndex;
        proposal.secretHash=_secret;
        proposal.isOpen=true;
    }

    function AcceptGarden(uint32 _gardenIndex,uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC) public OnlyAdmin() OnlyValidProposal(_gardenIndex){
        bool alreadyVoted =false;
        for (uint256 i = 0; i < Proposals[_gardenIndex].rejectProposal.length; i++) {
            if(Proposals[_gardenIndex].acceptProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");
        require(VerifierContract.verifyTx(_proofA,_proofB,_proofC,Proposals[_gardenIndex].secretHash), "Proof of secret should be valid");
        Proposals[_gardenIndex].acceptProposal.push(msg.sender);
        if(Proposals[_gardenIndex].acceptProposal.length==MinApprovals){
            GManager.AcceptGarden(_gardenIndex);
            Proposals[_gardenIndex].isOpen=false;
        }
    }

    function RejectGarden(uint32 _gardenIndex) public OnlyAdmin() OnlyValidProposal(_gardenIndex){
        bool alreadyVoted =false;
        for (uint256 i = 0; i < Proposals[_gardenIndex].rejectProposal.length; i++) {
            if(Proposals[_gardenIndex].rejectProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");
        Proposals[_gardenIndex].rejectProposal.push(msg.sender);
        if(Proposals[_gardenIndex].rejectProposal.length==MinApprovals){
            GManager.RejectGarden(_gardenIndex);
            Proposals[_gardenIndex].isOpen=false;
        }
    }
}