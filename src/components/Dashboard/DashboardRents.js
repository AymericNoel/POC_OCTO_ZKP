import React, { Component } from 'react';
import { MDBContainer } from 'mdbreact';
import SectionContainer from '../SectionContainer';
import RentsDatatable from '../RentsDatatable';
import QueryParamsHelper from '../../utils/QueryParamsUtils';

class DashboardRents extends Component {
  render() {
    const {
      params: { gardenId },
    } = this.props.match;
    const status = QueryParamsHelper(this.props.location.search);
    return (
      <MDBContainer>
        <SectionContainer
          title={`Jardin n° ${gardenId}`}
          header={`Status : ${status}`}
          className='p-2'
        >
          <RentsDatatable gardenId={gardenId} />
        </SectionContainer>
      </MDBContainer>
    );
  }
}

export default DashboardRents;
