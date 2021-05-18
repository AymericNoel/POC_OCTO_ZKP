import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';

class ModifyVerifierContractForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      verfierAddress: '',
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const accounts = await this.context.accountsPromise;
    const account = accounts !== undefined ? accounts[0] : undefined;
    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.changeAddress();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeAddress = async () => {
    const { verfierAddress, contracts, account } = this.state;
    try {
      await contracts.AdminContract.methods
        .modifyVerifierContractAddress(verfierAddress)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.toastManager.add(`Adresse modifiée avec succès`, {
            appearance: 'success',
          });
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de modifier l&apos;adresse du contrat Verifier, veuillez réessayer',
        {
          appearance: 'error',
        },
      );
    }
  };

  render() {
    return (
      <form onSubmit={this.submitHandler}>
        <MDBInput
          className='text-center'
          label='Nouvelle adresse'
          type='text'
          validate
          required
          size='sm'
          name='verfierAddress'
          pattern='^0x[a-fA-F0-9]{40}$'
          onChange={this.changeHandler}
          onInvalid={(e) => e.target.setCustomValidity('Adresse ethereum invalide')}
        />
        <div className='text-center mb-2'>
          <MDBBtn type='submit' size='sm'>
            Envoyer
          </MDBBtn>
        </div>
      </form>
    );
  }
}
ModifyVerifierContractForm.contextType = BlockchainContext;

export default withToastManager(ModifyVerifierContractForm);
