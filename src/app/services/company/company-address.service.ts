import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Address } from '../../models/address';

@Injectable()
export class CompanyAddressService extends JSONAPIBase {
  domainModel: any = Address;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'addresses';
  postUrl: string = 'companies/${companyId}/address';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
