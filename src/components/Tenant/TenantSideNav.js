import React, { Component } from 'react';
import { MDBBtn, MDBCollapse, MDBNav } from 'mdbreact';

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
    return (
      <MDBNav className='flex-column'>
        <div className='text-center mb-2'>
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
          <p>ter</p>
        </MDBCollapse>
        <div className='text-center mb-2'>
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
          <p>button 2</p>
        </MDBCollapse>
        <div className='text-center mb-2'>
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
          <p>button 2</p>
        </MDBCollapse>
        <div className='text-center mb-2'>
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
          <p>button 2</p>
        </MDBCollapse>
        <div className='text-center mb-2'>
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
          <p>button 2</p>
        </MDBCollapse>
      </MDBNav>
    );
  }
}
export default TenantSideNav;
