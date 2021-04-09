// SPDX-License-Identifier: MIT
pragma solidity ^0.6.1;
import "./AdminManager.sol";
import "./Verifier.sol";
import {GLibrary} from "./GLibrary.sol";

/// @title GardenManager contract
/// @author Aymeric NOEL <aymeric.noel@octo.com>
/// @notice this contract is used to automatically manage the rental of gardens directly between owners and tenants
contract GardenManager {
    Verifier public VerifierContract;
    AdminManager public AManager;
    uint public GardenCount;
    mapping (uint=>GLibrary.Garden) public AllGarden;

    /// @dev Emitted when a new garden is created
    /// @param _owner garden's owner
    /// @param _gardenIndex garden index
    event NewGarden(address _owner, uint _gardenIndex);
    
    constructor (address _adminContract, address _verifierContract) public {
        AManager = AdminManager(_adminContract);
        VerifierContract = Verifier(_verifierContract);
    }
    
    modifier OnlyContractAdmin {
        require(msg.sender == address(AManager), "Not administrator contract");
        _;
    }
    
    modifier OnlyOwner(uint gardenIndex){
        require(AllGarden[gardenIndex].owner==msg.sender, "Not garden owner");
        _;
    }

    modifier OnlyValidProof(uint _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC){
        require(VerifierContract.verifyTx(_proofA,_proofB,_proofC,AllGarden[_gardenIndex].secretHash), "Proof of secret invalid");
        _;
    }

    function getGardenById(uint _gardenIndex)external view returns(address payable owner,
        bool multipleOwners,
        address payable[] memory coOwners,
        GLibrary.GardenType gardenType,
        string memory district,
        uint32 area,
        uint[2] memory secretHash,
        string memory contact,
        GLibrary.Status status,
        uint rentLength){
        GLibrary.Garden memory garden = AllGarden[_gardenIndex];
        return (garden.owner, garden.multipleOwners, garden.coOwners, garden.gardenType,
        garden.district,garden.area, garden.secretHash, garden.contact,garden.status,
        garden.rents.length);
    }

    function getRentByGardenAndRentId(uint _gardenIndex, uint _rentId) external view returns(int rate,
        uint duration, 
        uint price,
        uint beginning,
        uint balance,
        address payable tenant,
        bytes32 gardenHashCode){
        GLibrary.Rent memory rent = AllGarden[_gardenIndex].rents[_rentId];
        return(rent.rate,rent.duration,rent.price,rent.beginning,rent.balance,rent.tenant,rent.accessCode.hashCode);
    }

    function getAccessCodeByGardenId(uint _gardenIndex)external view returns(string memory encryptedCode){
        GLibrary.Rent memory rent = getLastRentForGarden(_gardenIndex);
        require(msg.sender==rent.tenant || msg.sender==AllGarden[_gardenIndex].owner,"Caller must be the tenant or the owner");
        return(rent.accessCode.encryptedCode);
    }

    function modifyVerifierContract(address _verifierContract) public OnlyContractAdmin returns(address){
        VerifierContract = Verifier(_verifierContract);
        return _verifierContract;
    }

    /// @dev Use this function to add a new garden.
    /// @param _secretHash hash of the user' secret; must be in decimal form int[2]
    /// @param _district district of the garden
    /// @param _area area of the garden
    /// @param _contact contact of the owner
    /// @param _gardenType gardenType of the garden
    /// @param _multipleOwners boolean that represents multiple owners for a garden or not
    /// @param _coOwners in case of multiple owners : all owners' addresses, could be empty
    function createGarden(uint[2] calldata _secretHash, string calldata _district,uint32 _area, string calldata _contact, GLibrary.GardenType _gardenType, bool _multipleOwners, address payable[] calldata _coOwners) external{
        GardenCount++;
        GLibrary.Garden storage garden = AllGarden[GardenCount];
        garden.area=_area;
        garden.contact=_contact;
        garden.gardenType=_gardenType;
        garden.secretHash=_secretHash;
        garden.district=_district;
        garden.status=GLibrary.Status.Waiting;
        garden.owner=msg.sender;
        if(_multipleOwners){
            garden.multipleOwners=true;
            garden.coOwners=_coOwners;
        }
        AManager.addGarden(GardenCount, _secretHash);
        emit NewGarden(msg.sender, GardenCount);        
    }

    /// @dev Use this function to update the contact of a garden.
    /// The caller must be the garden's owner.
    /// @param _gardenIndex the Id of the garden
    /// @param _contact the new contact of the garden
    function updateGardenContact(uint _gardenIndex, string calldata _contact) external OnlyOwner(_gardenIndex) {
        AllGarden[_gardenIndex].contact =_contact;
    }

    /// @dev Use this function to update the secret of the secret of a garden.
    /// The caller must be the garden's owner and must prove it by sending the preimage of the secret hash.
    /// @param _gardenIndex the Id of the garden
    /// @param _proofA the first part of the proof
    /// @param _proofB the second part of the proof
    /// @param _proofC the third part of the proof
    /// @param _newSecretHash the new hash of the secret's garden
    function updateGardenSecretHash(uint _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC, uint[2] calldata _newSecretHash) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        AllGarden[_gardenIndex].secretHash =_newSecretHash;
    }


    /// @dev Use this function to accept a new garden and open it to location.
    /// The caller must be the admin contract.
    /// @param _gardenIndex the Id of the garden
    function acceptGarden(uint _gardenIndex) public OnlyContractAdmin {
        AllGarden[_gardenIndex].status= GLibrary.Status.Free;
    }

    /// @dev Use this function to reject a new garden and blacklist it.
    /// The caller must be the admin contract.
    /// @param _gardenIndex the Id of the garden
    function rejectGarden(uint _gardenIndex) public OnlyContractAdmin{
        AllGarden[_gardenIndex].status= GLibrary.Status.Blacklist;
    }        

    function getLastRentForGarden(uint _gardenIndex) private view returns(GLibrary.Rent storage){
        return AllGarden[_gardenIndex].rents[AllGarden[_gardenIndex].rents.length-1];
    }

    /// @dev Use this function to propose a new location offer.
    /// The caller must be the owner, after agreement with the tenant offchain.
    /// @param _gardenIndex the Id of the garden
    /// @param _tenant tenant's garden
    /// @param _rentingDuration duration of the location
    /// @param _price price of the location
    /// @param _proofA the first part of the proof
    /// @param _proofB the second part of the proof
    /// @param _proofC the third part of the proof
    function proposeGardenOffer(uint _gardenIndex, address payable _tenant, 
    uint _rentingDuration, uint _price, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status==GLibrary.Status.Free, "Garden not free");
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];        
        garden.status= GLibrary.Status.Blocked;
        garden.rents.push();
        GLibrary.Rent storage lastRent = getLastRentForGarden(_gardenIndex);
        lastRent.duration=_rentingDuration;
        lastRent.price=_price;
        lastRent.tenant=_tenant;
        lastRent.rate=-1;
    }

    /// @dev Use this function to delete an offer that has not received any response.
    /// Ownly the garden's owner could call and only if an offer is running.
    /// @param _gardenIndex the Id of the garden
    /// @param _proofA the first part of the proof
    /// @param _proofB the second part of the proof
    /// @param _proofC the third part of the proof
    function deleteGardenOffer(uint _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status== GLibrary.Status.Blocked,"No offer running");
        AllGarden[_gardenIndex].status= GLibrary.Status.Free;
        AllGarden[_gardenIndex].rents.pop();
    }

    /// @dev Use this function to accept a location offer.
    /// Caller must be the tenant.
    /// @param _gardenIndex the Id of the garden
    function acceptGardenOffer(uint _gardenIndex)external payable{
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        GLibrary.Rent storage lastRent = getLastRentForGarden(_gardenIndex);
        require(garden.status== GLibrary.Status.Blocked, "No offer running");
        require(lastRent.tenant== msg.sender, "Not the correct tenant");
        require(lastRent.price <= msg.value, "Insufficient amount");
        lastRent.balance=msg.value;
        garden.status=GLibrary.Status.CodeWaiting;
    }

    /// @dev Use this function to add access code to a garden.
    /// The caller must be the garden's owner and prove it.
    /// @param _gardenIndex the Id of the garden
    /// @param _proofA the first part of the proof
    /// @param _proofB the second part of the proof
    /// @param _proofC the third part of the proof
    /// @param _hashCode the hash of the access code
    /// @param _encryptedCode the code encrypted with the tenant's public key
    function addAccessCodeToGarden(uint _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC, bytes32 _hashCode,string memory _encryptedCode) public OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status==GLibrary.Status.CodeWaiting,"No location running");
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        GLibrary.Rent storage lastRent = getLastRentForGarden(_gardenIndex);
        lastRent.beginning=block.timestamp;
        lastRent.accessCode=GLibrary.AccessCode(_hashCode,_encryptedCode);
        garden.status=GLibrary.Status.Location;
    }

    /// @dev Use this function to get refund and to cancel a location only if access code is missing.
    /// @param _gardenIndex the Id of the garden
    function getRefundBeforeLocation(uint _gardenIndex) external {
        require(AllGarden[_gardenIndex].status==GLibrary.Status.CodeWaiting,"Code is not missing");
        GLibrary.Rent storage lastRent = getLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender,"Not the tenant");
        uint balance = lastRent.balance;
        AllGarden[_gardenIndex].status=GLibrary.Status.Free;
        lastRent.balance =0;
        msg.sender.transfer(balance);        
    }

    function transferPaymentToMultipleOwners(uint _amount, GLibrary.Garden memory _garden) internal {
        for (uint i = 0; i < _garden.coOwners.length; i++) {
            _garden.coOwners[i].transfer(_amount);
        }
    }

    /// @dev Use the function to update location status after location and get payment.
    /// The caller must be the garden's owner.
    /// @param _gardenIndex the Id of the garden
    /// @param _proofA the first part of the proof
    /// @param _proofB the second part of the proof
    /// @param _proofC the third part of the proof
    function updateLocationStatusAndGetPayment(uint _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC)external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        GLibrary.Rent storage lastRent = getLastRentForGarden(_gardenIndex);
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        require(garden.status!= GLibrary.Status.Dispute, "Dispute is running");
        require(isRentOver(lastRent.beginning,lastRent.duration),"Location not over");
        uint balance = lastRent.balance;
        lastRent.balance=0;
        lastRent.accessCode.hashCode= 0;
        AllGarden[_gardenIndex].status=GLibrary.Status.Free;
        if(garden.multipleOwners){
            uint payroll = balance/garden.coOwners.length;
            transferPaymentToMultipleOwners(payroll,garden);
        }else{
            garden.owner.transfer(balance);
        }
    }

    /// @dev Tenant should use this function to add a grade to his locations between 1 and 5.
    /// @param _gardenIndex the Id of the garden
    /// @param _grade the given grade
    /// @return saved : true if saved, false either
    function addGradeToGarden(uint _gardenIndex, int _grade)external returns(bool saved){
        require(_grade<6 && _grade >=0, "Grade is not in range 0-5");
        saved=false;
        GLibrary.Rent[] storage allRents = AllGarden[_gardenIndex].rents;
        for (uint i = 0; i < allRents.length; i++) {
            if(msg.sender== allRents[i].tenant && allRents[i].rate==int(-1) && isRentOver(allRents[i].beginning,allRents[i].duration)){
                allRents[i].rate=_grade;
                saved=true;
            }
        }
        return saved;
    }

    /// @dev Use this function to add a dispute in case of disagreement between owner and tenant.
    /// @param _gardenIndex the Id of the garden
    function addDispute(uint _gardenIndex) public {
        require(AllGarden[_gardenIndex].status==GLibrary.Status.Location,"No location running");
        GLibrary.Rent memory lastRent = getLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender || AllGarden[_gardenIndex].owner==msg.sender,"Not the tenant nor the owner");
        AllGarden[_gardenIndex].status = GLibrary.Status.Dispute;
        AManager.addDispute(_gardenIndex,lastRent.balance);
    }

    /// @dev Use this function to close a dispute and give back ether amounts to correct people.
    /// Must be call by the admin contract.
    /// @param _gardenIndex the Id of the garden
    /// @param _ownerAmount amount for the owner
    /// @param _tenantAmount amount for the tenant
    function closeDispute(uint _gardenIndex, uint _ownerAmount, uint _tenantAmount) public OnlyContractAdmin{
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        require(garden.status==GLibrary.Status.Dispute, "No dispute running");
        GLibrary.Rent storage lastRent = getLastRentForGarden(_gardenIndex);
        if(_tenantAmount!=0){
            lastRent.tenant.transfer(_tenantAmount);
        }
        if(_ownerAmount!=0){
            if(garden.multipleOwners){
                uint payroll = _ownerAmount/garden.coOwners.length;
                transferPaymentToMultipleOwners(payroll,garden);
            }else{
                garden.owner.transfer(_ownerAmount);
            }
        }
        lastRent.balance=0;
        lastRent.accessCode.hashCode=0;
        garden.status=GLibrary.Status.Free;
    }

    function isRentOver(uint _beginning, uint _duration) private view returns (bool){
        if(_beginning + _duration<= block.timestamp){
            return true;
        }
        return false;
    }
}