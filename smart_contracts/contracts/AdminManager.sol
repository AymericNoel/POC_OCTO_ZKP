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
    uint public MinApprovals;

    //garden proposal area
    struct GardenProposal{
        uint32 gardenIndex;
        uint[2] secretHash;
        address[] acceptProposal;
        address[] rejectProposal;
        bool isOpen;
    }
    mapping (uint32=>GardenProposal) GardenProposals;
    
    //dispute proposal area
    struct DisputeProposal{
        uint32 gardenIndex;
        uint ownerAmount;
        uint tenantAmount;
        address[] acceptProposal;
        bool isOpen;
    }
    mapping(uint32=>DisputeProposal) DisputeProposals;
   
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
    modifier OnlyValidGardenProposal(uint32 _gardenIndex){
        require(GardenProposals[_gardenIndex].isOpen, "GardenProposal should be open.");   
        _;   
    }
    modifier OnlyValidDisputeProposal(uint32 _gardenIndex){
        require(DisputeProposals[_gardenIndex].isOpen, "DisputeProposal should be open.");   
        _;   
    }
    modifier OnlyDeployer(){
        require(msg.sender==deployer);
        _;
    }

    function AddGardenManagerAddress(address _address) external OnlyDeployer() returns(address){
        GManager = GardenManager(_address);
        return _address;
    }

    function GetGardenManagerAddress()external view returns(address){
        return address(GManager);
    }

    function GetVerifierContractAddress()external view returns(address){
        return address(VerifierContract);
    }

    function ModifyVerifierContractAddress(address _verifierContract) external OnlyDeployer(){
        VerifierContract = Verifier(_verifierContract);
        GManager.ModifyVerifierContract(_verifierContract);
    }

    function AddGarden(uint32 _gardenIndex, uint[2] memory _secret) public{
        require(msg.sender== address(GManager));
        GardenProposal storage proposal = GardenProposals[_gardenIndex];
        proposal.gardenIndex=_gardenIndex;
        proposal.secretHash=_secret;
        proposal.isOpen=true;
    }

    function AcceptGarden(uint32 _gardenIndex,uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyAdmin() OnlyValidGardenProposal(_gardenIndex){
        GardenProposal storage proposal = GardenProposals[_gardenIndex];
        bool alreadyVoted =false;
        for (uint256 i = 0; i < proposal.acceptProposal.length; i++) {
            if(proposal.acceptProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");
        require(VerifierContract.verifyTx(_proofA,_proofB,_proofC,proposal.secretHash), "Proof of secret invalid");
        proposal.acceptProposal.push(msg.sender);
        if(proposal.acceptProposal.length==MinApprovals){
            GManager.AcceptGarden(_gardenIndex);
            proposal.isOpen=false;
        }
    }

    function RejectGarden(uint32 _gardenIndex) external OnlyAdmin() OnlyValidGardenProposal(_gardenIndex){
        GardenProposal storage proposal = GardenProposals[_gardenIndex];
        bool alreadyVoted =false;
        for (uint256 i = 0; i < proposal.rejectProposal.length; i++) {
            if(proposal.rejectProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");
        proposal.rejectProposal.push(msg.sender);
        if(proposal.rejectProposal.length==MinApprovals){
            GManager.RejectGarden(_gardenIndex);
            proposal.isOpen=false;
        }
    }

    function AddDispute(uint32 _gardenIndex) public {
        require(msg.sender== address(GManager));
        DisputeProposal storage proposal = DisputeProposals[_gardenIndex];
        proposal.gardenIndex=_gardenIndex;
    }

    function SetAmountForDispute(uint32 _gardenIndex,uint _ownerAmount, uint _tenantAmount) public OnlyDeployer() OnlyValidDisputeProposal(_gardenIndex){
        DisputeProposal storage proposal = DisputeProposals[_gardenIndex];
        if(proposal.acceptProposal.length !=0){
            delete proposal.acceptProposal;
        }
        proposal.ownerAmount=_ownerAmount;
        proposal.tenantAmount=_tenantAmount;
        proposal.acceptProposal.push(msg.sender);
    }

    function AcceptDispute(uint32 _gardenIndex) external OnlyAdmin() OnlyValidDisputeProposal(_gardenIndex){
        bool alreadyVoted =false;
        DisputeProposal storage proposal = DisputeProposals[_gardenIndex];
        for (uint256 i = 0; i < proposal.acceptProposal.length; i++) {
            if(proposal.acceptProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");        
        proposal.acceptProposal.push(msg.sender);
        if(proposal.acceptProposal.length==MinApprovals){
            GManager.CloseDispute(_gardenIndex, proposal.ownerAmount,proposal.tenantAmount);
            proposal.isOpen=false;
        }
    }
}