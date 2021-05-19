const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import TenantDatatable from './TenantDatatable';
import {
  ToastProvider,
  DefaultToastContainer,
} from 'react-toast-notifications';
import React from 'react';
import BlockchainContext from '../../context/BlockchainContext';
import {
  generateGarden,
  generateGardenArray,
  generateRentArray,
} from '../../utils/StubResponses';

function web3StubResponse(gardensAndRents = []) {
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
          returnValue = gardensAndRents[this.lastGardenId - 1];
          break;
        case 2:
          returnValue =
            gardensAndRents[this.lastGardenId - 1].rents[
              this.lastRentId
            ];
          break;
        case 3:
          returnValue = gardensAndRents.length;
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

  test('Should display empty elements and show error toaster if contractsPromise context is null', async () => {
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
    const retrievedRentsContent = screen.getByTestId('empty-tenant-datatable');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(retrievedRentsContent).toBeVisible();
    expect(retrievedRentsContent).toBeInTheDocument();
    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
  });

  test('Should display empty elements if accountsPromise context is null', async () => {
    const rentLength = 5;
    const gardensWithRents = generateGardenArray(
      4,
      undefined,
      undefined,
      rentLength,
    ).map((garden) => {
      garden.rents = generateRentArray(garden.rentLength);
      return garden;
    });
    const contractsPromise = web3StubResponse(gardensWithRents);
    const accountsPromise = null;
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider>
          <TenantDatatable />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-tenant-datatable'));
    const retrievedRentsContent = screen.getByTestId('empty-tenant-datatable');

    expect(retrievedRentsContent).toBeVisible();
    expect(retrievedRentsContent).toBeInTheDocument();
  });

  test('Should display empty elements without error toaster if there is no garden on blockchain', async () => {
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
    const retrievedRentsContent = screen.getByTestId('empty-tenant-datatable');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedRentsContent).toBeVisible();
    expect(retrievedRentsContent).toBeInTheDocument();
    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });

  test('Should display empty elements without error toaster if there is no location for current user', async () => {
    const rentLength = 5;
    const gardensWithRents = generateGardenArray(
      4,
      undefined,
      undefined,
      rentLength,
    ).map((garden) => {
      garden.rents = generateRentArray(garden.rentLength);
      return garden;
    });
    const contractsPromise = web3StubResponse(gardensWithRents);
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
    const retrievedRentsContent = screen.getByTestId('empty-tenant-datatable');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedRentsContent).toBeVisible();
    expect(retrievedRentsContent).toBeInTheDocument();
    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });

  test('Should display correct rents for user', async () => {
    const rentLengthByGarden = 5;
    const tenantsRents = 3;
    const tenantAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const accountsPromise = new Promise((resolve) => {
      resolve([tenantAddress]);
    });
    const gardensWithRents = generateGardenArray(
      6,
      undefined,
      undefined,
      rentLengthByGarden,
    ).map((garden) => {
      garden.rents = generateRentArray(
        garden.rentLength,
        tenantAddress,
        tenantsRents,
      );
      return garden;
    });
    const contractsPromise = web3StubResponse(gardensWithRents);
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
    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les locations depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });
});
