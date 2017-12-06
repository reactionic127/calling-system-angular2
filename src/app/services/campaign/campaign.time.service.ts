import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignTime } from '../../models/campaign-time';


@Injectable()
export class CampaignTimeService extends JSONAPIBase {
  domainModel: any = CampaignTime;
  getUrl: string = '';
  getItemUrl: string = 'campaign_times';
  getListUrl: string = 'campaign_settings/${campaignSettingId}/campaign_times';
  patchUrl: string = 'campaign_times';
  postUrl: string = 'campaign_settings/${campaignSettingId}/campaign_times';
  deleteUrl: string = 'campaign_times';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
