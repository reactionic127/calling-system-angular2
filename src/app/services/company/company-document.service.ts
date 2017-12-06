import { Injectable } from '@angular/core';
import { JSONAPIBase, Datastore } from '../json-api.base';
import { Document } from '../../models/document';

@Injectable()
export class CompanyDocumentService extends JSONAPIBase {
  domainModel: any = Document;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = 'companies/${companyId}/documents';
  deleteUrl: string = 'documents';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
