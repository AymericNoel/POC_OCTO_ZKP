import React, { Component } from 'react';
import { MDBBtn, MDBContainer, MDBRow } from 'mdbreact';
import BlockchainContext from '../../context/BlockchainContext';
import GardenList from '../GardenList';
import CreateGardenForm from './CreateGardenForm';
import SectionContainer from '../SectionContainer';

class Owner extends Component {
  constructor() {
    super();
    this.state = {
      isEmpty: true,
      // contracts: undefined,
      allGardens: [],
      modal: false,
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
            this.setState({ allGardens: [...this.state.allGardens, row] });
          }
        }
        if (found) {
          this.setState({ isEmpty: false });
        }
      }
    } catch (error) {
      this.setState({ isEmpty: true });
      console.error('Error while retrieving gardens from blockchain', error);
    }
  }

  toggle = () => {
    const { modal } = this.state;
    this.setState({
      modal: !modal,
    });
  };

  seeMore = (id, status) => {
    this.props.history.push(`/Owner/${id}?status=${status}`);
  };

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
          <SectionContainer title='Vos jardins' className='p-2' noBorder>
            <GardenList data={allGardens} onClick={this.seeMore} />
          </SectionContainer>
        </div>
      );
    }
    return (
      <MDBContainer>
        {toDisp}
        <MDBRow center className='mt-2'>
          <MDBBtn color='success' onClick={this.toggle}>
            Créer un jardin
          </MDBBtn>
          <CreateGardenForm display={modal} toggle={this.toggle} />
        </MDBRow>
      </MDBContainer>
    );
  }
}
Owner.contextType = BlockchainContext;

export default Owner;
