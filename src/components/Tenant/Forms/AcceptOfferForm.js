import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';
import Web3Utils from '../../../utils/Web3Utils';

class AcceptOfferForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
      etherAmount: 0,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.acceptGarden();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  acceptGarden = async () => {
    const { gardenIndex, contracts, account, etherAmount } = this.state;
    const { web3 } = this.context;
    try {
      const messageToSign = await contracts.GardenContract.methods
        .signMe()
        .call();
      const signature = await web3.eth.personal.sign(messageToSign, account);
      await contracts.GardenContract.methods
        .acceptGardenOffer(gardenIndex, signature)
        .send({ from: account, value: Web3Utils.getWeiFromEther(etherAmount) })
        .then(() => {
          this.props.toastManager.add(
            'Proposition acceptée. La location débutera lorsque le propriétaire aura rajouter le code d&apos;accès au jardin',
            {
              appearance: 'success',
            },
          );
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de d&apos;accepter la proposition, veuillez réessayer',
        {
          appearance: 'error',
        },
      );
    }
  };

  render() {
    return (
      <form onSubmit={this.submitHandler}>
        <p className='text-center' style={{ fontSize: '13px' }}>
          Le nombre d&apos;éthers à envoyer doit être supérieur ou égal au
          montant fixé au préalable. Une signature sera demandée, elle servira
          plus tard au propriétaire pour crypté le code d&apos;accès au jardin
          pour qu&apos;il soit uniquement décryptable par le locataire, vous.
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
          label='Ethers à envoyer'
          type='number'
          validate
          required
          size='sm'
          name='etherAmount'
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
AcceptOfferForm.contextType = BlockchainContext;

export default withToastManager(AcceptOfferForm);
