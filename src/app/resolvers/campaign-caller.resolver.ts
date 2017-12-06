import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { CampaignCallersService } from '../services/campaign/campaign-callers.service';

@Injectable()
export class CampaignCallerResolver implements Resolve<any> {
  constructor(private service: CampaignCallersService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.service.getItem(route.params['id']);
  }
}
