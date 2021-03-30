const adminManager = artifacts.require('AdminManager.sol');
const verifieur = artifacts.require('Verifier.sol');
const gardenManager = artifacts.require('GardenManager.sol');

const validProof = require("./validProof.json");
let tryCatch = require("./exceptions.js").tryCatch;
let errTypes = require("./exceptions.js").errTypes;
let gardenType = require("./Utils.js").GardenType;
const secretHash=["263561599766550617289250058199814760685", "65303172752238645975888084098459749904"];

contract('Testing Admin Manager contract', function (accounts) {
    
    const deployer = accounts[0];
    const firstSigner = accounts[0];
    const secondSigner = accounts[1];
    const thirdSigner = accounts[2];
    const nonAdmin = accounts[9];
    const minApprovals=3;

    // Setup before each test
    beforeEach('setup contract for each test', async function () {
        var P2PContact = "contactAdmin@gmail.com";
        Verifier = await verifieur.new({from : deployer});
        AdminContract = await adminManager.new([firstSigner, secondSigner, thirdSigner], minApprovals,Verifier.address,P2PContact, { from: deployer });   
        GardenManager = await gardenManager.new(AdminContract.address, Verifier.address);
        GardenManagerAddress= GardenManager.address;
        await AdminContract.AddGardenManagerAddress(GardenManagerAddress, {from:deployer});
    })
    it('GardenManager contract address should be correct', async function () {
        let retrievedAddress = await AdminContract.GManager()
        assert.equal(retrievedAddress, GardenManagerAddress)
    })
    it('Deployer tries to modify VerifierContract address', async function(){
        let retrievedAddress = await AdminContract.VerifierContract();
        assert.equal(retrievedAddress,Verifier.address);

        let newVerifierContractAddress = accounts[7];
        await AdminContract.ModifyVerifierContractAddress(newVerifierContractAddress, {from:deployer});
        retrievedAddress = await AdminContract.VerifierContract();
        assert.equal(retrievedAddress,newVerifierContractAddress);
    })
    it('Non deployer can t modify VerifierContract address', async function(){
        await tryCatch(AdminContract.ModifyVerifierContractAddress(accounts[7], {from: nonAdmin}), errTypes.revert);
    })
    it('Only GardenManager contract should add gardenProposal',async function () {
        await AddGardenProposal(secretHash);
        let retrievedId=await AddGardenProposal(secretHash);    
        let retrievedGardenProposal = await AdminContract.GetGardenProposalById(retrievedId);
        assert.equal(retrievedGardenProposal.gardenIndex,retrievedId);
        assert.equal(retrievedGardenProposal.gardenIndex,1);
        assert.equal(retrievedGardenProposal.isOpen,true);
        
        //call not from gardenManager contract :
        await tryCatch(AdminContract.AddGarden(5,["0xc6481e22c5ff4163af680b8cfaa5e8ed", "0x3120eeff89c4f307c4a6faaae059ce10"]),errTypes.revert);
    })
    it('Admins with valid proofs can accept gardenProposal',async function(){
        let retrievedId= await AddGardenProposal(secretHash);
        await AdminContract.AcceptGarden(retrievedId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: firstSigner});
        let retrievedGardenProposal = await AdminContract.GetGardenProposalById(retrievedId);        
        assert.equal(retrievedGardenProposal.acceptProposal[0],firstSigner);
    })
    it('Non admins could not accept gardenProposal',async function () {
        let retrievedId= await AddGardenProposal(secretHash);
        await tryCatch(AdminContract.AcceptGarden(retrievedId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: nonAdmin}),errTypes.revert)
    })
    it('Admins with invalid proofs could not accept gardenProposal',async function () {
        let retrievedId= await AddGardenProposal(secretHash);
        await tryCatch(AdminContract.AcceptGarden(retrievedId,["0x2961","0x2961"],validProof.proof.b,validProof.proof.c,{from: secondSigner}),errTypes.revert )
    })
    it('Admins could not accept proposal with fake id',async function () {
        let fakeId=89;
        await AddGardenProposal(secretHash);
        await tryCatch(AdminContract.AcceptGarden(fakeId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: secondSigner}),errTypes.revert )
    })
    it('Admins couldn t accept gardenProposal twice',async function () {
        let retrievedId= await AddGardenProposal(secretHash);
        await AdminContract.AcceptGarden(retrievedId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: firstSigner});
        await tryCatch(AdminContract.AcceptGarden(retrievedId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: firstSigner}),errTypes.revert)
    })
    it('Proposal validated by all admins should be closed',async function () {
        let retrievedId= await AddGardenProposal(secretHash);
        let retrievedGardenProposals = await AdminContract.GetGardenProposalById.call(retrievedId);
        assert.equal(retrievedGardenProposals.isOpen,true);
        for (let i = 0; i < minApprovals; i++) {
            await AdminContract.AcceptGarden(retrievedId,validProof.proof.a,validProof.proof.b,validProof.proof.c,{from: accounts[i]});            
        }
        retrievedGardenProposals = await AdminContract.GetGardenProposalById.call(retrievedId);
        assert.isFalse(retrievedGardenProposals.isOpen);
    })
    it('Non admins could not reject gardenProposal',async function () {
        let retrievedId= await AddGardenProposal(secretHash);
        await tryCatch(AdminContract.RejectGarden(retrievedId,{from: nonAdmin}),errTypes.revert)
    })
    it('Admins could not reject proposal with fake id',async function () {
        let fakeId = 98;
        await AddGardenProposal(secretHash);
        await tryCatch(AdminContract.RejectGarden(fakeId,{from: secondSigner}),errTypes.revert )
    })
    it('Proposal rejected by all admins should be closed',async function () {
        let retrievedId= await AddGardenProposal(secretHash);
        let retrievedGardenProposal = await AdminContract.GetGardenProposalById(retrievedId);
        assert.isTrue(retrievedGardenProposal.isOpen);
        for (let i = 0; i < minApprovals; i++) {
            await AdminContract.RejectGarden(retrievedId,{from: accounts[i]});            
        }
        retrievedGardenProposal = await AdminContract.GetGardenProposalById(retrievedId);
        assert.isFalse(retrievedGardenProposal.isOpen);
    })
    it('Only GardenManager contract should add disputeProposal',async function () {
        let gardenIndex = 5;
        let gardenManagerAddress= accounts[8];
        await AdminContract.AddGardenManagerAddress(gardenManagerAddress, {from:accounts[0]});

        await tryCatch(AdminContract.AddDispute(gardenIndex,2,{from:accounts[2]}),errTypes.revert);

        await AdminContract.AddDispute(gardenIndex,2,{from:gardenManagerAddress});
        let retrievedDisputeProposal=await AdminContract.GetDisputeProposalById(0);
        assert.equal(retrievedDisputeProposal.gardenIndex,gardenIndex);
        assert.isTrue(retrievedDisputeProposal.isOpen);
        assert.isFalse(retrievedDisputeProposal.isReady);
    })
    it('Only deployer should add correct amount for dispute',async function () {
        let gardenBalance = 4;
        let disputeId = await AddDisputeProposal(gardenBalance);

        //non deployer : 
        await tryCatch(AdminContract.SetAmountForDispute(disputeId,gardenBalance/2,gardenBalance/2,{from: nonAdmin}),errTypes.revert);

        //invalid amount : 
        await tryCatch(AdminContract.SetAmountForDispute(disputeId,2,1,{from: deployer}),errTypes.revert);
        
        await AdminContract.SetAmountForDispute(disputeId,gardenBalance/2,gardenBalance/2,{from: deployer});

        let retrievedDisputeProposal=await AdminContract.GetDisputeProposalById(disputeId);
        assert.equal(retrievedDisputeProposal.ownerAmount,2);
    })
    it('Only deployer should modify amount for dispute and reset validations',async function () {
        let gardenBalance = 4;
        let disputeId = await AddDisputeProposal(gardenBalance);
        await AdminContract.SetAmountForDispute(disputeId,gardenBalance/2,gardenBalance/2,{from: deployer});
        await AdminContract.AcceptDispute(disputeId,{from:secondSigner});
        
        let retrievedDisputeProposal=await AdminContract.GetDisputeProposalById(disputeId);
        assert.lengthOf(retrievedDisputeProposal.acceptProposal,2);

        await AdminContract.SetAmountForDispute(0,gardenBalance,0,{from: deployer});
        retrievedDisputeProposal=await AdminContract.GetDisputeProposalById(disputeId);
        assert.lengthOf(retrievedDisputeProposal.acceptProposal,1);
        assert.equal(retrievedDisputeProposal.ownerAmount,gardenBalance);
    })

    async function AddGardenProposal(secretHash){
        // function CreateGarden(uint[2] calldata _secretHash, string calldata _district,uint32 _area, string calldata _contact, GLibrary.GardenType _gardenType, bool _multipleOwners, address payable[] calldata _coOwners)
        let result = await GardenManager.CreateGarden(secretHash,"paris",567,"mail@contact.io",gardenType.Hobby,false,[]);
        return result.logs[0].args._gardenIndex.toNumber();
    }
    async function AddDisputeProposal(gardenBalance) {
        let gardenIndex = 2;
        let gardenManagerAddress= accounts[8];
        await AdminContract.AddGardenManagerAddress(gardenManagerAddress, {from:deployer});
        await AdminContract.AddDispute(gardenIndex,gardenBalance,{from:gardenManagerAddress});
        return 0;
    }
})