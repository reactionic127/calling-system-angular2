import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CampaignCaller } from '../../models/campaign-caller';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';

@Injectable()
export class CampaignCallersService extends JSONAPIBase {
  domainModel: any = CampaignCaller;
  getUrl: string = '';
  getItemUrl: string = 'campaign_callers';
  getListUrl: string = 'campaigns/${campaignId}/campaign_callers';
  patchUrl: string = 'campaign_callers';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }

  getCampaignCallers(params: any): Observable<any[]> {
    const id = params.id;
    let modelClass = `campaigns/${id}/campaign_callers`;

    delete params.id;
    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);

    return this.datastore.query(this.domainModel, params);
  }

  leaveCampaign(campaign: any, removalReason: string): Observable<any> {
    let id: string = campaign.callerLeaveCampaignId;
    let url: string = `campaign_callers/${id}/reject?data[attributes][removalReason]=${removalReason}`;
    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);

    return this.datastore.createRecord(this.domainModel, campaign).save();
  }

  updateStatus(model: any, removalReason: string = null, removalOtherReason: string = null): Observable<any> {
    let modelClass = `campaign_callers/${model.id}/${model.status}`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);

    let url = (this.datastore as any).buildUrl(this.domainModel);

    let body = {
      data: {
        type: modelClass,
        id: model.id,
        attributes: {
          status: model.status
        }
      }
    };

    if (model.status === 'reject') {
      body.data.attributes['removalReason'] = removalReason;
      if (removalOtherReason) {
        body.data.attributes['removalOtherReason'] = removalOtherReason;
      }
    }

    return this.http.patch(url, body)
      .map((res: any): any => {
        return (this.datastore as any).extractRecordData(res, this.domainModel, model);
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }
}
