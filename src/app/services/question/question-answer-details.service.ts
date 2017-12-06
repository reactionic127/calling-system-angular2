import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { QuestionAnswerDetails } from '../../models/question-answer-details';

@Injectable()
export class QuestionAnswerDetailsService extends JSONAPIBase {
  domainModel: any = QuestionAnswerDetails;
  getUrl: string = '';
  getItemUrl: string = 'campaigns/${campaignId}/answer_details/${answerId}';
  getListUrl: string = 'campaigns/${campaignId}/answer_details/${answerId}';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }
}
