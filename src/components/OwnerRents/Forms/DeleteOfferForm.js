import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import Spinner from '../../Spinner';
import BlockchainContext from '../../../context/BlockchainContext';
import computeProof from '../../../utils/ZkpUtils';

class DeleteOfferForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
      password: '',
      loading: false,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.deleteOffer();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  deleteOffer = async () => {
    const { gardenIndex, contracts, account, password } = this.state;
    this.setState({ loading: true });
    try {
      const proof = await computeProof(password);
      await contracts.GardenContract.methods
        .updateGardenSecretHash(gardenIndex, proof.a, proof.b, proof.c)
        .send({ from: account })
        .then(() => {
          window.location.reload();
        });
    } catch (error) {
      console.error('Unable to delete offer.', error);
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading } = this.state;
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          La suppresion d&apos;une offre ne peut avoir lieu uniquement si le
          locataire ne l&apos;a pas accepté. Une preuve de validité de mot de passe
          sera générée. Cette étape peut durer ~ 45 secondes.
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
          label='Mot de passe'
          type='password'
          validate
          required
          size='sm'
          name='password'
          onChange={this.changeHandler}
        />

        <div className='text-center mb-2'>
          <MDBBtn type='submit' size='sm'>
            Envoyer
          </MDBBtn>
          {loading ? <Spinner /> : <div />}
        </div>
      </form>
    );
  }
}
DeleteOfferForm.contextType = BlockchainContext;

export default DeleteOfferForm;
