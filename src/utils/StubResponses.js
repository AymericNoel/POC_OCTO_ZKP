import { HashUtils } from './HashUtils';
const RandExp = require('randexp');

const generateRandomDistrict = (length = 8) => {
  let result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i += 1) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return result.join('');
};

const generateRandomNumber = (min = 0, max = 501) => {
  return Math.floor(Math.random() * max) + min;
};

const generateRandomContact = () => {
  return new RandExp(/^[a-zA-z0-9]{7}@gmail.com$/).gen();
};

const generateRandomEthereumAddress = () => {
  return new RandExp(/^0x[a-fA-F0-9]{40}$/).gen();
};

/**
 * Generates a garden stub.
 * @param {number} [id=0] - The id of the generated garden.
 * @param {string} [ownerAddress=null] - The address of a specific owner.
 * @param {number} [rentLength=0] - The number of rents for this garden.
 * @returns A garden.
 */
const generateGarden = (id = 0, ownerAddress = null, rentLength = 0) => {
  const gardenProposal = {
    id,
    owner: ownerAddress === null ? generateRandomEthereumAddress() : ownerAddress,
    multipleOwners: false,
    coOwners: [],
    gardenType: 1,
    district: generateRandomDistrict(),
    area: generateRandomNumber(),
    secretHash: [
      '20681647278589003737256370945052365463',
      '289140766284904553191244936235506921461',
    ],
    contact: generateRandomContact(),
    status: 0,
    rentLength,
    rents: null,
  };
  return gardenProposal;
};

const generateRent = (tenant = null) => {
  const balanceWeiUnit = generateRandomNumber(100000, 40000000000).toString();
  const rent = {
    rate: generateRandomNumber(-1, 5),
    price: balanceWeiUnit,
    balance: balanceWeiUnit,
    tenant: tenant ?? generateRandomEthereumAddress(),
    duration: generateRandomNumber(5000, 500000),
    signature: 'valid_signature',
    gardenHashCode: HashUtils.hashWithoutInputPadding(balanceWeiUnit),
  };
  return rent;
};

const generateDisputeProposal = (id) => {
  const balanceWeiUnit = generateRandomNumber(100000, 40000000000);
  const disputeProposal = {
    id,
    acceptProposal: [generateRandomEthereumAddress()],
    ownerAmount: Math.round(balanceWeiUnit / 2).toString(),
    tenantAmount: Math.round(balanceWeiUnit / 2).toString(),
    balance: balanceWeiUnit.toString(),
    isReady: true,
    isOpen: true,
    gardenIndex: 1,
  };
  return disputeProposal;
};

const generateAdminGardenProposal = (id) => {
  const gardenProposal = {
    id,
    acceptProposal: [],
    rejectProposal: [],
    isOpen: true,
  };
  return gardenProposal;
};

/**
 * Generates an array of rent stubs.
 * @param {number} length - The length of the array.
 * @param {string} [tenantAddress=''] - The address of a specific tenant
 * @param {number} [tenantCount=0] - The number of rents that belongs to that specific tenant.
 * @returns {Array} Rent array
 */
const generateRentArray = (length, tenantAddress = '', tenantCount = 0) => {
  const finalArray = [];
  let rentNumber = tenantCount;
  for (let i = 0; i < length; i += 1) {
    const rent = rentNumber <= 0 ? generateRent() : generateRent(tenantAddress);
    rentNumber -= 1;
    finalArray.push(rent);
  }
  return finalArray;
};

/**
 * Generates an array of garden stubs.
 * @param {number} length - The length of the array.
 * @param {string} [ownerAddress=''] - The address of a specific owner.
 * @param {number} [ownershipNumber=0] - The number of gardens that belongs to that specific owner.
 * @param {number} [rentLength=0] - The number of rents for each garden.
 * @returns {Array} Garden array
 */
const generateGardenArray = (length, ownerAddress = '', ownershipNumber = 0, rentLength = 0) => {
  const finalArray = [];
  let ownership = ownershipNumber;
  for (let i = 1; i <= length; i += 1) {
    const garden =
      ownership <= 0
        ? generateGarden(i, undefined, rentLength)
        : generateGarden(i, ownerAddress, rentLength);
    ownership -= 1;
    finalArray.push(garden);
  }
  return finalArray;
};

/**
 * Generates an array of disputes proposals stubs.
 * @param {number} length - The length of the array.
 * @returns {Array} Dispute proposals array.
 */
const generateDisputeProposalsArray = (length) => {
  const finalArray = [];
  for (let i = 1; i <= length; i += 1) {
    const dispute = generateDisputeProposal(i);
    finalArray.push(dispute);
  }
  return finalArray;
};

/**
 * Generates an array of garden proposals stubs.
 * @param {number} length - The length of the array.
 * @returns {Array} Garden proposals array.
 */
const generateAdminGardenProposalsArray = (length) => {
  const finalArray = [];
  for (let i = 1; i <= length; i += 1) {
    const garden = generateAdminGardenProposal(i);
    finalArray.push(garden);
  }
  return finalArray;
};

export {
  generateGardenArray,
  generateDisputeProposalsArray,
  generateAdminGardenProposalsArray,
  generateGarden,
  generateRentArray,
};
