import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignSettings } from '../../models/campaign-settings';

@Injectable()
export class CampaignSettingsService extends JSONAPIBase {
  domainModel: any = CampaignSettings;
  getUrl: string = '';
  getItemUrl: string = 'campaign_settings';
  getListUrl: string = 'campaign_settings';
  patchUrl: string = 'campaign_settings';
  postUrl: string = 'campaigns/${campaignId}/campaign_settings';
  deleteUrl: string = 'campaign_settings';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
