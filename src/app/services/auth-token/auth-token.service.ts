import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { AuthToken } from '../../models/auth-token';
import * as es6template from 'es6-template-strings';
import { APP_CONFIG } from '../../environment';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';

@Injectable()
export class AuthTokenService extends JSONAPIBase {
  domainModel: any = AuthToken;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';
  refreshUrl: string = 'auth_tokens/${id}/refresh';

  constructor(datastore: Datastore, http: Http) {
    super(datastore, http);
  }

  refreshToken(item: any): Observable<any> {
    let url = APP_CONFIG.apiBase + '/' + es6template(this.refreshUrl, item);
    return this.http.patch(url, '')
      .map((res: any): any => {
        let result = (this.datastore as any).extractRecordData(res, this.domainModel);
        return result;
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }
}
