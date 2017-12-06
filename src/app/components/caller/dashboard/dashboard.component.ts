import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit {
  public loadingFinished: boolean = false;
  public loggedUser: {};

  constructor(private _authService: AuthService) { }

  ngOnInit(): void {
    this.loadingFinished = true;

    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.loggedUser = currentUserData;
    });
  }
}
