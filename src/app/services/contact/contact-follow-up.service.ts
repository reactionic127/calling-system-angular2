import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { FollowUpActions } from '../../models/follow-up-actions';

@Injectable()
export class ContactFollowUpService extends JSONAPIBase {
  domainModel: any = FollowUpActions;
  getUrl: string = '';
  getItemUrl: string = 'follow_ups';
  getListUrl: string = 'follow_ups';
  patchUrl: string = 'follow_ups';
  postUrl: string = 'contacts/${contactId}/follow_ups';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
