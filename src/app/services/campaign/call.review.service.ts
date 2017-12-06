import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Rating } from '../../models/rating';

@Injectable()
export class CallReviewService extends JSONAPIBase {
  domainModel: any   = Rating;
  getUrl: string = '';
  getItemUrl: string = 'reviews';
  getListUrl: string = 'calls/${callId}/reviews';
  patchUrl: string   = 'reviews';
  postUrl: string    = 'calls/${callId}/reviews';
  deleteUrl: string  = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
