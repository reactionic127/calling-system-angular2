import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { CampaignCallComponent } from '../components/caller/campaign/details/call/campaign-call.component';
import { Observable } from 'rxjs';

@Injectable()
export class CanDeactivateCallService implements CanDeactivate<CampaignCallComponent> {

  canDeactivate(
    component: CampaignCallComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (component != null && component.callState != null) {
      if (component.callState === 'busy' || component.callState === 'calling') {
        alert('Unable to leave page while in a call!');
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}
