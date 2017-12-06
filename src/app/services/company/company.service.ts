import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Company } from '../../models/company';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class CompanyService extends JSONAPIBase {
  domainModel: any = Company;
  getUrl: string = '';
  getItemUrl: string = 'companies';
  getListUrl: string = 'companies';
  patchUrl: string = 'companies';
  postUrl: string = 'companies';
  deleteUrl: string = 'companies';
  // postLogoUrl: string = 'companies/${id}/picture';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }
}
