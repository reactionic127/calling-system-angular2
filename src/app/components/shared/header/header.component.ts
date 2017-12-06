import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'header-app',
  styleUrls: [],
  templateUrl: 'header.template.html'
})
export class HeaderComponent {
  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  constructor(private _authService: AuthService) {
  }

  logOut(): void {
    this._authService.doLogout();
  }

}
