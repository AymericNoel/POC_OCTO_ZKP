import React, { Component } from 'react';
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
} from 'mdbreact';
import SectionContainer from '../SectionContainer';
import SideBarNav from './SideBarNav';
import GardenProposals from './GardenProposals';
import DisputeProposals from './DisputeProposals';
import GardenCard from '../GardenCard';

class Admin extends Component {
  constructor() {
    super();
    this.state = {
      modal: false,
      gardenId: 0,
    };
  }

  toggle = (gardenId = 0) => {
    const { modal } = this.state;
    this.setState({
      modal: !modal,
      gardenId,
    });
  };

  render() {
    const { gardenId, modal } = this.state;
    return (
      <MDBContainer className='ml-1'>
        <MDBRow>
          <MDBCol size='3'>
            <SideBarNav />
          </MDBCol>
          <MDBCol size='9'>
            <SectionContainer
              title='Propositions jardins/litiges'
              header='Propositions de jardin'
              noBorder
            >
              <GardenProposals toggle={this.toggle} />
            </SectionContainer>
            <SectionContainer header='Litiges' noBorder noBottom>
              <DisputeProposals toggle={this.toggle} />
            </SectionContainer>
          </MDBCol>
          <MDBModal isOpen={modal} toggle={this.toggle} size='lg'>
            <MDBModalHeader
              style={{ backgroundColor: 'rgb(201,248,215)' }}
              toggle={() => {
                this.toggle(0);
              }}
            >
              Jardin n°{gardenId}
            </MDBModalHeader>
            <MDBModalBody>
              <GardenCard gardenId={gardenId} />
            </MDBModalBody>
          </MDBModal>
        </MDBRow>
      </MDBContainer>
    );
  }
}

export default Admin;
