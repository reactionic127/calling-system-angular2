import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Permission } from '../../models/permission';
@Injectable()
export class PermissionService extends JSONAPIBase {
  domainModel: any = Permission;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
