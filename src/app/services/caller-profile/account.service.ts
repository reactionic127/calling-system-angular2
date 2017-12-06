import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { CallerPayMethod } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PayPalAccountService extends JSONAPIBase {
    domainModel: any = CallerPayMethod;
    getUrl: string = '';
    getItemUrl: string = '';
    getListUrl: string = '';
    patchUrl: string = 'caller_pay_methods';
    postUrl: string = 'callers/{paypalMethod}/caller_pay_methods';
    deleteUrl: string = '';

    constructor(datastore: Datastore) {
        super(datastore);
    }

    postCallerPaypalMethod(id: string, item: any): Observable<any> {
        delete item.id;
        let url: string = `callers/${id}/caller_pay_method`;
        Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
        return this.datastore.createRecord(this.domainModel, item).save();
    }
}
