import React, { Component } from 'react';
import { MDBBtn, MDBContainer, MDBInput } from 'mdbreact';

import computeProof from '../../../utils/ZkpUtils';
import SectionContainer from '../../SectionContainer';
import Spinner from '../../Spinner';

class ZKP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      preimage: '',
      proof: {},
    };
  }

  submitHandler = async (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    console.log(this.state.preimage);
    try {
      const proof = await computeProof(this.state.preimage);
      this.setState({ loading: false, proof });
      document.getElementById('downloadProof').click();
    } catch (error) {
      console.error('could not export proof', error);
      this.setState({ loading: false });
    }
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { loading, proof } = this.state;
    return (
      <MDBContainer>
        <SectionContainer
          title='Modules Zero Knowledge Proof'
          header='Exportation de preuve'
        >
          <form onSubmit={this.submitHandler}>
            <MDBInput
              label='Mot de passe'
              icon='key'
              type='password'
              validate
              required
              size='sm'
              name='preimage'
              onChange={this.changeHandler}
            />
            <MDBBtn color='success' type='submit'>
              Exporter preuve de mot de passe
            </MDBBtn>
            {loading ? <Spinner /> : <div />}
          </form>
          <a
            id='downloadProof'
            download='proof.json'
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(proof, null, 2),
            )}`}
          >
            {' '}
          </a>
        </SectionContainer>
        <SectionContainer header='Comment ça marche ?'>
          <p>explication ici</p>
        </SectionContainer>
        <SectionContainer header='Explication du fichier "proof.json"'>
          <p>explication ici</p>
        </SectionContainer>
      </MDBContainer>
    );
  }
}

export default ZKP;
