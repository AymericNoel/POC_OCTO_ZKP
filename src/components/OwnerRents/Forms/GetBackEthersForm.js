import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import Spinner from '../../Spinner';
import BlockchainContext from '../../../context/BlockchainContext';
import computeProof from '../../../utils/ZkpUtils';

class GetBackEthersForm extends Component {
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
    event.preventDefault();
    await this.getpayment();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  getpayment = async () => {
    const { gardenId, contracts, account, password } = this.state;
    this.setState({ loading: true });
    try {
      setTimeout(async () => {
        const proofObject = await computeProof(password);
        await contracts.GardenContract.methods
          .updateLocationStatusAndGetPayment(
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
              `Transaction confirmée`,
              {
                appearance: 'success',
              },
            );
          });
      }, 10);
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de retirer les éthers, veuillez réessayer',
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
          Les éthers ne peuvent être récupérés uniquement si la location est
          terminée. Après récupération des éthers, le status du jardin redevient
          &quot;libre&quot;. Une preuve de validité de mot de passe sera générée. Cette
          étape peut durer ~ 45 secondes.
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
GetBackEthersForm.contextType = BlockchainContext;

export default withToastManager(GetBackEthersForm);
