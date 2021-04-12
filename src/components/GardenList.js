import React from 'react';
import {
  MDBCard,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBRow,
  MDBIcon,
  MDBCardHeader,
  MDBBadge,
  MDBAnimation,
  MDBCardGroup,
} from 'mdbreact';
import { GardenType, GardenStatus } from '../utils/Enum';
import './GardenList.css';

/**
 * Component to create list of gardens via cards
 * @param {Array} data - gardens retrieved from blockchain
 * @param {function} onClick - function to redirect when 'see more' is clicked
 */
function Cards({ data, onClick }) {
  const allCards = data.map((garden) => (
    <MDBAnimation reveal type='zoomIn' key={garden}>
      <MDBCard style={{ width: '22rem' }} className='mb-3 mr-2' cascade>
        <MDBCardHeader color='success-color'>
          Jardin n°{garden.id}
        </MDBCardHeader>
        <MDBCardBody>
          <MDBBadge pill color='info'>
            Status : {GardenStatus[garden.status]}
          </MDBBadge>
          <MDBRow style={{ marginTop: '1em' }}>
            <MDBCol>
              <MDBCardText>Superficie :</MDBCardText>
            </MDBCol>
            <MDBCol>
              <MDBCardText>{garden.area}</MDBCardText>
            </MDBCol>
          </MDBRow>
          <MDBRow>
            <MDBCol>
              <MDBCardText>Quartier :</MDBCardText>
            </MDBCol>
            <MDBCol>
              <MDBCardText>{garden.district}</MDBCardText>
            </MDBCol>
          </MDBRow>
          <MDBRow>
            <MDBCol>
              <MDBCardText>Contact :</MDBCardText>
            </MDBCol>
            <MDBCol>
              <MDBCardText>{garden.contact}</MDBCardText>
            </MDBCol>
          </MDBRow>
          <MDBRow>
            <MDBCol>
              <MDBCardText>Nombre de locations :</MDBCardText>
            </MDBCol>
            <MDBCol>
              <MDBCardText>{garden.rentLength}</MDBCardText>
            </MDBCol>
          </MDBRow>
          <MDBRow>
            <MDBCol>
              <MDBCardText>Type de jardin :</MDBCardText>
            </MDBCol>
            <MDBCol>
              <MDBCardText>{GardenType[garden.gardenType]}</MDBCardText>
            </MDBCol>
          </MDBRow>
          <div className='d-flex flex-row-reverse mt-2'>
            <button
              type='button'
              className='gardenButton'
              onClick={() => {
                onClick(garden.id, garden.status);
              }}
            >
              <h6>
                Voir plus
                <MDBIcon icon='angle-double-right' className='ml-2' />
              </h6>
            </button>
          </div>
        </MDBCardBody>
      </MDBCard>
    </MDBAnimation>
  ));

  return allCards;
}

function GardenList(props) {
  return (
    <MDBCardGroup>
      <Cards data={props.data} onClick={props.onClick} />
    </MDBCardGroup>
  );
}

export default GardenList;
