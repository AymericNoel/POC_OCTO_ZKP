const crypto = require('crypto');
/* eslint prefer-template: "off" */

const getDecimalFromString = (str) => {
  let decimals = '';
  for (let i = 0; i < str.length; i += 1) {
    decimals += '' + str.charCodeAt(i);
  }
  return decimals;
};

function hexStringToByte(str) {
  if (!str) {
    return new Uint8Array();
  }

  const a = [];
  for (let i = 0, len = str.length; i < len; i += 2) {
    a.push(parseInt(str.substr(i, 2), 16));
  }

  return new Uint8Array(a);
}

const getHashFromDecimal = (preimage) => {
  const hexValue = BigInt(preimage).toString(16).padStart(128, '0');
  return crypto
    .createHash('sha256')
    .update(hexStringToByte(hexValue))
    .digest('hex');
};

const getHashFromString = (preimage) => {
  const decimalsPreimage = getDecimalFromString(preimage);
  return getHashFromDecimal(decimalsPreimage);
};

const getArrayOfDecimalsFromhash = (hash) => {
  let a = hash.slice(0, 32);
  a = '0x' + a;
  let b = hash.slice(32);
  b = '0x' + b;
  return [BigInt(a).toString(), BigInt(b).toString()];
};

const concatDecimalsArrayToHex = (array) => {
  let aHex = BigInt(array[0]).toString(16);
  const bHex = BigInt(array[1]).toString(16);
  aHex = '0x' + aHex;
  return aHex + bHex;
};

module.exports.HashUtils = {
  concatDecimalsArrayToHex,
  getArrayOfDecimalsFromhash,
  getHashFromString,
  getDecimalFromString,
  getHashFromDecimal,
};
