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
      gardenUpdated: false,
      disputeUpdated: false,
    };
  }

  toggle = (gardenId = 0) => {
    const { modal } = this.state;
    this.setState({
      modal: !modal,
      gardenId,
    });
  };

  updateGardenProposals = () => {
    this.setState((prevState) => ({
      gardenUpdated: !prevState.gardenUpdated,
    }));
  };

  updateDisputeProposals = () => {
    this.setState((prevState) => ({
      disputeUpdated: !prevState.disputeUpdated,
    }));
  };

  render() {
    const { gardenId, modal, gardenUpdated, disputeUpdated } = this.state;
    return (
      <MDBContainer className='ml-1'>
        <MDBRow>
          <MDBCol size='3'>
            <SideBarNav
              updateGardens={this.updateGardenProposals}
              updateDisputes={this.updateDisputeProposals}
            />
          </MDBCol>
          <MDBCol size='9'>
            <SectionContainer
              title='Propositions jardins/litiges'
              header='Propositions de jardin'
              noBorder
            >
              <GardenProposals toggle={this.toggle} updated={gardenUpdated} />
            </SectionContainer>
            <SectionContainer header='Litiges' noBorder noBottom>
              <DisputeProposals toggle={this.toggle} updated={disputeUpdated} />
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
