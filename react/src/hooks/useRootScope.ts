import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const useRootScope = (pageEvent: string, readFromRoute: boolean, _trackPage: () => void) => {
  const history = useHistory();

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      // Apply $route based filtering if configured
      if (readFromRoute) {
        // Avoid tracking undefined routes, routes without template (e.g. redirect routes)
        // and those explicitly marked as 'do not track'
        // SECOND AGENT: [MISSING CONTEXT] - Need to determine how to check for undefined routes, routes without template, and doNotTrack in React Router
        return;
      }

      _trackPage();
    });

    return () => {
      unlisten();
    };
  }, [history, pageEvent, readFromRoute, _trackPage]);
};

export default useRootScope;