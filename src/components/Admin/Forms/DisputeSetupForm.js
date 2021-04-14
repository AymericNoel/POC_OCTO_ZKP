import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import BlockchainContext from '../../../context/BlockchainContext';

class DisputeSetupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      disputeId: 0,
      currentOwnerStepIndex: 0,
      currentTenantStepIndex: 100,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.setupDispute();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleInputChange = (e) => {
    this.setState({
      currentOwnerStepIndex: e.currentTarget.value,
      currentTenantStepIndex: 100 - e.currentTarget.value,
    });
  };

  setupDispute = async () => {
    const {
      disputeId,
      contracts,
      account,
      currentTenantStepIndex,
    } = this.state;
    try {
      const disputeProposal = await contracts.AdminContract.methods
        .getDisputeProposalById(disputeId)
        .call();
      const tenantAmount = currentTenantStepIndex * 0.01 * Number(disputeProposal.balance);
      const ownerAmount = Number(disputeProposal.balance) - tenantAmount;

      await contracts.AdminContract.methods
        .setAmountForDispute(disputeId, tenantAmount, ownerAmount)
        .send({ from: account })
        .then(() => {
          window.location.reload();
        });
    } catch (error) {
      console.error('Unable to reject garden.', error);
    }
  };

  render() {
    return (
      <div>
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
          <label htmlFor='customRange1' style={{ fontSize: '13px' }}>
            Montant pour le propriétaire
            <input
              onInput={this.handleInputChange}
              type='range'
              value={this.state.currentOwnerStepIndex}
              className='custom-range'
              id='customRange1'
              min='0'
              max='100'
              step='25'
              list='tick-list'
            />
            <datalist id='tick-list'>
              <option>0</option>
              <option>25</option>
              <option>50</option>
              <option>75</option>
              <option>100</option>
            </datalist>
            <span id='output'>{this.state.currentOwnerStepIndex} %</span>
          </label>
          <label htmlFor='customRange1' style={{ fontSize: '13px' }}>
            Montant pour le locataire
            <input
              type='range'
              value={this.state.currentTenantStepIndex}
              className='custom-range'
              id='customRange1'
              min='0'
              max='100'
              step='25'
              list='tick-list'
              disabled
            />
            <span id='output'>{this.state.currentTenantStepIndex} %</span>
          </label>

          <div className='text-center mb-2'>
            <MDBBtn type='submit' size='sm'>
              Envoyer
            </MDBBtn>
          </div>
        </form>
      </div>
    );
  }
}
DisputeSetupForm.contextType = BlockchainContext;

export default DisputeSetupForm;
