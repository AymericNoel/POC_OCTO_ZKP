const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import Owner from './Owner';
import {
  ToastProvider,
  DefaultToastContainer,
} from 'react-toast-notifications';
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

  test('Should not display empty elements if ethereum send back gardens that belong to owner', async () => {
    const ownerAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const gardensStub = generateGardenArray(9, ownerAddress, 3);
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
    const retrievedContent = screen.getByTestId('loaded-owner-component');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();
    gardensStub.forEach((garden) => {
      if (garden.owner === ownerAddress) {
        expect(retrievedContent).toHaveTextContent(`Jardin n°${garden.id}`);
        expect(retrievedContent).toHaveTextContent(
          `Superficie :${garden.area}`,
        );
        expect(retrievedContent).toHaveTextContent(
          `Quartier :${garden.district}`,
        );
        expect(retrievedContent).toHaveTextContent(
          `Contact :${garden.contact}`,
        );
        expect(retrievedContent).toHaveTextContent(
          `Nombre de locations :${garden.rentLength}`,
        );
      } else {
        expect(retrievedContent).not.toHaveTextContent(`Jardin n°${garden.id}`);
      }
    });
    expect(retrievedContent).toHaveTextContent('Vos jardins');
  });

  test('Should display empty elements if accountsPromise context is undefined', async () => {
    const ownerAddress = '0xC8f56f654eB18560718B4012497122CC9A9E898f';
    const gardensStub = generateGardenArray(9, ownerAddress, 3);
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
    const retrievedContent = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();
    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent('');
  });

  test('Should display empty elements and error toaster if contractsPromise context is null', async () => {
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
    const retrievedContent = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
  });

  test('Should display empty elements without error toaster if there is no garden on blockchain', async () => {
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
    const retrievedContent = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();

    expect(retrievedToaster).toHaveTextContent('');
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
  });

  test('Should display empty elements without error toaster if owner doesnt have any gardens', async () => {
    const contractsPromise = web3StubResponse(9);
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
    const retrievedContent = screen.getByTestId('empty-owner-component');
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedContent).toBeVisible();
    expect(retrievedContent).toBeInTheDocument();

    expect(retrievedToaster).toHaveTextContent('');
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les jardins depuis la blockchain',
    );
  });
});
