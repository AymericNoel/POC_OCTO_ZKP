const { initialize } = require('zokrates-js/node');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { HashUtils } = require('../src/utils/HashUtils');

const zokratesDir = '../src/zokrates';
const solidityTestsDir = '../test';
const solidityContractsDir = '../contracts';
const zokProgram = fs.readFileSync(
  path.join(__dirname, `${zokratesDir}/hash_proof.zok`),
  'utf8',
);

const generateProof = (preimage, zokratesProvider, artifacts, provingKey) =>
  new Promise((resolve) => {
    const decimalPreimage = HashUtils.getDecimalFromString(preimage);
    const computedHash = HashUtils.getHashFromDecimal(decimalPreimage);
    const decimalHashArray = HashUtils.getArrayOfDecimalsFromhash(computedHash);

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

const generateZokratesSetupAndMockProofForTests = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    '\nGeneration of mock proof for solidity tests and zero knowledge proof new setup ...\n',
  );
  rl.question(
    'Attention this step can be long, do you want to proccess ? \n(y) Yes  / (n) No\n',
    (answer) => {
      if (answer.toUpperCase() === 'y'.toUpperCase()) {
        console.log('Zero Knowledge Proof Setup ...');

        initialize().then(async (zokratesProvider) => {
          //compile zok program and export artifacts
          const artifacts = zokratesProvider.compile(zokProgram, 'main.zok');
          fs.writeFileSync(
            path.join(__dirname, `${zokratesDir}/abi.json`),
            artifacts.abi,
          );
          fs.writeFileSync(
            path.join(__dirname, `${zokratesDir}/program.bin`),
            artifacts.program,
            'binary',
          );

          //generate keyPair and export them
          let keypair = zokratesProvider.setup(artifacts.program);
          fs.writeFileSync(
            path.join(__dirname, `${zokratesDir}/verification.key`),
            JSON.stringify(keypair.vk, null, 2),
          );
          fs.writeFileSync(
            path.join(__dirname, `${zokratesDir}/provingKey.bin`),
            keypair.pk,
            'binary',
          );

          //generate solidity verifier contract and export it
          let verifier = zokratesProvider.exportSolidityVerifier(
            keypair.vk,
            'v1',
          );
          fs.writeFileSync(
            path.join(__dirname, `${solidityContractsDir}/verifier.sol`),
            verifier,
          );

          //generate proof and save it in solidity test dir
          let proof = await generateProof(
            'input',
            zokratesProvider,
            artifacts,
            keypair.pk,
          );
          proof['decimalHash'] = [
            '20681647278589003737256370945052365463',
            '289140766284904553191244936235506921461',
          ];
          let outputFile = JSON.stringify(proof, null, 2);
          fs.writeFileSync(
            path.join(__dirname, `${solidityTestsDir}/validProof.json`),
            outputFile,
          );
          console.log('Setup complete.');
        });
      }
      rl.close();
    },
  );
};

generateZokratesSetupAndMockProofForTests();
