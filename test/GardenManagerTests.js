const adminManager = artifacts.require('AdminManager.sol');
const verifieur = artifacts.require('Verifier.sol');
const gardenManager = artifacts.require('GardenManager.sol');

const validProof = require("./validProof.json");
let tryCatch = require("./exceptions.js").tryCatch;
let errTypes = require("./exceptions.js").errTypes;
let gardenType = require("./Utils.js").GardenType;
let gardenStatus = require("./Utils.js").GardenStatus;
const secretHash = validProof.decimalHash;

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
        await AdminContract.addGardenManagerAddress(GardenManagerAddress, {from:deployer});
    })
    it('Verifier contract address should be correct', async function () {
        let retrievedAddress = await GardenManager.VerifierContract();
        assert.equal(retrievedAddress, Verifier.address);
    })
    it('Only AdminManager contract should modify verifier contract address',async function(){
        await AdminContract.modifyVerifierContractAddress(accounts[7], {from:deployer});
        let retrievedAddress = await GardenManager.VerifierContract();
        assert.equal(retrievedAddress,accounts[7]);

        await tryCatch(GardenManager.modifyVerifierContract(accounts[2]), errTypes.revert);
    })
    it('Users could create gardens', async function () {        
        let city="Brest";
        let area=300;

        // function createGarden(uint[2] calldata _secretHash, string calldata _district,uint32 _area, string calldata _contact, GLibrary.GardenType _gardenType, bool _multipleOwners, address payable[] calldata _coOwners)
        await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        await GardenManager.createGarden(secretHash,"toulouse",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let result = await GardenManager.createGarden(secretHash,city,area,"mail@contact.io",gardenType.Vegetable,true,[secondSigner,thirdSigner],{from:accounts[2]});
        let [gardenIndex,gardenOwner]= GetGardenIndexAndOwner(result);
        let retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        
        assert.equal(gardenIndex,3);
        assert.equal(retrievedGarden.owner,gardenOwner);
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
        let owner = accounts[5];
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:owner});
        let [gardenIndex,gardenOwner]= GetGardenIndexAndOwner(result);
        assert.equal(gardenOwner,owner);
        await GardenManager.updateGardenContact(gardenIndex,"modifiedContact@test.com",{from:gardenOwner});
        let retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.contact,"modifiedContact@test.com");  

        let fakeOwner = accounts[2];
        await tryCatch(GardenManager.updateGardenContact(gardenIndex,"mail@contact.io",{from:fakeOwner}), errTypes.revert);
    })
    it('Only garden owner with valid proof should modify gardenSecretHash',async function(){
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let [gardenIndex,gardenOwner]= GetGardenIndexAndOwner(result);

        let newSecretHash = [2345678908,5535434546546];
        
        let fakeOwner = accounts[1];
        await tryCatch(GardenManager.updateGardenSecretHash(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,newSecretHash,{from:fakeOwner}), errTypes.revert);
        
        let fakeProof=["0xf","0xf"];
        await tryCatch(GardenManager.updateGardenSecretHash(gardenIndex,fakeProof,validProof.proof.b,validProof.proof.c,newSecretHash,{from:gardenOwner}), errTypes.revert);
        
        await GardenManager.updateGardenSecretHash(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,newSecretHash,{from:gardenOwner});
        let retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.secretHash[0],newSecretHash[0]);  
    })
    it('Only adminContract should accept gardens',async function(){
        let result =await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let [gardenIndex,gardenOwner]= GetGardenIndexAndOwner(result);

        await tryCatch(GardenManager.acceptGarden(gardenIndex,{from:gardenOwner}), errTypes.revert);

        await ValidateGardenByAdminContract(gardenIndex);

        let retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
    })
    it('Only adminContract should reject gardens',async function(){
        let result =await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let [gardenIndex,gardenOwner]= GetGardenIndexAndOwner(result);

        await tryCatch(GardenManager.rejectGarden(gardenIndex,{from:gardenOwner}), errTypes.revert);

        await RejectGardenByAdminContract(gardenIndex);

        let retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Blacklist);
    })
    it('Validated garden owner with valid proofs could propose offer',async function(){
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[],{from:accounts[5]});
        let [gardenIndex,gardenOwner]= GetGardenIndexAndOwner(result);

        let tenant = accounts[2];
        let duration = 4 ; //value in days

        //wrong status :
        await tryCatch(GardenManager.proposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: gardenOwner}),errTypes.revert);
        
        await ValidateGardenByAdminContract(gardenIndex);

        //not the owner :
        await tryCatch(GardenManager.proposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: accounts[2]}),errTypes.revert);
        
        //incorrect proof :
        await tryCatch(GardenManager.proposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),["0xf","0xf"],validProof.proof.b,validProof.proof.c,{from: gardenOwner}),errTypes.revert);
        
        await GardenManager.proposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(duration),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: gardenOwner});
        let [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Blocked);
        assert.equal(web3.utils.fromWei(retrievedRent.price),1);
        assert.equal(retrievedRent.rate,-1);
        assert.equal(retrievedRent.tenant,tenant);
        assert.equal(retrievedRent.beginning,0);
    })
    it('Garden owner with valid proof could delete garden offer if tenant not responding and status "blocked"',async function () {
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let [gardenIndex,]= GetGardenIndexAndOwner(result);
        let retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Waiting);
        
        //wrong status :
        await tryCatch(GardenManager.deleteGardenOffer(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c),errTypes.revert);

        await ValidateGardenByAdminContract(gardenIndex);
        retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);

        //wrong status :
        await tryCatch(GardenManager.deleteGardenOffer(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c),errTypes.revert);


        await GardenManager.proposeGardenOffer(gardenIndex,accounts[7],GetSecondsFromDays(3),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Blocked);
        await GardenManager.deleteGardenOffer(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c);

        retrievedGarden = await GardenManager.getGardenById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
        assert.equal(retrievedGarden.rentLength,0);
    })
    it('Only correct tenant could accept garden offer',async function () {
        let tenant = accounts[3];
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let [gardenIndex,]= GetGardenIndexAndOwner(result);
        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.proposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(3),web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        
        //not the tenant :
        await tryCatch(GardenManager.acceptGardenOffer(gardenIndex,{from: accounts[2],value:web3.utils.toWei('1', 'ether')}),errTypes.revert);
        //ether amount insufficient :
        await tryCatch(GardenManager.acceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei('0.5', 'ether')}),errTypes.revert);
        
        await GardenManager.acceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei('1', 'ether')});
        let [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.CodeWaiting);
        assert.equal(web3.utils.fromWei(retrievedRent.balance),1);
        assert.equal(retrievedRent.beginning,0);
    })
    it('Owner can add access code to garden only if status is "code waiting"',async function () {
        let tenant = accounts[3];
        let locationDuration = 3; //value in days
        let hashedCode = "0x4092503716f23af46b012c27a434e2e0416087dc42d853f57864fa289b6a9102";

        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let [gardenIndex,gardenOwner]= GetGardenIndexAndOwner(result);

        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.proposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(locationDuration) ,web3.utils.toWei('1', 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        let [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        //wrong status :
        assert.equal(retrievedGarden.status,gardenStatus.Blocked);
        await tryCatch(GardenManager.addAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,hashedCode,"EncryptedAccessCode",{from: gardenOwner}),errTypes.revert);

        await GardenManager.acceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei('1.5', 'ether')});
        await GardenManager.addAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,hashedCode,"EncryptedAccessCode",{from: gardenOwner});
        [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Location);
        assert.isAtLeast(parseInt(retrievedRent.beginning), GetCurrentDateInSeconds()-5);
        assert.equal(retrievedRent.gardenHashCode,hashedCode);

        //not the owner nor the tenant :
        await tryCatch(GardenManager.getAccessCodeByGardenId(gardenIndex,{from: accounts[7]}),errTypes.revert);

        let retrievedEncryptedCode = await GardenManager.getAccessCodeByGardenId(gardenIndex,{from: tenant});
        assert.equal(retrievedEncryptedCode,"EncryptedAccessCode");
        retrievedEncryptedCode = await GardenManager.getAccessCodeByGardenId(gardenIndex,{from: gardenOwner});
        assert.equal(retrievedEncryptedCode,"EncryptedAccessCode");
    })

    it('Tenant could get refund only if accessCode is missing',async function () {
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let [gardenIndex,]= GetGardenIndexAndOwner(result);
        let tenant = accounts[2];
        let locationPrice ="8";

        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.proposeGardenOffer(gardenIndex,tenant,GetSecondsFromDays(2) ,web3.utils.toWei(locationPrice, 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        await GardenManager.acceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei(locationPrice, 'ether')});

        let [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.CodeWaiting);
        assert.equal(web3.utils.fromWei(retrievedRent.balance),locationPrice);
        let tenantBalanceBeforeRefund = await GetBalance(tenant);

        //not the tenant :
        await tryCatch(GardenManager.getRefundBeforeLocation(gardenIndex,{from:accounts[0]}),errTypes.revert);
        
        await GardenManager.getRefundBeforeLocation(gardenIndex,{from:tenant});
        [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
        assert.equal(retrievedRent.balance,0);
        
        let tenantBalanceAfterRefund = await GetBalance(tenant);
        assert.isAbove(tenantBalanceAfterRefund, tenantBalanceBeforeRefund);
    })
    it('Tenant can add location grade to rent only if location is over and if there is no grade yet',async function () {
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        let [gardenIndex,]= GetGardenIndexAndOwner(result);
        let tenant = accounts[2];
        let locationPrice ="2";
        let locationDurationInSeconds = 4;
        let grade =4;
        let hashedCode = "0x4092503716f23af46b012c27a434e2e0416087dc42d853f57864fa289b6a9102";

        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.proposeGardenOffer(gardenIndex,tenant,locationDurationInSeconds ,web3.utils.toWei(locationPrice, 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        await GardenManager.acceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei(locationPrice, 'ether')});
        await GardenManager.addAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,hashedCode,"EncryptedAccessCode");
        
        //location not over :
        await GardenManager.addGradeToGarden(gardenIndex,grade,{from:tenant});
        let [,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedRent.rate,-1);

        sleep(3500);

        //not the tenant :
        await GardenManager.addGradeToGarden(gardenIndex,grade,{from:accounts[0]});
        [,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedRent.rate,-1);

        //incorrect grade :
        await tryCatch(GardenManager.addGradeToGarden(gardenIndex,8,{from:tenant}),errTypes.revert);

        await GardenManager.addGradeToGarden(gardenIndex,grade,{from:tenant});
        [,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedRent.rate,grade);

        //already graded : 
        await GardenManager.addGradeToGarden(gardenIndex,grade,{from:tenant});
    })

    it('AdminManager contract should close dispute and pay the correct people',async function () {
        let multipleOwners=[accounts[0],accounts[2]];
        let result = await GardenManager.createGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,true,multipleOwners);
        let [gardenIndex,]= GetGardenIndexAndOwner(result);
        let tenant = accounts[3];
        let locationPrice ="3";
        let hashedCode = "0x4092503716f23af46b012c27a434e2e0416087dc42d853f57864fa289b6a9102";

        await ValidateGardenByAdminContract(gardenIndex);
        await GardenManager.proposeGardenOffer(gardenIndex,tenant,3 ,web3.utils.toWei(locationPrice, 'ether'),validProof.proof.a,validProof.proof.b,validProof.proof.c);
        await GardenManager.acceptGardenOffer(gardenIndex,{from: tenant,value:web3.utils.toWei(locationPrice, 'ether')});
        await GardenManager.addAccessCodeToGarden(gardenIndex,validProof.proof.a,validProof.proof.b,validProof.proof.c,hashedCode,"EncryptedAccessCode");
        
        let tenantBalanceBeforeRefund= await GetBalance(tenant);
        let firstOwnerBalanceBeforeRefund= await GetBalance(multipleOwners[0]);
        let secondOwnerBalanceBeforeRefund= await GetBalance(multipleOwners[1]);
        await GardenManager.addDispute(gardenIndex);
        let [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(web3.utils.fromWei(retrievedRent.balance),3);

        //only admin contract should close dispute :
        await tryCatch(GardenManager.closeDispute(gardenIndex,'2','1'),errTypes.revert);
        await CloseDisputeByAdminContract(1,'2','1');

        [retrievedGarden,retrievedRent] = await GetGardenAndRentsById(gardenIndex);
        assert.equal(retrievedGarden.status,gardenStatus.Free);
        assert.equal(retrievedRent.balance,0);        
        assert.equal(retrievedRent.gardenHashCode,"0x0000000000000000000000000000000000000000000000000000000000000000");

        let tenantBalanceAfterRefund= await GetBalance(tenant);
        let firstOwnerBalanceAfterRefund= await GetBalance(multipleOwners[0]);
        let secondOwnerBalanceAfterRefund= await GetBalance(multipleOwners[1]);

        assert.isAbove(tenantBalanceAfterRefund, tenantBalanceBeforeRefund);
        assert.isAbove(firstOwnerBalanceAfterRefund, firstOwnerBalanceBeforeRefund);
        assert.isAbove(secondOwnerBalanceAfterRefund, secondOwnerBalanceBeforeRefund);
    })

    async function ValidateGardenByAdminContract(gardenId) {
        for (let i = 0; i < minApprovals; i++) {
            await AdminContract.acceptGarden(gardenId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: accounts[i]});            
        }
    }
    async function RejectGardenByAdminContract(gardenId) {
        for (let i = 0; i < minApprovals; i++) {
            await AdminContract.rejectGarden(gardenId,{from: accounts[i]});            
        }
    }
    async function CloseDisputeByAdminContract(disputeIndex,ownerAmount,tenantAmount) {
        await AdminContract.setAmountForDispute(disputeIndex,web3.utils.toWei(ownerAmount),web3.utils.toWei(tenantAmount),{from:accounts[0]});
        for (let i = 1; i < minApprovals; i++) {
            await AdminContract.acceptDispute(disputeIndex,{from:accounts[i]});
        }
    }
    async function GetBalance(address) {
        return parseInt(web3.utils.fromWei(await web3.eth.getBalance(address)));
    }
    async function GetGardenAndRentsById(gardenIndex, rentId=null) {
        let garden = await GardenManager.getGardenById(gardenIndex);
        let lastRent = garden.rentLength-1;
        let rent = await GardenManager.getRentByGardenAndRentId(gardenIndex,rentId==null?lastRent:rentId);
        return [garden,rent];
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
    function GetGardenIndexAndOwner(result){
        let index = result.logs[0].args._gardenIndex.toNumber();
        let owner = result.logs[0].args._owner;
        return [index,owner];
    }
})