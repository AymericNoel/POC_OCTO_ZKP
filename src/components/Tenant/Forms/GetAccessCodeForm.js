import React, { Component } from 'react';
import { withToastManager } from 'react-toast-notifications';
import { MDBInput, MDBBtn } from 'mdbreact';
import BlockchainContext from '../../../context/BlockchainContext';

class GetAccessCodeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
      returnValue: null,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.getCode();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  getCode = async () => {
    const { gardenIndex, contracts, account } = this.state;
    try {
      await contracts.GardenContract.methods
        .getAccessCodeByGardenId(gardenIndex)
        .call({ from: account })
        .then((result) => {
          this.setState({ returnValue: result });
        });
    } catch (error) {
      this.props.toastManager.add(
        `Impossible de récupérer le code d'accès du jardin, veuillez réessayer`,
        {
          appearance: 'error',
        },
      );
    }
  };

  displayCode = () => (
    <div className='input-group input-group-sm'>
      <input
        type='text'
        readOnly
        className='form-control'
        id='inlineFormInputGroup'
        value={this.state.returnValue}
      />
      <div className='input-group-append'>
        <button
          className='btn-outline-secondary'
          id='copy-button'
          onClick={() => {
            const btn = document.getElementById('copy-button');
            btn.innerHTML = 'Copié';
            navigator.clipboard.writeText(this.state.returnValue);
          }}
          type='button'
        >
          Copier
        </button>
      </div>
    </div>
  );

  render() {
    const { gardenIndex } = this.state;
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          Le code d&apos;accès renvoyé sera celui de votre location dans le
          jardin &apos;{gardenIndex === 0 ? 'x' : gardenIndex}&apos;. Pour
          déchiffrer le code reçu avec votre private key, téléchargez ce{' '}
          <a
            href='https://github.com/AymericNoel/Garden-Code-Decryptor/releases'
            target='blank'
            className='text-decoration-none'
          >
            logiciel
          </a>
          , qui assure à la fois sécurité et simplicité d&apos;utilisation.
        </p>
        <MDBInput
          className='text-center'
          label='Id du jardin'
          type='number'
          validate
          required
          size='sm'
          name='gardenIndex'
          onChange={this.changeHandler}
        />

        <div className='text-center mb-2'>
          <MDBBtn type='submit' size='sm'>
            Envoyer
          </MDBBtn>
        </div>
        {this.state.returnValue !== null ? this.displayCode() : <div />}
      </form>
    );
  }
}
GetAccessCodeForm.contextType = BlockchainContext;

export default withToastManager(GetAccessCodeForm);
