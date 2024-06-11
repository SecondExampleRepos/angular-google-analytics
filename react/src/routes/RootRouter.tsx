import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import useRootScope from './useRootScope';
import SomeComponent from './SomeComponent'; // Replace with actual component imports

const RootRouter = () => {
  const { someState, setSomeState, someFunction } = useRootScope();

  return (
    <Router>
      <Switch>
        <Route path="/some-path" component={SomeComponent} />

        <Route path="/another-path" component={AnotherComponent} /> {/* Replace with actual component */}
        <Route path="/yet-another-path" component={YetAnotherComponent} /> {/* Replace with actual component */}
      </Switch>
    </Router>
  );
};

export default RootRouter;