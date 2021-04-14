const path = require('path');
const fs = require('fs');
const { initialize } = require('zokrates-js/node');
const { HashUtils } = require('./HashUtils');

const zokratesDir = '../../zokrates';

const computeProof = (preimage) => new Promise((resolve) => {
  initialize().then((zokratesProvider) => {
    const provingKey = fs.readFileSync(
      path.join(__dirname, `${zokratesDir}/proving.key`),
    );
    const program = fs.readFileSync(
      path.join(__dirname, `${zokratesDir}/program`),
    );
    const abi = fs.readFileSync(
      path.join(__dirname, `${zokratesDir}/abi.json`),
      'utf8',
    );
    const artifacts = { program, abi };

    const decimalPreimage = HashUtils.getDecimalFromString(preimage);
    const computedHash = HashUtils.getHashFromDecimal(decimalPreimage);
    const decimalHashArray = HashUtils.getArrayOfDecimalsFromhash(
      computedHash,
    );

    // Computation
    const computationResult = zokratesProvider.computeWitness(artifacts, [
      '0',
      '0',
      '0',
      decimalPreimage.toString(),
      decimalHashArray[0].toString(),
      decimalHashArray[1].toString(),
    ]);

    // Generate proof
    const proof = zokratesProvider.generateProof(
      artifacts.program,
      computationResult.witness,
      provingKey,
    );
    resolve(proof);
  });
});

module.exports = computeProof;
