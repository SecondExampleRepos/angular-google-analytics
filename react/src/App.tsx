import React from 'react';
import useRootScope from './hooks/useRootScope';

const App: React.FC = () => {
  const { someState, setSomeState, someFunction } = useRootScope();

  return (
    <div>
      <h1>React Application</h1>
      <p>State: {someState}</p>
      <button onClick={someFunction}>Update State</button>
    </div>
  );
};

export default App;