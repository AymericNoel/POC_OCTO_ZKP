const { render, screen, cleanup, waitFor } = require('@testing-library/react');
import Admin from './Admin';
import {
  ToastProvider,
  DefaultToastContainer,
} from 'react-toast-notifications';
import React from 'react';
import BlockchainContext from '../../context/BlockchainContext';
import {
  generateAdminGardenProposalsArray,
  generateDisputeProposalsArray,
} from '../../utils/StubResponses';

function web3StubResponse(gardens = [], disputes = [], contact = null) {
  const methods = {
    lastCall: 0,
    lastGardenId: 0,
    lastDisputeId: 0,
    getDisputeProposalById: function(id) {
      this.lastDisputeId = id;
      this.lastCall = 1;
      return this;
    },
    disputeProposalsCount: function() {
      this.lastCall = 2;
      return this;
    },
    GardenCount: function() {
      this.lastCall = 3;
      return this;
    },
    getGardenProposalById: function(id) {
      this.lastGardenId = id;
      this.lastCall = 4;
      return this;
    },
    ContactP2P: function() {
      this.lastCall = 5;
      return this;
    },
    call: function() {
      let returnValue;
      switch (this.lastCall) {
        case 1:
          returnValue = disputes[this.lastDisputeId - 1];
          break;
        case 2:
          returnValue = disputes.length;
          break;
        case 3:
          returnValue = gardens.length;
          break;
        case 4:
          returnValue = gardens[this.lastGardenId - 1];
          break;
        case 5:
          returnValue = contact;
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
      AdminContract: {
        methods,
      },
    });
  });
  return contractsPromise;
}

describe('Admin component', () => {
  afterEach(cleanup);

  test('Should display empty datatables for disputes and gardens and show error toaster if contractsPromise context is null', async () => {
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
          <Admin />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-garden-proposal'));
    const retrievedGardenContent = screen.getByTestId('empty-garden-proposal');
    const retrievedDisputeContent = screen.getByTestId(
      'empty-dispute-proposal',
    );
    const retrievedToaster = screen.getByTestId('toastContainer');
    expect(retrievedGardenContent).toBeVisible();
    expect(retrievedGardenContent).toBeInTheDocument();
    expect(retrievedDisputeContent).toBeVisible();
    expect(retrievedDisputeContent).toBeInTheDocument();
    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les propositions de jardins depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer les litiges depuis la blockchain',
    );
    expect(retrievedToaster).toHaveTextContent(
      'Impossible de récupérer le contact "administrateur"',
    );
  });

  test('Should display empty datatables for disputes and gardens if there is no garden or dispute on blockchain without errors', async () => {
    const contractsPromise = web3StubResponse();
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <Admin />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('empty-garden-proposal'));
    const retrievedGardenContent = screen.getByTestId('empty-garden-proposal');
    const retrievedDisputeContent = screen.getByTestId(
      'empty-dispute-proposal',
    );
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(retrievedGardenContent).toBeVisible();
    expect(retrievedGardenContent).toBeInTheDocument();
    expect(retrievedDisputeContent).toBeVisible();
    expect(retrievedDisputeContent).toBeInTheDocument();

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les propositions de jardins depuis la blockchain',
    );
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les litiges depuis la blockchain',
    );
  });

  test('Should display admin contact without errors', async () => {
    const contractsPromise = web3StubResponse(
      undefined,
      undefined,
      'admin@contact.fr',
    );
    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <Admin />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('admin-contact'));
    const retrievedAdminContact = screen.getByTestId('admin-contact');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(retrievedAdminContact).toBeVisible();
    expect(retrievedAdminContact).toBeInTheDocument();
    expect(retrievedAdminContact).toHaveTextContent('admin@contact.fr');

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer le contact "administrateur"',
    );
  });

  test('Should display datatables with correct elements for disputes and gardens', async () => {
    const disputeProposals = generateDisputeProposalsArray(2);
    const gardenProposals = generateAdminGardenProposalsArray(6);
    const contractsPromise = web3StubResponse(
      gardenProposals,
      disputeProposals,
      'admin@contact.org',
    );

    const MyCustomToastContainer = (props) => (
      <DefaultToastContainer {...props} data-testid='toastContainer' />
    );
    render(
      <BlockchainContext.Provider value={{ contractsPromise }}>
        <ToastProvider
          data-testid='toastContainer'
          components={{ ToastContainer: MyCustomToastContainer }}
        >
          <Admin />
        </ToastProvider>
      </BlockchainContext.Provider>,
    );

    await waitFor(() => screen.getByTestId('full-garden-proposal'));
    const retrievedGardenContent = screen.getByTestId('full-garden-proposal');
    const retrievedDisputeContent = screen.getByTestId('full-dispute-proposal');
    const retrievedToaster = screen.getByTestId('toastContainer');

    expect(retrievedGardenContent).toBeVisible();
    expect(retrievedGardenContent).toBeInTheDocument();
    gardenProposals.forEach((garden) => {
      expect(retrievedGardenContent).toHaveTextContent(`n° ${garden.id}`);
    });

    expect(retrievedDisputeContent).toBeVisible();
    expect(retrievedDisputeContent).toBeInTheDocument();
    disputeProposals.forEach((dispute) => {
      expect(retrievedDisputeContent).toHaveTextContent(`Litige n° ${dispute.id}`);
      expect(retrievedDisputeContent).toHaveTextContent(dispute.acceptProposal[0]);
    });
    

    expect(retrievedToaster).toBeVisible();
    expect(retrievedToaster).toBeInTheDocument();
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les propositions de jardins depuis la blockchain',
    );
    expect(retrievedToaster).not.toHaveTextContent(
      'Impossible de récupérer les litiges depuis la blockchain',
    );
  });
});
