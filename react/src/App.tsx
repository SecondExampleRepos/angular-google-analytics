import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import useRootScope from './hooks/useRootScope';
import SomeComponent from './components/SomeComponent'; // Replace with actual component imports
import AnotherComponent from './components/AnotherComponent'; // Replace with actual component imports
import YetAnotherComponent from './components/YetAnotherComponent'; // Replace with actual component imports

const App = () => {
  const { exampleState, setExampleState, exampleFunction } = useRootScope();

  return (
    <Router>
      <Switch>
        <Route path="/some-path" component={SomeComponent} />
        <Route path="/another-path" component={AnotherComponent} />
        <Route path="/yet-another-path" component={YetAnotherComponent} />
      </Switch>
    </Router>
  );
};

export default App;