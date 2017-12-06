import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Payment } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PaymentsService extends JSONAPIBase {
  domainModel: any = Payment;
  getUrl: string = 'callers/{id}/payments';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = 'callers/{id}/payments';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }

  getPayments(params: any): Observable<any[]> {
    const id = params.id;
    let url: string = `callers/${id}/payments`;
    delete params.id;

    if (url) {
      Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    }
    return this.datastore.query(this.domainModel, params);
  }

  makePayment(id: any): Observable<any> {
    let url: string = `callers/${id}/caller_payments`;
    Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    return this.datastore.createRecord(this.domainModel, null).save();
  }
}
