import React from 'react';
import { MDBContainer } from 'mdbreact';
import SectionContainer from '../SectionContainer';
import RentsDatatable from '../RentsDatatable';
import QueryParamsHelper from '../../utils/QueryParamsUtils';

function DashboardRents(props) {
  const {
    params: { gardenId },
  } = props.match;
  const status = QueryParamsHelper(props.location.search);
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

export default DashboardRents;
