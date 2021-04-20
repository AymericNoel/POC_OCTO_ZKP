import React, { Component } from 'react';
import { MDBDataTableV5, MDBBadge } from 'mdbreact';
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
            sort: 'asc',
          },
          {
            label: 'Accepté par',
            field: 'accepts',
            sort: 'asc',
            width: 136,
          },
          {
            label: 'Rejeté par',
            field: 'rejects',
            sort: 'asc',
            width: 136,
          },
          {
            label: 'Ouverture',
            field: 'isOpen',
            width: 50,
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
    const contracts = await this.context.contractsPromise;
    try {
      const gardenCount = await contracts.GardenContract.methods
        .GardenCount()
        .call();
      if (Number(gardenCount) !== 0) {
        this.setState({ isEmpty: false });
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
            accepts: proposal.acceptProposal,
            rejects: proposal.rejectProposal,
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
          this.setState({
            allProposals: {
              columns: [...this.state.allProposals.columns],
              rows: [...this.state.allProposals.rows, row],
            },
          });
        }
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
