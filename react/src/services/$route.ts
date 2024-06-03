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

  addRoute(path: string, route: Route): void {
    this.routes[path] = route;
  }

  removeRoute(path: string): void {
    delete this.routes[path];
  }
}

export default RouteService;