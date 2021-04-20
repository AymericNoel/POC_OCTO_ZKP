import React, { Component } from 'react';
import { MDBDataTableV5 } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../context/BlockchainContext';

class TenantDatatable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEmpty: true,
      allRents: {
        columns: [
          {
            label: 'Locataire',
            field: 'tenant',
            width: 136,
          },
          {
            label: 'Durée',
            field: 'duration',
            width: 136,
          },
          {
            label: 'Status',
            field: 'status',
            width: 136,
          },
          {
            label: 'Prix',
            field: 'price',
            width: 136,
          },
          {
            label: 'Balance',
            field: 'balance',
            width: 136,
          },
          {
            label: 'Note',
            field: 'rate',
            width: 136,
          },
          {
            label: 'Code Hashé',
            field: 'gardenHashCode',
            width: 136,
          },
          {
            label: 'Status du jardin',
            field: 'gardenStatus',
            width: 136,
          },
        ],
        rows: [],
      },
    };
  }

  /* eslint no-await-in-loop: "off" */
  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];
    let found = false;
    try {
      const gardenCount = await contracts.GardenContract.methods
        .GardenCount()
        .call();
      if (Number(gardenCount) !== 0) {
        for (let id = 1; id <= gardenCount; id += 1) {
          const retrievedGarden = await contracts.GardenContract.methods
            .getGardenById(id)
            .call();
          const lastRent = await contracts.GardenContract.methods.getRentByGardenAndRentId(
            id,
            Number(retrievedGarden.rentLength) - 1,
          );
          const duration = Number(lastRent.duration);
          const beginning = Number(lastRent.beginning);
          const rate = Number(lastRent.rate);
          let status;
          if (beginning === 0) {
            status = 'Pas commencé';
          } else if (beginning + duration < Date.now() / 1000) {
            status = 'Terminé';
          } else {
            status = 'En cours';
          }
          const row = {
            tenant: lastRent.tenant,
            duration:
              duration < 86400
                ? `${duration / 60 / 60} heures`
                : `${duration / 60 / 60 / 24} jours`,
            status,
            price: lastRent.price,
            balance: lastRent.balance,
            rate: rate !== -1 ? rate : 'non noté',
            gardenHashCode: lastRent.gardenHashCode,
            gardenStatus: retrievedGarden.status,
          };
          if (row.tenant === account && row.status !== 'Terminé') {
            found = true;
            this.setState({ allGardens: [...this.state.allGardens, row] });
          }
        }
        if (found) {
          this.setState({ isEmpty: false });
        }
      }
    } catch (error) {
      this.setState({ isEmpty: true });
      this.props.toastManager.add(
        'Impossible de récupérer les locations depuis la blockchain',
        {
          appearance: 'error',
        },
      );
    }
  }

  render() {
    const { isEmpty, allRents } = this.state;
    let toDisp;
    if (isEmpty) {
      toDisp = (
        <h6>
          Vous n&apos;avez pas de locations en cours. Contactez un propriétaire
          pour effectuer une location.
        </h6>
      );
    } else {
      toDisp = (
        <MDBDataTableV5
          infoLabel={['', '-', 'sur', '']}
          entriesLabel='Locations par page'
          hover
          data={allRents}
          searching={false}
        />
      );
    }
    return toDisp;
  }
}

TenantDatatable.contextType = BlockchainContext;

export default withToastManager(TenantDatatable);
