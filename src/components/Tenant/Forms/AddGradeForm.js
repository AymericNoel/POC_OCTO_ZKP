import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import BlockchainContext from '../../../context/BlockchainContext';

class AddGradeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
      grade: 0,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.addGrade();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  addGrade = async () => {
    const { gardenIndex, contracts, account, grade } = this.state;
    try {
      await contracts.GardenContract.methods
        .addGradeToGarden(gardenIndex, grade)
        .send({ from: account })
        .then(() => {
          window.location.reload();
        });
    } catch (error) {
      console.error('Unable to add grade.', error);
    }
  };

  render() {
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          La note doit être comprise entre 1 et 5.
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
        <MDBInput
          className='text-center'
          label='Note'
          type='number'
          validate
          required
          size='sm'
          name='grade'
          min='1'
          max='5'
          step='1'
          onChange={this.changeHandler}
          onInvalid={(e) => e.target.setCustomValidity(
            'Note invalide. Doit être entre 1 et 5',
          )}
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
AddGradeForm.contextType = BlockchainContext;

export default AddGradeForm;
