const {
  render,
  screen,
  cleanup,
  waitFor,
} = require('@testing-library/react');
import App from './App';
import { ToastProvider } from 'react-toast-notifications';
import Web3Utils from './utils/Web3Utils';
import React from 'react';
jest.mock('./utils/Web3Utils');
jest.mock('./utils/ZkpUtils');

describe('App component', () => {
  afterEach(cleanup);

  test('Should display connect button if ethereum accounts not found', async () => {
    Web3Utils.getWeb3.mockImplementation(() => null);
    Web3Utils.getNetworkType.mockImplementation(() => 'rinkeby');
    Web3Utils.getAccounts.mockImplementation(() => []);

    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );

    await waitFor(() => screen.getByTestId('metamask-connection-button'));
    const retrievedContent = screen.getByTestId('metamask-connection-button');
    expect(retrievedContent).toBeVisible();
    expect(Web3Utils.getAccounts).toHaveBeenCalled();
    expect(Web3Utils.getAccounts).toHaveBeenCalledWith(null);
  });

  test('Should display connected button if ethereum accounts found', async () => {
    Web3Utils.getWeb3.mockImplementation(() => 'web3Instance');
    Web3Utils.getNetworkType.mockImplementation(() => 'rinkeby');
    Web3Utils.getAccounts.mockImplementation(() => [
      '0xC8f56f654eB18560718B4012497122CC9A9E898f',
      '0xC8f56f654eB18560718B4012497122CC9A9E898f',
    ]);

    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );

    await waitFor(() => screen.getByTestId('metamask-connected-button'));
    const retrievedContent = screen.getByTestId('metamask-connected-button');
    expect(retrievedContent).toBeVisible();
    expect(Web3Utils.getAccounts).toHaveBeenCalled();
    expect(Web3Utils.getAccounts).toHaveBeenCalledWith('web3Instance');
  });
});
