import React, { Component } from 'react';
import { MDBInput, MDBBtn } from 'mdbreact';
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
        this.setState({ inputFile: JSON.parse(e.target.result), nameFile });
      };
    } catch (error) {
      this.setState({ nameFile: 'Télécharger la preuve' });
    }
  };

  validateGarden = async () => {
    const { gardenIndex, inputFile, contracts, account } = this.state;
    try {
      console.log(inputFile);
      await contracts.AdminContract.methods
        .acceptGarden(gardenIndex, inputFile.proof.a, inputFile.proof.b, inputFile.proof.c)
        .send({ from: account })
        .then(() => {
          window.location.reload();
        });
    } catch (error) {
      console.error('Unable to validate garden ', error);
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
          <label className='custom-file-label inputFile' style={{ fontSize: '13px' }} htmlFor='inputGroupFile01'>
            {this.state.nameFile}
            <input
              type='file'
              className='custom-file-input'
              id='inputGroupFile01'
              aria-describedby='inputGroupFileAddon01'
              name='inputFile'
              onChange={this.inputFileHandler}
              required
            />
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

export default AcceptGardenForm;
