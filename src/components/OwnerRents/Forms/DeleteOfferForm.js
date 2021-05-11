import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import Spinner from '../../Spinner';
import BlockchainContext from '../../../context/BlockchainContext';
import computeProof from '../../../utils/ZkpUtils';

class DeleteOfferForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenId: 0,
      password: '',
      loading: false,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];
    const { gardenId } = this.props;
    this.setState({ contracts, account, gardenId });
  }

  submitHandler = async (event) => {
    this.setState({ loading: true });
    event.preventDefault();
    await this.deleteOffer();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  deleteOffer = async () => {
    const { gardenId, contracts, account, password } = this.state;
    try {
      setTimeout(async () => {
        const proofObject = await computeProof(password);
        await contracts.GardenContract.methods
          .deleteGardenOffer(
            gardenId,
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
              `L'offre de location a été supprimé avec succès`,
              {
                appearance: 'success',
              },
            );
          });
      }, 10);
    } catch (error) {
      this.props.toastManager.add(
        `Impossible de supprimer l'offre de location, veuillez réessayer`,
        {
          appearance: 'error',
        },
      );
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading } = this.state;
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          La suppresion d&apos;une offre ne peut avoir lieu uniquement si le
          locataire ne l&apos;a pas accepté. Une preuve de validité de mot de
          passe sera générée. Cette étape peut durer ~ 45 secondes.
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

export default withToastManager(DeleteOfferForm);
