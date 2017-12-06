import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Observable } from 'rxjs';
import { QuestionAnswer } from '../../models/question-answer';

@Injectable()
export class QuestionAnswersService extends JSONAPIBase {
  domainModel: any = QuestionAnswer;
  getUrl: string = '';
  getItemUrl: string = 'campaigns/${campaignId}/answers';
  getListUrl: string = 'campaigns/${campaignId}/answers';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }

  getItemForCampaign(id: string, campaignId: number): Observable<any> {
    let typeForUrl = `campaigns/${campaignId}/answers`;

    Reflect.defineMetadata('JsonApiModelConfig', { type: typeForUrl }, this.domainModel);

    return this.datastore.findRecord(this.domainModel, id);
  }
}
