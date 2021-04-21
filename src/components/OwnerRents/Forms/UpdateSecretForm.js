import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import Spinner from '../../Spinner';
import BlockchainContext from '../../../context/BlockchainContext';
import { HashUtils } from '../../../utils/HashUtils';
import computeProof from '../../../utils/ZkpUtils';

class UpdateSecretForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenId: 0,
      oldPassword: '',
      newPassword: '',
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
    await this.updateSecret();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  updateSecret = async () => {
    const {
      gardenId,
      contracts,
      account,
      oldPassword,
      newPassword,
    } = this.state;
    try {
      const proofObject = await computeProof(oldPassword);
      const passwordHash = HashUtils.getHashFromString(newPassword);
      await contracts.GardenContract.methods
        .updateGardenSecretHash(
          gardenId,
          proofObject.proof.a,
          proofObject.proof.b,
          proofObject.proof.c,
          HashUtils.getArrayOfDecimalsFromhash(passwordHash),
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
            'Mot de passe mis à jour avec succès',
            {
              appearance: 'success',
            },
          );
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de mettre à jour le mot de passe, veuillez réessayer',
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
          Une preuve de validité de mot de passe sera générée. Cette étape peut
          durer ~ 45 secondes.
        </p>
        <MDBInput
          className='text-center'
          label='Ancien mot de passe'
          type='password'
          validate
          required
          size='sm'
          name='oldPassword'
          onChange={this.changeHandler}
        />
        <MDBInput
          className='text-center'
          label='Nouveau mot de passe'
          type='password'
          validate
          required
          size='sm'
          name='newPassword'
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
UpdateSecretForm.contextType = BlockchainContext;

export default withToastManager(UpdateSecretForm);
