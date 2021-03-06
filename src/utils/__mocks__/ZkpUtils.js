const computeProof = () =>
  new Promise((resolve) => {
    resolve({
      proof: {
        a: [
          '0x26810a04c9f28af0ac2beae2b01a5dd4a45c16482a55b0d56a23a71f1608c62f',
          '0x060d85690d4c64a98d2873bee9d467d3b615d51a8fd1c510046e256134768065',
        ],
        b: [
          [
            '0x2b6b6eaf061b6414053f938132dfc7d40e7533dc4284ece43504f528e8b4ba02',
            '0x18477c6318edb00e84d4ec12b6b5e5848a90631836763a159da2a59b82adc5c2',
          ],
          [
            '0x1075432926134cc82bd1e0882af5e33b2b3d8b9b0c3ece579bec9aec2f00e1df',
            '0x262adb06001f496e835602c470be0c9455669ebf5827dac98240db4507d7cd35',
          ],
        ],
        c: [
          '0x17809dec4bc280985f3efb99d9b72340ef8745e7e0da783fd6289728b362ce04',
          '0x1f7320403b2b336f0e3e659a5f65163e93e50077bd99b1296fbabbf8f107eaad',
        ],
      },
      inputs: [
        '0x000000000000000000000000000000000f8f23efe5fce8f02ddb7b4bc657d297',
        '0x00000000000000000000000000000000d9867c6a0b7f290d504508d2913eeff5',
      ],
      decimalHash: [
        '20681647278589003737256370945052365463',
        '289140766284904553191244936235506921461',
      ],
    });
  });

export default computeProof;
