import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
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
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.acceptDispute();
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
        .then(() => {
          window.location.reload();
        });
    } catch (error) {
      console.error('Unable to validate dispute.', error);
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

export default ValidateDisputeForm;
