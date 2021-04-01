import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Owner from './components/Owner/Owner.js';
import Admin from './components/Admin/Admin.js';
import Dashboard from './components/Dashboard/Dashboard.js';
import Tenant from './components/Tenant/Tenant.js';
import Hash from "./components/Utils/Hash/Hash";
import ZKP from "./components/Utils/ZKP/ZKP";

class Routes extends React.Component {
    render() {
      return (
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/Owner" component={Owner} />
          <Route exact path="/Admin" component={Admin} />
          <Route exact path="/Tenant" component={Tenant} />          
          <Route exact path="/Utils/hash" component={Hash} />          
          <Route exact path="/Utils/ZKP" component={ZKP} />          
          <Route
            render={function() {
              return <h1>Wrong Url ...</h1>;
            }}
          />
        </Switch>
      );
    }
  }
  
  export default Routes;