import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Earning } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CallersEarningsService extends JSONAPIBase {
  domainModel: any = Earning;
  getUrl: string = 'callers/${id}/earnings';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = 'callers/${id}/earnings';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getCallerEarnings(id: string): Observable<any[]> {
    let modelClass = `callers/${id}/earnings`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);
    return this.datastore.query(this.domainModel, null);
  }

  getCallerEarningsByCampaign(callerId: string, campaignId: string): Observable<any[]> {
    let modelClass = `callers/${callerId}/earnings?filter[campaignId]=${campaignId}`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);
    return this.datastore.query(this.domainModel, null);
  }

  getEarningsList(params?: any): Observable<any[]> {
    let id = params.id;
    let url: string = `callers/${id}/earnings`;
    delete params.id;
    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return (this.datastore as any).queryPaged(this.domainModel, params);
  }
}
