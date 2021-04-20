import React from 'react';
import ReactDOM from 'react-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import {
  ToastProvider,
  DefaultToastContainer,
} from 'react-toast-notifications';
import App from './App';

const MyCustomToastContainer = (props) => (
  <DefaultToastContainer {...props} style={{ opacity: 0.75, zIndex: 9999 }} />
);

ReactDOM.render(
  <React.StrictMode>
    <ToastProvider
      autoDismiss
      placement='bottom-left'
      components={{ ToastContainer: MyCustomToastContainer }}
    >
      <App />
    </ToastProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
