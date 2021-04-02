import React, { Component } from "react";
import { MDBNavbar,MDBTooltip, MDBBtn,MDBFooter,MDBDropdown,MDBDropdownMenu,MDBDropdownItem, MDBNavbarBrand, MDBDropdownToggle,MDBNavbarNav, MDBNavItem, MDBNavLink, MDBNavbarToggler, MDBCollapse, MDBIcon } from "mdbreact";
import { BrowserRouter as Router } from 'react-router-dom';
import Web3 from 'web3';
import Routes from './Routes';
import "./App.css"

function ConnectButton(props) {
  return (
    <MDBBtn color="dark-green" onClick={props.onClick} size="sm">
      {/* <i class="fa-metamask mr-1"/>  Connect Metamask */}
      <MDBIcon icon="magic" className="mr-1" />  Connection Metamask
    </MDBBtn>
  );
};

function ConnectedButton(props) {
  var network = props.network;
  if(network!==""){network=network+"."}
  return (
    <MDBTooltip placement="bottom" > 
      <MDBBtn size ="sm" color="success" href={"https://" + network + "etherscan.io/address/" + props.address} target="blank">
        <MDBIcon icon="magic" className="mr-1" /> Connecté <br/>  
      </MDBBtn><span>{props.address}</span>
    </MDBTooltip>);
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isLoggedIn: true,
      address: '',
      network: ''
    };
    this.handleLoginClick = this.handleLoginClick.bind(this);
  }
  toggleCollapse = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }
  handleLoginClick() {
    Web3.givenProvider.enable();
  }
  
  async componentDidMount() {
    let web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    let network = await web3.eth.net.getNetworkType();
    this.setState({ network: network });
    let address = await web3.eth.getAccounts();
    if (address.length === 0) { this.setState({ isLoggedIn: false }) }
    else{this.setState({ isLoggedIn: true }) }
    this.setState({ address: address[0] });
  }
  MetamaskRefresh=()=>{
    window.ethereum.on('accountsChanged', () => {
      window.location.reload();
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }
  render() {
    this.MetamaskRefresh();
    const isLoggedIn = this.state.isLoggedIn;
    let button;
    if (isLoggedIn) {
      button = <ConnectedButton address={this.state.address} network={this.state.network === "main" ? "" : this.state.network} />;
    } else {
      button = <ConnectButton onClick={this.handleLoginClick} />;
    }
    return (
      <Router>
        <MDBNavbar color=" light-green darken-3" dark expand="md" >
          <MDBNavbarBrand href="/">
            <MDBIcon fab icon="pagelines" />
            <strong className="white-text">Garden Manager</strong>
          </MDBNavbarBrand>
          <MDBNavbarToggler onClick={this.toggleCollapse} />
          <MDBCollapse id="navbarCollapse3" isOpen={this.state.isOpen} navbar>
            <MDBNavbarNav left>
              <MDBNavItem className="navBarCustom">
                <MDBNavLink to="/Owner">Proprietaire</MDBNavLink>
              </MDBNavItem>
              <MDBNavItem className="navBarCustom">
                <MDBNavLink to="/Tenant">Locataire</MDBNavLink>
              </MDBNavItem>
              <MDBNavItem className="navBarCustom">
                <MDBNavLink to="/Admin">Admin</MDBNavLink>
              </MDBNavItem>
              <MDBNavItem className="navBarCustom">
                <MDBDropdown>
                  <MDBDropdownToggle nav caret color="primary">
                    <span className="mr-2">Utiles</span>
                  </MDBDropdownToggle>
                  <MDBDropdownMenu >
                    <MDBDropdownItem href="/Utils/hash">Calcul de hash</MDBDropdownItem>
                    <MDBDropdownItem href="/Utils/ZKP">Explication du ZKP</MDBDropdownItem>
                  </MDBDropdownMenu>
                </MDBDropdown>
              </MDBNavItem>
            </MDBNavbarNav>
            <MDBNavbarNav right>
              {button}
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBNavbar>
        <main style={{ marginTop: '2rem' }}>
          <Routes />
        </main>
        <MDBFooter color='light-green lighten-4' className="fixed-bottom">
          <p className='footer-copyright mb-0 py-3 text-center'>
            &copy; {new Date().getFullYear()} Copyright :
            <a href='https://www.octo.com/' target="blank"> octo.com </a> | 
            <a href='https://github.com/AymericNoel' target="blank"> Aymeric NOEL </a>
          </p>
        </MDBFooter>
      </Router>
    );
  }
}