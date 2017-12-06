import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignCall } from '../../models/campaign-call';

@Injectable()
export class CampaignCallService extends JSONAPIBase {
  domainModel: any = CampaignCall;
  getUrl: string = '';
  getItemUrl: string = 'campaign_callers/${campaignCallerId}/calls';
  getListUrl: string = 'campaign_callers/${campaignCallerId}/calls';
  patchUrl: string   = 'campaign_callers/${campaignCallerId}/calls';
  postUrl: string    = '';
  deleteUrl: string  = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
