import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { CampaignService } from '../services/campaign/campaign.service';

@Injectable()
export class CampaignResolver implements Resolve<any> {
  constructor(private service: CampaignService) {

  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.service.getItem(route.params['id']);
  }
}
