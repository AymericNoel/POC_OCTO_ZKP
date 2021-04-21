import React, { Component } from 'react';
import {
  MDBDataTableV5,
  MDBModalBody,
  MDBModalHeader,
  MDBModal,
} from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../context/BlockchainContext';
import Web3Utils from '../utils/Web3Utils';
import GardenCard from './GardenCard';

class RentsDatatable extends Component {
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
            label: 'Locataire',
            field: 'tenant',
          },
          {
            label: 'Durée',
            field: 'duration',
          },
          {
            label: 'Etat',
            field: 'status',
            width: 300,
          },
          {
            label: 'Prix',
            field: 'price',
          },
          {
            label: 'Balance',
            field: 'balance',
            width: 300,
          },
          {
            label: 'Note',
            field: 'rate',
          },
          {
            label: ' ',
            field: 'seeMore',
            sort: 'disabled',
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
    const { gardenId } = this.props;
    const contracts = await this.context.contractsPromise;
    try {
      const rows = [];
      const garden = await contracts.GardenContract.methods
        .getGardenById(gardenId)
        .call();
      if (Number(garden.rentLength) !== 0) {
        this.setState({ isEmpty: false });
        for (let id = 0; id < garden.rentLength; id += 1) {
          const rent = await contracts.GardenContract.methods
            .getRentByGardenAndRentId(gardenId, id)
            .call();
          const duration = Number(rent.duration);
          const beginning = Number(rent.beginning);
          const rate = Number(rent.rate);
          const gardenStatus = Number(garden.status);

          let status;
          if (gardenStatus === 6) {
            status = 'Litige';
          } else {
            if (beginning === 0) {
              if (gardenStatus === 1 || id !== Number(garden.rentLength) - 1) {
                status = 'Annulé';
              } else {
                status = 'Pas commencé';
              }
            }
            if (beginning + duration < Date.now() / 1000) {
              status = 'Terminé';
            } else {
              status = 'En cours';
            }
          }

          const row = {
            tenant: rent.tenant,
            duration:
              duration < 86400
                ? `${duration / 60 / 60} heures`
                : `${duration / 60 / 60 / 24} jours`,
            status,
            price: `${Web3Utils.getEtherFromWei(rent.price)} ETH`,
            balance: `${Web3Utils.getEtherFromWei(rent.balance)} ETH`,
            rate: rate !== -1 ? rate : 'Non noté',
            seeMore:
              this.props.seeMore === true ? (
                <button
                  style={{
                    borderRadius: '8px',
                    height: 'auto',
                    fontSize: '11px',
                  }}
                  type='submit'
                  onClick={() => {
                    this.toggle(garden, gardenId);
                  }}
                >
                  Voir jardin
                </button>
              ) : (
                ''
              ),
          };
          rows.push(row);
        }
        this.setState({
          allRents: {
            columns: [...this.state.allRents.columns],
            rows,
          },
        });
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
    const { isEmpty, allRents, modal, gardenInfo, gardenId } = this.state;
    let toDisp;
    if (isEmpty) {
      toDisp = <h6>Il n&apos;y a pas de locations pour ce jardin.</h6>;
    } else {
      toDisp = (
        <div>
          <MDBDataTableV5
            infoLabel={['', '-', 'sur', '']}
            entriesLabel='Locations par page'
            hover
            data={allRents}
            entries={7}
            searching={false}
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

RentsDatatable.contextType = BlockchainContext;

export default withToastManager(RentsDatatable);
