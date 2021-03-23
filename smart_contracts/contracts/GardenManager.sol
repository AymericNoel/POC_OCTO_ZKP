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
    mapping (uint32=>Garden) private AllGarden;
    enum GardenType{Vegetable, Hobby}
    enum Status{Waiting,Free,Blocked,CodeWaiting,Location,Blacklist}
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

    modifier OnlyContractAdmin(){
        require(msg.sender == address(AManager), "Only administrator contract should call.");
        _;
    }
    modifier OnlyFreeGarden(uint32 gardenIndex){
        require(AllGarden[gardenIndex].status==Status.Free, "Garden should be free.");
        _;
    }
    modifier OnlyOwner(uint32 gardenIndex){
        require(AllGarden[gardenIndex].owner==msg.sender, "Only garden owner should call");
        _;
    }
    modifier OnlyValidProof(uint32 _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC){
                require(VerifierContract.verifyTx(_proofA,_proofB,_proofC,AllGarden[_gardenIndex].secretHash), "Proof of secret should be valid");
                _;
            }

    function ModifyVerifierContract(address _verifierContract) public OnlyContractAdmin() returns(address){
        VerifierContract = Verifier(_verifierContract);
        return _verifierContract;
    }

    function CreateGarden(uint[2] memory _secretHash, string memory _district,uint32 _area, string memory _contact, GardenType _gardenType, bool _multipleOwners, address payable[] memory _coOwners) public returns(uint32 index){
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

    function UpdateGardenContact(uint32 _gardenIndex, string memory _contact) public OnlyOwner(_gardenIndex) {
        AllGarden[_gardenIndex].contact =_contact;
    }

    function UpdateGardenSecretHash(uint32 _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC, uint[2] memory _newSecretHash) public OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        AllGarden[_gardenIndex].secretHash =_newSecretHash;
    }

    function AcceptGarden(uint32 _gardenIndex) public OnlyContractAdmin() {
        AllGarden[_gardenIndex].status= Status.Free;
    }

    function RejectGarden(uint32 _gardenIndex) public OnlyContractAdmin() {
        AllGarden[_gardenIndex].status= Status.Blacklist;
    }    

    function IsRentOver(Rent memory _rent) private view returns (bool){
        if(_rent.beginning + _rent.duration<= block.timestamp){
            return true;
        }
        return false;
    }

    function GetLastRentForGarden(uint32 _gardenIndex) private view returns(Rent storage){
        return AllGarden[_gardenIndex].rents[AllGarden[_gardenIndex].rents.length-1];
    }

    function ProposeGardenOffer(uint32 _gardenIndex, address payable _tenant, 
    uint256 _rentingDuration, uint _price, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC) public OnlyFreeGarden(_gardenIndex) OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
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

    function DeleteGardenOffer(uint32 _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC) public OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status== Status.Blocked,"There is no offer running");
        AllGarden[_gardenIndex].status= Status.Free;
        AllGarden[_gardenIndex].rents.pop(); //can be very costly, have to be tested
    }

    function AcceptGardenOffer(uint32 _gardenIndex)public payable{
        Garden storage garden = AllGarden[_gardenIndex];
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        require(garden.status== Status.Blocked, "Garden should be block for user");
        require(lastRent.tenant== msg.sender, "Should be the correct tenant public key");
        require(lastRent.price <= msg.value, "Amount for rents insufficient");
        lastRent.balance=msg.value;
        garden.status=Status.CodeWaiting;
    }

    function AddAccessCodeToGarden(uint32 _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC, string memory _hashCode,string memory _encryptedCode) public OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        require(AllGarden[_gardenIndex].status==Status.CodeWaiting,"Can't add code if no location");
        Garden storage garden = AllGarden[_gardenIndex];
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        lastRent.beginning=block.timestamp;        
        lastRent.accessCode=AccessCode(_hashCode,_encryptedCode);
        garden.status=Status.Location;
    }

    function GetRefundBeforeLocation(uint32 _gardenIndex) public {
        require(AllGarden[_gardenIndex].status==Status.CodeWaiting,"Code is not missing");
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender,"Can't refund if you're not the tenant");
        msg.sender.transfer(lastRent.balance);
        AllGarden[_gardenIndex].status=Status.Free;
    }

    function UpdateLocationStatusAndGetPayment(uint32 _gardenIndex, uint[2] memory _proofA, uint[2][2] memory _proofB,
            uint[2] memory _proofC)public OnlyOwner(_gardenIndex) OnlyValidProof(_gardenIndex,_proofA,_proofB,_proofC){
        Rent storage lastRent = GetLastRentForGarden(_gardenIndex);
        Garden storage garden = AllGarden[_gardenIndex];
        require(IsRentOver(lastRent),"Can't withdraw ether before the end of location");
        if(garden.multipleOwners){
            uint payroll = lastRent.balance/garden.coOwners.length;
            for (uint256 i = 0; i < garden.coOwners.length; i++) {
                garden.coOwners[i].transfer(payroll);
            }
        }else{
            garden.owner.transfer(lastRent.balance);
        }
        lastRent.accessCode.hashCode="";
        AllGarden[_gardenIndex].status=Status.Free;
    }

    function AddGradeToGarden(uint32 _gardenIndex,int _grade)public returns(bool saved){
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

    function GetGardenById(uint32 _gardenIndex)external view returns(address payable,bool, address payable[] memory, GardenType,string memory, uint32 , string memory, Status, Rent[] memory){
        Garden memory garden = AllGarden[_gardenIndex];
        return(
            garden.owner,
            garden.multipleOwners,
            garden.coOwners,
            garden.gardenType,
            garden.district,
            garden.area,
            garden.contact,
            garden.status,
            garden.rents
        );
    }

    function GetEncryptedAccessCodeForGarden(uint32 _gardenIndex)external view returns(string memory) {
        Rent memory lastRent = GetLastRentForGarden(_gardenIndex);
        require(lastRent.tenant==msg.sender,"Can't access to code if you're not the tenant");
        return lastRent.accessCode.encryptedCode;
    }
}
//ouverture litige :
//une fonction pour bloquer export eth, une pour redonner les ethers aux bonnes personnes et/ou modifier duree loc