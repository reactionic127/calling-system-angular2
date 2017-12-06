import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JSONAPIBase } from '../json-api.base';
import { BaseModel } from '../../base.model';
import { Datastore } from '../json-api.base';
import { Question } from '../../models/question';
import { Observable } from 'rxjs';

@Injectable()
export class QuestionService extends JSONAPIBase {
  domainModel: any = Question;
  getUrl: string = '';
  getItemUrl: string = 'questions';
  getListUrl: string = 'campaigns/${campaignId}/questions';
  patchUrl: string   = 'questions';
  postUrl: string    = 'campaigns/${campaignId}/questions';
  deleteUrl: string  = 'questions';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }

  getList(params?: any): Observable<any[]> { // return the model with which we work
    const id = params.id;
    delete params.id;
    let modelClass = `campaigns/${id}/questions`;
    
    Reflect.defineMetadata('JsonApiModelConfig', {type: modelClass}, Question);

    return this.datastore.query(Question, params);
  }

  updateChildItem(item: any, campaignId: string): Observable<BaseModel> {
    let modelClass = `campaigns/${campaignId}/questions`;

    if (item.id) {
      modelClass = 'questions';
    }

    Reflect.defineMetadata('JsonApiModelConfig', {type: modelClass}, Question);

    let newModel = this.datastore.createRecord(Question, item);

    return newModel.save();
  }

   removeChildItem(item: any, campaignId: string): Observable<any> {
    let modelClass = `questions`;

    Reflect.defineMetadata('JsonApiModelConfig', {type: modelClass}, Question);

    return this.datastore.deleteRecord(Question, item.id);
  }
}
