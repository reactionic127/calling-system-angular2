import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { User } from '../../models/user';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';
import { APP_CONFIG } from '../../environment';

@Injectable()
export class UserService extends JSONAPIBase {
  domainModel: any = User;
  getUrl: string = 'auth/edit';
  patchUrl: string = 'auth';
  postUrl: string = 'auth';
  deleteUrl: string = 'auth';
  getItemUrl: string = 'auth/edit';
  getListUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore);
  }

  updatePassword(model: any): Observable<any> {
    let modelUrl = 'auth/password';
    Reflect.defineMetadata('JsonApiModelConfig', { type: modelUrl }, this.domainModel);
    let url = (this.datastore as any).buildUrl(this.domainModel);
    let id = model.id;
    delete model.id;
    let body = {
      data: {
        type: modelUrl,
        id: id,
        attributes: model
      }
    };
    return this.http[id ? 'patch' : 'post'](url, body)
      .map((res: any): any => {
        return true;
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }

  updateItemAdvanced(model: any): Observable<any> {
    return super.updateItemAdvanced(model, 'auth');
  }

  validateToken(): Promise<any> {
    let url = APP_CONFIG.apiBase + '/auth/validate_token';

    let newModel = this.getNewModel({});
    return this.http.get(url).toPromise()
      .then((result: any): any => {
        return (this.datastore as any).extractRecordData(result, newModel, newModel);
      })
      .catch((result: any): any => {
        (this.datastore as any).handleError(result);
        throw result;
      });
  }
}
