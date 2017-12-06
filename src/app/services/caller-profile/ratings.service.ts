import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Rating } from '../../models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RatingsService extends JSONAPIBase {
    domainModel: any = Rating;
    getItemUrl: string = '';
    getListUrl: string = '';
    getUrl: string = 'callers/${id}/ratings';
    patchUrl: string = '';
    postUrl: string = '';
    deleteUrl: string = '';

    constructor(datastore: Datastore) {
        super(datastore);
    }

    getCallerRatings(params: any): Observable<any[]> {
        let id = params.id;
        let modelClass = `callers/${id}/ratings`;
        delete params.id;

        Reflect.defineMetadata('JsonApiModelConfig', { type: modelClass }, this.domainModel);
        return (this.datastore as any).queryPaged(this.domainModel, params);
    }
}
