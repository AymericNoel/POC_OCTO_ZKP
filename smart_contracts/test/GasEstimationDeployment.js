const adminManager = artifacts.require('AdminManager.sol')
const verifieur = artifacts.require('Verifier.sol')
const gardenManager = artifacts.require('GardenManager.sol')

contract('Deployment gas estimation', function (accounts) {
    const firstSigner = accounts[0]
    const secondSigner = accounts[1]
    const thirdSigner = accounts[2]
    it('print gas for deploy of adminManager', async function () {
        console.log(await adminManager.new.estimateGas([firstSigner, secondSigner, thirdSigner], 3,thirdSigner,"P2PContact"))
    })
    it('print gas for deploy of gardenManager', async function () {
        console.log(await gardenManager.new.estimateGas(firstSigner, secondSigner))
    })
    it('print gas for deploy of verifier', async function () {
        console.log(await verifieur.new.estimateGas())
    })
})