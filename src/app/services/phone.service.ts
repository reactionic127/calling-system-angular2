import { Injectable } from '@angular/core';
import { JSONAPIBase } from './json-api.base';
import { Datastore } from './json-api.base';
import { Phone } from '../models/phone';

@Injectable()
export class PhoneService extends JSONAPIBase {
  domainModel: any = Phone;
  getUrl: string = '';
  getItemUrl: string = 'phones';
  getListUrl: string = 'phones';
  patchUrl: string = 'phones';
  postUrl: string = 'contacts/${contactId}/phones';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
