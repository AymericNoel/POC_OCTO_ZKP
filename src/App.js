import React, { Component } from 'react';
import { withToastManager } from 'react-toast-notifications';
import {
  MDBNavbar,
  MDBTooltip,
  MDBBtn,
  MDBFooter,
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBNavbarBrand,
  MDBDropdownToggle,
  MDBNavbarNav,
  MDBNavItem,
  MDBNavLink,
  MDBNavbarToggler,
  MDBCollapse,
  MDBIcon,
} from 'mdbreact';
import { BrowserRouter as Router } from 'react-router-dom';
import Web3 from 'web3';
import Routes from './Routes';
import './App.css';
import BlockchainContext from './context/BlockchainContext';
import Web3Utils from './utils/Web3Utils';

function ConnectButton(props) {
  const { onClick } = props;
  return (
    <MDBBtn color='dark-green' onClick={onClick} size='sm'>
      {/* <i class="fa-metamask mr-1"/>  Connect Metamask */}
      <MDBIcon icon='magic' className='mr-1' />
      Connection Metamask
    </MDBBtn>
  );
}

function ConnectedButton(props) {
  const { address } = props;
  let { network } = props;
  network = network !== '' ? `${network}.` : network;
  return (
    <MDBTooltip placement='bottom'>
      <MDBBtn
        size='sm'
        color='success'
        href={`https://${network}etherscan.io/address/${address}`}
        target='blank'
      >
        <MDBIcon icon='magic' className='mr-1' />
        Connecté
        <br />
      </MDBBtn>
      <span>{address}</span>
    </MDBTooltip>
  );
}

const activeStyleNavItem = { backgroundColor: '#689f38 ' };

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isLoggedIn: false,
      network: '',
      accounts: [],
    };
    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  async componentDidMount() {
    const web3 = Web3Utils.getWeb3();
    const network = await web3.eth.net.getNetworkType();
    const accounts = await Web3Utils.getAccounts(web3);
    if (accounts.length === 0) {
      this.setState({ isLoggedIn: false, network });
    } else {
      this.setState({
        isLoggedIn: true,
        network,
        accounts,
      });
    }
  }

  handleLoginClick = () => {
    try {
      Web3.givenProvider.enable();
    } catch (error) {
      this.props.toastManager.add(
        'Impossible de connecter Metamask, veuillez vérifier votre extension',
        {
          appearance: 'error',
        },
      );
    }
  };

  toggleCollapse = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    Web3Utils.metamaskRefresh();
    const web3 = Web3Utils.getWeb3();
    const accountsPromise = Web3Utils.getAccounts(web3);
    const contractsPromise = Web3Utils.getContracts(web3);
    const { isLoggedIn, network, accounts } = this.state;
    let button;
    if (isLoggedIn) {
      button = (
        <ConnectedButton
          address={accounts[0]}
          network={network === 'main' ? '' : network}
        />
      );
    } else {
      button = <ConnectButton onClick={this.handleLoginClick} />;
    }
    return (
      <div id='page-container'>
        <Router>
          <BlockchainContext.Provider
            value={{ contractsPromise, accountsPromise, web3 }}
          >
            <MDBNavbar
              color='light-green darken-3'
              fixed='top'
              dark
              expand='md'
            >
              <MDBNavbarBrand href='/'>
                <MDBIcon fab icon='pagelines' />
                <strong className='white-text'>Garden Manager</strong>
              </MDBNavbarBrand>
              <MDBNavbarToggler onClick={this.toggleCollapse} />
              <MDBCollapse
                id='navbarCollapse3'
                isOpen={this.state.isOpen}
                navbar
              >
                <MDBNavbarNav left>
                  <MDBNavItem className='navBarCustom'>
                    <MDBNavLink activeStyle={activeStyleNavItem} to='/Owner'>
                      Proprietaire
                    </MDBNavLink>
                  </MDBNavItem>
                  <MDBNavItem className='navBarCustom'>
                    <MDBNavLink activeStyle={activeStyleNavItem} to='/Tenant'>
                      Locataire
                    </MDBNavLink>
                  </MDBNavItem>
                  <MDBNavItem className='navBarCustom'>
                    <MDBNavLink activeStyle={activeStyleNavItem} to='/Admin'>
                      Admin
                    </MDBNavLink>
                  </MDBNavItem>
                  <MDBNavItem className='navBarCustom'>
                    <MDBDropdown>
                      <MDBDropdownToggle nav caret color='primary'>
                        <span className='mr-2'>Utiles</span>
                      </MDBDropdownToggle>
                      <MDBDropdownMenu>
                        <MDBDropdownItem href='/Utils/hash'>
                          Calcul de hash
                        </MDBDropdownItem>
                        <MDBDropdownItem href='/Utils/ZKP'>
                          Exportation de preuve ZKP
                        </MDBDropdownItem>
                      </MDBDropdownMenu>
                    </MDBDropdown>
                  </MDBNavItem>
                </MDBNavbarNav>
                <MDBNavbarNav right className='mr-5'>
                  {button}
                </MDBNavbarNav>
              </MDBCollapse>
            </MDBNavbar>
            <main style={{ marginTop: '4.5rem' }} id='content-wrap'>
              <Routes />
            </main>
            <MDBFooter color='light-green lighten-4' id='footer'>
              <p className='footer-copyright mb-0 py-3 text-center'>
                &copy;
                {new Date().getFullYear()} Copyright :{' '}
                <a href='https://github.com/AymericNoel' target='blank'>
                  Aymeric NOEL
                </a>
                {' '}| Stage chez{' '}
                <a href='https://www.octo.com/' target='blank'>
                  Octo Technology
                </a>
              </p>
            </MDBFooter>
          </BlockchainContext.Provider>
        </Router>
      </div>
    );
  }
}

export default withToastManager(App);
