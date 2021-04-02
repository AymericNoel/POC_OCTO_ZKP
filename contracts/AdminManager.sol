// SPDX-License-Identifier: MIT
pragma solidity ^0.6.1;
import "./GardenManager.sol";
import "./Verifier.sol";

/// @title AdminManager contract
/// @author Aymeric NOEL <aymeric.noel@octo.com>
/// @notice Use this contract as a multisignature contract to validate garden and resolve dispute on @GardenManager contract
contract AdminManager{   
    struct GardenProposal{
        uint gardenIndex;
        uint[2] secretHash;
        address[] acceptProposal;
        address[] rejectProposal;
        bool isOpen;
    }
   
    struct DisputeProposal{
        uint gardenIndex;
        uint ownerAmount;
        uint tenantAmount;
        uint balance;
        address[] acceptProposal;
        bool isOpen;
        bool isReady;
    }

    //import area
    Verifier public VerifierContract;
    GardenManager public GManager;  

    //administrators of this contract
    mapping (address=>bool) private ContractAdmins; 

    mapping (uint=>GardenProposal) public GardenProposals;
    mapping (uint=>DisputeProposal) public DisputeProposals;

    address private deployer;
    string public ContactP2P;

    //minimum approvals to valid a proposal
    uint public MinApprovals;

    //number of disputeProposal in the contract
    uint public disputeProposalsCount;

    /// @dev Emited when a new disputeProposal is created
    /// @param _disputeIndex The id of the given disputeProposal
    event NewDispute(uint _disputeIndex);

    constructor (address[] memory _contractAdmins,uint _minApprovals, address _verifierContract, string memory _contactP2P) public {
        for (uint i = 0; i < _contractAdmins.length; i++) {
            ContractAdmins[_contractAdmins[i]]=true;
        }
        MinApprovals=_minApprovals;
        deployer= msg.sender;
        VerifierContract = Verifier(_verifierContract);
        ContactP2P = _contactP2P;
    }

    modifier OnlyAdmin{
        require(ContractAdmins[msg.sender], "Only administrators should call");
        _;
    }
    modifier OnlyValidGardenProposal(uint _gardenIndex){
        require(GardenProposals[_gardenIndex].isOpen, "GardenProposal should be open.");   
        _;   
    }
    modifier OnlyOpenDisputeProposal(uint _disputeIndex){
        require(DisputeProposals[_disputeIndex].isOpen, "DisputeProposal should be open."); 
        _;   
    }
    modifier OnlyDeployer{
        require(msg.sender==deployer,"Must be the deployer");
        _;
    }
    modifier OnlyGardenManager{
        require(msg.sender== address(GManager),"Must be garden manager contract");
        _;
    }

    function getGardenProposalById(uint _gardenIndex) external view returns(uint gardenIndex,
        uint[2] memory secretHash, address[] memory acceptProposal, address[] memory rejectProposal, bool isOpen){
        GardenProposal memory garden=GardenProposals[_gardenIndex];
        return(garden.gardenIndex,garden.secretHash,garden.acceptProposal,garden.rejectProposal,garden.isOpen);
    }

    function getDisputeProposalById(uint _disputeId)external view returns(uint gardenIndex,
        uint ownerAmount,
        uint tenantAmount,
        uint balance,
        address[] memory acceptProposal,
        bool isOpen,
        bool isReady){
        DisputeProposal memory dispute = DisputeProposals[_disputeId];
        return (dispute.gardenIndex,dispute.ownerAmount,dispute.tenantAmount,dispute.balance,dispute.acceptProposal,
        dispute.isOpen,dispute.isReady);
    }

    function addGardenManagerAddress(address _address) external OnlyDeployer returns(address){
        GManager = GardenManager(_address);
        return _address;
    }

    function modifyVerifierContractAddress(address _verifierContract) external OnlyDeployer{
        VerifierContract = Verifier(_verifierContract);
        GManager.modifyVerifierContract(_verifierContract);
    }

    function addGarden(uint _gardenIndex, uint[2] memory _secret)public OnlyGardenManager {
        GardenProposals[_gardenIndex] = GardenProposal(_gardenIndex,_secret,new address[](0),new address[](0),true);
    }

    function acceptGarden(uint _gardenIndex,uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyAdmin OnlyValidGardenProposal(_gardenIndex){
        GardenProposal storage proposal = GardenProposals[_gardenIndex];
        bool alreadyVoted =false;
        for (uint i = 0; i < proposal.acceptProposal.length; i++) {
            if(proposal.acceptProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");
        require(VerifierContract.verifyTx(_proofA,_proofB,_proofC,proposal.secretHash), "Proof of secret invalid");
        proposal.acceptProposal.push(msg.sender);
        if(proposal.acceptProposal.length==MinApprovals){
            GManager.acceptGarden(_gardenIndex);
            proposal.isOpen=false;
        }
    }

    function rejectGarden(uint _gardenIndex) external OnlyAdmin OnlyValidGardenProposal(_gardenIndex){
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
            GManager.rejectGarden(_gardenIndex);
            proposal.isOpen=false;
        }
    }

    function addDispute(uint _gardenIndex,uint _gardenBalance) public OnlyGardenManager {
        DisputeProposals[disputeProposalsCount] = DisputeProposal(_gardenIndex,0,0,_gardenBalance,new address[](0),true,false);
        emit NewDispute(disputeProposalsCount);
        disputeProposalsCount++;
    }

    /// @dev use this function to set amount for the owner and the tenant in order to resolve the dispute.
    /// Only the deployer should call this.
    /// @param _disputeIndex the id of the disputeProposal
    /// @param _ownerAmount the amount that should be given to the owner after dispute
    /// @param _tenantAmount the amount that should be given to the tenant after dispute
    function setAmountForDispute(uint _disputeIndex,uint _ownerAmount, uint _tenantAmount) public OnlyDeployer OnlyOpenDisputeProposal(_disputeIndex){
        DisputeProposal storage proposal = DisputeProposals[_disputeIndex];
        require(_ownerAmount+_tenantAmount==proposal.balance,"Incorrect amounts");
        if(proposal.acceptProposal.length !=0){
            delete proposal.acceptProposal;
        }
        proposal.ownerAmount=_ownerAmount;
        proposal.tenantAmount=_tenantAmount;
        proposal.isReady=true;
        proposal.acceptProposal.push(msg.sender);
    }

    function acceptDispute(uint _disputeIndex) external OnlyAdmin OnlyOpenDisputeProposal(_disputeIndex){
        DisputeProposal storage proposal = DisputeProposals[_disputeIndex]; 
        require(proposal.isReady,"Amounts not set"); 
        bool alreadyVoted =false; 
        for (uint i = 0; i < proposal.acceptProposal.length; i++) {
            if(proposal.acceptProposal[i]==msg.sender){
                alreadyVoted=true;
                break;
            }
        }
        require(!alreadyVoted, "You should only vote once");        
        proposal.acceptProposal.push(msg.sender);
        if(proposal.acceptProposal.length==MinApprovals){
            GManager.closeDispute(proposal.gardenIndex, proposal.ownerAmount,proposal.tenantAmount);
            proposal.isOpen=false;
        }
    }
}