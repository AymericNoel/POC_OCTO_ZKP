import React, { Component } from 'react';
import { MDBDataTableV5, MDBBadge } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../context/BlockchainContext';
import Web3Utils from '../../utils/Web3Utils';

class DisputeProposals extends Component {
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
            label: 'Montant pour propriétaire',
            field: 'ownerAmount',
            sort: 'asc',
            width: 136,
          },
          {
            label: 'Montant pour locataire',
            field: 'tenantAmount',
            sort: 'asc',
            width: 136,
          },
          {
            label: 'Montant à répartir',
            field: 'balance',
          },
          {
            label: 'Montant répartis',
            field: 'isReady',
            width: 50,
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
      const disputeCount = await contracts.AdminContract.methods
        .disputeProposalsCount()
        .call();
      if (Number(disputeCount) !== 0) {
        this.setState({ isEmpty: false });
        for (let id = 1; id <= disputeCount; id += 1) {
          const disputeProposal = await contracts.AdminContract.methods
            .getDisputeProposalById(id)
            .call();
          const row = {
            id: (
              <MDBBadge pill color='light-green darken-3' className='p-1 px-2'>
                Litige n° {id}
              </MDBBadge>
            ),
            accepts: disputeProposal.acceptProposal,
            ownerAmount: Web3Utils.getEtherFromWei(disputeProposal.ownerAmount),
            tenantAmount: Web3Utils.getEtherFromWei(
              disputeProposal.tenantAmount,
            ),
            balance: Web3Utils.getEtherFromWei(disputeProposal.balance),
            isReady:
              disputeProposal.isReady.toString() === 'true' ? 'Oui' : 'Non',
            isOpen:
              disputeProposal.isOpen.toString() === 'true' ? 'Oui' : 'Non',
            seeMore: (
              <button
                style={{
                  borderRadius: '8px',
                  height: 'auto',
                  fontSize: '11px',
                }}
                type='submit'
                onClick={() => {
                  this.props.toggle(disputeProposal.gardenIndex);
                }}
              >
                Voir jardin
              </button>
            ),
          };
          this.setState({ allProposals: [...this.state.allProposals, row] });
        }
      }
    } catch (error) {
      this.setState({ isEmpty: true });
      this.props.toastManager.add(
        'Impossible de récupérer les litiges depuis la blockchain',
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
      toDisp = <h6>Il n&apos;y a pas de litige.</h6>;
    } else {
      toDisp = (
        <MDBDataTableV5
          infoLabel={['', '-', 'sur', '']}
          entriesLabel='Litiges par page'
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

DisputeProposals.contextType = BlockchainContext;

export default withToastManager(DisputeProposals);
