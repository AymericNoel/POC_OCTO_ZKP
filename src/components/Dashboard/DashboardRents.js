import React from 'react';
import { MDBContainer } from 'mdbreact';
import SectionContainer from '../SectionContainer';
import RentsDatatable from '../RentsDatatable';

function DashboardRents(props) {
  const {
    params: { gardenId },
  } = props.match;
  return (
    <MDBContainer>
      <SectionContainer
        title={`Jardin n° ${gardenId}`}
        className='p-2'
      >
        <RentsDatatable gardenId={gardenId} seeMore />
      </SectionContainer>
    </MDBContainer>
  );
}

export default DashboardRents;
