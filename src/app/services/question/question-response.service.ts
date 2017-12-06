import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';

import { QuestionResponse } from '../../models/question-response';

@Injectable()
export class QuestionResponseService extends JSONAPIBase {
  domainModel: any = QuestionResponse;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'question_responses';
  postUrl: string = 'contacts/${contactId}/questions/${questionId}/question_responses';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

}
