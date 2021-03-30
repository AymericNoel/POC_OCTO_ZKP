// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.9.0;
import "./GardenManager.sol";
import "./Verifier.sol";

contract AdminManager{
    //import area
    Verifier public VerifierContract;
    GardenManager public GManager;
    event newDispute( uint _disputeIndex);

    //admin area
    mapping (address=>bool) ContractAdmins; 
    address private deployer;
    string public ContactP2P;
    uint public MinApprovals;
    uint public disputeProposalsCount;

    //garden proposal area
    struct GardenProposal{
        uint gardenIndex;
        uint[2] secretHash;
        address[] acceptProposal;
        address[] rejectProposal;
        bool isOpen;
    }
    mapping (uint=>GardenProposal) public GardenProposals;
    
    //dispute proposal area
    struct DisputeProposal{
        uint gardenIndex;
        uint ownerAmount;
        uint tenantAmount;
        uint balance;
        address[] acceptProposal;
        bool isOpen;
    }
    mapping(uint=>DisputeProposal) public DisputeProposals;
   
    constructor (address[] memory _contractAdmins,uint _minApprovals, address _verifierContract, string memory _contactP2P) public {
        for (uint i = 0; i < _contractAdmins.length; i++) {
            ContractAdmins[_contractAdmins[i]]=true;
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
    modifier OnlyValidGardenProposal(uint _gardenIndex){
        require(GardenProposals[_gardenIndex].isOpen, "GardenProposal should be open.");   
        _;   
    }
    modifier OnlyValidDisputeProposal(uint _disputeIndex){
        require(DisputeProposals[_disputeIndex].isOpen, "DisputeProposal should be open.");   
        _;   
    }
    modifier OnlyDeployer(){
        require(msg.sender==deployer);
        _;
    }
    function GetGardenProposalById(uint _gardenIndex)external view returns(GardenProposal memory){
        return GardenProposals[_gardenIndex];
    }
    function GetDisputeProposalById(uint _disputeId)external view returns(DisputeProposal memory){
        return DisputeProposals[_disputeId];
    }
    function AddGardenManagerAddress(address _address) external OnlyDeployer() returns(address){
        GManager = GardenManager(_address);
        return _address;
    }

    function ModifyVerifierContractAddress(address _verifierContract) external OnlyDeployer(){
        VerifierContract = Verifier(_verifierContract);
        GManager.ModifyVerifierContract(_verifierContract);
    }

    function AddGarden(uint _gardenIndex, uint[2] memory _secret) public{
        require(msg.sender== address(GManager));
        GardenProposal storage proposal = GardenProposals[_gardenIndex];
        proposal.gardenIndex=_gardenIndex;
        proposal.secretHash=_secret;
        proposal.isOpen=true;
    }

    function AcceptGarden(uint _gardenIndex,uint[2] calldata _proofA, uint[2][2] calldata _proofB,
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

    function RejectGarden(uint _gardenIndex) external OnlyAdmin() OnlyValidGardenProposal(_gardenIndex){
        GardenProposal storage proposal = GardenProposals[_gardenIndex];
        bool alreadyVoted =false;
        for (uint i = 0; i < proposal.rejectProposal.length; i++) {
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

    function AddDispute(uint _gardenIndex,uint _gardenBalance) public {
        require(msg.sender== address(GManager));
        DisputeProposal storage proposal = DisputeProposals[disputeProposalsCount];
        proposal.gardenIndex=_gardenIndex;
        proposal.balance=_gardenBalance;
        proposal.isOpen=true;
        emit newDispute(disputeProposalsCount);
        disputeProposalsCount++;
    }

    function SetAmountForDispute(uint _disputeIndex,uint _ownerAmount, uint _tenantAmount) public OnlyDeployer() OnlyValidDisputeProposal(_disputeIndex){
        DisputeProposal storage proposal = DisputeProposals[_disputeIndex];
        require(_ownerAmount+_tenantAmount==proposal.balance,"Incorrect amounts");
        if(proposal.acceptProposal.length !=0){
            delete proposal.acceptProposal;
        }
        proposal.ownerAmount=_ownerAmount;
        proposal.tenantAmount=_tenantAmount;
        proposal.acceptProposal.push(msg.sender);
    }

    function AcceptDispute(uint _disputeIndex) external OnlyAdmin() OnlyValidDisputeProposal(_disputeIndex){
        bool alreadyVoted =false;
        DisputeProposal storage proposal = DisputeProposals[_disputeIndex];
        for (uint i = 0; i < proposal.acceptProposal.length; i++) {
            if(proposal.acceptProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");        
        proposal.acceptProposal.push(msg.sender);
        if(proposal.acceptProposal.length==MinApprovals){
            GManager.CloseDispute(proposal.gardenIndex, proposal.ownerAmount,proposal.tenantAmount);
            proposal.isOpen=false;
        }
    }
}