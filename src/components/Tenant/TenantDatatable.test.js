const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import TenantDatatable from './TenantDatatable';
import { ToastProvider, DefaultToastContainer } from 'react-toast-notifications';
import React from 'react';
import BlockchainContext from '../../context/BlockchainContext';
import {
  generateGardenArray,
  generateRentArray,
  extractRentHashesFromGardenArray,
} from '../../utils/StubResponses';

function web3StubResponse(gardens = []) {
  const methods = {
    lastCall: 0,
    lastRentId: 0,
    lastGardenId: 0,
    getGardenById: function(gardenId) {
      this.lastGardenId = gardenId;
      this.lastCall = 1;
      return this;
    },
    getRentByGardenAndRentId: function(gardenId, Id) {
      this.lastGardenId = gardenId;
      this.lastRentId = Id;
      this.lastCall = 2;
      return this;
    },
    GardenCount: function() {
      this.lastCall = 3;
      return this;
    },
    call: function() {
      let returnValue;
      switch (this.lastCall) {
        case 1:
          returnValue = gardens[this.lastGardenId - 1];
          break;
        case 2:
          returnValue = gardens[this.lastGardenId - 1].rents[this.lastRentId];
          break;
        case 3:
          returnValue = gardens.length;
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

describe('TenantDatatable component', () => {
  afterEach(cleanup);

  test('Should display empty tag element and show error toaster if contractsPromise context is null', async () => {
    const contractsPromise = null;
    const tenantAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const accountsPromise = new Promise((resolve) => {
      resolve([tenantAddress]);
    });

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <TenantDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-tenant-datatable'));
    const emptyRetrievedRents = screen.getByTestId('empty-tenant-datatable');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedRents).toBeVisible();
    expect(emptyRetrievedRents).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
  });

  test('Should display empty tag element if accountsPromise context is null', async () => {
    const allGardens = 6;
    const rentsByGarden = 5;
    const StubGardensWithRents = generateGardenArray(
      allGardens,
      undefined,
      undefined,
      rentsByGarden,
    ).map((garden) => {
      garden.rents = generateRentArray(garden.rentLength);
      return garden;
    });

    const contractsPromise = web3StubResponse(StubGardensWithRents);
    const accountsPromise = null;

    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider>
          <TenantDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-tenant-datatable'));
    const emptyRetrievedRents = screen.getByTestId('empty-tenant-datatable');

    expect(emptyRetrievedRents).toBeVisible();
    expect(emptyRetrievedRents).toBeInTheDocument();
  });

  test('Should display empty tag element without error toaster if there is no garden on blockchain', async () => {
    const contractsPromise = web3StubResponse();
    const tenantAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const accountsPromise = new Promise((resolve) => {
      resolve([tenantAddress]);
    });

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <TenantDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-tenant-datatable'));
    const emptyRetrievedRents = screen.getByTestId('empty-tenant-datatable');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedRents).toBeVisible();
    expect(emptyRetrievedRents).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });

  test('Should display empty tag element without error toaster if there is no location for current user', async () => {
    const allGardens = 6;
    const rentsByGarden = 5;
    const StubGardensWithRents = generateGardenArray(
      allGardens,
      undefined,
      undefined,
      rentsByGarden,
    ).map((garden) => {
      garden.rents = generateRentArray(garden.rentLength);
      return garden;
    });

    const contractsPromise = web3StubResponse(StubGardensWithRents);
    const tenantAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const accountsPromise = new Promise((resolve) => {
      resolve([tenantAddress]);
    });

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <TenantDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-tenant-datatable'));
    const emptyRetrievedRents = screen.getByTestId('empty-tenant-datatable');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedRents).toBeVisible();
    expect(emptyRetrievedRents).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });

  test('Should display correct rents for specific tenant', async () => {
    const allGardens = 2;
    const rentsByGarden = 5;
    const rentsByTenantInEachGarden = 3;
    const tenantAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';

    const StubGardensWithRents = generateGardenArray(
      allGardens,
      undefined,
      undefined,
      rentsByGarden,
    ).map((garden) => {
      garden.rents = generateRentArray(garden.rentLength, tenantAddress, rentsByTenantInEachGarden);
      return garden;
    });

    const contractsPromise = web3StubResponse(StubGardensWithRents);
    const accountsPromise = new Promise((resolve) => {
      resolve([tenantAddress]);
    });

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <TenantDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('full-tenant-datatable'));
    const retrievedRentsContent = screen.getByTestId('full-tenant-datatable');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(retrievedRentsContent).toBeVisible();
    expect(retrievedRentsContent).toBeInTheDocument();

    StubGardensWithRents.forEach((garden) => {
      const rents = garden.rents;

      rents.forEach((rent) => {
        if (rent.tenant === tenantAddress) {
          expect(retrievedRentsContent).toHaveTextContent(rent.gardenHashCode);
        } else {
          expect(retrievedRentsContent).not.toHaveTextContent(rent.gardenHashCode);
        }
      });

    });

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });
});
