import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { QuestionField } from '../../models/question.field';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class QuestionFieldsService extends JSONAPIBase {
  domainModel: any = QuestionField;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string   = 'question_fields';
  postUrl: string    = 'questions/${questionId}/question_fields';
  deleteUrl: string  = 'question_fields';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }

  getList(params?: any): Observable<any[]> { // return the model with which we work
    const id = params.id;
    delete params.id;
    let modelClass = `questions/${id}/question_fields`;

    Reflect.defineMetadata('JsonApiModelConfig', {type: modelClass}, QuestionField);

    return this.datastore.query(QuestionField, params);
  }
  updateChildItem(item: any, campaignId: string): Observable<any> {
    let modelClass = (item.id) ? 'question_fields' : `questions/${campaignId}/question_fields`;

    Reflect.defineMetadata('JsonApiModelConfig', {type: modelClass}, QuestionField);

    let newModel = this.datastore.createRecord(QuestionField, item);

    return newModel.save();
  }
  removeChildItem(item: any, campaignId: string): Observable<any> {
    let modelClass = `question_fields`;

    Reflect.defineMetadata('JsonApiModelConfig', {type: modelClass}, QuestionField);

    return this.datastore.deleteRecord(QuestionField, item.id);
  }
}
