import React, { Component } from 'react';
import { MDBDataTableV5, MDBBadge, MDBRow } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../context/BlockchainContext';

class GardenProposals extends Component {
  constructor() {
    super();
    this.state = {
      isEmpty: true,
      allProposals: {
        columns: [
          {
            label: 'Proposal ID',
            field: 'id',
          },
          {
            label: 'Accepté par',
            field: 'accepts',
          },
          {
            label: 'Rejeté par',
            field: 'rejects',
          },
          {
            label: 'Ouverture',
            field: 'isOpen',
            sort: 'asc',
            width: 50,
          },
          {
            label: ' ',
            field: 'seeMore',
            sort: 'disabled',
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
    if (prevProps.updated !== this.props.updated) {
      await this.fetchData();
    }
  }

  async fetchData() {
    const contracts = await this.context.contractsPromise;
    try {
      const gardenCount = await contracts.GardenContract.methods
        .GardenCount()
        .call();
      if (Number(gardenCount) !== 0) {
        this.setState({ isEmpty: false });
        const rows = [];
        for (let id = 1; id <= gardenCount; id += 1) {
          const proposal = await contracts.AdminContract.methods
            .getGardenProposalById(id)
            .call();
          const row = {
            id: (
              <MDBBadge
                pill
                color='light-green darken-3'
                className='w-responsive'
              >
                Jardin n° {id}
              </MDBBadge>
            ),
            accepts: proposal.acceptProposal.map((accept) => (
              <MDBRow className='my-0' style={{ fontSize: '9px' }}>
                {accept}
              </MDBRow>
            )),
            rejects: proposal.rejectProposal.map((reject) => (
              <MDBRow className='my-0' style={{ fontSize: '9px' }}>
                {reject}
              </MDBRow>
            )),
            isOpen: proposal.isOpen.toString() === 'true' ? 'Oui' : 'Non',
            seeMore: (
              <button
                style={{
                  borderRadius: '8px',
                  height: 'auto',
                  fontSize: '11px',
                }}
                type='submit'
                onClick={() => {
                  this.props.toggle(id);
                }}
              >
                Voir jardin
              </button>
            ),
          };
          rows.push(row);
        }
        this.setState({
          allProposals: {
            columns: [...this.state.allProposals.columns],
            rows,
          },
        });
      }
    } catch (error) {
      this.setState({ isEmpty: true });
      this.props.toastManager.add(
        'Impossible de récupérer les propositions de jardins depuis la blockchain',
        {
          appearance: 'error',
        },
      );
    }
  }

  render() {
    const { isEmpty, allProposals } = this.state;
    let toDisp;
    if (isEmpty) {
      toDisp = <h6>Il n&apos;y a pas encore de propositions de jardins.</h6>;
    } else {
      toDisp = (
        <MDBDataTableV5
          infoLabel={['', '-', 'sur', '']}
          entriesLabel='Jardins par page'
          hover
          data={allProposals}
          entries={7}
          order={['isOpen', 'desc']}
          searching={false}
        />
      );
    }
    return toDisp;
  }
}

GardenProposals.contextType = BlockchainContext;

export default withToastManager(GardenProposals);
