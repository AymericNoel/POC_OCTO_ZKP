import React, { Component } from 'react';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBBtn,
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
} from 'mdbreact';
import SectionContainer from '../SectionContainer';
import RentsDatatable from '../RentsDatatable';
import OwnerRentsSideNav from './OwnerRentsSideNav';
import BlockchainContext from '../../context/BlockchainContext';
import { GardenStatus } from '../../utils/Enum';
import GardenCard from '../GardenCard';

class OwnerRents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gardenStatus: '',
      gardenData: {},
      modal: false,
      updated: false,
    };
  }

  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const accounts = await this.context.accountsPromise;
    const {
      params: { gardenId },
    } = this.props.match;
    try {
      const gardenCount = await contracts.GardenContract.methods
        .GardenCount()
        .call();
      if (Number(gardenCount) < gardenId) {
        this.props.history.push('/');
      } else {
        const retrievedGarden = await contracts.GardenContract.methods
          .getGardenById(gardenId)
          .call();
        if (retrievedGarden.owner !== accounts[0]) {
          this.props.history.push('/');
        }
        this.setState({
          gardenData: retrievedGarden,
          gardenStatus: GardenStatus[retrievedGarden.status],
        });
      }
    } catch (error) {
      this.props.history.push('/');
    }
  }

  toggle = () => {
    this.setState((prevState) => ({
      modal: !prevState.modal,
    }));
  };

  updateRents = () => {
    this.setState((prevState) => ({
      updated: !prevState.updated,
    }));
  }

  render() {
    const { gardenStatus, gardenData, modal, updated } = this.state;
    const {
      params: { gardenId },
    } = this.props.match;
    return (
      <MDBContainer className='ml-1'>
        <MDBRow>
          <MDBCol size='3'>
            <OwnerRentsSideNav gardenId={gardenId} updateRents={this.updateRents} />
          </MDBCol>
          <MDBCol>
            <SectionContainer
              title={`Jardin n° ${gardenId}`}
              header={gardenStatus}
              noBorder
            >
              <div className='mt-O'>
                <MDBBtn rounded size='sm' onClick={this.toggle}>
                  Détails sur le jardin
                </MDBBtn>
              </div>
              <RentsDatatable gardenId={gardenId} seeMore={false} updated={updated} />
            </SectionContainer>
          </MDBCol>
        </MDBRow>
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
            <GardenCard gardenData={gardenData} />
          </MDBModalBody>
        </MDBModal>
      </MDBContainer>
    );
  }
}

OwnerRents.contextType = BlockchainContext;

export default OwnerRents;
