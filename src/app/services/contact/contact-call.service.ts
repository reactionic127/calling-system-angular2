import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignCall } from '../../models/campaign-call';

@Injectable()
export class ContactCallService extends JSONAPIBase {
  domainModel: any = CampaignCall;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = 'contacts/${contactId}/callers/${callerId}/calls';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
