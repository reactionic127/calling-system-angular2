import {
  JSONAPIBase,
  Datastore
} from '../json-api.base';
import { Translation } from '../../models/translation';

import {
  Injectable
} from '@angular/core';
import { vsprintf } from 'sprintf-js';
import { UtilsService } from '../utils.service';
import { Observable } from 'rxjs';

export interface ITranslateParams {
  'params'?: any[];
  'domain'?: string;
  'context'?: string;
}

@Injectable()
export class TranslateService extends JSONAPIBase {
  currentLang: string = 'en';
  domainModel: any = Translation;
  getUrl: string = '';
  getItemUrl: string = 'translations';
  getListUrl: string = 'translations';
  patchUrl: string = 'translations';
  postUrl: string = 'translations';
  deleteUrl: string = '';

  _translations: any = {};

  constructor(datastore: Datastore, private _utilsService: UtilsService) {
    super(datastore);
  }

  changeLang(lang: string): void {
    this.currentLang = lang;
    this.loadTranslations();
    // window.location.href = window.location.href;
  }

  loadTranslations(): Promise<any> {
    return this.getList({ filter: { locale: this.currentLang } }).toPromise().then((items: any[]) => {
      this._translations = {};
      items.forEach(i => this._translations[i.key] = i.text);
      return Promise.resolve(true);
    });
  }

  translate(key: string, params?: ITranslateParams): string {
    params = params || {} as ITranslateParams;
    params.domain = this.fixKeyChars(params.domain || 'ui');
    params.context = this.fixKeyChars(params.context || this._utilsService.getCloserRouteData('pageName') || 'def');
    let originalKey = key;
    let translated;
    key = this.fixKeyChars(key);
    let fullKey = params.domain + '.' + params.context + '.' + key;
    if (this._translations[fullKey]) {
      translated = this._translations[fullKey];
    } else {
      this._translations[fullKey] = translated = originalKey;
      if ('production' !== ENV) {
        this.manageMissing(fullKey, originalKey);
      }
    }
    try {
      if (params.params && params.params.length) {
        translated = vsprintf(translated, params.params);
      }
    } catch (e) {
    }
    return translated;
  }

  manageMissing(fullKey: string, text: string): Observable<any> {
    let obs = this.updateItem({ key: fullKey, locale: this.currentLang, text: text });
    obs.subscribe(res => res.data.json());
    return obs;
  }

  private fixKeyChars(key: string): string {
    key = key || '';
    key = key.replace(/^\s+|\s+$/g, '');
    if (key === '') {
      return '';
    }
    key = key.replace(/[^a-zA-Z0-9_]/g, '_'); //
    key = key.substr(0, 200);
    return key;
  }
}
