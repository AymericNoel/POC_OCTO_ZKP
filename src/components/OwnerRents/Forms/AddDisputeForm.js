import React, { Component } from 'react';
import { MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';

class AddDisputeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenId: 0,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];
    const { gardenId } = this.props;
    this.setState({ contracts, account, gardenId });
  }

  submitHandler = async () => {
    await this.openDispute();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  openDispute = async () => {
    const { gardenId, contracts, account } = this.state;
    try {
      await contracts.GardenContract.methods
        .addDispute(gardenId)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.updateRents();
          this.props.toastManager.add(
            'Litige ouvert avec succès, contactez les administrateurs',
            {
              appearance: 'success',
            },
          );
        });
    } catch (error) {
      this.props.toastManager.add(
        `Impossible d'ouvrir un litige, veuillez réessayer`,
        {
          appearance: 'error',
        },
      );
    }
  };

  render() {
    return (
      <div>
        <p className='text-center' style={{ fontSize: '13px' }}>
          Le litige arretera la location en cours prématurement et les fonds
          serons redistribués. Prenez contact avec les administrateurs pour
          expliquer votre problème.
        </p>
        <div className='text-center mb-2'>
          <MDBBtn type='button' onClick={this.submitHandler} size='sm'>
            Ouvrir
          </MDBBtn>
        </div>
      </div>
    );
  }
}
AddDisputeForm.contextType = BlockchainContext;

export default withToastManager(AddDisputeForm);
