import 'reflect-metadata';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { JsonApiDatastoreConfig, JsonApiDatastore } from 'angular2-jsonapi';
import { APP_CONFIG } from '../environment';
import * as models from '../models';
import * as es6template from 'es6-template-strings';

@JsonApiDatastoreConfig({
  baseUrl: APP_CONFIG.apiBase + '/',
  models: (function (): any {
    let exp = {};

    for (let m in models) {
      if (models.hasOwnProperty(m)) {
        let modelClass = models[m];
        let reflectData = Reflect.getMetadata('JsonApiModelConfig', modelClass);
        if (!reflectData) {
          continue; // not a BaseModel
        }
        let modelType = reflectData.type;
        exp[modelType] = modelClass;
      }
    }
    exp['questionFields'] = models.QuestionField;
    exp['campaignCalls'] = models.CampaignCall;
    exp['call'] = models.CampaignCall;
    exp['campaignSettings'] = models.CampaignSettings;

    return exp;
  }())
})

export class Datastore extends JsonApiDatastore {
  constructor(http: Http) {
    super(http);
  }
}

(function (): void {
  (JsonApiDatastore.prototype as any).queryPaged = function (modelType: any, params: any, headers?: any): any {
    let _this = this;
    let options = this.getOptions(headers);
    let url = this.buildUrl(modelType, params);
    return this.http.get(url, options)
      .map(function (res: any): any {
        let body = res.json();
        let pages: any = {};
        Object.keys(body.links).forEach((name) => {
          pages[name] = new URLSearchParams(decodeURIComponent(body.links[name]).split('?')[1]).get('page[number]');
        });
        // todo: keep only body.meta.totalItems when all the API endpoints will contain it
        let totalItems;
        if (body.meta.totalItems) {
          totalItems = body.meta.totalItems;
        } else {
          totalItems = params.page && params.page.size && (pages.last || pages.self) ?
            (pages.last || pages.self) * params.page.size : body.data.length;
        }

        let pageCount = body.meta ? (body.meta.totalPages ? body.meta.totalPages : null) : null;
        let totalItemsOnServer = pageCount * params.page.size;
        return [_this.extractQueryData(res, modelType), totalItems, pages, pageCount, totalItemsOnServer];
      })
      .catch(function (res: any): any {
        return _this.handleError(res);
      });
  };
}());

export abstract class JSONAPIBase {
  abstract domainModel: any;
  abstract getUrl: string;
  abstract getItemUrl: string;
  abstract getListUrl: string;
  abstract patchUrl: string;
  abstract postUrl: string;
  abstract deleteUrl: string;

  static getPlainData(item: any): any {
    let attributes = Reflect.getMetadata('Attribute', item);
    let ret = { id: item.id };
    for (let i in attributes) {
      if (i.substr(0, 1) !== '_') {
        ret[i] = item[i];
      }
    }
    return ret;
  }

  static updateStorageWith(itemTo: any, itemFrom: any): any {
    let plainData = this.getPlainData(itemFrom);

    for (let i in plainData) {
      if (true) {
        itemTo[i] = plainData[i];
      }
    }
  }

  constructor(protected datastore: Datastore, protected http?: Http) {
  }

  getItem(id?: any, params?: any): Observable<any> {
    if (this.getItemUrl) {
      Reflect.defineMetadata('JsonApiModelConfig', { type: es6template(this.getItemUrl, Object.assign({ id: id }, params)) }, this.domainModel);
    }
    return this.datastore.findRecord(this.domainModel, id, params);
  }

  getItemWithParams(id?: string, params?: any): Observable<any> {
    let url: string = this.getUrl ? es6template(this.getUrl, { id: id }) : null;
    if (url) {
      Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    }
    return this.datastore.findRecord(this.domainModel, id, params);
  }

  getList(params?: any): Observable<any[]> {
    if (this.getListUrl) {
      Reflect.defineMetadata('JsonApiModelConfig', { type: es6template(this.getListUrl, params) }, this.domainModel);
    }
    return this.datastore.query(this.domainModel, params);
  }

  getListPaged(params?: any): Observable<any[]> {
    let url: string = this.getListUrl ? es6template(this.getListUrl, params) : null;
    if (url) {
      Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    }
    return (this.datastore as any).queryPaged(this.domainModel, params);
  }

  updateItem(item: any): Observable<any> {
    let url: string = '';
    if (item.id) {
      url = this.patchUrl ? es6template(this.patchUrl, item) : url;
    } else {
      url = this.postUrl ? es6template(this.postUrl, item) : url;
    }
    if (url) {
      Reflect.defineMetadata('JsonApiModelConfig', { type: url }, this.domainModel);
    }
    return this.datastore.createRecord(this.domainModel, item).save();
  }

  updateItemAdvanced(model: any, modelUrl?: string): Observable<any> {
    let url;
    if (model.id) {
      url = APP_CONFIG.apiBase + '/' + es6template(modelUrl ? modelUrl : (this.patchUrl + '/' + model.id), model);
    } else {
      url = APP_CONFIG.apiBase + '/' + es6template(modelUrl ? modelUrl : this.postUrl, model);
    }
    const id = model.id;
    delete model.id;
    if (model instanceof this.domainModel) {
      model = JSONAPIBase.getPlainData(model);
    }
    let body = {
      data: {
        id: id,
        attributes: model
      }
    };

    return this.http[id ? 'patch' : 'post'](url, body)
      .map((res: any): any => {
        return (this.datastore as any).extractRecordData(res, this.domainModel);
      })
      .catch((res: any): any => {
        return (this.datastore as any).handleError(res);
      });
  }

  getNewModel(data?: any): any {
    return this.datastore.createRecord(this.domainModel, data);
  }

  deleteItem(item: any): Observable<any> {
    Reflect.defineMetadata('JsonApiModelConfig', { type: this.deleteUrl }, this.domainModel);
    return this.datastore.deleteRecord(this.domainModel, item.id);
  }
}

