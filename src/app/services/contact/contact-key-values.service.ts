import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { KeyValues } from '../../models/key-values';

@Injectable()
export class ContactKeyValuesService extends JSONAPIBase {
  domainModel: any = KeyValues;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'key_values';
  postUrl: string = 'contacts/${contactId}/key_values';
  deleteUrl: string = 'key_values';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
