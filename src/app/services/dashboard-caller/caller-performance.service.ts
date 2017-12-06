import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CallerPerformance } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CallerPerformanceService extends JSONAPIBase {
  domainModel: any = CallerPerformance;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getCallerPerformances(id?: string): Observable<CallerPerformance> {
    let url: string = `callers/${id}/performances`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return this.datastore.findRecord(this.domainModel, null);
  }

}
