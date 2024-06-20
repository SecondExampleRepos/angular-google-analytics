import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import useRootScope from './hooks/useRootScope';

// Importing all the routes
import Home from './routes/Home';
import About from './routes/About';
import Contact from './routes/Contact';
import NotFound from './routes/NotFound';

const App: React.FC = () => {
  const { someState, setSomeState, someFunction } = useRootScope();

  useEffect(() => {
    // Placeholder for any initialization logic
    const initialize = () => {
      // Example initialization logic
      setSomeState('initialized');
    };

    initialize();
  }, [setSomeState]);

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

export default App;