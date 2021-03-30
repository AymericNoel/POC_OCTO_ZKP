const adminManager = artifacts.require('AdminManager.sol');
const verifieur = artifacts.require('Verifier.sol');
const gardenManager = artifacts.require('GardenManager.sol');

const validProof = require("./validProof.json");
let tryCatch = require("./exceptions.js").tryCatch;
let errTypes = require("./exceptions.js").errTypes;
let gardenType = require("./Utils.js").GardenType;
let gardenStatus = require("./Utils.js").GardenStatus;
const secretHash=["263561599766550617289250058199814760685", "65303172752238645975888084098459749904"];

contract('Testing Garden Manager contract', function (accounts) {
    const deployer = accounts[0];
    const firstSigner = accounts[0];
    const secondSigner = accounts[1];
    const thirdSigner = accounts[2];
    const minApprovals=3;

    // Setup before each test
    beforeEach('setup contract for each test', async function () {
        var P2PContact = "contactAdmin@gmail.com";
        Verifier = await verifieur.new({from : deployer});
        AdminContract = await adminManager.new([firstSigner, secondSigner, thirdSigner], minApprovals,Verifier.address,P2PContact, { from: deployer});   
        GardenManager = await gardenManager.new(AdminContract.address, Verifier.address);
        GardenManagerAddress= GardenManager.address;
        await AdminContract.AddGardenManagerAddress(GardenManagerAddress, {from:deployer});
    })
    it('Verifier contract address should be correct', async function () {
        let retrievedAddress = await GardenManager.GetVerifierContractAddress();
        assert.equal(retrievedAddress, Verifier.address);
    })
    it('Only AdminManager contract should modify verifier contract address',async function(){
        await AdminContract.ModifyVerifierContractAddress(accounts[7], {from:deployer});
        let retrievedAddress = await GardenManager.GetVerifierContractAddress();
        assert.equal(retrievedAddress,accounts[7]);

        await tryCatch(GardenManager.ModifyVerifierContract(accounts[2]), errTypes.revert);
    })
    it('Users could create gardens', async function () {        
        let city="Brest";
        let area=300;
        // function CreateGarden(uint[2] calldata _secretHash, string calldata _district,uint32 _area, string calldata _contact, GLibrary.GardenType _gardenType, bool _multipleOwners, address payable[] calldata _coOwners)
        await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        await GardenManager.CreateGarden(secretHash,"toulouse",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let result = await GardenManager.CreateGarden(secretHash,city,area,"mail@contact.io",gardenType.Vegetable,true,[secondSigner,thirdSigner],{from:accounts[2]});
        let retrievedGarden = await GardenManager.GetGardenById(result.logs[0].args._gardenIndex.toNumber());
        
        assert.equal(result.logs[0].args._gardenIndex.toNumber(),2);
        assert.equal(retrievedGarden.owner,result.logs[0].args._owner);
        assert.isTrue(retrievedGarden.multipleOwners);
        assert.equal(retrievedGarden.coOwners[0],secondSigner);        
        assert.equal(retrievedGarden.coOwners[1],thirdSigner);        
        assert.equal(retrievedGarden.gardenType,gardenType.Vegetable);
        assert.equal(retrievedGarden.district,city);
        assert.equal(retrievedGarden.area,area);
        assert.equal(retrievedGarden.secretHash[0],secretHash[0]);        
        assert.equal(retrievedGarden.contact,"mail@contact.io");        
        assert.equal(retrievedGarden.status,gardenStatus.Waiting);
    })
    it('Only garden owner should modify gardenContact',async function(){
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let gardenOwner = result.logs[0].args._owner;
        assert.equal(gardenOwner,accounts[5]);
        await GardenManager.UpdateGardenContact(gardenIndex,"modifiedContact@test.com",{from:gardenOwner});
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden[7],"modifiedContact@test.com");  
        await tryCatch(GardenManager.UpdateGardenContact(gardenIndex,"mail@contact.io",{from:accounts[1]}), errTypes.revert);
    })
    it('Only garden owner with valid proof should modify gardenSecretHash',async function(){
        let newSecretHash = [2345678908,5535434546546];
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let gardenOwner = result.logs[0].args._owner;
        await tryCatch(GardenManager.UpdateGardenSecretHash(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,newSecretHash,{from:accounts[1]}), errTypes.revert);
        await tryCatch(GardenManager.UpdateGardenSecretHash(gardenIndex,["0x2620744f16b92e2e554594f8948670bd9e161971ff6c883ba0189cc8acd82961",
            "0x301bdcdfc90bfb9db4522155bbb81f5aea62ebd3689656b3fbe1044c19a5d37a"],validProof.proof.b,validProof.proof.c,newSecretHash,{from:gardenOwner}), errTypes.revert);
        await GardenManager.UpdateGardenSecretHash(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,newSecretHash,{from:gardenOwner});
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.secretHash[0],newSecretHash[0]);  
    })
    it('Only adminContract should accept gardens',async function(){
        let result =await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        await tryCatch(GardenManager.AcceptGarden(gardenIndex), errTypes.revert);
        await ValidateGardenByAdminContract(gardenIndex);
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
    })
    it('Only adminContract should reject gardens',async function(){
        let result =await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        await tryCatch(GardenManager.RejectGarden(gardenIndex), errTypes.revert);
        await RejectGardenByAdminContract(gardenIndex);
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Blacklist);
    })
    it('Only validated garden owner with valid proofs should propose offer',async function(){
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let gardenOwner = result.logs[0].args._owner;

        let tenant = accounts[2];
        let duration = 4 ; //value in days

        //wrong status :
        await tryCatch(GardenManager.ProposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: gardenOwner}),errTypes.revert);
        await ValidateGardenByAdminContract(gardenIndex);

        //not the owner :
        await tryCatch(GardenManager.ProposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: accounts[2]}),errTypes.revert);
        
        //incorrect proof :
        await tryCatch(GardenManager.ProposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),["0xf","0xf"],validProof.proof.b,validProof.proof.c,{from: gardenOwner}),errTypes.revert);
        
        await GardenManager.ProposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: gardenOwner});
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Blocked);
        assert.equal(web3.utils.fromWei(retrievedGarden.rents[0].price),1);
        assert.equal(retrievedGarden.rents[0].rate,-1);
        assert.equal(retrievedGarden.rents[0].tenant,tenant);
    })
    it('Only garden owner with valid proof could delete garden offer if tenant not responding',async function () {
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Waiting);
        await tryCatch(GardenManager.DeleteGardenOffer(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c),errTypes.revert);

        await ValidateGardenByAdminContract(gardenIndex);
        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
        await tryCatch(GardenManager.DeleteGardenOffer(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c),errTypes.revert);


        await GardenManager.ProposeGardenOffer(gardenIndex,accounts[7],GetSecondsFromDays(3),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Blocked);
        await GardenManager.DeleteGardenOffer(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c);

        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
        assert.isEmpty(retrievedGarden.rents);
    })
    it('Only correct tenant could accept garden offer',async function () {
        let tenant = accounts[3];
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.ProposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(3),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        
        //not the tenant :
        await tryCatch(GardenManager.AcceptGardenOffer(gardenIndex,{from: accounts[2],value:web3.utils.toWei('1', 'ether')}),errTypes.revert);
        //ether amount insufficient :
        await tryCatch(GardenManager.AcceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei('0.5', 'ether')}),errTypes.revert);
        
        await GardenManager.AcceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei('1', 'ether')});
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.CodeWaiting);
        assert.equal(web3.utils.fromWei(retrievedGarden.rents[0].balance),1);
        assert.equal(retrievedGarden.rents[0].beginning,0);
    })
    it('Owner can add access code to garden only if status is "code waiting"',async function () {
        let tenant = accounts[3];
        let locationDuration = 3; //value in days

        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let gardenOwner = result.logs[0].args._owner;

        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.ProposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(locationDuration) ,web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        //wrong status :
        assert.equal(retrievedGarden.status,gardenStatus.Blocked);
        await tryCatch(GardenManager.AddAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,"hashedAccessCode","EncryptedAccessCode",{from: gardenOwner}),errTypes.revert);

        await GardenManager.AcceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei('1.5', 'ether')});
        await GardenManager.AddAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,"hashedAccessCode","EncryptedAccessCode",{from: gardenOwner});
        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Location);
        assert.isAtLeast(parseInt(retrievedGarden.rents[0].beginning), GetCurrentDateInSeconds()-5);
        assert.equal(retrievedGarden.rents[0].accessCode.hashCode,"hashedAccessCode");
        assert.equal(retrievedGarden.rents[0].accessCode.encryptedCode,"EncryptedAccessCode");
    })

    it('Tenant could get refund only if accessCode is missing',async function () {
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let tenant = accounts[2];
        let locationPrice ="8";

        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.ProposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(2) ,web3.utils.toWei(locationPrice, 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        await GardenManager.AcceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei(locationPrice, 'ether')});

        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.CodeWaiting);
        assert.equal(web3.utils.fromWei(retrievedGarden.rents[0].balance),locationPrice);
        let tenantBalanceBeforeRefund = await GetBalance(tenant);

        //not the tenant :
        await tryCatch(GardenManager.GetRefundBeforeLocation(gardenIndex,{from:accounts[0]}),errTypes.revert);
        
        await GardenManager.GetRefundBeforeLocation(gardenIndex,{from:tenant});
        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
        assert.equal(retrievedGarden.rents[0].balance,0);
        
        let tenantBalanceAfterRefund = await GetBalance(tenant);
        assert.isAbove(tenantBalanceAfterRefund, tenantBalanceBeforeRefund);
    })
    it('Tenant can add location grade to rent only if location is over and if there is no grade yet',async function () {
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let tenant = accounts[2];
        let locationPrice ="2";
        let locationDurationInSeconds = 3;
        let grade =4;

        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.ProposeGardenOffer(gardenIndex,tenant,locationDurationInSeconds ,web3.utils.toWei(locationPrice, 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        await GardenManager.AcceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei(locationPrice, 'ether')});
        await GardenManager.AddAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,"hashedAccessCode","EncryptedAccessCode");
        
        //location not over :
        await GardenManager.AddGradeToGarden(gardenIndex,grade,{from:tenant});
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.rents[0].rate,-1);

        sleep(3000);

        //not the tenant :
        await GardenManager.AddGradeToGarden(gardenIndex,grade,{from:accounts[0]});
        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.rents[0].rate,-1);

        //incorrect grade :
        await tryCatch(GardenManager.AddGradeToGarden(gardenIndex,8,{from:tenant}),errTypes.revert);

        await GardenManager.AddGradeToGarden(gardenIndex,grade,{from:tenant});
        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(retrievedGarden.rents[0].rate,grade);

        //already graded : 
        await GardenManager.AddGradeToGarden(gardenIndex,grade,{from:tenant});
    })

    it('AdminManager contract should close dispute and pay the correct people',async function () {
        let multipleOwners=[accounts[0],accounts[2]];
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,true,multipleOwners);
        let gardenIndex = result.logs[0].args._gardenIndex.toNumber();
        let tenant = accounts[3];
        let locationPrice ="3";
        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.ProposeGardenOffer(gardenIndex,tenant,3 ,web3.utils.toWei(locationPrice, 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        await GardenManager.AcceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei(locationPrice, 'ether')});
        await GardenManager.AddAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,"hashedAccessCode","EncryptedAccessCode");
        
        let tenantBalanceBeforeRefund= await GetBalance(tenant);
        let firstOwnerBalanceBeforeRefund= await GetBalance(multipleOwners[0]);
        let secondOwnerBalanceBeforeRefund= await GetBalance(multipleOwners[1]);
        await GardenManager.AddDispute(gardenIndex);
        let retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.equal(web3.utils.fromWei(retrievedGarden.rents[0].balance),3);
        await tryCatch(GardenManager.CloseDispute(gardenIndex,'2','1'),errTypes.revert);
        await CloseDisputeByAdminContract(0,'2','1');

        retrievedGarden = await GardenManager.GetGardenById(gardenIndex);
        assert.isEmpty(retrievedGarden.rents[0].accessCode.hashCode);
        assert.equal(retrievedGarden.rents[0].balance,0);
        assert.equal(retrievedGarden.status,gardenStatus.Free);

        let tenantBalanceAfterRefund= await GetBalance(tenant);
        let firstOwnerBalanceAfterRefund= await GetBalance(multipleOwners[0]);
        let secondOwnerBalanceAfterRefund= await GetBalance(multipleOwners[1]);

        assert.isAbove(tenantBalanceAfterRefund, tenantBalanceBeforeRefund);
        assert.isAbove(firstOwnerBalanceAfterRefund, firstOwnerBalanceBeforeRefund);
        assert.isAbove(secondOwnerBalanceAfterRefund, secondOwnerBalanceBeforeRefund);
    })

    async function ValidateGardenByAdminContract(gardenId) {
        for (let i = 0; i < minApprovals; i++) {
            await AdminContract.AcceptGarden(gardenId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: accounts[i]});            
        }
    }
    async function RejectGardenByAdminContract(gardenId) {
        for (let i = 0; i < minApprovals; i++) {
            await AdminContract.RejectGarden(gardenId,{from: accounts[i]});            
        }
    }
    async function CloseDisputeByAdminContract(disputeIndex,ownerAmount,tenantAmount) {
        await AdminContract.SetAmountForDispute(disputeIndex,web3.utils.toWei(ownerAmount),web3.utils.toWei(tenantAmount),{from:accounts[0]});
        for (let i = 1; i < minApprovals; i++) {
            await AdminContract.AcceptDispute(disputeIndex,{from:accounts[i]});            
        }
    }
    async function GetBalance(address) {
        return parseInt(web3.utils.fromWei(await web3.eth.getBalance(address)));
    }
    function GetSecondsFromDays(days) {
        return days*24*60*60;
    }
    function GetCurrentDateInSeconds() {
        return Date.now()/1000;
    }
    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
})