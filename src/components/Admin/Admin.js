import React, { Component } from 'react';
import { MDBContainer, MDBCol, MDBRow } from 'mdbreact';
import SectionContainer from '../SectionContainer';
import SideBarNav from './SideBarNav';
import GardenProposals from './GardenProposals';
import DisputeProposals from './DisputeProposals';

class Admin extends Component {
  render() {
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
              noBottom
            >
              <GardenProposals />
            </SectionContainer>
            <SectionContainer header='Litiges' noBorder noBottom>
              <DisputeProposals />
            </SectionContainer>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }
}

export default Admin;
