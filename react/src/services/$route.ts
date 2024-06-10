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

  constructor() {
    this.routes = {
      someroute: { pageTrack: '/some' },
      otherroute: {}
    };
  }

  getCurrentRoute(path: string): Route | undefined {
    return this.routes[path];
  }

  // Placeholder for additional methods if needed
  addRoute(path: string, route: Route): void {
    if (!path) {
      throw new Error('Path is required to add a route.');
    }
    this.routes[path] = route;
  }

  removeRoute(path: string): void {
    if (!this.routes[path]) {
      throw new Error(`Route with path "${path}" does not exist.`);
    }
    delete this.routes[path];
  }

  updateRoute(path: string, updatedRoute: Partial<Route>): void {
    if (!this.routes[path]) {
      throw new Error(`Route with path "${path}" does not exist.`);
    }
    this.routes[path] = { ...this.routes[path], ...updatedRoute };
  }
}

export default RouteService;