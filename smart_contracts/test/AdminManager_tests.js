const adminManager = artifacts.require('AdminManager.sol')
const verifieur = artifacts.require('Verifier.sol')
const gardenManager = artifacts.require('GardenManager.sol')

let tryCatch = require("./exceptions.js").tryCatch;
let errTypes = require("./exceptions.js").errTypes;

contract('Testing Admin Manager contract', function (accounts) {

    const firstSigner = accounts[0]
    const secondSigner = accounts[1]
    const thirdSigner = accounts[2]

    // Setup before each test
    beforeEach('setup contract for each test', async function () {
        // Deploying contract
        var minApprovals =3
        var P2PContact = "contactAdmin@gmail.com"
        Verifier = await verifieur.new({from : accounts[0]})
        AdminContract = await adminManager.new([firstSigner, secondSigner, thirdSigner], minApprovals,Verifier.address,P2PContact, { from: accounts[0] })        
        GardenManager = await gardenManager.new(AdminContract.address, Verifier.address)
        GardenManagerAddress= GardenManager.address
        await AdminContract.AddGardenManagerAddress(GardenManagerAddress, {from:accounts[0]})        
    })
    it('garden manager contract address should be correct', async function () {
        let retrievedAddress = await AdminContract.GetGardenManagerAddress()
        assert.equal(retrievedAddress, GardenManagerAddress)
    })
    it('deployer tries to modify verify contract address', async function(){
        let retrievedAddress = await AdminContract.GetVerifierContractAddress();
        assert.equal(retrievedAddress,Verifier.address)
        await AdminContract.ModifyVerifierContractAddress(accounts[7], {from:accounts[0]});
        retrievedAddress = await AdminContract.GetVerifierContractAddress();
        assert.equal(retrievedAddress,accounts[7])        
    })
    it('non deployer can t modify verifier contract address', async function(){
        await tryCatch(AdminContract.ModifyVerifierContractAddress(accounts[7], {from: accounts[2]}), errTypes.revert);
    })
})