import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CallRatings } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CallRatingsService extends JSONAPIBase {
  domainModel: any = CallRatings;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getCallRatings(callerId?: string, ratingId?: string): Observable<any> {
    let url: string = `callers/${callerId}/call_ratings`;
    if (ratingId !== null && ratingId !== undefined) {
      url = `callers/${callerId}/call_ratings/${ratingId}`;
    }
    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return this.datastore.findRecord(this.domainModel, null);
  }

}
