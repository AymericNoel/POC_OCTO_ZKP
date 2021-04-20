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
      gardenIndex: 0,
      newContact: '',
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.updateContact();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  updateContact = async () => {
    const { gardenIndex, contracts, account, newContact } = this.state;
    try {
      await contracts.GardenContract.methods
        .updateGardenContact(gardenIndex, newContact)
        .send({ from: account })
        .then(() => {
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
          Seul le déployeur des smarts contracts peut mettre à jour le contact
          administrateur.
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
          label='Nouvelle coordonnée'
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
