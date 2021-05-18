import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';

class RejectGardenForm extends Component {
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
    const accounts = await this.context.accountsPromise;
    const account = accounts !== undefined ? accounts[0] : undefined;

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.rejectGarden();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  rejectGarden = async () => {
    const { gardenIndex, contracts, account } = this.state;
    try {
      await contracts.AdminContract.methods
        .rejectGarden(gardenIndex)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.updateGardens();
          this.props.toastManager.add(`Jardin ${gardenIndex} rejeté avec succès`, {
            appearance: 'success',
          });
        });
    } catch (error) {
      this.props.toastManager.add('Impossible de rejeter le jardin', {
        appearance: 'error',
      });
    }
  };

  render() {
    return (
      <form onSubmit={this.submitHandler}>
        <MDBInput
          className='text-center'
          label='Id du jardin'
          type='number'
          validate
          required
          size='sm'
          value={this.state.gardenIndex}
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
RejectGardenForm.contextType = BlockchainContext;

export default withToastManager(RejectGardenForm);
