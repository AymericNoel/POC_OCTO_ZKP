const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import Owner from './Owner';
import { ToastProvider, DefaultToastContainer } from 'react-toast-notifications';
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
      const returnValue = this.lastCall === 1 ? gardens.length : gardens[this.gardenId - 1];
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

describe('Owner component', () => {
  afterEach(cleanup);

  test('Should display only gardens that belong to specific owner', async () => {
    const allGardens = 9;
    const ownerAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const ownerGardensLength = 3;

    const gardensStub = generateGardenArray(allGardens, ownerAddress, ownerGardensLength);    
    const contractsPromise = web3StubResponse(gardensStub);
    const accountsPromise = new Promise((resolve) => {
      resolve([ownerAddress]);
    });

    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider>
          <Owner />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('loaded-owner-component'));
    const fullRetrievedGardens = screen.getByTestId('loaded-owner-component');

    expect(fullRetrievedGardens).toBeVisible();
    expect(fullRetrievedGardens).toBeInTheDocument();

    gardensStub.forEach((garden) => {
      if (garden.owner === ownerAddress) {
        expect(fullRetrievedGardens).toHaveTextContent(`Jardin n°${garden.id}`);
        expect(fullRetrievedGardens).toHaveTextContent(`Superficie :${garden.area}`);
        expect(fullRetrievedGardens).toHaveTextContent(`Quartier :${garden.district}`);
        expect(fullRetrievedGardens).toHaveTextContent(`Contact :${garden.contact}`);
        expect(fullRetrievedGardens).toHaveTextContent(`Nombre de locations :${garden.rentLength}`);
      } else {
        expect(fullRetrievedGardens).not.toHaveTextContent(`Jardin n°${garden.id}`);
      }
    });
    expect(fullRetrievedGardens).toHaveTextContent('Vos jardins');
  });

  test('Should display empty tag element if accountsPromise context is undefined', async () => {    
    const allGardens = 9;
    const ownerGardensLength = 3;
    const ownerAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';

    const gardensStub = generateGardenArray(allGardens, ownerAddress, ownerGardensLength);
    const contractsPromise = web3StubResponse(gardensStub);
    const accountsPromise = null;

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider components={{ ToastContainer: MyCustomToastContainer }}>
          <Owner />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-owner-component'));
    const emptyRetrievedGardens = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedGardens).toBeVisible();
    expect(emptyRetrievedGardens).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });

  test('Should display empty tag element and show error toaster if contractsPromise context is null', async () => {
    const contractsPromise = null;
    const ownerAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const accountsPromise = new Promise((resolve) => {
      resolve([ownerAddress]);
    });

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider components={{ ToastContainer: MyCustomToastContainer }}>
          <Owner />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-owner-component'));
    const emptyRetrievedGardens = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedGardens).toBeVisible();
    expect(emptyRetrievedGardens).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
  });

  test('Should display empty tag element without error toaster if there is no garden on blockchain', async () => {
    const contractsPromise = web3StubResponse();
    const ownerAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const accountsPromise = new Promise((resolve) => {
      resolve([ownerAddress]);
    });

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider components={{ ToastContainer: MyCustomToastContainer }}>
          <Owner />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-owner-component'));
    const emptyRetrievedGardens = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(emptyRetrievedGardens).toBeVisible();
    expect(emptyRetrievedGardens).toBeInTheDocument();

    expect(retrievedToaster).toHaveTextContent('');
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
  });

  test('Should display empty elements without error toaster if owner doesnt have any gardens', async () => {
    const allGardens = 9;
    const gardensStub = generateGardenArray(allGardens);

    const contractsPromise = web3StubResponse(gardensStub);    
    const ownerAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const accountsPromise = new Promise((resolve) => {
      resolve([ownerAddress]);
    });

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise, accountsPromise }}>
        <ToastProvider components={{ ToastContainer: MyCustomToastContainer }}>
          <Owner />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-owner-component'));
    const emptyRetrievedGardens = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');
    
    expect(emptyRetrievedGardens).toBeVisible();
    expect(emptyRetrievedGardens).toBeInTheDocument();

    expect(retrievedToaster).toHaveTextContent('');
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
  });
});
