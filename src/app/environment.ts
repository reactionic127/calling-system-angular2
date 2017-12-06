// Angular 2
// rc2 workaround
import { enableDebugTools, disableDebugTools } from '@angular/platform-browser';
import { enableProdMode, ApplicationRef } from '@angular/core';
// @todo: dynamic take based on env
let CFG = require('../../config/app-config/' + ('production' === ENV ? 'prod' : 'dev') + '.json');

// Environment Providers
let PROVIDERS: any[] = [
  // common env directives
];

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
let _decorateModuleRef = function identity<T>(value: T): T {
  return value;
};

if ('production' === ENV) {

  // Production
  disableDebugTools();
  enableProdMode();

  PROVIDERS = [
    ...PROVIDERS,
    // custom providers in production
  ];

} else {
  _decorateModuleRef = (modRef: any) => {
    const appRef = modRef.injector.get(ApplicationRef);
    const cmpRef = appRef.components[0];

    let _ng = (<any>window).ng;
    enableDebugTools(cmpRef);
    (<any>window).ng.probe = _ng.probe;
    (<any>window).ng.coreTokens = _ng.coreTokens;
    return modRef;
  };

  // Development
  PROVIDERS = [
    ...PROVIDERS,
    // custom providers in development
  ];

}

export const decorateModuleRef = _decorateModuleRef;

export const ENV_PROVIDERS = [
  ...PROVIDERS
];

interface IConfig {
  oldApp: {
    login: string,
    logout: string,
    pictureUrlFormat: string
  };
  apiBase: string;
  apiHost: string;
  webBase: string;
  sendbird: {
    AppId: string
  };
  twilio: {
    tokenEndpoint: string
  };
  stripe: {
    key: string
  };
  intercom: {
    appId: string
  };
  filestack: {
    key: string
  };
};

let CONFIG = <IConfig>{
  oldApp: {
    login: '/en/users/sign_in',
    logout: '/en/users/sign_out',
    pictureUrlFormat: 'https://s3.amazonaws.com/upcall-user-data/pictures/images/000/000/%d/medium/%s'
  }
};

Object.assign(CONFIG, CFG);
CONFIG.apiBase = CONFIG.apiBase.replace(/\/+$/, '');

export const APP_CONFIG = CONFIG;
