import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import Spinner from '../../Spinner';
import BlockchainContext from '../../../context/BlockchainContext';
import computeProof from '../../../utils/ZkpUtils';
import Web3Utils from '../../../utils/Web3Utils';

class AddOfferForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
      password: '',
      tenantAddress: '',
      duration: 0,
      price: 0,
      loading: false,
      radioButton: 1,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.addOffer();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  addOffer = async () => {
    const {
      gardenIndex,
      contracts,
      account,
      password,
      tenantAddress,
      duration,
      price,
      radioButton,
    } = this.state;
    console.log('button ', radioButton);
    this.setState({ loading: true });
    try {
      const durationInSeconds = radioButton === 1 ? duration * 60 * 60 : duration * 60 * 60 * 24;
      const proof = await computeProof(password);
      await contracts.GardenContract.methods
        .updateGardenSecretHash(
          gardenIndex,
          tenantAddress,
          durationInSeconds,
          Web3Utils.getWeiFromEther(price),
          proof.a,
          proof.b,
          proof.c,
        )
        .send({ from: account })
        .then(() => {
          window.location.reload();
        });
    } catch (error) {
      console.error('Unable to add offer.', error);
      this.setState({ loading: false });
    }
  };

  onClick = (nr) => () => {
    this.setState({
      radioButton: nr,
    });
  };

  render() {
    const { loading } = this.state;
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          Une preuve de validité de mot de passe sera générée. Cette étape peut
          durer ~ 45 secondes.
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
        <MDBInput
          className='text-center'
          label='Prix (en éthers)'
          type='number'
          validate
          required
          size='sm'
          name='price'
          onChange={this.changeHandler}
        />
        <MDBInput
          className='text-center'
          label='Adresse du locataire'
          type='text'
          validate
          size='sm'
          name='tenantAddress'
          pattern='^0x[a-fA-F0-9]{40}$'
          onChange={this.changeHandler}
          onInvalid={(e) => e.target.setCustomValidity('Adresse ethereum invalide')}
        />
        <MDBInput
          className='text-center'
          label='Durée de la location'
          type='number'
          validate
          required
          size='sm'
          name='duration'
          onChange={this.changeHandler}
        />
        <div className='text-center mt-0 mb-4'>
          <div className='form-check form-check-inline'>
            <label
              className='form-check-label'
              style={{ fontSize: '13px' }}
              htmlFor='radio1'
            >
              <input
                className='form-check-input'
                type='radio'
                name='radioButton'
                id='radio1'
                onClick={this.onClick(1)}
              />
              Heures
            </label>
          </div>

          <div className='form-check form-check-inline'>
            <label
              className='form-check-label'
              style={{ fontSize: '13px' }}
              htmlFor='radio2'
            >
              <input
                className='form-check-input'
                type='radio'
                id='radio2'
                name='radioButton'
                onClick={this.onClick(2)}
              />
              Jours
            </label>
          </div>
        </div>

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
AddOfferForm.contextType = BlockchainContext;

export default AddOfferForm;
