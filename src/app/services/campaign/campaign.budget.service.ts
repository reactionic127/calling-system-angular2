import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignBudget } from '../../models/campaign-budget';


@Injectable()
export class CampaignBudgetService extends JSONAPIBase {
  domainModel: any = CampaignBudget;
  getUrl: string = '';
  getItemUrl: string = 'campaign_budgets';
  getListUrl: string = '';
  patchUrl: string = 'campaign_budgets';
  postUrl: string = 'campaigns/${campaignId}/campaign_budget';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
