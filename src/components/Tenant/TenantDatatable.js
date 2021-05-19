import React, { Component } from 'react';
import {
  MDBDataTableV5,
  MDBModalBody,
  MDBModalHeader,
  MDBModal,
} from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../context/BlockchainContext';
import Web3Utils from '../../utils/Web3Utils';
import GardenCard from '../GardenCard';

class TenantDatatable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEmpty: true,
      modal: false,
      gardenInfo: {},
      gardenId: 0,
      allRents: {
        columns: [
          {
            label: 'Durée',
            field: 'duration',
            width: 136,
          },
          {
            label: 'Etat',
            field: 'status',
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
            label: `Hash du code d'accès au jardin`,
            field: 'hash',
            width: 136,
          },
          {
            label: ' ',
            field: 'seeMore',
            width: 50,
          },
        ],
        rows: [],
      },
    };
  }

  /* eslint no-await-in-loop: "off" */
  async componentDidMount() {
    await this.fetchData();
  }

  async componentDidUpdate(prevProps) {
    if (this.props.updated !== prevProps.updated) {
      await this.fetchData();
    }
  }

  toggle = (gardenInfo, gardenId) => {
    const { modal } = this.state;
    this.setState({
      modal: !modal,
      gardenInfo,
      gardenId,
    });
  };

  async fetchData() {
    const contracts = await this.context.contractsPromise;
    const accounts = await this.context.accountsPromise;
    const account = accounts !== (undefined || null) ? accounts[0] : undefined;
    let found = false;
    try {
      const gardenCount = await contracts.GardenContract.methods
        .GardenCount()
        .call();
      if (Number(gardenCount) !== 0) {
        const rows = [];
        for (let id = 1; id <= gardenCount; id += 1) {
          const retrievedGarden = await contracts.GardenContract.methods
            .getGardenById(id)
            .call();
          if (Number(retrievedGarden.rentLength) !== 0) {
            for (
              let rentId = 0;
              rentId < Number(retrievedGarden.rentLength);
              rentId += 1
            ) {
              const lastRent = await contracts.GardenContract.methods
                .getRentByGardenAndRentId(id, rentId)
                .call();
              const duration = Number(lastRent.duration);
              const beginning = Number(lastRent.beginning);
              const rate = Number(lastRent.rate);
              const gardenStatus = Number(retrievedGarden.status);

              let status;
              if (gardenStatus === 6) {
                status = 'Litige';
              } else if (beginning === 0) {
                status = 'Non commencé';
              } else if (beginning + duration < Date.now() / 1000) {
                status = 'Terminé';
              } else {
                status = 'En cours';
              }
              const gardenHashedCode = parseInt(lastRent.gardenHashCode, 16) === 0
                ? 'Code Indisponible'
                : lastRent.gardenHashCode;

              if (lastRent.tenant === account) {
                found = true;
                const row = {
                  duration:
                    duration < 86400
                      ? `${duration / 60 / 60} heures`
                      : `${duration / 60 / 60 / 24} jours`,
                  status,
                  price: `${Web3Utils.getEtherFromWei(lastRent.price)} ETH`,
                  balance: `${Web3Utils.getEtherFromWei(lastRent.balance)} ETH`,
                  hash: <p style={{ fontSize: '9px' }}>{gardenHashedCode}</p>,
                  rate: rate !== -1 ? `${rate}/5` : 'Non noté',
                  seeMore: (
                    <button
                      style={{
                        borderRadius: '8px',
                        height: 'auto',
                        fontSize: '11px',
                      }}
                      type='submit'
                      onClick={() => {
                        this.toggle(retrievedGarden, id);
                      }}
                    >
                      Voir jardin
                    </button>
                  ),
                };
                rows.push(row);
              }
            }
          }
        }
        if (found) {
          this.setState({
            isEmpty: false,
            allRents: {
              columns: [...this.state.allRents.columns],
              rows,
            },
          });
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
    const { isEmpty, allRents, modal, gardenInfo, gardenId } = this.state;
    let toDisp;
    if (isEmpty) {
      toDisp = (
        <h6 data-testid='empty-tenant-datatable'>
          Vous n&apos;avez pas de locations en cours. Contactez un propriétaire
          pour effectuer une location.
        </h6>
      );
    } else {
      toDisp = (
        <div data-testid='full-tenant-datatable'>
          <MDBDataTableV5
            infoLabel={['', '-', 'sur', '']}
            entriesLabel='Locations par page'
            hover
            data={allRents}
            searching={false}
            order={['status', 'desc']}
          />
          <MDBModal isOpen={modal} toggle={this.toggle} size='lg'>
            <MDBModalHeader
              style={{ backgroundColor: 'rgb(201,248,215)' }}
              toggle={() => {
                this.toggle(null);
              }}
            >
              Jardin n°{gardenId}
            </MDBModalHeader>
            <MDBModalBody>
              <GardenCard gardenData={gardenInfo} />
            </MDBModalBody>
          </MDBModal>
        </div>
      );
    }
    return toDisp;
  }
}

TenantDatatable.contextType = BlockchainContext;

export default withToastManager(TenantDatatable);
