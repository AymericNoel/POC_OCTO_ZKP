// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.8.0;
import "./AdminManager.sol";
import "./Verifier.sol";

contract GardenManager {
    Verifier VerifierContract;
    AdminManager AManager;   
     uint32 public GardenCount=0;

    //garden declaration
    mapping (uint32=>Garden) public AllGarden;
    enum GardenType{Vegetable, Hobby}
    enum Status{Waiting,Free,Blocked,CodeWaiting,Location,Blacklist,Dispute}
    struct Garden{
        address payable owner;
        bool multipleOwners;
        address payable[] coOwners;
        GardenType gardenType;
        string district;
        uint32 area;
        uint[2] secretHash;
        string contact;
        Status status; 
        Rent[] rents;
    }
    struct Rent{
        int rate;
        uint32 gardenIndex;
        uint256 duration; 
        uint256 price;
        uint256 beginning;
        uint256 balance;
        address payable tenant;
        AccessCode accessCode;
    }
    struct AccessCode{
        string hashCode;
        string encryptedCode;
    }
    constructor (address _adminContract, address _verifierContract) public {
        AManager = AdminManager(_adminContract);
        VerifierContract = Verifier(_verifierContract);
    }
    
    function OnlyContractAdmin()private view{
        require(msg.sender == address(AManager), "Not administrator contract");
    }
    
    modifier OnlyOwner(uint32 gardenIndex){
        require(AllGarden[gardenIndex].owner==msg.sender, "Not garden owner");
        _;
    }
    modifier OnlyValidProof(uint32 _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC){
        require(VerifierContract.verifyTx(_proofA,_proofB,_proofC,AllGarden[_gardenIndex].secretHash), "Proof of secret invalid");
        _;
    }

    function GetVerifierContractAddress()external view returns(address){
        return address(VerifierContract);
    }
    
    function ModifyVerifierContract(address _verifierContract) public  returns(address){
        OnlyContractAdmin();
        VerifierContract = Verifier(_verifierContract);
        return _verifierContract;
    }

    function CreateGarden(uint[2] calldata _secretHash, string calldata _district,uint32 _area, string calldata _contact, GardenType _gardenType, bool _multipleOwners, address payable[] calldata _coOwners) external returns(uint32 index){
        Garden storage garden = AllGarden[GardenCount];
        garden.area=_area;
        garden.contact=_contact;
        garden.gardenType=_gardenType;
        garden.secretHash=_secretHash;
        garden.district=_district;
        garden.status=Status.Waiting;
        garden.owner=msg.sender;
        if(_multipleOwners){
            garden.multipleOwners=true;
            garden.coOwners=_coOwners;
        }
        AManager.AddGarden(GardenCount,_secretHash);
        GardenCount++;
        return (GardenCount-1);
    }

    function UpdateGardenContact(uint32 _gardenIndex, string calldata _contact) external OnlyOwner(_gardenIndex) {
        AllGarden[_gardenIndex].contact =_contact;
    }

    function UpdateGardenSecretHash(uint32 _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC, uint[2] calldata _newSecretHash) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        AllGarden[_gardenIndex].secretHash =_newSecretHash;
    }

    function AcceptGarden(uint32 _gardenIndex) public  {
        OnlyContractAdmin();
        AllGarden[_gardenIndex].status= Status.Free;
    }

    function RejectGarden(uint32 _gardenIndex) public  {
        OnlyContractAdmin();
        AllGarden[_gardenIndex].status= Status.Blacklist;
    }        

    function GetLastRentForGarden(uint32 _gardenIndex) private view returns(Rent storage){
        return AllGarden[_gardenIndex].rents[AllGarden[_gardenIndex].rents.length-1];
    }

    function ProposeGardenOffer(uint32 _gardenIndex, address payable _tenant, 
    uint256 _rentingDuration, uint _price, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status==Status.Free, "Garden not free");
        Garden storage garden = AllGarden[_gardenIndex];        
        garden.status= Status.Blocked;
        garden.rents.push();
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        lastRent.gardenIndex=_gardenIndex;
        lastRent.duration=_rentingDuration;
        lastRent.price=_price;
        lastRent.tenant=_tenant;
        lastRent.rate=-1;
    }

    function DeleteGardenOffer(uint32 _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC) external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status== Status.Blocked,"No offer running");
        AllGarden[_gardenIndex].status= Status.Free;
        AllGarden[_gardenIndex].rents.pop(); //can be very costly, have to be tested
    }

    function AcceptGardenOffer(uint32 _gardenIndex)external payable{
        Garden storage garden = AllGarden[_gardenIndex];
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        require(garden.status== Status.Blocked, "No offer running");
        require(lastRent.tenant== msg.sender, "Not the correct tenant");
        require(lastRent.price <= msg.value, "Insufficient amount");
        lastRent.balance=msg.value;
        garden.status=Status.CodeWaiting;
    }

    function AddAccessCodeToGarden(uint32 _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC, string memory _hashCode,string memory _encryptedCode) public OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status==Status.CodeWaiting,"No location running");
        Garden storage garden = AllGarden[_gardenIndex];
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        lastRent.beginning=block.timestamp;        
        lastRent.accessCode=AccessCode(_hashCode,_encryptedCode);
        garden.status=Status.Location;
    }

    function GetRefundBeforeLocation(uint32 _gardenIndex) external {
        require(AllGarden[_gardenIndex].status==Status.CodeWaiting,"Code is not missing");
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender,"Not the tenant");
        msg.sender.transfer(lastRent.balance);
        AllGarden[_gardenIndex].status=Status.Free;
    }
    function TransferPaymentToMultipleOwners(uint _amount, Garden memory _garden) internal {
        for (uint256 i = 0; i < _garden.coOwners.length; i++) {
            _garden.coOwners[i].transfer(_amount);
        }
    }
    function IsRentOver(Rent memory _rent) internal view returns (bool){
        if(_rent.beginning + _rent.duration<= block.timestamp){
            return true;
        }
        return false;
    }
    function UpdateLocationStatusAndGetPayment(uint32 _gardenIndex, uint[2] calldata _proofA, uint[2][2] calldata _proofB,
            uint[2] calldata _proofC)external OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        Garden storage garden = AllGarden[_gardenIndex];
        require(garden.status!= Status.Dispute, "Dispute is running");
        require(IsRentOver(lastRent),"Location not over");
        if(garden.multipleOwners){
            uint256 payroll = lastRent.balance/garden.coOwners.length;
            TransferPaymentToMultipleOwners(payroll,garden);    
        }else{
            garden.owner.transfer(lastRent.balance);
        }
        lastRent.balance=0;
        lastRent.accessCode.hashCode="";
        AllGarden[_gardenIndex].status=Status.Free;
    }    

    function AddGradeToGarden(uint32 _gardenIndex,int _grade)external returns(bool saved){
        require(_grade<6 && _grade >=0, "Grade is not in range 0-5");
        saved=false;
        Rent[] storage allRents = AllGarden[_gardenIndex].rents;
        for (uint256 i = 0; i < allRents.length; i++) {
            if(msg.sender== allRents[i].tenant && allRents[i].rate==int(-1) && IsRentOver(allRents[i])){
                allRents[i].rate=_grade;
                saved=true;
            }
        }
        return saved;
    }

    function GetEncryptedAccessCodeForGarden(uint32 _gardenIndex)external view returns(string memory) {
        Rent memory lastRent = GetLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender,"Not the tenant");
        return lastRent.accessCode.encryptedCode;
    }

    function AddDispute(uint32 _gardenIndex) public {
        Rent memory lastRent = GetLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender || AllGarden[_gardenIndex].owner==msg.sender,"Not the tenant nor the owner");
        AllGarden[_gardenIndex].status = Status.Dispute;
        AManager.AddDispute(_gardenIndex);
    }

    function CloseDispute(uint32 _gardenIndex, uint _ownerAmount, uint _tenantAmount) public {
        OnlyContractAdmin();
        Garden storage garden = AllGarden[_gardenIndex];    
        require(garden.status==Status.Dispute, "No dispute running"); 
        Rent memory lastRent = GetLastRentForGarden(_gardenIndex);   
        if(_tenantAmount!=0){
            lastRent.tenant.transfer(_tenantAmount);
        }
        if(_ownerAmount!=0){
                if(garden.multipleOwners){
                uint256 payroll = _ownerAmount/garden.coOwners.length;
                TransferPaymentToMultipleOwners(payroll,garden);   
            }else{
                garden.owner.transfer(_ownerAmount);
            }
        }        
        lastRent.balance=0;
        lastRent.accessCode.hashCode="";
        garden.status=Status.Free;
    }
}