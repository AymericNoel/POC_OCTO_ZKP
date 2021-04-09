import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Owner from './components/Owner/Owner';
import OwnerRents from './components/OwnerRents/OwnerRents';
import Admin from './components/Admin/Admin';
import Dashboard from './components/Dashboard/Dashboard';
import Tenant from './components/Tenant/Tenant';
import Hash from './components/Utils/Hash/Hash';
import ZKP from './components/Utils/ZKP/ZKP';
import DashboardRents from './components/Dashboard/DashboardRents';

function Routes() {
  function wrongPath() {
    return <h1>Wrong Url ...</h1>;
  }
  return (
    <Switch>
      <Route exact path='/' component={Dashboard} />
      <Route exact path='/Dashboard/:gardenId' component={DashboardRents} />
      <Route exact path='/Owner' component={Owner} />
      <Route exact path='/Owner/:gardenId' component={OwnerRents} />
      <Route exact path='/Admin' component={Admin} />
      <Route exact path='/Tenant' component={Tenant} />
      <Route exact path='/Utils/hash' component={Hash} />
      <Route exact path='/Utils/ZKP' component={ZKP} />
      <Route
        render={wrongPath}
      />
    </Switch>
  );
}

export default Routes;
