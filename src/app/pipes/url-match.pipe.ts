import { Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';

@Pipe({
  name: 'urlMatch'
})
export class UrlMatchPipe implements PipeTransform {
  constructor(private _location: Location) {
  }

  transform(matchString: string, locationCheck?: string): any {
    locationCheck = locationCheck || this._location.prepareExternalUrl(this._location.path());
    let match     = new RegExp(matchString).test(locationCheck);
    return match;
  }
}
