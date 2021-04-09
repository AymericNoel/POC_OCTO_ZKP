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
      account: '',
    };
  }

  async componentDidMount() {
    const account = (await this.context.accountsPromise)[0];
    this.setState({ account });
  }

  render() {
    const { account } = this.state;
    return (
      <MDBContainer className='ml-1'>
        <MDBRow>
          <MDBCol size='3'>
            <TenantSideNav />
          </MDBCol>
          <MDBCol size='9'>
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
              <TenantDatatable />
            </SectionContainer>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }
}
Tenant.contextType = BlockchainContext;

export default Tenant;
