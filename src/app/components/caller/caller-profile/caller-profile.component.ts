import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services';

@Component({
  selector: 'dashboard',
  templateUrl: './caller-profile.component.html',
  styleUrls: ['./caller-profile.component.css'],
})

export class CallerProfileHomeComponent implements OnInit {
  public loggedUser: {};

  constructor(private _authService: AuthService) { }

  ngOnInit(): void {

    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.loggedUser = currentUserData;
    });
  }
}
