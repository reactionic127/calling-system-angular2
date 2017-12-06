import { Injectable } from '@angular/core';
import { JSONAPIBase } from './json-api.base';
import { Datastore } from './json-api.base';
import { Phone } from '../models/phone';

@Injectable()
export class TwilioCapabilityTokenService extends JSONAPIBase {
  domainModel: any = Phone;
  getUrl: string = 'twilio_capability_token';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
