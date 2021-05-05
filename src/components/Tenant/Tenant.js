import React, { Component } from 'react';
import { MDBCol, MDBContainer, MDBRow } from 'mdbreact';
import BlockchainContext from '../../context/BlockchainContext';
import SectionContainer from '../SectionContainer';
import TenantDatatable from './TenantDatatable';
import TenantSideNav from './TenantSideNav';

class Tenant extends Component {
  constructor() {
    super();
    this.state = {
      account: 'undefined',
      updated: false,
    };
  }

  async componentDidMount() {
    const accounts = await this.context.accountsPromise;
    if (accounts.length !== 0) {
      this.setState({ account: accounts[0] });
    }
  }

  updateLocations = () => {
    this.setState((prevState) => ({
      updated: !prevState.updated,
    }));
  };

  render() {
    const { account, updated } = this.state;
    return (
      <MDBContainer>
        <MDBRow>
          <MDBCol size='3'>
            <TenantSideNav updateLocations={this.updateLocations} />
          </MDBCol>
          <MDBCol>
            <SectionContainer
              customTitle={
                (
                  <h3 className='mb-3'>
                    Locations du <code>{account}</code>
                  </h3>
                )
              }
              noBorder
            >
              <TenantDatatable updated={updated} />
            </SectionContainer>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }
}
Tenant.contextType = BlockchainContext;

export default Tenant;
