import React, { Component } from 'react';
import { MDBBtn, MDBCollapse, MDBNav, MDBNavItem, MDBInput } from 'mdbreact';

class SideBarNav extends Component {
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
              Accepter un jardin
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse1' isOpen={collapseID}>
            <form>
              <MDBInput
                label='Type your email'
                icon='envelope'
                group
                type='email'
                validate
                error='wrong'
                success='right'
              />
              <MDBInput
                label='Type your password'
                icon='lock'
                group
                type='password'
                validate
              />
              <div className='text-center mb-2'>
                <MDBBtn>Login</MDBBtn>
              </div>
            </form>
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
              Rejeter un jardin
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
              Valider un litige
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
              onClick={this.toggleCollapse('collapse3')}
              className='w-100'
            >
              Fixer redistribution pour litige
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
              Modifier l&apos;addresse du contrat verifieur
            </MDBBtn>
          </div>
          <MDBCollapse id='collapse5' isOpen={collapseID}>
            <p>verifier</p>
          </MDBCollapse>
        </MDBNavItem>
      </MDBNav>
    );
  }
}
export default SideBarNav;
