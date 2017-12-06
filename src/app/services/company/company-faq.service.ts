import { Injectable } from '@angular/core';
import { JSONAPIBase, Datastore } from '../json-api.base';
import { Faq } from '../../models/faq';
import { Http } from '@angular/http';

@Injectable()
export class CompanyFaqService extends JSONAPIBase {
  domainModel: any = Faq;
  getUrl: string = '';
  getItemUrl: string = 'faqs';
  getListUrl: string = 'companies/${companyId}/faqs';
  patchUrl: string = 'faqs';
  postUrl: string = 'companies/${companyId}/faqs';
  deleteUrl: string = 'faqs';

  constructor(datastore: Datastore, protected http: Http) {
    super(datastore, http);
  }
}
