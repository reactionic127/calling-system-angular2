import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { FollowUpResponses } from '../../models/follow-up-responses';

@Injectable()
export class CampaignFollowUpResponsesService extends JSONAPIBase {
  domainModel: any = FollowUpResponses;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'follow_ups';
  postUrl: string = 'contacts/${contactId}/follow_ups';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
