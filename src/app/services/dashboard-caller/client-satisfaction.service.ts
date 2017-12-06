import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { ClientSatisfaction } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ClientSatisfactionService extends JSONAPIBase {
  domainModel: any = ClientSatisfaction;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getClientSatisfaction(id?: string): Observable<any> {
    let url: string = `callers/${id}/client_ratings`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return this.datastore.findRecord(this.domainModel, null, {
      include: 'previous,next'
    });
  }

  getNextClientSatisfaction(callerId: string, ratingId: string): Observable<any> {
    let url: string = `callers/${callerId}/client_ratings/${ratingId}`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return this.datastore.findRecord(this.domainModel, null);
  }

}
