import React, { useEffect } from 'react';
import GoogleAnalyticsService from './googleAnalyticsService';

const gaService = new GoogleAnalyticsService();

const MyComponent: React.FC = () => {
  useEffect(() => {
    gaService.trackPage(window.location.pathname);
  }, []);

  const handleButtonClick = () => {
    gaService.trackEvent('Category', 'Action', 'Label', 1);
  };

  return (
    <div>
      <h1>My Component</h1>
      <button onClick={handleButtonClick}>Track Event</button>
    </div>
  );
};

export default MyComponent;