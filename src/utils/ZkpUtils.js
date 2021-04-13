const { initialize } = require('zokrates-js/node');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const HashUtils = require('./HashUtils').HashUtils;
const zokratesDir = '../../zokrates';
const solidityTestsDir = '../../test';
const solidityContractsDir = '../../contracts';
const zokProgram = fs.readFileSync(
  path.join(__dirname, `${zokratesDir}/hash_proof.zok`),
  'utf8',
);

const generateZokratesSetup = () => {
  return new Promise((resolve) => {
    initialize().then((zokratesProvider) => {
      //compile zok program and export artifacts
      const artifacts = zokratesProvider.compile(zokProgram, 'main.zok');
      fs.writeFileSync(
        path.join(__dirname, `${zokratesDir}/abi.json`),
        artifacts.abi,
      );
      fs.writeFileSync(
        path.join(__dirname, `${zokratesDir}/program`),
        artifacts.program,
      );

      //generate keyPair and export them
      let keypair = zokratesProvider.setup(artifacts.program);
      fs.writeFileSync(
        path.join(__dirname, `${zokratesDir}/verification.key`),
        JSON.stringify(keypair.vk),
      );
      fs.writeFileSync(
        path.join(__dirname, `${zokratesDir}/proving.key`),
        keypair.pk,
      );

      //generate solidity verifier contract and export it
      let verifier = zokratesProvider.exportSolidityVerifier(keypair.vk, 'v1');
      fs.writeFileSync(
        path.join(__dirname, `${solidityContractsDir}/verifier.sol`),
        verifier,
      );
    });
    resolve(true);
  });
};

const computeProof = (preimage) => {
  return new Promise((resolve) => {
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

      let decimalPreimage = HashUtils.getDecimalFromString(preimage);
      let computedHash = HashUtils.getHashFromDecimal(decimalPreimage);
      let decimalHashArray = HashUtils.getArrayOfDecimalsFromhash(computedHash);

      // Computation
      let computationResult = zokratesProvider.computeWitness(artifacts, [
        '0',
        '0',
        '0',
        decimalPreimage.toString(),
        decimalHashArray[0].toString(),
        decimalHashArray[1].toString(),
      ]);

      // Generate proof
      let proof = zokratesProvider.generateProof(
        artifacts.program,
        computationResult.witness,
        provingKey,
      );
      resolve(proof);
    });
  });
};

const setupAndWriteMockProofForSolidityTests = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    '\nGeneration of mock proof for solidity tests and zero knowledge proof new setup ...\n',
  );
  rl.question(
    'Attention this step can be long, do you want to skip it ? \n(y) Yes  / (n) No\n',
    async (answer) => {
      if (answer.toUpperCase() !== 'y'.toUpperCase()) {
        console.log('Zero Knowledge Proof Setup ...');
        await generateZokratesSetup();
        let proof = await computeProof('input');
        proof['decimalHash'] = [
          '254960964953927206500213748090202348550',
          '161448835893749292677740045653760556657',
        ];
        let outputFile = JSON.stringify(proof, null, 2);
        fs.writeFileSync(
          path.join(__dirname, `${solidityTestsDir}/validProof.json`),
          outputFile,
        );
        console.log('Setup complete');
      }
      rl.close();
    },
  );
};

module.exports.ZkpUtils = {
  computeProof,
  setupAndWriteMockProofForSolidityTests,
};
