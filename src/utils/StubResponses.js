import { HashUtils } from './HashUtils';
const RandExp = require('randexp');

const generateRandomDistrict = (length = 8) => {
  let result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i += 1) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength)),
    );
  }
  return result.join('');
};

const generateRandomNumber = (max = 501) => {
  return Math.floor(Math.random() * max);
};

const generateRandomContact = () => {
  return new RandExp(/^[a-zA-z0-9]{7}@gmail.com$/).gen();
};

const generateRandomHash = () => {
  return HashUtils.hashWithoutInputPadding('test');
};

const generateRandomEthereumAddress = () => {
  return new RandExp(/^0x[a-fA-F0-9]{40}$/).gen();
};

const generateGarden = (id, owner = null) => {
  const gardenProposal = {
    id,
    owner: owner === null ? generateRandomEthereumAddress() : owner,
    multipleOwners: false,
    coOwners: [],
    gardenType: 1,
    district: generateRandomDistrict(),
    area: generateRandomNumber(),
    secretHash: generateRandomHash(),
    contact: generateRandomContact(),
    status: 0,
    rentLength: 0,
  };
  return gardenProposal;
};

const generateDisputeProposal = (id) => {
  const balanceWeiUnit = generateRandomNumber(40000000000) + 100000;
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

const generateGardenArray = (length) => {
  const finalArray = [];
  for (let i = 1; i <= length; i += 1) {
    const garden = generateGarden(i);
    finalArray.push(garden);
  }
  return finalArray; //et owner specfific
};

const generateDisputeProposalsArray = (length) => {
  const finalArray = [];
  for (let i = 1; i <= length; i += 1) {
    const dispute = generateDisputeProposal(i);
    finalArray.push(dispute);
  }
  return finalArray;
};

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
};
