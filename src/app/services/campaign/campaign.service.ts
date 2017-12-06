import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Campaign } from '../../models/campaign';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { CampaignRevenueStats } from '../../models/campaign-revenue-stats';
import * as es6template from 'es6-template-strings';
import { AuthService } from '../auth/auth.service';
import { APP_CONFIG } from '../../environment';

@Injectable()
export class CampaignService extends JSONAPIBase {
  domainModel: any = Campaign;
  callerCampaignRevenueStats: any = CampaignRevenueStats;
  getUrl: string = 'campaigns';
  getItemUrl: string = 'campaigns';
  getListUrl: string = '';
  patchUrl: string   = 'campaigns';
  postUrl: string    = 'companies/${companyId}/campaigns';
  deleteUrl: string  = '';

  constructor(datastore: Datastore, protected http: Http, protected _authService: AuthService) {
    super(datastore, http);
  }

  getApprovedCampaigns(params: any): Observable<any[]> {
    const id = params.id;
    let modelClass = `callers/${id}/campaigns/approved`;
    delete params.id;
    Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);

    return this.datastore.query(this.domainModel, params);
  }

  getList(params?: any): Observable<any[]> {
    let url         = '';
    let currentUser = this._authService.currentUserData;

    if (currentUser.role === 'caller') {
      url = `callers/${currentUser.caller.id}/campaigns/approved`;
    } else {
      url = `companies/${currentUser.company.id}/campaigns`;
    }

    Reflect.defineMetadata('JsonApiModelConfig', {type: es6template(url, params)}, this.domainModel);

    return this.datastore.query(this.domainModel, params);
  }

  cloneItem(item: Campaign): Observable<Campaign> {
    let url = APP_CONFIG.apiBase + `/campaigns/${item.id}/copy`;
    return this.http.post(url, '')
      .map((res: any): any => {
        return (this.datastore as any).extractRecordData(res, this.domainModel);
      })
      .catch((result: any): any => {
        throw (this.datastore as any).handleError(result).error;
      });
  }
}
