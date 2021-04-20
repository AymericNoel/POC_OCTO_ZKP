import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../../context/BlockchainContext';
import '../SideBarNav.css';

class AcceptGardenForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: undefined,
      account: undefined,
      gardenIndex: 0,
      inputFile: null,
      nameFile: 'Télécharger la preuve',
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];
    this.setState({ contracts, account });
  }

  submitHandler = async (event) => {
    event.preventDefault();
    await this.validateGarden();
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  inputFileHandler = (event) => {
    try {
      const nameFile = event.target.files[0].name;
      const fileReader = new FileReader();
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        try {
          const jsonProof = JSON.parse(e.target.result);
          this.setState({ inputFile: jsonProof, nameFile });
        } catch (error) {
          this.props.toastManager.add(
            'Impossible de telecharger la preuve, veuillez vérifier votre fichier',
            {
              appearance: 'error',
            },
          );
        }
      };
    } catch (error) {
      this.setState({ nameFile: 'Télécharger la preuve' });
    }
  };

  validateGarden = async () => {
    const { gardenIndex, inputFile, contracts, account } = this.state;
    try {
      await contracts.AdminContract.methods
        .acceptGarden(
          gardenIndex,
          inputFile.proof.a,
          inputFile.proof.b,
          inputFile.proof.c,
        )
        .send({ from: account })
        .then(() => {
          this.props.toastManager.add(`Jardin ${gardenIndex} validé`, {
            appearance: 'success',
          });
        });
    } catch (error) {
      this.props.toastManager.add('Impossible de valider le jardin', {
        appearance: 'error',
      });
    }
  };

  render() {
    return (
      <form onSubmit={this.submitHandler}>
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

        <div className='custom-file mb-4'>
          <input
            type='file'
            className='custom-file-input'
            id='inputFile'
            name='inputFile'
            onChange={this.inputFileHandler}
            required
          />
          <label
            className='custom-file-label'
            style={{ fontSize: '13px' }}
            htmlFor='inputFile'
            data-browse='Parcourir'
          >
            {this.state.nameFile}
          </label>
        </div>

        <div className='text-center mb-2'>
          <MDBBtn type='submit' size='sm'>
            Envoyer
          </MDBBtn>
        </div>
      </form>
    );
  }
}
AcceptGardenForm.contextType = BlockchainContext;

export default withToastManager(AcceptGardenForm);
