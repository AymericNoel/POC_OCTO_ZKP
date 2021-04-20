import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import EthCrypto from 'eth-crypto';
import { withToastManager } from 'react-toast-notifications';
import Spinner from '../../Spinner';
import BlockchainContext from '../../../context/BlockchainContext';
import computeProof from '../../../utils/ZkpUtils';
import { HashUtils } from '../../../utils/HashUtils';

class AddAccessCodeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
      password: '',
      gardenAccessCode: '',
      loading: false,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.addCode();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  addCode = async () => {
    const {
      gardenIndex,
      contracts,
      account,
      password,
      gardenAccessCode,
    } = this.state;
    this.setState({ loading: true });
    try {
      const { web3 } = this.context;
      const proof = await computeProof(password);
      const retrievedGarden = await contracts.GardenContract.methods
        .getGardenById(gardenIndex)
        .call();

      const retrievedRent = await contracts.GardenContract.methods
        .getRentByGardenAndRentId(gardenIndex, retrievedGarden.rentLength - 1)
        .call();

      const messageToSign = await contracts.GardenContract.methods
        .signMe()
        .call();

      const tenantSignature = retrievedRent.signature;

      const hashedCode = `0x${HashUtils.getHashFromString(gardenAccessCode)}`;
      const encryptedCode = await this.encryptCode(
        gardenAccessCode,
        tenantSignature,
        messageToSign,
        web3,
      );

      await contracts.GardenContract.methods
        .addAccessCodeToGarden(
          gardenIndex,
          proof.a,
          proof.b,
          proof.c,
          hashedCode,
          encryptedCode,
        )
        .send({ from: account })
        .then(() => {
          this.props.toastManager.add('Code ajouté avec succès', {
            appearance: 'success',
          });
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible d&apos;ajouter un code d&apos;accès au jardin, veuillez réessayer',
        {
          appearance: 'error',
        },
      );
      this.setState({ loading: false });
    }
  };

  encryptCode = async (accessCode, tenantSignature, signedMessage, web3) => {
    const signerPublicKey = EthCrypto.recoverPublicKey(
      tenantSignature,
      web3.eth.accounts.hashMessage(signedMessage),
    );

    const encrypted = await EthCrypto.encryptWithPublicKey(
      signerPublicKey,
      accessCode,
    );
    const encryptedString = EthCrypto.cipher.stringify(encrypted);
    return encryptedString;
  };

  render() {
    const { loading } = this.state;
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          Une preuve de validité de mot de passe sera générée. Cette étape peut
          durer ~ 45 secondes.
        </p>
        <MDBInput
          className='text-center'
          label='Id du jardin'
          type='number'
          validate
          required
          min='1'
          step='1'
          size='sm'
          name='gardenIndex'
          onChange={this.changeHandler}
        />
        <MDBInput
          className='text-center'
          label='Mot de passe'
          type='password'
          validate
          required
          size='sm'
          name='password'
          onChange={this.changeHandler}
        />
        <MDBInput
          className='text-center'
          label="Code d'accès au jardin"
          type='password'
          validate
          required
          size='sm'
          name='gardenAccessCode'
          onChange={this.changeHandler}
        />

        <div className='text-center mb-2'>
          <MDBBtn type='submit' size='sm'>
            Envoyer
          </MDBBtn>
          {loading ? <Spinner /> : <div />}
        </div>
      </form>
    );
  }
}
AddAccessCodeForm.contextType = BlockchainContext;

export default withToastManager(AddAccessCodeForm);
