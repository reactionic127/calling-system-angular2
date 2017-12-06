import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CallerStats } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CallerStatsService extends JSONAPIBase {
  domainModel: any = CallerStats;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getCallerStats(id?: string): Observable<CallerStats> {
    let url: string = `callers/${id}/stats`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return this.datastore.findRecord(this.domainModel, null);
  }

}
