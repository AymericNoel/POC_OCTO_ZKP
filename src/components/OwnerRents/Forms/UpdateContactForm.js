import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';

class UpdateContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenId: 0,
      newContact: '',
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
    await this.updateContact();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  updateContact = async () => {
    const { gardenId, contracts, account, newContact } = this.state;
    try {
      await contracts.GardenContract.methods
        .updateGardenContact(gardenId, newContact)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.updateRents();
          this.props.toastManager.add('Contact mis à jour avec succès', {
            appearance: 'success',
          });
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de mettre à jour le contact, veuillez réessayer',
        {
          appearance: 'error',
        },
      );
    }
  };

  render() {
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          Ce contact sera accessible par tous les visiteurs du site web.
        </p>
        <MDBInput
          className='text-center'
          label='Nouveau contact'
          type='text'
          validate
          required
          name='newContact'
          onChange={this.changeHandler}
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
UpdateContactForm.contextType = BlockchainContext;

export default withToastManager(UpdateContactForm);
