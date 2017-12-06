import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CreditCards } from '../../models/credit-card';
import { Observable } from 'rxjs/Observable';
import { APP_CONFIG } from '../../environment';
import { Http } from '@angular/http';

@Injectable()
export class CreditCardsService extends JSONAPIBase {
  domainModel: any = CreditCards;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = 'credit_cards';

  constructor(datastore: Datastore, http: Http) {
    super(datastore, http);
  }

  getCompanyCreditCards(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/companies/${data.company_id}/credit_cards`;

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }

  addreditCard(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/companies/${data.company_id}/credit_cards`;

    let body = {
      data: {
        attributes: {
          cardToken: data.card_token,
          default: false
        }
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

  setDefault(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/credit_cards/${data.credit_card_id}/set_default`;

    return this.http.patch(url, '').toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }
}
