import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Rating } from '../../models/rating';

@Injectable()
export class CallerReviewService extends JSONAPIBase {
  domainModel: any   = Rating;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string   = '';
  postUrl: string    = 'campaign_callers/${campaignCallerId}/reviews';
  deleteUrl: string  = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
