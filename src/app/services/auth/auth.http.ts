import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Http, Headers, ConnectionBackend, Response, RequestOptionsArgs, Request, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { APP_CONFIG } from '../../environment';

@Injectable()
export class AuthHttp extends Http {
  authService: AuthService;

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, authService: AuthService) {
    super(backend, defaultOptions);
    this.authService = authService;
  }
  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    const request = super.request(url, this.appendAuthHeader(options)).share();
    request.subscribe(res => this.saveToken(res), res => this.handleApiError(res));
    return request;
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    if (this.isRequestTargetExternal(url)) {
      return super.get(url, options);
    }
    const request = super.get(url, this.appendAuthHeader(options)).share();
    request.subscribe(res => this.saveToken(res), res => this.handleApiError(res));
    return request;
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    if (this.isRequestTargetExternal(url)) {
      return super.post(url, body, options);
    }
    const request = super.post(url, body, this.appendAuthHeader(options)).share();
    request.subscribe(res => this.saveToken(res), res => this.handleApiError(res));
    return request;
  }

  patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    if (this.isRequestTargetExternal(url)) {
      return super.patch(url, body, options);
    }
    const request = super.patch(url, body, this.appendAuthHeader(options)).share();
    request.subscribe(res => this.saveToken(res), res => this.handleApiError(res));
    return request;
  }

  put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    if (this.isRequestTargetExternal(url)) {
      return super.put(url, body, options);
    }
    const request = super.put(url, body, this.appendAuthHeader(options)).share();
    request.subscribe(res => this.saveToken(res), res => this.handleApiError(res));
    return request;
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    if (this.isRequestTargetExternal(url)) {
      return super.delete(url, options);
    }
    const request = super.delete(url, this.appendAuthHeader(options)).share();
    request.subscribe(res => this.saveToken(res), res => this.handleApiError(res));
    return request;
  }

  appendAuthHeader(options?: RequestOptionsArgs): RequestOptionsArgs {
    let mergedOptions: RequestOptionsArgs;
    if (!options) {
      mergedOptions = { headers: new Headers() };
    } else {
      mergedOptions = options;
    }
    let authData = this.authService.currentAuthData && this.authService.currentAuthData.accessToken ?
      this.authService.currentAuthData : null;
    if (authData) {
      // let expiry = new Date(authData.expiry*1000);
      // let format = date => `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      // console.log('token still valid: ', now.getTime() < expiry.getTime(), format(now), format(expiry), `[${authData.accessToken}]`);
      // @TODO: if token expired, launch validate token request, save the new token, run this request again
      mergedOptions.headers.append('access-token', localStorage.getItem('accessToken'));
      mergedOptions.headers.append('client', authData.client);
      mergedOptions.headers.append('expiry', authData.expiry);
      mergedOptions.headers.append('token-type', authData.tokenType);
      mergedOptions.headers.append('uid', authData.uid);
    } else {
      console.error('NO auth data!');
    }
    return mergedOptions;
  }

  saveToken(res: Response): void {
    let headers = res.headers;
    let authData = {
      accessToken: headers.get('access-token'),
      client: headers.get('client'),
      expiry: +headers.get('expiry'),
      tokenType: headers.get('token-type'),
      uid: headers.get('uid')
    };

    // console.info('token?: ', res.url, authData.accessToken, authData.expiry);
    if (!authData.accessToken || !authData.client || !authData.expiry || !authData.uid ||
      (this.authService.currentAuthData && authData.expiry < this.authService.currentAuthData.expiry)) {
      return;
    }
    this.authService.setAuthData(authData);
  }

  private handleApiError(res: Response): void {
    this.saveToken(res);
    this.authService.handleApiError(res);
  }

  private isRequestTargetExternal(url: string): boolean {
    url = url.toLowerCase();
    let apiHost = APP_CONFIG.apiHost;
    if (url.indexOf(apiHost) === 0) {
      return false;
    }
    return true;
  }
}
