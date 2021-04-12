import React, { Component } from 'react';
import { MDBBtn, MDBCollapse, MDBNav, MDBInput } from 'mdbreact';

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
              className='text-center'
              label='Id du jardin'
              validate
              size='sm'
            />
            <MDBInput label='Preuve ZKP' validate size='sm' />
            <div className='text-center mb-2'>
              <MDBBtn size='sm'>Send</MDBBtn>
            </div>
          </form>
        </MDBCollapse>
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
      </MDBNav>
    );
  }
}
export default SideBarNav;
