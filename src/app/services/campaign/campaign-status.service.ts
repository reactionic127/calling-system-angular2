import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Campaign } from '../../models/campaign';
import { APP_CONFIG } from '../../environment';
import { Http } from '@angular/http';

@Injectable()
export class CampaignStatusService extends JSONAPIBase {
  domainModel: any = Campaign;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'campaigns';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }

  updateStatus(campaign: Campaign): Promise<any> {
    let url = APP_CONFIG.apiBase + `/campaigns/${campaign.id}/${campaign.status}`;
    let campaignId = this.getNewModel({});
    return this.http.patch(url, '').toPromise()
      .then((result: any): any => {
        return (this.datastore as any).extractRecordData(result, this.domainModel, campaignId);
      })
      .catch((result: any): any => {
        return (this.datastore as any).handleError(result);
      });
  }
}
