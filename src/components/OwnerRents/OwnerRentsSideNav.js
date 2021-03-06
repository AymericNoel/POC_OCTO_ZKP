import React, { Component } from 'react';
import { MDBBtn, MDBCollapse, MDBNav } from 'mdbreact';
import AddDisputeForm from './Forms/AddDisputeForm';
import AddOfferForm from './Forms/AddOfferForm';
import DeleteOfferForm from './Forms/DeleteOfferForm';
import GetBackEthersForm from './Forms/GetBackEthersForm';
import UpdateContactForm from './Forms/UpdateContactForm';
import UpdateSecretForm from './Forms/UpdateSecretForm';
import AddAccessCodeForm from './Forms/AddAccessCodeForm';

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
    const { updateRents, gardenId } = this.props;
    return (
      <MDBNav className='flex-column'>
        <div className='text-center mb-2 ml-n2'>
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
          <UpdateContactForm gardenId={gardenId} updateRents={updateRents} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
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
          <UpdateSecretForm gardenId={gardenId} updateRents={updateRents} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
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
          <AddOfferForm gardenId={gardenId} updateRents={updateRents} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
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
          <DeleteOfferForm gardenId={gardenId} updateRents={updateRents} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse3')}
            className='w-100'
          >
            Ajouter un code d&apos;acc??s
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse3' isOpen={collapseID}>
          <AddAccessCodeForm gardenId={gardenId} updateRents={updateRents} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
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
          <AddDisputeForm gardenId={gardenId} updateRents={updateRents} />
        </MDBCollapse>
        <div className='text-center mb-2 ml-n2'>
          <MDBBtn
            size='sm'
            color='success'
            onClick={this.toggleCollapse('collapse6')}
            className='w-100'
          >
            Retirer ses ??thers apr??s location
          </MDBBtn>
        </div>
        <MDBCollapse id='collapse6' isOpen={collapseID}>
          <GetBackEthersForm gardenId={gardenId} updateRents={updateRents} />
        </MDBCollapse>
      </MDBNav>
    );
  }
}
export default OwnerRentsSideNav;
