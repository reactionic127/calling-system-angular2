import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  TranslateService,
  ITranslateParams
} from '../services/translate/translate.service';

@Pipe({name: 'translate'})
export class TranslatePipe implements PipeTransform {
  constructor(private _translateService: TranslateService) {
  }

  transform(value: string, params: ITranslateParams): string {
    return this._translateService.translate(value, params);
  }
}
