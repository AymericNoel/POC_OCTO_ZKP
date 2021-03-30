// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2; //voir si c'est necessaire //linter solidity
pragma solidity >=0.4.22 <0.8.0;
import "./AdminManager.sol";
import "./Verifier.sol";
import {GLibrary} from "./GLibrary.sol";

contract GardenManager {
    Verifier VerifierContract;
    AdminManager AManager;
    uint public GardenCount;
    mapping (uint=>GLibrary.Garden) public AllGarden;
    event newGarden(address _owner, uint _gardenIndex);
    
    constructor (address _adminContract, address _verifierContract) public {
        AManager = AdminManager(_adminContract);
        VerifierContract = Verifier(_verifierContract);
    }
    
    function OnlyContractAdmin()private view{
        require(msg.sender == address(AManager), "Not administrator contract");
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

    function GetGardenById(uint _gardenIndex)external view returns(GLibrary.Garden memory){
        return AllGarden[_gardenIndex];
    }
    
    function GetVerifierContractAddress()external view returns(address){
        return address(VerifierContract);
    }
    
    function ModifyVerifierContract(address _verifierContract) public  returns(address){
        OnlyContractAdmin();
        VerifierContract = Verifier(_verifierContract);
        return _verifierContract;
    }

    function CreateGarden(uint[2] calldata _secretHash, string calldata _district,uint32 _area, string calldata _contact, GLibrary.GardenType _gardenType, bool _multipleOwners, address payable[] calldata _coOwners) external{
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
        AManager.AddGarden(GardenCount,_secretHash);
        GardenCount++;
        emit newGarden(msg.sender,GardenCount-1);
    }

    function UpdateGardenContact(uint _gardenIndex, string calldata _contact) external OnlyOwner(_gardenIndex) {
        AllGarden[_gardenIndex].contact =_contact;
    }

    function UpdateGardenSecretHash(uint _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC, uint[2] calldata _newSecretHash) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        AllGarden[_gardenIndex].secretHash =_newSecretHash;
    }

    function AcceptGarden(uint _gardenIndex) public  {
        OnlyContractAdmin();
        AllGarden[_gardenIndex].status= GLibrary.Status.Free;
    }

    function RejectGarden(uint _gardenIndex) public  {
        OnlyContractAdmin();
        AllGarden[_gardenIndex].status= GLibrary.Status.Blacklist;
    }        

    function GetLastRentForGarden(uint _gardenIndex) private view returns(GLibrary.Rent storage){
        return AllGarden[_gardenIndex].rents[AllGarden[_gardenIndex].rents.length-1];
    }

    function ProposeGardenOffer(uint _gardenIndex, address payable _tenant, 
    uint _rentingDuration, uint _price, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status==GLibrary.Status.Free, "Garden not free");
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];        
        garden.status= GLibrary.Status.Blocked;
        garden.rents.push();
        GLibrary.Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        lastRent.duration=_rentingDuration;
        lastRent.price=_price;
        lastRent.tenant=_tenant;
        lastRent.rate=-1;
    }

    function DeleteGardenOffer(uint _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status== GLibrary.Status.Blocked,"No offer running");
        AllGarden[_gardenIndex].status= GLibrary.Status.Free;
        AllGarden[_gardenIndex].rents.pop();
    }

    function AcceptGardenOffer(uint _gardenIndex)external payable{
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        GLibrary.Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        require(garden.status== GLibrary.Status.Blocked, "No offer running");
        require(lastRent.tenant== msg.sender, "Not the correct tenant");
        require(lastRent.price <= msg.value, "Insufficient amount");
        lastRent.balance=msg.value;
        garden.status=GLibrary.Status.CodeWaiting;
    }

    function AddAccessCodeToGarden(uint _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC, string memory _hashCode,string memory _encryptedCode) public OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status==GLibrary.Status.CodeWaiting,"No location running");
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        GLibrary.Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        lastRent.beginning=block.timestamp;
        lastRent.accessCode=GLibrary.AccessCode(_hashCode,_encryptedCode);
        garden.status=GLibrary.Status.Location;
    }

    function GetRefundBeforeLocation(uint _gardenIndex) external {
        require(AllGarden[_gardenIndex].status==GLibrary.Status.CodeWaiting,"Code is not missing");
        GLibrary.Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender,"Not the tenant");
        msg.sender.transfer(lastRent.balance);
        AllGarden[_gardenIndex].status=GLibrary.Status.Free;
        lastRent.balance =0;
    }
    function TransferPaymentToMultipleOwners(uint _amount, GLibrary.Garden memory _garden) internal {
        for (uint i = 0; i < _garden.coOwners.length; i++) {
            _garden.coOwners[i].transfer(_amount);
        }
    }

    function UpdateLocationStatusAndGetPayment(uint _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC)external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        GLibrary.Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        require(garden.status!= GLibrary.Status.Dispute, "Dispute is running");
        require(GLibrary.IsRentOver(lastRent.beginning,lastRent.duration),"Location not over");
        if(garden.multipleOwners){
            uint payroll = lastRent.balance/garden.coOwners.length;
            TransferPaymentToMultipleOwners(payroll,garden);    
        }else{
            garden.owner.transfer(lastRent.balance);
        }
        lastRent.balance=0;
        lastRent.accessCode.hashCode="";
        AllGarden[_gardenIndex].status=GLibrary.Status.Free;
    }

    function AddGradeToGarden(uint _gardenIndex,int _grade)external returns(bool saved){
        require(_grade<6 && _grade >=0, "Grade is not in range 0-5");
        saved=false;
        GLibrary.Rent[] storage allRents = AllGarden[_gardenIndex].rents;
        for (uint i = 0; i < allRents.length; i++) {
            if(msg.sender== allRents[i].tenant && allRents[i].rate==int(-1) && GLibrary.IsRentOver(allRents[i].beginning,allRents[i].duration)){
                allRents[i].rate=_grade;
                saved=true;
            }
        }
        return saved;
    }

    function AddDispute(uint _gardenIndex) public {
        require(AllGarden[_gardenIndex].status==GLibrary.Status.Location,"No location running");
        GLibrary.Rent memory lastRent = GetLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender || AllGarden[_gardenIndex].owner==msg.sender,"Not the tenant nor the owner");
        AllGarden[_gardenIndex].status = GLibrary.Status.Dispute;
        AManager.AddDispute(_gardenIndex,lastRent.balance);
    }

    function CloseDispute(uint _gardenIndex, uint _ownerAmount, uint _tenantAmount) public {
        OnlyContractAdmin();
        GLibrary.Garden storage garden = AllGarden[_gardenIndex];
        require(garden.status==GLibrary.Status.Dispute, "No dispute running");
        GLibrary.Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        if(_tenantAmount!=0){
            lastRent.tenant.transfer(_tenantAmount);
        }
        if(_ownerAmount!=0){
                if(garden.multipleOwners){
                uint payroll = _ownerAmount/garden.coOwners.length;
                TransferPaymentToMultipleOwners(payroll,garden);
            }else{
                garden.owner.transfer(_ownerAmount);
            }
        }
        lastRent.balance=0;
        lastRent.accessCode.hashCode="";
        garden.status=GLibrary.Status.Free;
    }
}