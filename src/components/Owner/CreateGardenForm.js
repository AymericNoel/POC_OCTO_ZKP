import React, { Component } from 'react';
import { withToastManager } from 'react-toast-notifications';
import { MDBInput, MDBModalBody, MDBModal, MDBBtn, MDBIcon } from 'mdbreact';
import BlockchainContext from '../../context/BlockchainContext';
import { HashUtils } from '../../utils/HashUtils';

class CreateGardenForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenType: 1,
      multipleOwners: 0,
      contact: '',
      district: '',
      area: '',
      coOwnersAddresses: '',
      password: '',
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const accounts = await this.context.accountsPromise;
    const account = accounts !== (undefined || null) ? accounts[0] : undefined;

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
    const passwordHash = HashUtils.getHashFromString(password);
    if (multipleOwners) {
      addresses = coOwnersAddresses.split(';');
    }
    try {
      await contracts.GardenContract.methods
        .createGarden(
          HashUtils.getArrayOfDecimalsFromhash(passwordHash),
          district,
          area,
          contact,
          gardenType,
          multipleOwners,
          addresses,
        )
        .send({ from: account })
        .on('transactionHash', (hash) => {
          this.props.toggle();
          this.props.toastManager.add(`Hash de Tx: ${hash}`, {
            appearance: 'info',
          });
        })
        .once('confirmation', () => {
          this.props.refresh();
          this.props.toastManager.add('Jardin crée avec succès', {
            appearance: 'success',
          });
        });
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de créer un jardin, veuillez réessayer',
        {
          appearance: 'error',
        },
      );
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
              label='Surface (m²)'
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
            <div className='mt-0 mb-4'>
              <div className='form-check form-check-inline'>
                <span style={{ marginRight: '1.5em' }}>Type de jardin :</span>
                <label className='form-check-label mr-5' htmlFor='garden1'>
                  <input
                    className='form-check-input'
                    type='radio'
                    id='garden1'
                    readOnly
                    checked={this.state.gardenType === 1}
                    name='gardenType'
                    onClick={this.onGardenTypeClick(1)}
                  />
                  Détente
                </label>
                <label className='form-check-label' htmlFor='garden2'>
                  <input
                    className='form-check-input'
                    type='radio'
                    readOnly
                    checked={this.state.gardenType === 0}
                    id='garden2'
                    name='gardenType'
                    onClick={this.onGardenTypeClick(0)}
                  />
                  Potager
                </label>
              </div>
            </div>
            <div className='mt-0 mb-4'>
              <div className='form-check form-check-inline'>
                <span style={{ marginRight: '1.5em' }}>copropriétaires :</span>
                <label className='form-check-label mr-5' htmlFor='cop1'>
                  <input
                    className='form-check-input'
                    type='radio'
                    readOnly
                    checked={this.state.multipleOwners === 0}
                    id='cop1'
                    name='multipleOwners'
                    onClick={this.onMultipleOwnerClick(0)}
                  />
                  Non
                </label>
                <label className='form-check-label' htmlFor='cop2'>
                  <input
                    className='form-check-input'
                    type='radio'
                    readOnly
                    checked={this.state.multipleOwners === 1}
                    id='cop2'
                    name='multipleOwners'
                    onClick={this.onMultipleOwnerClick(1)}
                  />
                  Oui
                </label>
              </div>
            </div>
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
              label='Mot de passe (8 caractères maximum)'
              icon='key'
              onChange={this.changeHandler}
              name='password'
              maxLength='8'
              validate
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

export default withToastManager(CreateGardenForm);
