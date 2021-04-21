import React, { Component } from 'react';
import { MDBBtn, MDBCollapse, MDBNav } from 'mdbreact';
import AcceptOfferForm from './Forms/AcceptOfferForm';
import AddGradeForm from './Forms/AddGradeForm';
import GetAccessCodeForm from './Forms/GetAccessCodeForm';
import OpenDispute from './Forms/OpenDispute';
import RefundForm from './Forms/RefundForm';

class TenantSideNav extends Component {
  constructor() {
    super();
    this.state = {
      collapseID: '',
    };
  }

  toggleCollapse = (collapseID) => () => {
    this.setState((prevState) => ({
      collapseID: prevState.collapseID !== collapseID ? collapseID : '',
    }));
  };

  render() {
    const { collapseID } = this.state;
    const { updateLocations } = this.props;
    return (
      <MDBNav className='flex-column'>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse1')}
            className='w-100'
          >
            Accepter proposition
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse1' isOpen={collapseID}>
          <AcceptOfferForm updateLocations={updateLocations} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse2')}
            className='w-100'
          >
            Remboursement avant location
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse2' isOpen={collapseID}>
          <RefundForm updateLocations={updateLocations} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse4')}
            className='w-100'
          >
            Obtenir code d&apos;accès au jardin
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse4' isOpen={collapseID}>
          <GetAccessCodeForm />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse7')}
            className='w-100'
          >
            Ajouter une note à un jardin
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse7' isOpen={collapseID}>
          <AddGradeForm updateLocations={updateLocations} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse3')}
            className='w-100'
          >
            Ouvrir un litige
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse3' isOpen={collapseID}>
          <OpenDispute updateLocations={updateLocations} />
        </MDBCollapse>
      </MDBNav>
    );
  }
}
export default TenantSideNav;
