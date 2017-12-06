import { Component } from '@angular/core';
import { AuthService } from '../../../../../services';

@Component({
  selector: 'no-campaigns',
  templateUrl: './no-campaigns.component.html'
})
export class NoCampaignsComponent {
  constructor(private _authService: AuthService) {
  }
  get loggedUser(): any {
    return this._authService.currentUserData;
  };
}
