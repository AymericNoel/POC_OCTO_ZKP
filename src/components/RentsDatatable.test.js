const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import RentsDatatable from './RentsDatatable';
import { ToastProvider, DefaultToastContainer } from 'react-toast-notifications';
import React from 'react';
import BlockchainContext from '../context/BlockchainContext';
import { generateGarden, generateRentArray } from '../utils/StubResponses';

function web3StubResponse(garden, rents = []) {
  const methods = {
    lastCall: 0,
    lastRentId: 0,
    getGardenById: function() {
      this.lastCall = 1;
      return this;
    },
    getRentByGardenAndRentId: function(gardenId, Id) {
      this.lastRentId = Id;
      this.lastCall = 2;
      return this;
    },
    call: function() {
      let returnValue;
      switch (this.lastCall) {
        case 1:
          returnValue = garden;
          break;
        case 2:
          returnValue = rents[this.lastRentId];
          break;
        default:
          break;
      }
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

describe('RentsDatatable component', () => {
  afterEach(cleanup);

  test('Should display empty tag element and show error toaster if contractsPromise context is null', async () => {
    const contractsPromise = null;
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <RentsDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-rents'));
    const emptyRetrievedRents = screen.getByTestId('empty-rents');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedRents).toBeVisible();
    expect(emptyRetrievedRents).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de charger les locations depuis la blockchain',
    );
  });

  test('Should display empty tag element without error toaster if there is no location for the garden', async () => {
    const garden = generateGarden();
    const contractsPromise = web3StubResponse(garden);
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <RentsDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-rents'));
    const emptyRetrievedRents = screen.getByTestId('empty-rents');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedRents).toBeVisible();
    expect(emptyRetrievedRents).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de charger les locations depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });

  test('Should display all rents for a specific garden', async () => {
    const allRents = 4;
    const Stubgarden = generateGarden(undefined, undefined, allRents);
    const StubRents = generateRentArray(allRents);

    const contractsPromise = web3StubResponse(Stubgarden, StubRents);

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <RentsDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('full-rents'));
    const retrievedRentsContent = screen.getByTestId('full-rents');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(retrievedRentsContent).toBeVisible();
    expect(retrievedRentsContent).toBeInTheDocument();

    StubRents.forEach((rent) => {
      expect(retrievedRentsContent).toHaveTextContent(rent.tenant);

      rent.rate !== -1
        ? expect(retrievedRentsContent).toHaveTextContent(`${rent.rate}/5`)
        : expect(retrievedRentsContent).toHaveTextContent('Non noté');

      rent.duration < 86400
        ? expect(retrievedRentsContent).toHaveTextContent(`${rent.duration / 60 / 60} heures`)
        : expect(retrievedRentsContent).toHaveTextContent(`${rent.duration / 60 / 60 / 24} jours`);
    });

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de charger les locations depuis la blockchain',
    );
  });
});
