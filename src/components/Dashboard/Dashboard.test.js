const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import Dashboard from './Dashboard';
import {
  ToastProvider,
  DefaultToastContainer,
} from 'react-toast-notifications';
import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import BlockchainContext from '../../context/BlockchainContext';
import { generateGardenArray } from '../../utils/StubResponses';

function web3StubResponse(gardens = []) {
  const methods = {
    lastCall: 0,
    gardenId: 0,
    GardenCount: function() {
      this.lastCall = 1;
      return this;
    },
    getGardenById: function(gardenId) {
      this.lastCall = 2;
      this.gardenId = gardenId;
      return this;
    },
    call: function() {
      const returnValue =
        this.lastCall === 1 ? gardens.length : gardens[this.gardenId - 1];
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

  test('Should display correct gardens retrieved from blockchain', async () => {
    const gardensStub = generateGardenArray(7);
    const contractsPromise = web3StubResponse(gardensStub);

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
    const fullRetrievedDashboard = screen.getByTestId('loaded-dashboard');

    expect(fullRetrievedDashboard).toBeVisible();
    expect(fullRetrievedDashboard).toBeInTheDocument();

    gardensStub.forEach((garden) => {
      expect(fullRetrievedDashboard).toHaveTextContent(`Jardin n°${garden.id}`);
      expect(fullRetrievedDashboard).toHaveTextContent(garden.area);
      expect(fullRetrievedDashboard).toHaveTextContent(garden.district);
      expect(fullRetrievedDashboard).toHaveTextContent(garden.contact);
    });
    expect(fullRetrievedDashboard).toHaveTextContent(`Jardins sur la plateforme : ${gardensStub.length}`);
  });

  test('Should display empty tag element and show error toaster if contractsPromise context is null', async () => {
    const contractsPromise = null;
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
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
    const emptyRetrievedDashboard = screen.getByTestId('empty-dashboard');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedDashboard).toBeVisible();
    expect(emptyRetrievedDashboard).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les données depuis la blockchain',
    );
  });

  test('Should display empty tag element without error toaster if there is no garden on blockchain', async () => {
    const contractsPromise = web3StubResponse();
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
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
    const emptyRetrievedDashboard = screen.getByTestId('empty-dashboard');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedDashboard).toBeVisible();
    expect(emptyRetrievedDashboard).toBeInTheDocument();

    expect(retrievedToaster).toHaveTextContent('');
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les données depuis la blockchain',
    );
  });
});
