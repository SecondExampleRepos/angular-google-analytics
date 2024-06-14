import React, { useEffect } from 'react';
import useRootScope from './hooks/useRootScope';

const App: React.FC = () => {
  const { someState, someFunction } = useRootScope();

  useEffect(() => {
    // Example logic for someFunction
    someFunction();
  }, [someFunction]);

  return (
    <div>
      <h1>React Application</h1>
      <p>State: {someState}</p>
    </div>
  );
};

export default App;