import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';

class RefundForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.openDispute();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  openDispute = async () => {
    const { gardenIndex, contracts, account } = this.state;
    try {
      await contracts.GardenContract.methods
        .addDispute(gardenIndex)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.updateLocations();
          this.props.toastManager.add(
            'litige ouvert avec succès, veuillez prendre contact avec les administrateurs',
            {
              appearance: 'success',
            },
          );
        });
    } catch (error) {
      this.props.toastManager.add(
        `Impossible d'ajouter un litige, veuillez réessayer`,
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
          Le litige arreta la location en cours prématurement et les fonds
          serons redistribués. Prenez contact avec les administrateurs pour
          expliquer votre problème.
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

        <div className='text-center mb-2'>
          <MDBBtn type='submit' size='sm'>
            Envoyer
          </MDBBtn>
        </div>
      </form>
    );
  }
}
RefundForm.contextType = BlockchainContext;

export default withToastManager(RefundForm);
