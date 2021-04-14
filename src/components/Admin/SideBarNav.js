import React, { Component } from 'react';
import { MDBBtn, MDBCollapse, MDBNav } from 'mdbreact';
import BlockchainContext from '../../context/BlockchainContext';
import AcceptGardenForm from './Forms/AcceptGardenForm';
import DisputeSetupForm from './Forms/DisputeSetupForm';
import ModifyVerifierContractForm from './Forms/ModifyVerifierContractForm';
import RejectGardenForm from './Forms/RejectGardenForm';
import ValidateDisputeForm from './Forms/ValidateDisputeForm';
import './SideBarNav.css';

class SideBarNav extends Component {
  constructor() {
    super();
    this.state = {
      collapseID: '',
      contact: 'undefined',
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    try {
      const contact = await contracts.AdminContract.methods.ContactP2P().call();
      this.setState({ contact });
    } catch (error) {
      console.error('Unable to retrieve admin contact from blockchain.', error);
    }
  }

  toggleCollapse = (collapseID) => () => {
    this.setState((prevState) => ({
      collapseID: prevState.collapseID !== collapseID ? collapseID : '',
    }));
  };

  render() {
    const { collapseID, contact } = this.state;
    return (
      <MDBNav className='flex-column'>
        <div className='adminContact mb-3 w-100'>
          <p className='text-center font-weight-bolder'>Admin contact : </p>
          <p className='text-center font-weight-bold'>{contact}</p>
        </div>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse1')}
            className='w-100'
          >
            Accepter un jardin
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse1' isOpen={collapseID}>
          <AcceptGardenForm />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse2')}
            className='w-100'
          >
            Rejeter un jardin
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse2' isOpen={collapseID}>
          <RejectGardenForm />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse4')}
            className='w-100'
          >
            Fixer redistribution pour litige
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse4' isOpen={collapseID}>
          <DisputeSetupForm />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse3')}
            className='w-100'
          >
            Valider un litige
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse3' isOpen={collapseID}>
          <ValidateDisputeForm />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse5')}
            className='w-100'
          >
            Modifier l&apos;addresse du contrat verifieur
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse5' isOpen={collapseID}>
          <ModifyVerifierContractForm />
        </MDBCollapse>
      </MDBNav>
    );
  }
}
SideBarNav.contextType = BlockchainContext;

export default SideBarNav;
