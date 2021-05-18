const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import Dashboard from './Dashboard';
import {
  ToastProvider,
  DefaultToastContainer,
} from 'react-toast-notifications';
import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import BlockchainContext from '../../context/BlockchainContext';

function web3StubResponse(empty = false) {
  const retrievedMockGarden = {
    id: 1,
    owner: 'owner',
    multipleOwners: false,
    coOwners: [],
    gardenType: 1,
    district: 'test district',
    area: 'test area',
    secretHash: null,
    contact: 'test contact',
    status: 0,
    rentLength: 0,
  };
  const methods = {
    lastCall: 0,

    GardenCount: function() {
      this.lastCall = 1;
      return this;
    },
    getGardenById: function() {
      this.lastCall = 2;
      return this;
    },
    call: function() {
      const gardenNumber = !empty ? 1 : 0;
      const returnValue =
        this.lastCall === 1 ? gardenNumber : retrievedMockGarden;
      return returnValue;
    },
  };
  const contractsPromise = new Promise((resolve) => {
    resolve({
      GardenContract: {
        methods,
      },
    });
  });
  return contractsPromise;
}

describe('Dashboard component', () => {
  afterEach(cleanup);

  test('Should not display empty element if ethereum send back gardens', async () => {
    const contractsPromise = web3StubResponse();

    render(
      <Router>
        <BlockchainContext.Provider value={{ contractsPromise }}>
          <ToastProvider>
            <Dashboard />
          </ToastProvider>
        </BlockchainContext.Provider>
      </Router>,
    );

    await waitFor(() => screen.getByTestId('loaded-dashboard'));
    const retrievedContent = screen.getByTestId('loaded-dashboard');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();
  });

  test('Should display empty element and error toaster if contractsPromise context is null', async () => {
    const contractsPromise = null;
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer
        {...props}
        style={{ opacity: 0.91, zIndex: 9999 }}
        data-testid='toastContainer'
      />
    );
    render(
      <Router>
        <BlockchainContext.Provider value={{ contractsPromise }}>
          <ToastProvider
            components={{ ToastContainer: MyCustomToastContainer }}
          >
            <Dashboard />
          </ToastProvider>
        </BlockchainContext.Provider>
      </Router>,
    );

    await waitFor(() => screen.getByTestId('empty-dashboard'));
    const retrievedContent = screen.getByTestId('empty-dashboard');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();
    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les données depuis la blockchain',
    );
  });

  test('Should display empty element if there is no garden on blockchain', async () => {
    const contractsPromise = web3StubResponse(true);
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer
        {...props}
        style={{ opacity: 0.91, zIndex: 9999 }}
        data-testid='toastContainer'
      />
    );
    render(
      <Router>
        <BlockchainContext.Provider value={{ contractsPromise }}>
          <ToastProvider
            components={{ ToastContainer: MyCustomToastContainer }}
          >
            <Dashboard />
          </ToastProvider>
        </BlockchainContext.Provider>
      </Router>,
    );

    await waitFor(() => screen.getByTestId('empty-dashboard'));
    const retrievedContent = screen.getByTestId('empty-dashboard');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent('');
  });
});
