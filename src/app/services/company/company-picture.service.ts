import { Injectable } from '@angular/core';
import { JSONAPIBase, Datastore } from '../json-api.base';
import { Picture } from '../../models/picture';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../environment';
import { Http } from '@angular/http';

@Injectable()
export class CompanyPictureService extends JSONAPIBase {
  domainModel: any = Picture;
  getUrl: string = '';
  getItemUrl: string = 'companies/${companyId}/picture';
  getListUrl: string = '';
  patchUrl: string = 'companies/${companyId}/picture';
  postUrl: string = 'companies/${companyId}/picture';
  deleteUrl: string = '';

  constructor(datastore: Datastore, http: Http) {
    super(datastore, http);
  }

  updateItem(item: any): Observable<Picture> {
    const id = item.id;
    delete item.id;

    let typeForUrl = APP_CONFIG.apiBase + `/companies/${item.companyId}/picture`;
    let body = {
      data: {
        id: id,
        attributes: item
      }
    };

    return this.http.patch(typeForUrl, body)
      .map((res: any): any => {
        return (this.datastore as any).extractRecordData(res, this.domainModel);
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }
}
