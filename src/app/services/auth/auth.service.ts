import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CanActivate, Router } from '@angular/router';
import { Http, URLSearchParams } from '@angular/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as _ from 'lodash';
import { Logger } from 'angular2-logger/core';

import { APP_CONFIG } from '../../environment';
import { PermissionService } from '../user/permission.service';
import { USER_ROLE_HOMEPAGE } from '../../models/permission';
import { UserService } from '../user/user.service';


@Injectable()
export class AuthService {
  currentAuthData: any;
  http: Http;
  private _currentUserData: any;
  private _userService: UserService;

  private _resolvePromiseCurrentUserData: Function         = null;
  private _rejectPromiseCurrentUserData: Function          = null;
  private _promiseCurrentUserDataIsAvailable: Promise<any> = null;

  constructor(private injector: Injector, private router: Router) {
    this._promiseCurrentUserDataIsAvailable = new Promise((resolvePromiseCurrentUserData, rejectPromiseCurrentUserData) => {
      this._resolvePromiseCurrentUserData = resolvePromiseCurrentUserData;
      this._rejectPromiseCurrentUserData  = rejectPromiseCurrentUserData;
    });

    this.managePostLogout();
    this.initAuth();
  }

  get currentUserData(): any {
    return this._currentUserData;
  }

  getUserService(): UserService {
    if (!this._userService) {
      this._userService = this.injector.get(UserService);
    }
    return this._userService;
  }

  getHttp(): Http {
    if (!this.http) {
      this.http = this.injector.get(Http);
    }
    return this.http;
  }

  initAuth(): void {
    let params                = new URLSearchParams(location.search.substr(1));
    let authData: any         = {};
    let justLoggedIn: boolean = params.has('auth_token');
    authData.accessToken      = params.get('auth_token') || localStorage.getItem('accessToken');
    authData.client           = params.get('client_id') || localStorage.getItem('client');
    authData.uid              = params.get('uid') || localStorage.getItem('uid');
    authData.expiry           = params.get('expiry') || localStorage.getItem('expiry');
    if (!authData.accessToken) {
      setTimeout(() => {
        this.doLogout();
        this.gotoLogin();
      });
      return;
    }
    this.setAuthData(authData);
    setTimeout(() => {
      let preLoginURL: string = sessionStorage.getItem('preLoginURL');
      if (preLoginURL) {
        sessionStorage.removeItem('preLoginURL');
        window.location.href = preLoginURL;
      }

      this.validateToken().then((currentUserData) => {
        if (preLoginURL) {
          window.location.href = preLoginURL;
        } else {
          if (justLoggedIn) {
            let userRoleHomepage = USER_ROLE_HOMEPAGE[currentUserData.role.toLowerCase()];
            if (userRoleHomepage) {
              this.router.navigateByUrl(userRoleHomepage);
            }
          }
        }

        // start intercom chat
        /*
        (window as any).Intercom('boot', {
          app_id    : APP_CONFIG.intercom.appId,
          name      : currentUserData.firstName + ' ' + currentUserData.lastName, // Full name
          email     : currentUserData.email, // Email address
          created_at: currentUserData.createdAtTimestamp, // Signup date as a Unix timestamp
          user_id   : currentUserData.id,
          user_hash : currentUserData.intercomHash
        });
        */
        
        // start elevio
        // build the user object
        var elevio_user = {
            first_name: currentUserData.firstName,
            last_name: currentUserData.lastName,
            email: currentUserData.email,
            user_hash: currentUserData.elevioHash
        };

        // set the user
        (window as any)._elev.changeUser(elevio_user);

        (window as any).Autopilot.run('associate', currentUserData.email);
      });
    });
  }

  validateToken(): Promise<any> {
    return this.getUserService().validateToken()
      .then((user: any) => {
        this._currentUserData = user;

        return this.getPermissions().then((permissionsData) => {
          this._currentUserData = _.assign(this._currentUserData, permissionsData.attributes);
          this._resolvePromiseCurrentUserData(this._currentUserData);
          return this._promiseCurrentUserDataIsAvailable;
        });
      }).catch((e) => {
        this.handleApiError(e);
        throw e;
      });
  }

  waitForCurrentUserData(): Promise<any> {
    return this._promiseCurrentUserDataIsAvailable;
  }

  getPermissions(): Promise<any> {
    return this.getHttp().get(APP_CONFIG.apiBase + '/permissions').toPromise().then((result: any) => {
      let data = JSON.parse(result._body);
      return Promise.resolve(data.data);
    }).catch((e) => {
      this.handleApiError(e);
      throw e;
    });
  }

  gotoLogin(): void {
    sessionStorage.setItem('preLoginURL', window.location.href);
    let redirectTo       = window.location.protocol + '//' + window.location.host; // todo: get rid of preLoginURL
    window.location.href = APP_CONFIG.webBase + APP_CONFIG.oldApp.login + '?redirect_to=' + encodeURIComponent(redirectTo);
  }

  doLogout(): void {
    // todo check needed params + withCredentials
    const req = this.getHttp().delete(APP_CONFIG.apiBase + '/auth/sign_out');
    req.subscribe(res => {
      localStorage.clear();
      this.currentAuthData = null;
      this.gotoLogin();
    });
  }

  manageNotAllowedPage(): void {
    this.router.navigate(['404']);
  }

  managePostLogout(): void {
    let params = new URLSearchParams(location.search.substr(1));
    let logOut = params.get('logOut'); // todo: update with real one
    if (logOut) {
      this.doLogout();
    }
  }

  setAuthData(authData: any): void {
    this.currentAuthData = authData;
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('client', authData.client);
    localStorage.setItem('expiry', authData.expiry);
    localStorage.setItem('tokenType', authData.tokenType || 'Bearer');
    localStorage.setItem('uid', authData.uid);
  }

  handleApiError(err: any): void {
    switch (err.status) {
      case 401:
        console.log('401 RECEIVED!');
        this.gotoLogin();
        break;

      default:
        break;
    }
  }
}

@Injectable()
export class AuthResolver implements Resolve<any> {
  constructor(private _authService: AuthService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return Observable.of(
      this._authService.currentUserData ? {res: this._authService.currentUserData} : false
    );
  }
}

abstract class AuthGuard implements CanActivate {
  abstract userRole: string;
  private _authService: AuthService;

  constructor(_authService: AuthService) {
    this._authService = _authService;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {

    let checkPermissions = (userData) => {
      let hasAccess = userData && userData.attributes && userData.attributes.role === this.userRole;
      if (!hasAccess) {
        this._authService.manageNotAllowedPage();
        throw 'User has no access to ' + JSON.stringify(route.url);
      }
      return hasAccess;
    };
    // todo: check if this way is always synced
    if (this._authService.currentUserData) {
      return checkPermissions(this._authService.currentUserData);
    }
    return this._authService.validateToken()
      .then((userData) => {
        return checkPermissions(userData);
      });
  }
}
@Injectable()
export class AuthGuardCampaigner extends AuthGuard {
  userRole: string = 'member'; // todo: change it upon api implementation

  constructor(_authService: AuthService) {
    super(_authService);
  }
}
@Injectable()
export class AuthGuardCaller extends AuthGuard {
  userRole: string = 'member'; // todo: change it upon api implementation

  constructor(_authService: AuthService) {
    super(_authService);
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  permissions: any = null;

  constructor(private _permissionService: PermissionService, private _authService: AuthService, private logger: Logger, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    let __this = this;
    if (!route.data['isAllowedPermission'] && !route.data['isAllowedRole']) {
      this.logger.warn('please secure route with permissions', route);
      return true;
    }

    let promiseAllowedByRole = null;
    let currentUserData      = null;
    if (route.data['isAllowedRole']) {
      promiseAllowedByRole = this._authService.waitForCurrentUserData()
        .then((crtUserData) => {
          currentUserData = crtUserData;
          if (route.data['isAllowedRole'].indexOf(crtUserData.role) === -1) {
            return Promise.resolve(false);
          }
          return Promise.resolve(true);
        })
        .catch((error) => {
          this.logger.error('error when processing user role', error);
        });
    } else {
      promiseAllowedByRole = Promise.resolve(true);
    }

    let promiseAllowedByPermissions = null;
    if (route.data['isAllowedPermission']) {
      let [resource, action] = route.data['isAllowedPermission'];
      if (this.permissions) {
        promiseAllowedByPermissions = Promise.resolve(isAllowedByPermission(resource, action));
      } else {
        promiseAllowedByPermissions = this._permissionService.getItem().toPromise()
          .then((res) => {
            this.permissions = {};
            res['permissions'].forEach(p => {
              p.subjects.forEach(a => {
                this.permissions[a] = _.keyBy(p.actions, i => i);
              });
            });
            return Promise.resolve(isAllowedByPermission(resource, action));
          })
          .catch((error) => {
            this.logger.error('error when processing permissions', error);
          });
      }
    } else {
      promiseAllowedByPermissions = Promise.resolve(true);
    }

    return Promise.all([promiseAllowedByRole, promiseAllowedByPermissions])
      .then(([allowedByRole, allowedByPermission]) => {
        if (!allowedByRole && !allowedByPermission) {
          let userRoleHomepage = USER_ROLE_HOMEPAGE[currentUserData.role.toLowerCase()];
          if (userRoleHomepage) {
            this.router.navigateByUrl(userRoleHomepage)
              .then(navigated => {
                if (!navigated) {
                  __this._authService.manageNotAllowedPage();
                  throw {error: 'Not allowed'};
                }
              })
              .catch(e => {
                __this._authService.manageNotAllowedPage();
                throw {error: 'Not allowed'};
              });
          } else {
            __this._authService.manageNotAllowedPage();
          }
        }
        return Promise.resolve(allowedByRole || allowedByPermission);
      });

    function isAllowedByPermission(resource: string, action: string): boolean {
      // todo: take into account aliased permissions
      return __this.permissions[resource] && __this.permissions[resource][action];
    }
  }
}
