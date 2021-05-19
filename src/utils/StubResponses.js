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

const generateRandomNumber = (min = 0, max = 501) => {
  return Math.floor(Math.random() * max) + min;
};

const generateRandomContact = () => {
  return new RandExp(/^[a-zA-z0-9]{7}@gmail.com$/).gen();
};

const generateRandomEthereumAddress = () => {
  return new RandExp(/^0x[a-fA-F0-9]{40}$/).gen();
};

const generateGarden = (id = 0, owner = null, status = 0, rentLength = 0) => {
  const gardenProposal = {
    id,
    owner: owner === null ? generateRandomEthereumAddress() : owner,
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
    status,
    rentLength,
    rents: null,
  };
  return gardenProposal;
};

const generateRent = (duration = null, tenant = null, signature = null) => {
  const balanceWeiUnit = generateRandomNumber(100000, 40000000000).toString();
  const rent = {
    rate: generateRandomNumber(-1, 5),
    price: balanceWeiUnit,
    balance: balanceWeiUnit,
    tenant: tenant ?? 'valid_address',
    duration: duration ?? generateRandomNumber(5000, 500000),
    signature: signature ?? 'valid_signature',
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

const generateRentArray = (length, tenantAddress = '', tenantCount = 0) => {
  const finalArray = [];
  let rentNumber = tenantCount;
  for (let i = 0; i < length; i += 1) {
    const rent =
      rentNumber <= 0 ? generateRent() : generateRent(undefined, tenantAddress);
    rentNumber -= 1;
    finalArray.push(rent);
  }
  return finalArray;
};

const generateGardenArray = (
  length,
  ownerAddress = '',
  ownershipNumber = 0,
  rentLength = 0,
) => {
  const finalArray = [];
  let ownership = ownershipNumber;
  for (let i = 1; i <= length; i += 1) {
    const garden =
      ownership <= 0
        ? generateGarden(i, undefined, undefined, rentLength)
        : generateGarden(i, ownerAddress, undefined, rentLength);
    ownership -= 1;
    finalArray.push(garden);
  }
  return finalArray;
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
  generateGarden,
  generateRentArray,
};
