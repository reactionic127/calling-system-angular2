import { Injectable } from '@angular/core';
import { JSONAPIBase } from './json-api.base';
import { Datastore } from './json-api.base';
import { User } from '../models/user';
import { Http } from '@angular/http';

@Injectable()
export class UpdateUserService extends JSONAPIBase {
  domainModel: any = User;
  getUrl: string = 'users';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'users';
  postUrl: string = '';
  deleteUrl: string = '';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore);
  }
}
