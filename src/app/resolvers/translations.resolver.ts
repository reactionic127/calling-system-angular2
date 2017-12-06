import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '../services/translate/translate.service';

@Injectable()
export class TranslationsResolver implements Resolve<any> {
  constructor(private service: TranslateService) {

  }

  resolve(route: ActivatedRouteSnapshot): Promise<any> {
    return this.service.loadTranslations();
  }
}
