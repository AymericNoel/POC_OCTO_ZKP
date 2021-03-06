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
      gardenId: 0,
      password: '',
      gardenAccessCode: '',
      loading: false,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];
    const { gardenId } = this.props;
    this.setState({ contracts, account, gardenId });
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
      gardenId,
      contracts,
      account,
      password,
      gardenAccessCode,
    } = this.state;
    this.setState({ loading: true });
    try {
      setTimeout(async () => {
        const { web3 } = this.context;
        const proofObject = await computeProof(password);
        const retrievedGarden = await contracts.GardenContract.methods
          .getGardenById(gardenId)
          .call();

        const retrievedRent = await contracts.GardenContract.methods
          .getRentByGardenAndRentId(gardenId, retrievedGarden.rentLength - 1)
          .call();

        const messageToSign = await contracts.GardenContract.methods
          .signMe()
          .call();

        const tenantSignature = retrievedRent.signature;

        const hashedCode = HashUtils.hashWithoutInputPadding(gardenAccessCode);
        const encryptedCode = await this.encryptCode(
          gardenAccessCode,
          tenantSignature,
          messageToSign,
          web3,
        );

        await contracts.GardenContract.methods
          .addAccessCodeToGarden(
            gardenId,
            proofObject.proof.a,
            proofObject.proof.b,
            proofObject.proof.c,
            hashedCode,
            encryptedCode,
          )
          .send({ from: account })
          .on('transactionHash', (hash) => {
            this.setState({ loading: false });
            this.props.toastManager.add(`Hash de Tx: ${hash}`, {
              appearance: 'info',
            });
          })
          .once('confirmation', () => {
            this.props.updateRents();
            this.props.toastManager.add('Code ajout?? avec succ??s', {
              appearance: 'success',
            });
          });
      }, 10);
    } catch (error) {
      this.props.toastManager.add(
        `Impossible d'ajouter un code d'acc??s au jardin, veuillez r??essayer`,
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
          Une preuve de validit?? de mot de passe sera g??n??r??e. Cette ??tape peut
          durer ~ 45 secondes.
        </p>
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
          label="Code d'acc??s au jardin de 4 chiffres"
          type='number'
          validate
          required
          size='sm'
          min='1000'
          max='9999'
          step='1'
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
