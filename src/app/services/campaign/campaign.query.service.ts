import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignQuery } from '../../models/campaign-query';
import { APP_CONFIG } from '../../environment';
import { Http } from '@angular/http';

@Injectable()
export class CampaignQueryService extends JSONAPIBase {
  domainModel: any = CampaignQuery;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  postUrl: string = 'campaigns/${id}/campaign_database_query';
  deleteUrl: string = 'campaign_database_query';
  patchUrl: string   = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }

  getCampaignDbQueryFields(campaignId: string): Promise<any> {
    let url = APP_CONFIG.apiBase + `/campaigns/${campaignId}/campaign_database_query_fields`;

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }

  getCampaignQuery(campaignId: string): Promise<any> {
    let url = APP_CONFIG.apiBase + `/campaigns/${campaignId}/campaign_database_query`;

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }

  calculateQuery(data: CampaignQuery): Promise<any> {
    let url = APP_CONFIG.apiBase + `/campaigns/${data.campaignId}/campaign_database_query`;

    let body = {
      data: {
        attributes: {
          campaignId: data.campaignId,
          databaseName: data.databaseName,
          fields: data.fields
        },
        type: this.domainModel
      }
    };

    return this.http.post(url, body).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }

  saveCampaignQuery(data: CampaignQuery): Promise<any> {
    let url = APP_CONFIG.apiBase + `/campaigns/${data.campaignId}/campaign_database_query`;

    let body = {
      data: {
        attributes: {
          campaignId: data.campaignId,
          databaseName: data.databaseName,
          fields: data.fields
        },
        type: this.domainModel
      }
    };

    return this.http.put(url, body).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }
}
