import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Http } from '@angular/http';
import { CampaignStats } from '../../models/campaign-stats';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../environment';

@Injectable()
export class CampaignStatsService extends JSONAPIBase {
  domainModel: any = CampaignStats;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, http: Http) {
    super(datastore, http);
  }

  getForCampaign(campaignId: number): Observable<any[]> {
    let typeForUrl = APP_CONFIG.apiBase + `/campaigns/${campaignId}/stats`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: typeForUrl }, this.domainModel);

    return this.http.get(typeForUrl)
      .map((res: any): any => {
        return (this.datastore as any).extractRecordData(res, this.domainModel);
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }
}
