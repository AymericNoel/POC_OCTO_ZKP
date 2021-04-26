import { initialize } from 'zokrates-js';
import { HashUtils } from './HashUtils';
import Abi from '../zokrates/abi.json';

/**
 * Compute ZKP proof from hash preimage.
 *
 * @param {string} preimage The hash input
 * @returns {Promise<Object>} Proof
 */
const computeProof = (preimage) => new Promise((resolve) => {
  initialize().then(async (zokratesProvider) => {
    const abi = JSON.stringify(Abi);
    const importedProgram = (await import('../zokrates/program.bin')).default;
    const program = Buffer.from(importedProgram, 'binary');

    const importedKey = (await import('../zokrates/provingKey.bin')).default;
    const provingKey = Buffer.from(importedKey, 'binary');

    const artifacts = { program, abi };
    const decimalPreimage = HashUtils.getDecimalFromString(preimage);
    const computedHash = HashUtils.getHashFromDecimal(decimalPreimage);
    const decimalHashArray = HashUtils.getArrayOfDecimalsFromhash(
      computedHash,
    );

    // Computation
    const computationResult = zokratesProvider.computeWitness(artifacts, [
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

export default computeProof;
