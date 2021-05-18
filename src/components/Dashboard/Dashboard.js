import { MDBContainer } from 'mdbreact';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../context/BlockchainContext';
import GardenList from '../GardenList';

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      isEmpty: true,
      allGardens: [],
      locations: 0,
      gardenCount: 0,
    };
  }

  /* eslint no-await-in-loop: "off" */
  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    try {
      const gardenCount = await contracts.GardenContract.methods
        .GardenCount()
        .call();
      if (Number(gardenCount) !== 0) {
        let locations = 0;
        for (let id = 1; id <= gardenCount; id += 1) {
          const proposal = await contracts.GardenContract.methods
            .getGardenById(id)
            .call();
          const row = {
            id,
            owner: proposal.owner,
            multipleOwners: proposal.multipleOwners,
            coOwners: proposal.coOwners,
            gardenType: proposal.gardenType,
            district: proposal.district,
            area: proposal.area,
            secretHash: null,
            contact: proposal.contact,
            status: proposal.status,
            rentLength: proposal.rentLength,
          };
          if (Number(proposal.status) === 4) {
            locations += 1;
          }
          this.setState({ allGardens: [...this.state.allGardens, row] });
        }
        this.setState({ isEmpty: false, gardenCount, locations });
      }
    } catch (error) {
      this.setState({ isEmpty: true });
      this.props.toastManager.add(
        'Impossible de récupérer les données depuis la blockchain',
        {
          appearance: 'error',
        },
      );
    }
  }

  seeMore = (id) => {
    this.props.history.push(`/Dashboard/${id}`);
  };

  render() {
    const { locations, gardenCount, allGardens, isEmpty } = this.state;
    let toDisp;
    if (isEmpty) {
      toDisp = (
        <h4 data-testid='empty-dashboard'>
          Il n&apos;y a pas encore de jardins sur la plateforme, soyez le
          premier à <Link to='/owner'>créer le votre</Link> !
        </h4>
      );
    } else {
      toDisp = (
        <div data-testid='loaded-dashboard'>
          <p>Jardins sur la plateforme : {gardenCount}</p>
          <p style={{ marginBottom: '2em' }}>
            Jardins en locations : {locations}
          </p>
          <GardenList data={allGardens} onClick={this.seeMore} />
        </div>
      );
    }
    return (
      <MDBContainer className='text-center'>
        <h3 className='h2-responsive mb-4'>
          <strong className='font-weight-bold'>
            Plateforme autonome de location de jardins
          </strong>
        </h3>
        {toDisp}
      </MDBContainer>
    );
  }
}

Dashboard.contextType = BlockchainContext;

export default withToastManager(Dashboard);
