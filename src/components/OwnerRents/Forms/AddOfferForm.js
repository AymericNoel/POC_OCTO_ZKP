import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
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
      gardenId: 0,
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
    const { gardenId } = this.props;
    this.setState({ contracts, account, gardenId });
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
      gardenId,
      contracts,
      account,
      password,
      tenantAddress,
      duration,
      price,
      radioButton,
    } = this.state;
    try {
      this.setState({ loading: true });
      const durationInSeconds = radioButton === 1 ? duration * 60 * 60 : duration * 60 * 60 * 24;
      const proofObject = await computeProof(password);
      await contracts.GardenContract.methods
        .proposeGardenOffer(
          gardenId,
          tenantAddress,
          durationInSeconds,
          Web3Utils.getWeiFromEther(price),
          proofObject.proof.a,
          proofObject.proof.b,
          proofObject.proof.c,
        )
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.setState({ loading: false });
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.updateRents();
          this.props.toastManager.add(
            'Offre ajoutée avec succès. En attente du paiement du locataire',
            {
              appearance: 'success',
            },
          );
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de rajouter une offre de location, veuillez réessayer',
        {
          appearance: 'error',
        },
      );
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
          required
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

export default withToastManager(AddOfferForm);
