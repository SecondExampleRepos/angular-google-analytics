import React, { useEffect } from 'react';
import useRootScope from './hooks/useRootScope';

const App: React.FC = () => {
  const { someState, setSomeState, someFunction } = useRootScope();

  useEffect(() => {
    // Initialize the application
    // Add any initialization logic here

    // Cleanup logic
    return () => {
      // Add any cleanup logic here
    };
  }, []);

  return (
    <div>
      <h1>React Google Analytics</h1>
      <p>State: {someState}</p>
      <button onClick={someFunction}>Call someFunction</button>
    </div>
  );
};

export default App;