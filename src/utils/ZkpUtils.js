import { initialize } from 'zokrates-js';
import { HashUtils } from './HashUtils';
import Abi from '../zokrates/abi.json';

/* eslint-disable import/no-webpack-loader-syntax, import/no-unresolved */
import ProvingKey from '!!binary-loader!../zokrates/provingKey.bin';
import Program from '!!binary-loader!../zokrates/program.bin';

const computeProof = (preimage) => new Promise((resolve) => {
  initialize().then(async (zokratesProvider) => {
    const abi = JSON.stringify(Abi);
    const program = Buffer.from(Program, 'binary');
    const provingKey = Buffer.from(ProvingKey, 'binary');

    const artifacts = { program, abi };
    const decimalPreimage = HashUtils.getDecimalFromString(preimage);
    const computedHash = HashUtils.getHashFromDecimal(decimalPreimage);
    const decimalHashArray = HashUtils.getArrayOfDecimalsFromhash(computedHash);

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

export default computeProof;
