import { Injectable } from '@angular/core';
import { JSONAPIBase, Datastore } from './json-api.base';
import { Industry } from '../models/industry';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class IndustryService extends JSONAPIBase {
  static _jsonData: any[];
  domainModel: any = Industry;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  static getJsonData(): any {
    if (!IndustryService._jsonData) {
      IndustryService._jsonData = require('../../assets/json/industries.json');
    }
    return IndustryService._jsonData;
  }

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getItem(id?: any, params?: any): Observable<any> {
    let data = this.getNewModel(_.find(IndustryService.getJsonData(), { id: id }));
    return Observable.of(data);
  }

  getList(params?: any): Observable<any[]> {
    let data = IndustryService.getJsonData().map((item) => this.getNewModel(item));
    return Observable.of(data);
  }
}
