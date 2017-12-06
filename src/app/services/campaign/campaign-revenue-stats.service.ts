import { Injectable } from '@angular/core';
import { JSONAPIBase, Datastore } from '../json-api.base';
import { Observable } from 'rxjs';
import { CampaignRevenueStats } from '../../models/campaign-revenue-stats';


@Injectable()
export class CampaignRevenueStatsService extends JSONAPIBase {
  domainModel: any = CampaignRevenueStats;
  getUrl: string = 'callerCampaignRevenueStats';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getCampaignRevenuesStats(params: any): Observable<CampaignRevenueStats> {
    let id = params.id;
    let modelClass = `callers/${id}/campaign_revenues_stats`;
    let campaignId = params.campaignId;
    if (campaignId !== null) {
      modelClass = `callers/${id}/campaign_revenues_stats/${campaignId}`;
    }
    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);

    return this.datastore.findRecord(this.domainModel, null);
  }
}
