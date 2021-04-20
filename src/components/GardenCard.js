import React, { useContext, useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import {
  MDBCardBody,
  MDBCard,
  MDBBadge,
  MDBCol,
  MDBRow,
  MDBCardText,
} from 'mdbreact';
import BlockchainContext from '../context/BlockchainContext';
import { GardenStatus, GardenType } from '../utils/Enum';

/**
 * Component to create unique garden via card
 * @param {gardenId} number - garden Id of chosen garden
 */
function GardenCard({ gardenId }) {
  const { addToast } = useToasts();
  const { contractsPromise } = useContext(BlockchainContext);

  const [garden, setGarden] = useState(undefined);

  useEffect(() => {
    async function loadGarden() {
      const contracts = await contractsPromise;
      try {
        const proposal = await contracts.GardenContract.methods
          .getGardenById(gardenId)
          .call();
        const row = {
          id: proposal.id,
          owner: proposal.owner,
          multipleOwners: proposal.multipleOwners,
          coOwners: proposal.coOwners,
          gardenType: proposal.gardenType,
          district: proposal.district,
          area: proposal.area,
          secretHash: proposal.secretHash,
          contact: proposal.contact,
          status: proposal.status,
          rentLength: proposal.rentLength,
        };
        setGarden(row);
      } catch (error) {
        addToast(
          `Impossible de charger le jardin ${gardenId}, veuillez réessayer`,
          { appearance: 'error' },
        );
        setGarden(null);
      }
    }
    loadGarden();
  }, []);

  return (
    <MDBCard cascade>
      <MDBCardBody>
        <MDBRow center>
          <MDBBadge pill color='info'>
            Status : {GardenStatus[garden?.status]}
          </MDBBadge>
        </MDBRow>
        <MDBRow style={{ marginTop: '1em' }}>
          <MDBCol>
            <MDBCardText>Propriétaire :</MDBCardText>
          </MDBCol>
          <MDBCol>
            <MDBCardText fontSize='3px'>{garden?.owner}</MDBCardText>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <MDBCardText>Superficie :</MDBCardText>
          </MDBCol>
          <MDBCol>
            <MDBCardText>{garden?.area}</MDBCardText>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <MDBCardText>Quartier :</MDBCardText>
          </MDBCol>
          <MDBCol>
            <MDBCardText>{garden?.district}</MDBCardText>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <MDBCardText>Contact :</MDBCardText>
          </MDBCol>
          <MDBCol>
            <MDBCardText>{garden?.contact}</MDBCardText>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <MDBCardText>Nombre de locations :</MDBCardText>
          </MDBCol>
          <MDBCol>
            <MDBCardText>{garden?.rentLength}</MDBCardText>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <MDBCardText>Type de jardin :</MDBCardText>
          </MDBCol>
          <MDBCol>
            <MDBCardText>{GardenType[garden?.gardenType]}</MDBCardText>
          </MDBCol>
        </MDBRow>
      </MDBCardBody>
    </MDBCard>
  );
}

export default GardenCard;
