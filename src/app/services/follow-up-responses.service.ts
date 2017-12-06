import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JSONAPIBase } from './json-api.base';
import { Datastore } from './json-api.base';
import { FollowUpResponses } from '../models/follow-up-responses';

@Injectable()
export class FollowUpResponsesService extends JSONAPIBase {
  domainModel: any = FollowUpResponses;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = 'campaigns/${campaignId}/follow_up_responses';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }
}
