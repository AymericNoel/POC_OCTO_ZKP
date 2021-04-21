import React, { Component } from 'react';
import { MDBBtn, MDBContainer, MDBRow } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import BlockchainContext from '../../context/BlockchainContext';
import GardenList from '../GardenList';
import CreateGardenForm from './CreateGardenForm';
import SectionContainer from '../SectionContainer';

class Owner extends Component {
  constructor() {
    super();
    this.state = {
      isEmpty: true,
      allGardens: [],
      modal: false,
      gardenRefresh: 0,
      contracts: undefined,
      account: undefined,
    };
  }

  /* eslint no-await-in-loop: "off" */
  async componentDidMount() {
    const contracts = await this.context.contractsPromise;
    const account = (await this.context.accountsPromise)[0];
    this.setState({ contracts, account });
    await this.fetchData();
  }

  /* eslint no-await-in-loop: "off" */
  async componentDidUpdate(prevProps, prevState) {
    if (this.state.gardenRefresh !== prevState.gardenRefresh) {
      await this.fetchData();
    }
  }

  toggle = () => {
    this.setState((prevState) => ({
      modal: !prevState.modal,
    }));
  };

  newGarden = () => {
    this.setState((prevState) => ({
      gardenRefresh: prevState.gardenRefresh + 1,
    }));
  };

  seeMore = (gardenId) => {
    this.props.history.push(`/Owner/${gardenId}`);
  };

  async fetchData() {
    const { contracts, account } = this.state;
    let found = false;
    try {
      const rows = [];
      const gardenCount = await contracts.GardenContract.methods
        .GardenCount()
        .call();
      if (Number(gardenCount) !== 0) {
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
            secretHash: proposal.secretHash,
            contact: proposal.contact,
            status: proposal.status,
            rentLength: proposal.rentLength,
          };
          if (row.owner === account) {
            found = true;
            rows.push(row);
          }
        }
        if (found) {
          this.setState({ allGardens: rows, isEmpty: false });
        }
      }
    } catch (error) {
      this.setState({ isEmpty: true });
      this.props.toastManager.add(
        'Impossible de récupérer les jardins depuis la blockchain',
        {
          appearance: 'error',
        },
      );
    }
  }

  render() {
    const { isEmpty, allGardens, modal } = this.state;
    let toDisp;
    if (isEmpty) {
      toDisp = (
        <h3 className='text-center'>
          Vous n&apos;avez pas encore de jardins, n&apos;hésitez pas à ajouter
          le votre !
        </h3>
      );
    } else {
      toDisp = (
        <div className='text-center'>
          <SectionContainer
            title='Vos jardins'
            className='p-2'
            noBorder
            noBottom
          >
            <GardenList data={allGardens} onClick={this.seeMore} />
          </SectionContainer>
        </div>
      );
    }
    return (
      <MDBContainer>
        {toDisp}
        <MDBRow center className='my-3'>
          <MDBBtn color='success' onClick={this.toggle}>
            Créer un jardin
          </MDBBtn>
          <CreateGardenForm
            display={modal}
            toggle={this.toggle}
            refresh={this.newGarden}
          />
        </MDBRow>
      </MDBContainer>
    );
  }
}
Owner.contextType = BlockchainContext;

export default withToastManager(Owner);
