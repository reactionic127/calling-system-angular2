import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import {
  AppState
} from './app.service';

import * as Services from './services';
import * as Resolvers from './resolvers';
import { Datastore } from './services/json-api.base';

// Application wide providers
export const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  Datastore,
  ...(Object.keys(Services).map(k => Services[k])),
  ...(Object.keys(Resolvers).map(k => Resolvers[k]))
];
