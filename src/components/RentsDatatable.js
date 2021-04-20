import React, { Component } from 'react';
import { MDBDataTableV5 } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../context/BlockchainContext';

class DisputeProposals extends Component {
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
        ],
        rows: [],
      },
    };
  }

  /* eslint no-await-in-loop: "off" */
  async componentDidMount() {
    const { gardenId } = this.props;
    const contracts = await this.context.contractsPromise;
    try {
      const garden = await contracts.GardenContract.methods
        .getGardenById(gardenId)
        .call();
      if (Number(garden.rentLength) !== 0) {
        this.setState({ isEmpty: false });
        for (let id = 0; id < garden.rentLength; id += 1) {
          const rent = await contracts.GardenContract.methods
            .getRentByGardenAndRentId(id)
            .call();
          const duration = Number(rent.duration);
          const beginning = Number(rent.beginning);
          const rate = Number(rent.rate);
          let status;
          if (beginning === 0) {
            status = 'Pas commencé';
          } else if (beginning + duration < Date.now() / 1000) {
            status = 'Terminé';
          } else {
            status = 'En cours';
          }
          const row = {
            tenant: rent.tenant,
            duration:
              duration < 86400
                ? `${duration / 60 / 60} heures`
                : `${duration / 60 / 60 / 24} jours`,
            status,
            price: rent.price,
            balance: rent.balance,
            rate: rate !== -1 ? rate : 'non noté',
            gardenHashCode: rent.gardenHashCode,
          };
          this.setState({
            allRents: {
              columns: [...this.state.allRents.columns],
              rows: [...this.state.allRents.rows, row],
            },
          });
        }
      } else {
        this.setState({ isEmpty: true });
      }
    } catch (error) {
      this.setState({ isEmpty: true });
      this.props.toastManager.add(
        'Impossible de charger les locations depuis la blockchain',
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
      toDisp = <h6>Il n&apos;y a pas de locations pour ce jardin.</h6>;
    } else {
      toDisp = (
        <MDBDataTableV5
          infoLabel={['', '-', 'sur', '']}
          entriesLabel='Locations par page'
          hover
          data={allRents}
          entries={7}
          searching={false}
        />
      );
    }
    return toDisp;
  }
}

DisputeProposals.contextType = BlockchainContext;

export default withToastManager(DisputeProposals);
