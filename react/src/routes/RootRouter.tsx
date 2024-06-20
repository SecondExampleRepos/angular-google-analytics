import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Importing all the routes
import Home from './Home';
import About from './About';
import Contact from './Contact';
import NotFound from './NotFound';

const RootRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default RootRouter;