import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { CallerId } from '../../models/caller-id';
import { Campaign } from '../../models/campaign';
import { APP_CONFIG } from '../../environment';

@Injectable()
export class CallerIdService extends JSONAPIBase {
  domainModel: any = CallerId;
  getUrl: string = '';
  getItemUrl: string = 'caller_ids';
  getListUrl: string = 'companies/${companyId}/caller_ids';
  patchUrl: string = 'caller_ids';

  // TODO when and if the JSON API standard will be respected for method POST /api/web/v1/companies/:company_id/caller_ids,
  // the code below should be used
  postUrl: string = 'companies/${companyId}/caller_ids';

  deleteUrl: string = 'caller_ids';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }

  getCallerIdsByCompany(companyId: number): Observable<Array<any>> {
    let typeForUrl = `companies/${companyId}/caller_ids`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: typeForUrl }, this.domainModel);

    return this.datastore.query(this.domainModel, {});
  }

  getCallerIdById(callerIdId: string): Observable<any> {
    return this.getItem(callerIdId);
  }

  attachCallerIdToCampaign(campaign: Campaign, callerId: CallerId): Promise<any> {
    let requestBody = {
      data: {
        attributes: {
          callerIdId: callerId.id
        }
      }
    };

    let url = APP_CONFIG.apiBase + `/campaigns/${campaign.id}/campaign_caller_id`;

    return this.http.post(url, requestBody).toPromise()
      .then((result: any): any => {
        // console.log('result of attach callerId to campaign api call', result);
      })
      .catch((result: any): any => {
        return (this.datastore as any).handleError(result);
      });
  }

  loadCallerIdAttachedToCampaign(campaign: Campaign): Promise<any> {
    let url = APP_CONFIG.apiBase + `/campaign_caller_ids/${campaign.id}`;
    let callerId = this.getNewModel({});
    return this.http.get(url).toPromise()
      .then((result: any): any => {
        console.log('result of getting callerId attached to campaign api call', result);
        return (this.datastore as any).extractRecordData(result, this.domainModel, callerId);
      })
      .catch((result: any): any => {
        return (this.datastore as any).handleError(result);
      });

  }

  getAvailableCallerIds(params: any): Promise<any> {
    let url = APP_CONFIG.apiBase + '/twilio_phone_numbers?' + (this.datastore as any).toQueryString(params);
    return this.http.get(url).toPromise()
      .then((result: any): any => {
        return (this.datastore as any).extractQueryData(result, this.domainModel);
      })
      .catch((result: any): any => {
        throw (this.datastore as any).handleError(result).error;
      });
  }

  buyCallerId(phoneNumber: string, companyId: string): Promise<any> {
    return this.updateItemAdvanced(this.getNewModel({ phoneNumber: phoneNumber }), `/companies/${companyId}/caller_ids/buy`).toPromise();
  }
}
