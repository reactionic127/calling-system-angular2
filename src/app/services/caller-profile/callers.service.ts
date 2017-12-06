import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Caller } from '../../models';
import { APP_CONFIG } from '../../environment';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';


@Injectable()
export class CallersService extends JSONAPIBase {
  domainModel: any = Caller;
  getUrl: string = '';
  getItemUrl: string = 'callers';
  getListUrl: string = 'callers';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore);
  }

  getCampaignRevenues(params: any): Observable<any> {
    let url = '';

    if (params.campaignId != null) {
      url = APP_CONFIG.apiBase +
        `/callers/${params.callerId}/campaign_revenues/${params.campaignId}?calendar_type=${params.calendarType}&date=${params.date}`;
    } else {
      url = APP_CONFIG.apiBase +
        `/callers/${params.callerId}/campaign_revenues?calendar_type=${params.calendarType}&date=${params.date}`;
    }
    let obs = this.http;
    return obs.get(url)
      .map(response => response.json().data.attributes);
  }
}
