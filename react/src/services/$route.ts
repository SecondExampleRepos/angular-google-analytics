// react/src/services/$route.ts

interface Route {
  pageTrack?: string;
  templateUrl?: string;
  doNotTrack?: boolean;
}

interface Routes {
  [key: string]: Route;
}

class RouteService {
  routes: Routes;
  current: Route | null;

  constructor() {
    this.routes = {
      someroute: { pageTrack: '/some' },
      otherroute: {}
    };
    this.current = null;
  }

  getCurrentRoute() {
    return this.current;
  }

  setCurrentRoute(routeName: string) {
    this.current = this.routes[routeName] || null;
  }

  getUrl() {
    if (this.current && this.current.pageTrack) {
      return this.current.pageTrack;
    }

    return window.location.pathname;
  }
}

export default RouteService;