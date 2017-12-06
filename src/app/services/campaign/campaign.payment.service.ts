import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { APP_CONFIG } from '../../environment';
import { Stripe } from '../../models/stripe';
import { Http } from '@angular/http';

@Injectable()
export class CampaignPaymentService extends JSONAPIBase {
  domainModel: any = Stripe;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, http: Http) {
    super(datastore, http);
  }

  getPlan(): Promise<any> {
    let url = APP_CONFIG.apiBase + `/plans`;

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }

  subscription(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/companies/${data.companyId}/subscription`;
    let param = {
      data: {
        attributes: {
          planId: data.planId,
          cardToken: data.cardToken
        }
      }
    };
    return this.http.post(url, param).toPromise()
      .then(
      (response: any) => {
        return Promise.resolve(JSON.parse(response._body));
      }
      )
      .catch(
      (response: any) => {
        return Promise.resolve(JSON.parse(response._body));
      }
      );
  }

  getSubscription(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/companies/${data.companyId}/subscription`;

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }
}
