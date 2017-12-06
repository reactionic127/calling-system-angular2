import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Leader } from '../../models';

@Injectable()
export class LeadersService extends JSONAPIBase {
  domainModel: any = Leader;
  getUrl: string = 'leaders';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

}
