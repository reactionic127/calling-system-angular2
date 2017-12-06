import { Injectable } from '@angular/core';
import { JSONAPIBase, Datastore } from './json-api.base';
import { CampaignCall } from '../models/campaign-call';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../environment';
import { Http } from '@angular/http';

@Injectable()
export class CallService extends JSONAPIBase {
  domainModel: any = CampaignCall;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '/calls/${call_id}/${status}';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore);
  }

  updateStatus(item: any): Observable<any> {
    let url: string;
    url = url = APP_CONFIG.apiBase + `/calls/${item.call_id}/${item.status}`;
    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    let body = {
      data: {
        type: this.domainModel,
        attributes: item.attributes
      }
    };

    return this.http.patch(url, body)
      .map((res: any): any => {
        return true;
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }

  updateNote(item: any): Observable<any> {
    let url: string;
    url = url = APP_CONFIG.apiBase + `/calls/${item.call_id}`;
    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    let body = {
      data: {
        type: this.domainModel,
        attributes: item.attributes
      }
    };

    return this.http.patch(url, body)
      .map((res: any): any => {
        return true;
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }
}
