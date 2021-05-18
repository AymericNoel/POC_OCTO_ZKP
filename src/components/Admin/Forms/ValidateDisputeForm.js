import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';

class ValidateDisputeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      disputeId: 0,
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
    await this.acceptDispute();
    this.setState({
      disputeId: null,
    });
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  acceptDispute = async () => {
    const { disputeId, contracts, account } = this.state;
    try {
      await contracts.AdminContract.methods
        .acceptDispute(disputeId)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.updateDisputes();
          this.props.toastManager.add(`Litige n°${disputeId} validé`, {
            appearance: 'success',
          });
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de valider le litige, veuillez réessayer',
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
          label='Id du litige'
          type='number'
          validate
          required
          size='sm'
          name='disputeId'
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
ValidateDisputeForm.contextType = BlockchainContext;

export default withToastManager(ValidateDisputeForm);
