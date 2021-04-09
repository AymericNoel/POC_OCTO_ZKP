import React, { Component } from 'react';
import { MDBCol, MDBContainer, MDBRow } from 'mdbreact';
import SectionContainer from '../SectionContainer';
import RentsDatatable from '../RentsDatatable';
import OwnerRentsSideNav from './OwnerRentsSideNav';
import QueryParamsHelper from '../../utils/QueryParamsUtils';

class OwnerRents extends Component {
  render() {
    const {
      params: { gardenId },
    } = this.props.match;
    const status = QueryParamsHelper(this.props.location.search);
    return (
      <MDBContainer className='ml-1'>
        <MDBRow>
          <MDBCol size='3'>
            <OwnerRentsSideNav />
          </MDBCol>
          <MDBCol size='9'>
            <SectionContainer
              title={`Jardin n° ${gardenId}`}
              header={status}
              className='p-2'
              noBorder
            >
              <RentsDatatable gardenId={gardenId} />
            </SectionContainer>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }
}

export default OwnerRents;
