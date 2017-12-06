import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignContact } from '../../models/campaign-contact';
import { Observable } from 'rxjs/Observable';
import { APP_CONFIG } from '../../environment';
import { Http } from '@angular/http';

@Injectable()
export class CampaignContactService extends JSONAPIBase {
  domainModel: any = CampaignContact;
  getUrl: string = '';
  getItemUrl: string = 'contacts';
  getListUrl: string = 'campaigns/${campaignId}/contacts';
  patchUrl: string = 'contacts';
  postUrl: string = 'campaigns/${campaignId}/contacts';
  deleteUrl: string = 'contacts';

  constructor(datastore: Datastore, http: Http) {
    super(datastore, http);
  }

  getNextNumber(params: any): Observable<CampaignContact> {
    let id = params.id;
    let modelClass = `campaigns/${id}/contacts/next_number?include=calls,address,keyvalues`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);
    return this.datastore.findRecord(this.domainModel, null);
  }

  isAvailable(params: any): Observable<CampaignContact> {
    let id = params.id;
    let modelClass = `contacts/${id}/available`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);
    return this.datastore.findRecord(this.domainModel, null);
  }

  deleteItem(item: any): Observable<any> {
    Reflect.defineMetadata('JsonApiModelConfig', { type: 'contacts' }, this.domainModel);
    return this.datastore.deleteRecord(this.domainModel, item.id);
  }

  bulkImport(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/campaigns/${data.campaign_id}/contact_bulk_uploads`;

    let responseObj: any = {
      body: {},
      status: '',
      statusText: ''
    };

    return this.http.post(url, data).toPromise()
      .then(
      (response: any) => {
        responseObj.body = JSON.parse(response._body);
        responseObj.status = response.status;
        responseObj.statusText = response.statusText;

        return Promise.resolve(responseObj);
      }
      )
      .catch(
      (response: any) => {
        responseObj.body = (response.status !== 0) ? JSON.parse(response._body) : {};
        responseObj.status = (response.status !== 0) ? response.status : 504;
        responseObj.statusText = (response.status !== 0) ? response.statusText : 'Gateway Time-out';

        return Promise.reject(responseObj);
      }
      );
  }

  bulkImportProgress(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/contact_bulk_uploads/${data.bulk_import_id}/progress`;

    let responseObj: any = {
      body: {},
      status: '',
      statusText: ''
    };

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        responseObj.body = JSON.parse(response._body);
        responseObj.status = response.status;
        responseObj.statusText = response.statusText;

        return Promise.resolve(responseObj);
      })
      .catch((response: any): any => {
        responseObj.body = (response.status !== 0) ? JSON.parse(response._body) : {};
        responseObj.status = (response.status !== 0) ? response.status : 504;
        responseObj.statusText = (response.status !== 0) ? response.statusText : 'Gateway Time-out';

        return Promise.reject(responseObj);
      });
  }

  bulkImportResult(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/contact_bulk_uploads/${data.bulk_import_id}`;

    let responseObj: any = {
      body: {},
      status: '',
      statusText: ''
    };

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        responseObj.body = JSON.parse(response._body);
        responseObj.status = response.status;
        responseObj.statusText = response.statusText;

        return Promise.resolve(responseObj);
      })
      .catch((response: any): any => {
        responseObj.body = (response.status !== 0) ? JSON.parse(response._body) : {};
        responseObj.status = (response.status !== 0) ? response.status : 504;
        responseObj.statusText = (response.status !== 0) ? response.statusText : 'Gateway Time-out';

        return Promise.reject(responseObj);
      });
  }
}
