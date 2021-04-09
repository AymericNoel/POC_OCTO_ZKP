import React, { Component } from 'react';
import { MDBBtn, MDBCollapse, MDBNav, MDBNavItem } from 'mdbreact';

class OwnerRentsSideNav extends Component {
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
        <MDBNavItem>
          <div className='text-center mb-2'>
            <MDBBtn
              size='sm'
              color='success'
              onClick={this.toggleCollapse('collapse1')}
              className='w-100'
            >
              Changer le contact
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse1' isOpen={collapseID}>
            <p>ter</p>
          </MDBCollapse>
        </MDBNavItem>
        <MDBNavItem>
          <div className='text-center mb-2'>
            <MDBBtn
              size='sm'
              color='success'
              onClick={this.toggleCollapse('collapse2')}
              className='w-100'
            >
              Changer le secret
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse2' isOpen={collapseID}>
            <p>button 2</p>
          </MDBCollapse>
        </MDBNavItem>
        <MDBNavItem>
          <div className='text-center mb-2'>
            <MDBBtn
              size='sm'
              color='success'
              onClick={this.toggleCollapse('collapse4')}
              className='w-100'
            >
              Ajouter une proposition
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse4' isOpen={collapseID}>
            <p>button 2</p>
          </MDBCollapse>
        </MDBNavItem>
        <MDBNavItem>
          <div className='text-center mb-2'>
            <MDBBtn
              size='sm'
              color='success'
              onClick={this.toggleCollapse('collapse7')}
              className='w-100'
            >
              Supprimer une proposition
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse7' isOpen={collapseID}>
            <p>button 2</p>
          </MDBCollapse>
        </MDBNavItem>
        <MDBNavItem>
          <div className='text-center mb-2'>
            <MDBBtn
              size='sm'
              color='success'
              onClick={this.toggleCollapse('collapse3')}
              className='w-100'
            >
              Ajouter un code d&apos;accès
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse3' isOpen={collapseID}>
            <p>button 2</p>
          </MDBCollapse>
        </MDBNavItem>
        <MDBNavItem>
          <div className='text-center mb-2'>
            <MDBBtn
              size='sm'
              color='success'
              onClick={this.toggleCollapse('collapse5')}
              className='w-100'
            >
              Ouvrir un litige
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse5' isOpen={collapseID}>
            <p>verifier</p>
          </MDBCollapse>
        </MDBNavItem>
        <MDBNavItem>
          <div className='text-center mb-2'>
            <MDBBtn
              size='sm'
              color='success'
              onClick={this.toggleCollapse('collapse6')}
              className='w-100'
            >
              Retirer ses éthers après location
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse6' isOpen={collapseID}>
            <p>verifier</p>
          </MDBCollapse>
        </MDBNavItem>
      </MDBNav>
    );
  }
}
export default OwnerRentsSideNav;
