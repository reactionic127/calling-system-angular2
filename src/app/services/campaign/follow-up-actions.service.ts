import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { FollowUpActions } from '../../models/follow-up-actions';

@Injectable()
export class FollowUpActionsService extends JSONAPIBase {
  domainModel: any = FollowUpActions;
  getUrl: string = '';
  getItemUrl: string = 'follow_up_actions';
  getListUrl: string = 'follow_up_actions';
  patchUrl: string   = 'follow_up_actions';
  postUrl: string    = 'campaigns/${campaignId}/follow_up_actions';
  deleteUrl: string  = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
