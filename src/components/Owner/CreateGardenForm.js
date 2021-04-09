import React, { Component } from 'react';
import {
  MDBInput,
  MDBModalBody,
  MDBModal,
  MDBBtn,
  MDBIcon,
  MDBFormInline,
} from 'mdbreact';
import BlockchainContext from '../../context/BlockchainContext';
import HashUtils from '../../utils/HashUtils';

class CreateGardenForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenType: 0,
      multipleOwners: 0,
      contact: '',
      district: '',
      area: '',
      coOwnersAddresses: '',
      password: '',
    };
    this.onGardenTypeClick = this.onGardenTypeClick.bind(this);
    this.onMultipleOwnerClick = this.onMultipleOwnerClick.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.sendGardenToBlockchain = this.sendGardenToBlockchain.bind(this);
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];

    this.setState({ contracts, account });
  }

  onGardenTypeClick = (nr) => () => {
    this.setState({
      gardenType: nr,
    });
  };

  onMultipleOwnerClick = (nr) => () => {
    this.setState({
      multipleOwners: nr,
    });
  };

  submitHandler = async (event) => {
    event.preventDefault();
    await this.sendGardenToBlockchain();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  sendGardenToBlockchain = async () => {
    let addresses = [];
    const {
      contracts,
      gardenType,
      multipleOwners,
      contact,
      district,
      area,
      coOwnersAddresses,
      password,
      account,
    } = this.state;
    const hash = HashUtils.getHashFromString(password);
    if (multipleOwners) {
      addresses = coOwnersAddresses.split(';');
    }
    try {
      await contracts.GardenContract.methods
        .createGarden(
          HashUtils.getArrayOfDecimalsFromhash(hash),
          district,
          area,
          contact,
          gardenType,
          multipleOwners,
          addresses,
        )
        .send({ from: account })
        .then(() => {
          this.props.toggle();
          window.location.reload();
        });
    } catch (error) {
      window.alert(error);
    }
  };

  render() {
    const { display, toggle } = this.props;
    return (
      <MDBModal isOpen={display} toggle={toggle} className='cascading-modal'>
        <div className='modal-header success-color white-text'>
          <h4 className='title'>
            <MDBIcon icon='pencil-alt' /> Création de jardins
          </h4>
          <button type='button' className='close' onClick={toggle}>
            <span aria-hidden='true'>×</span>
          </button>
        </div>
        <MDBModalBody>
          <form className='grey-text' onSubmit={this.submitHandler}>
            <MDBInput
              size='sm'
              label='Mail'
              icon='at'
              group
              type='email'
              validate
              required
              error='wrong'
              success='right'
              onChange={this.changeHandler}
              name='contact'
            />
            <MDBInput
              size='sm'
              label='Quartier'
              icon='home'
              group
              type='text'
              validate
              error='wrong'
              success='right'
              onChange={this.changeHandler}
              name='district'
              required
            />
            <MDBInput
              size='sm'
              label='Surface'
              icon='border-style'
              group
              type='number'
              validate
              error='wrong'
              success='right'
              onChange={this.changeHandler}
              name='area'
              required
            />
            <MDBFormInline>
              <span style={{ marginRight: '1.5em' }}>Type de jardin :</span>
              <MDBInput
                onClick={this.onGardenTypeClick(0)}
                checked={this.state.gardenType === 0}
                label='Potager'
                type='radio'
                id='garden1'
                containerClass='mr-5'
              />
              <MDBInput
                onClick={this.onGardenTypeClick(1)}
                checked={this.state.gardenType === 1}
                label='Détente'
                type='radio'
                id='garden2'
                containerClass='mr-5'
              />
            </MDBFormInline>
            <MDBFormInline>
              <span style={{ marginRight: '1.5em' }}>Copropriétaire :</span>
              <MDBInput
                className='radio-inline'
                onClick={this.onMultipleOwnerClick(0)}
                checked={this.state.multipleOwners === 0}
                label='Non'
                type='radio'
                id='cop1'
                containerClass='mr-5'
              />
              <MDBInput
                className='radio-inline'
                onClick={this.onMultipleOwnerClick(1)}
                checked={this.state.multipleOwners === 1}
                label='Oui'
                type='radio'
                id='cop2'
                containerClass='mr-5'
              />
            </MDBFormInline>
            <MDBInput
              size='sm'
              type='textarea'
              rows='2'
              disabled={this.state.multipleOwners !== 1}
              label='Adresses ethereum des copropriétaires séparées par un point virgule'
              icon='link'
              onChange={this.changeHandler}
              name='coOwnersAddresses'
              required
            />
            <MDBInput
              size='sm'
              type='password'
              rows='2'
              label='Mot de passe'
              icon='key'
              onChange={this.changeHandler}
              name='password'
              required
            />
            <div className='text-center'>
              <MDBBtn color='success' type='submit'>
                Soumettre le jardin
              </MDBBtn>
            </div>
          </form>
        </MDBModalBody>
      </MDBModal>
    );
  }
}
CreateGardenForm.contextType = BlockchainContext;

export default CreateGardenForm;
