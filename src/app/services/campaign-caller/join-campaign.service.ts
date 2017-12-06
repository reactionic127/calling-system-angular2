import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Campaign } from '../../models';
import { Observable } from 'rxjs/Observable';
import * as es6template from 'es6-template-strings';

@Injectable()
export class JoinCampaignService extends JSONAPIBase {
  domainModel: any = Campaign;
  getUrl: string = 'campaigns';
  getItemUrl: string = '';
  getListUrl: string = 'campaigns';
  patchUrl: string = 'campaigns';
  postUrl: string = 'campaigns/{campaignId}/callers/{callerId}/campaign_callers';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  /*getListPaged(params?: any): Observable<any[]> {
    let url         = `callers/${params.callerId}/campaigns/available_for_join`;

    Reflect.defineMetadata('JsonApiModelConfig', {type: es6template(url, params)}, this.domainModel);

    return (this.datastore as any).query(this.domainModel, params);
  }*/

  postCampaign(params: any, item: any): Observable<any> {
    delete item.id;
    let url: string = `campaigns/${params.campaignId}/callers/${params.callerId}/campaign_callers`;
    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return this.datastore.createRecord(this.domainModel, item).save();
  }
}
