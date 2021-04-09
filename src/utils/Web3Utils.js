import Web3 from 'web3';
import AdminContract from '../contracts/AdminManager.json';
import GardenContract from '../contracts/GardenManager.json';

const getAccounts = (_web3) => _web3.eth.getAccounts();

const getContracts = async (_web3) => {
  const networkId = await _web3.eth.net.getId();

  let deployedNetwork = AdminContract.networks[networkId];
  const adminContractInstance = new _web3.eth.Contract(
    AdminContract.abi,
    deployedNetwork && deployedNetwork.address,
  );

  deployedNetwork = GardenContract.networks[networkId];
  const gardenContractInstance = new _web3.eth.Contract(
    GardenContract.abi,
    deployedNetwork && deployedNetwork.address,
  );

  return {
    AdminContract: adminContractInstance,
    GardenContract: gardenContractInstance,
  };
};

const metamaskRefresh = () => {
  window.ethereum.on('accountsChanged', () => {
    window.location.reload();
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
};

const getWeb3 = () => {
  if (window.ethereum) {
    // Modern dapp browsers
    return new Web3(window.ethereum);
  }
  if (window.web3) {
    // Use Mist/MetaMask's provider
    const { web3 } = window;
    console.log('Injected web3 detected.');
    return web3;
  }
  // Fallback to localhost; use dev console port by default...
  const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
  const web3 = new Web3(provider);
  console.log('No web3 instance injected, using Local web3.');
  return web3;
};

const Web3Utils = {
  getAccounts,
  getContracts,
  metamaskRefresh,
  getWeb3,
};

export default Web3Utils;