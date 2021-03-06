import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Address } from '../../models/address';

@Injectable()
export class ContactAddressService extends JSONAPIBase {
  domainModel: any = Address;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string   = 'addresses';
  postUrl: string    = 'contacts/${contactId}/address';
  deleteUrl: string  = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
