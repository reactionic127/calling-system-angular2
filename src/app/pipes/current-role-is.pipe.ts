import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Pipe({
  name: 'currentRoleIn'
})
export class CurrentRoleInPipe implements PipeTransform {
  constructor(private _authService: AuthService) {
  }

  transform(listOfRoles: string): any {
    return listOfRoles && this._authService.currentUserData && listOfRoles.split(',').indexOf(this._authService.currentUserData.role) !== -1;
  }
}
